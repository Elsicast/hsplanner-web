// 主线程侧的引擎 RPC 客户端：提供与 Tauri `invoke` / `listen` 相同形态的 API，
// 由 bridge.ts / nativeDamage.ts / nativeSuggest.ts / App.tsx 使用。
// 所有计算都发生在引擎 Web Worker 里，主线程不会因重计算卡顿。

/** 兼容 Tauri 的事件取消订阅函数类型 */
export type UnlistenFn = () => void

export interface RpcInvokeOptions {
  /** 请求期间进度回调以哪个事件名转发（warmup-progress / suggest-progress） */
  progressEvent?: string
}

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (err: Error) => void
}

interface WorkerResponse {
  id?: number
  type?: 'event'
  event?: string
  payload?: unknown
  ok?: boolean
  fatal?: boolean
  error?: string
  result?: unknown
}

let activeWorker: Worker | null = null
let bootingWorker: Promise<Worker> | null = null
let nextRequestId = 1

const pendingRequests = new Map<number, PendingRequest>()
const eventListeners = new Map<string, Set<(payload: unknown) => void>>()

function rejectAllPending(message: string): void {
  for (const [, req] of pendingRequests) {
    req.reject(new Error(message))
  }
  pendingRequests.clear()
}

function handleWorkerMessage(msg: WorkerResponse): void {
  if (msg.type === 'event' && msg.event) {
    const listeners = eventListeners.get(msg.event)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(msg.payload)
        } catch {
          // 单个监听器出错不影响其余监听
        }
      }
    }
    return
  }
  if (typeof msg.id !== 'number') return
  const req = pendingRequests.get(msg.id)
  if (!req) return
  pendingRequests.delete(msg.id)
  if (msg.ok) {
    req.resolve(msg.result)
  } else {
    req.reject(new Error(msg.error ?? 'engine call failed'))
  }
}

function spawnWorker(): Worker {
  const worker = new Worker(new URL('./engine.worker.ts', import.meta.url), {
    type: 'module',
  })
  worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
    handleWorkerMessage(ev.data)
    if (ev.data?.fatal) {
      // wasm abort 后实例不可恢复：报废这只 worker，下次调用时重建
      if (activeWorker === worker) activeWorker = null
      bootingWorker = null
      worker.terminate()
    }
  }
  worker.onerror = () => {
    if (activeWorker === worker) activeWorker = null
    bootingWorker = null
    rejectAllPending('engine worker crashed')
    worker.terminate()
  }
  return worker
}

function getWorker(): Promise<Worker> {
  if (activeWorker) return Promise.resolve(activeWorker)
  if (!bootingWorker) {
    bootingWorker = Promise.resolve(spawnWorker()).then((worker) => {
      activeWorker = worker
      return worker
    })
  }
  return bootingWorker
}

/**
 * 调用引擎命令，形态与 Tauri 的 `invoke(cmd, args)` 一致：
 * 参数按 JSON 序列化发给 worker 里的 wasm 分发器。
 */
export async function invoke<T = unknown>(
  cmd: string,
  args?: Record<string, unknown>,
  options?: RpcInvokeOptions,
): Promise<T> {
  const worker = await getWorker()
  return new Promise<T>((resolve, reject) => {
    const id = nextRequestId++
    pendingRequests.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
    })
    worker.postMessage({ id, cmd, args: args ?? {}, progressEvent: options?.progressEvent })
  })
}

/**
 * 订阅引擎事件，形态与 Tauri 的 `listen` 一致（返回取消订阅函数）。
 */
export async function listen<T = unknown>(
  event: string,
  handler: (e: { payload: T }) => void,
): Promise<() => void> {
  let listeners = eventListeners.get(event)
  if (!listeners) {
    listeners = new Set()
    eventListeners.set(event, listeners)
  }
  const wrapped = (payload: unknown) => handler({ payload: payload as T })
  listeners.add(wrapped)
  return () => {
    listeners.delete(wrapped)
  }
}

/** 测试用：重置单例状态 */
export function __resetRpcForTest(): void {
  if (activeWorker) activeWorker.terminate()
  activeWorker = null
  bootingWorker = null
  rejectAllPending('rpc reset')
  eventListeners.clear()
}
