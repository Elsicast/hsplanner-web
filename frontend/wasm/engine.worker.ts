// 引擎 Web Worker：加载 wasm 计算引擎，把同步计算请求与进度事件转发给主线程。
// wasm 内部 panic 策略是 abort（实例随即不可用），此时上报 fatal 让主线程重建 worker。

import init, { invoke_cmd, set_progress_callback } from './engine/app_lib.js'

interface WorkerRequest {
  id: number
  cmd: string
  args?: Record<string, unknown>
  /** 该请求期间进度回调以哪个事件名转发（warmup-progress / suggest-progress） */
  progressEvent?: string
}

// wasm 同步执行期间记录当前请求的进度事件名（同一时刻只有一个请求在跑）
let currentProgressEvent: string | null = null
let booted: Promise<void> | null = null

function boot(): Promise<void> {
  if (!booted) {
    booted = (async () => {
      await init()
      set_progress_callback((current: number, total: number) => {
        if (currentProgressEvent) {
          self.postMessage({
            type: 'event',
            event: currentProgressEvent,
            payload: { current, total },
          })
        }
      })
    })()
  }
  return booted
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const { id, cmd, args, progressEvent } = ev.data
  try {
    await boot()
    currentProgressEvent = progressEvent ?? null
    let raw: string
    try {
      raw = invoke_cmd(cmd, JSON.stringify(args ?? {}))
    } finally {
      currentProgressEvent = null
    }
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      '__error' in (parsed as Record<string, unknown>)
    ) {
      throw new Error(String((parsed as { __error: string }).__error))
    }
    self.postMessage({ id, ok: true, result: parsed })
  } catch (err) {
    // RuntimeError("unreachable") 即 wasm abort：实例已坏，需要整只重建
    const fatal = err instanceof WebAssembly.RuntimeError
    self.postMessage({
      id,
      ok: false,
      fatal,
      error: err instanceof Error ? err.message : String(err),
    })
    if (fatal) booted = null
  }
}
