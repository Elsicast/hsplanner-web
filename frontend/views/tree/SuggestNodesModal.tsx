import { useCallback, useEffect, useRef, useState } from 'react'
import type { BuildPerformanceDeps } from '../../utils/build/buildPerformance'
import { suggestNodesNative } from '../../utils/tree/nativeSuggest'
import { TREE_NODE_INFO } from '../../utils/tree/treeStats'
import type { TreeNodeInfo } from '../../utils/tree/treeStats'
import { Modal } from '../../components/ui/Modal'
import { translateIncarnationTitle } from '../../utils/tree/incarnationText'

interface SuggestStep {
  nodeId: number
  dpsBefore: number
  dpsAfter: number
  gain: number
  isFiller: boolean
}

interface SuggestResult {
  addedNodes: Set<number>
  sequence: SuggestStep[]
  baseDps: number
  finalDps: number
  budgetUsed: number
  budgetRequested: number
  unsupportedLines: string[]
}

interface Props {
  currentAllocation: Set<number>
  deps: BuildPerformanceDeps
  onPreviewChange: (nodes: Set<number> | null) => void
  onApply: (suggestedNodes: Set<number>) => void
  onClose: () => void
}

type Phase = 'idle' | 'computing' | 'done' | 'error'

const MIN_BUDGET = 1
const MAX_BUDGET = 200
const DEFAULT_BUDGET = 10

function formatDps(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  if (Math.abs(value) >= 1000) {
    return Math.round(value).toLocaleString('en-US')
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
}

function formatGainPct(base: number, final: number): string {
  if (base <= 0) return final > 0 ? '+∞%' : '0%'
  const pct = ((final - base) / base) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

function nodeName(nodes: Record<string, TreeNodeInfo>, id: number): string {
  const info = nodes[String(id)]
  if (info?.t && info.t.trim()) return translateIncarnationTitle(info.t)
  return `节点 #${id}`
}

function nodeKind(
  nodes: Record<string, TreeNodeInfo>,
  id: number,
): 'jewelry' | 'big' | 'minor' | 'other' {
  const info = nodes[String(id)]
  if (!info) return 'other'
  if (info.n === 'jewelry') return 'jewelry'
  if (info.n === 'big') return 'big'
  return 'minor'
}

export default function SuggestNodesModal({
  currentAllocation,
  deps,
  onPreviewChange,
  onApply,
  onClose,
}: Props) {
  const nodeInfo = TREE_NODE_INFO as Record<string, TreeNodeInfo>
  const [budget, setBudget] = useState<number>(DEFAULT_BUDGET)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  })
  const [result, setResult] = useState<SuggestResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleClose = useCallback(() => {
    abortRef.current?.abort()
    onPreviewChange(null)
    onClose()
  }, [onClose, onPreviewChange])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      onPreviewChange(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (result?.addedNodes && result.addedNodes.size > 0) {
      onPreviewChange(result.addedNodes)
    } else {
      onPreviewChange(null)
    }
  }, [result, onPreviewChange])

  const handleCalculate = useCallback(async () => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setPhase('computing')
    setErrorMsg(null)
    setProgress({ current: 0, total: budget })
    setResult(null)
    onPreviewChange(null)

    try {
      const native = await suggestNodesNative(
        deps,
        currentAllocation,
        budget,
        (current, total) => setProgress({ current, total }),
      )
      if (ac.signal.aborted) return
      const res: SuggestResult = {
        addedNodes: new Set(native.addedNodes),
        sequence: native.sequence,
        baseDps: native.baseDps,
        finalDps: native.finalDps,
        budgetUsed: native.budgetUsed,
        budgetRequested: native.budgetRequested,
        unsupportedLines: native.unsupportedLines,
      }
      setResult(res)
      setPhase('done')
    } catch (err: unknown) {
      if (
        err instanceof DOMException &&
        (err.name === 'AbortError' || err.message === 'aborted')
      ) {
        return
      }
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setPhase('error')
    }
  }, [budget, currentAllocation, onPreviewChange, deps])

  const handleApply = useCallback(() => {
    if (!result || result.addedNodes.size === 0) return
    onPreviewChange(null)
    onApply(result.addedNodes)
    onClose()
  }, [onApply, onClose, onPreviewChange, result])

  const handleReset = useCallback(() => {
    abortRef.current?.abort()
    setResult(null)
    setPhase('idle')
    setProgress({ current: 0, total: 0 })
    setErrorMsg(null)
    onPreviewChange(null)
  }, [onPreviewChange])

  const isComputing = phase === 'computing'
  const canApply = phase === 'done' && (result?.addedNodes.size ?? 0) > 0
  const progressPct =
    progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : 0

  return (
    <Modal
      onClose={handleClose}
      dataTour="suggest-modal"
      panelClassName="max-h-[88vh] w-[540px] max-w-[94vw]"
      eyebrow="天赋树优化器"
      title="推荐节点"
    >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <section className="border-b border-border bg-black/20 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <label
                htmlFor="suggest-budget"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint"
              >
                要分配的节点数
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setBudget((b) => Math.max(MIN_BUDGET, b - 1))
                  }
                  disabled={isComputing || budget <= MIN_BUDGET}
                  className="h-7 w-7 rounded-[3px] border border-border-2 bg-panel-2 font-mono text-[14px] text-muted transition-colors enabled:hover:border-accent-deep enabled:hover:text-accent-hot disabled:opacity-40"
                  aria-label="减少"
                >
                  −
                </button>
                <input
                  id="suggest-budget"
                  type="number"
                  min={MIN_BUDGET}
                  max={MAX_BUDGET}
                  value={budget}
                  disabled={isComputing}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (!Number.isFinite(v)) return
                    setBudget(
                      Math.max(
                        MIN_BUDGET,
                        Math.min(MAX_BUDGET, Math.round(v)),
                      ),
                    )
                  }}
                  className="w-20 rounded-[3px] border border-border-2 bg-panel-2 px-2 py-1 text-center font-mono text-[13px] text-accent-hot focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent-hot/15 disabled:opacity-50"
                  style={{
                    background:
                      'linear-gradient(180deg, #0d0e12, var(--color-panel-2))',
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setBudget((b) => Math.min(MAX_BUDGET, b + 1))
                  }
                  disabled={isComputing || budget >= MAX_BUDGET}
                  className="h-7 w-7 rounded-[3px] border border-border-2 bg-panel-2 font-mono text-[14px] text-muted transition-colors enabled:hover:border-accent-deep enabled:hover:text-accent-hot disabled:opacity-40"
                  aria-label="增加"
                >
                  +
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min={MIN_BUDGET}
                max={MAX_BUDGET}
                value={budget}
                disabled={isComputing}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full"
                style={{
                  ['--sl-pct' as never]: `${
                    ((budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100
                  }%`,
                }}
                aria-label="要分配的节点数"
              />
              <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                <span>{MIN_BUDGET}</span>
                <span className="text-muted">
                  优化器将对照当前分配逐个评估候选节点
                </span>
                <span>{MAX_BUDGET}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {phase === 'done' && result
                  ? `已用 ${result.budgetUsed} / ${result.budgetRequested}`
                  : phase === 'idle'
                    ? '贪心 DPS 优化器'
                    : phase === 'error'
                      ? '上次运行出错'
                      : '迭代中…'}
              </p>
              <div className="flex gap-2">
                {phase === 'done' && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-[3px] border border-border-2 bg-transparent px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent-deep hover:text-accent-hot"
                  >
                    重置
                  </button>
                )}
                <button
                  type="button"
                  onClick={isComputing ? handleReset : handleCalculate}
                  className={
                    isComputing
                      ? 'rounded-[3px] border border-border-2 bg-transparent px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stat-red transition-colors hover:border-stat-red'
                      : 'rounded-[3px] border border-accent-deep px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-hot transition-all hover:border-accent-hot hover:shadow-[0_0_14px_rgba(224,184,100,0.3)]'
                  }
                  style={
                    isComputing
                      ? undefined
                      : {
                          background:
                            'linear-gradient(180deg, #3a2f1a, #2a2418)',
                        }
                  }
                >
                  {isComputing ? '取消' : phase === 'done' ? '重新计算' : '计算'}
                </button>
              </div>
            </div>

            {isComputing && (
              <div className="mt-3">
                <div
                  className="relative h-1.5 overflow-hidden rounded-[2px] border border-border-2"
                  style={{
                    background:
                      'linear-gradient(180deg, #0a0b0f, var(--color-panel-2))',
                  }}
                >
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-150"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        'linear-gradient(90deg, var(--color-accent-deep), var(--color-accent-hot))',
                      boxShadow: '0 0 12px rgba(224,184,100,0.4)',
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                  <span>
                    步骤{' '}
                    <span className="text-accent-hot">{progress.current}</span>{' '}
                    / {progress.total}
                  </span>
                  <span>{progressPct}%</span>
                </div>
              </div>
            )}
          </section>

          {phase === 'error' && errorMsg && (
            <div className="border-b border-stat-red/30 bg-stat-red/5 px-5 py-3 font-mono text-[11px] text-stat-red">
              {errorMsg}
            </div>
          )}

          {phase === 'done' && result && (
            <ResultsSection result={result} nodeInfo={nodeInfo} />
          )}

          {phase === 'idle' && (
            <section className="flex-1 px-5 py-6 text-center">
              <div className="mx-auto mb-3 inline-flex items-center justify-center">
                <span
                  className="block h-2 w-2 rotate-45 bg-accent-deep"
                  style={{ boxShadow: '0 0 14px rgba(201,165,90,0.4)' }}
                />
              </div>
              <p className="mx-auto max-w-[380px] text-[12px] leading-relaxed text-muted">
                选择要添加的节点数量。优化器会沿当前分配的边界推进，每一步贪心选取
                DPS 提升最高的相邻节点；当没有即时收益时，会退而寻找通往核心天赋或珠宝插槽的最短路径。
              </p>
            </section>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-black/30 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                phase === 'done'
                  ? 'bg-accent-hot'
                  : phase === 'computing'
                    ? 'bg-stat-blue'
                    : phase === 'error'
                      ? 'bg-stat-red'
                      : 'bg-faint'
              }`}
              style={
                phase === 'done'
                  ? { boxShadow: '0 0 8px rgba(224,184,100,0.6)' }
                  : undefined
              }
            />
            <span
              className={
                phase === 'done'
                  ? 'text-accent-hot'
                  : phase === 'error'
                    ? 'text-stat-red'
                    : phase === 'computing'
                      ? 'text-stat-blue'
                      : 'text-faint'
              }
            >
              {phase === 'done' && result
                ? `${result.addedNodes.size} 个节点就绪`
                : phase === 'computing'
                  ? '优化中'
                  : phase === 'error'
                    ? '错误'
                    : '设置预算点数'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!canApply}
              onClick={handleApply}
              className="rounded-[3px] border border-accent-deep px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-hot transition-all enabled:hover:border-accent-hot enabled:hover:shadow-[0_0_14px_rgba(224,184,100,0.3)] disabled:cursor-not-allowed disabled:border-border-2 disabled:text-faint"
              style={
                canApply
                  ? { background: 'linear-gradient(180deg, #3a2f1a, #2a2418)' }
                  : undefined
              }
            >
              应用
            </button>
          </div>
        </footer>
    </Modal>
  )
}

function ResultsSection({
  result,
  nodeInfo,
}: {
  result: SuggestResult
  nodeInfo: Record<string, TreeNodeInfo>
}) {
  const gainAbs = result.finalDps - result.baseDps
  const gainPct = formatGainPct(result.baseDps, result.finalDps)
  const isPositive = gainAbs > 0

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="grid grid-cols-3 border-b border-border bg-black/30 px-5 py-3"
        style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
      >
        <DpsStat label="基础 DPS" value={result.baseDps} tone="neutral" />
        <DpsStat label="最终 DPS" value={result.finalDps} tone="accent" />
        <DpsStat
          label="提升"
          value={gainAbs}
          subLabel={gainPct}
          tone={isPositive ? 'good' : 'neutral'}
          showSign
        />
      </div>

      <div className="flex items-center justify-between border-b border-border bg-black/10 px-5 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          推荐序列
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
          {result.sequence.length} 步
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {result.sequence.length === 0 && (
          <div className="p-8 text-center font-mono text-[11px] text-muted">
            预算内未找到可提升项
          </div>
        )}
        {result.sequence.map((step, idx) => (
          <SequenceRow
            key={`${step.nodeId}-${idx}`}
            index={idx}
            step={step}
            nodes={nodeInfo}
          />
        ))}
      </div>

      {result.unsupportedLines && result.unsupportedLines.length > 0 && (
        <UnsupportedWarning lines={result.unsupportedLines} />
      )}
    </section>
  )
}

function UnsupportedWarning({ lines }: { lines: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const uniq = Array.from(new Set(lines)).slice(0, expanded ? 200 : 6)
  return (
    <div className="border-t border-stat-orange/30 bg-stat-orange/[0.03] px-5 py-2 font-mono text-[10px] tracking-[0.04em]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left text-stat-orange transition-colors hover:text-accent-hot"
      >
        <span>
          <span className="text-stat-orange">▲</span>{' '}
          {lines.length} 条不支持的天赋行（按 0 DPS 计）
        </span>
        <span>{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <ul className="mt-2 space-y-0.5 pl-4 text-[10px] text-muted">
          {uniq.map((line, i) => (
            <li key={i} className="truncate">
              · {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DpsStat({
  label,
  value,
  subLabel,
  tone,
  showSign,
}: {
  label: string
  value: number
  subLabel?: string
  tone: 'neutral' | 'accent' | 'good'
  showSign?: boolean
}) {
  const valueColor =
    tone === 'good'
      ? 'text-stat-green'
      : tone === 'accent'
        ? 'text-accent-hot'
        : 'text-text'
  const formatted = formatDps(value)
  const display = showSign && value > 0 ? `+${formatted}` : formatted

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
        {label}
      </div>
      <div
        className={`font-mono text-[16px] font-semibold tracking-[0.02em] ${valueColor}`}
        style={
          tone === 'accent'
            ? { textShadow: '0 0 12px rgba(224,184,100,0.25)' }
            : tone === 'good'
              ? { textShadow: '0 0 10px rgba(110,180,90,0.25)' }
              : undefined
        }
      >
        {display}
      </div>
      {subLabel && (
        <div
          className={`mt-0.5 font-mono text-[10px] tracking-[0.02em] ${
            tone === 'good' ? 'text-stat-green' : 'text-muted'
          }`}
        >
          {subLabel}
        </div>
      )}
    </div>
  )
}

function SequenceRow({
  step,
  index,
  nodes,
}: {
  step: SuggestStep
  index: number
  nodes: Record<string, TreeNodeInfo>
}) {
  const name = nodeName(nodes, step.nodeId)
  const kind = nodeKind(nodes, step.nodeId)
  const gainText = step.isFiller ? '过渡' : `+${formatDps(step.gain)} DPS`
  const gainColor = step.isFiller
    ? 'text-faint'
    : step.gain > 0
      ? 'text-stat-green'
      : 'text-muted'
  const kindBadge =
    kind === 'jewelry'
      ? { label: '插槽', cls: 'border-stat-blue/50 text-stat-blue' }
      : kind === 'big'
        ? { label: '核心天赋', cls: 'border-accent-deep text-accent-hot' }
        : kind === 'minor'
          ? { label: '小天赋', cls: 'border-border-2 text-muted' }
          : { label: '节点', cls: 'border-border-2 text-faint' }

  return (
    <div
      className="group grid items-center gap-3 border-b border-dashed border-border px-5 py-2 transition-colors last:border-b-0 hover:bg-accent-hot/[0.04]"
      style={{ gridTemplateColumns: '28px 1fr 60px 84px' }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="truncate text-[12px] text-text group-hover:text-accent-hot">
        {name}
      </span>
      <span
        className={`w-max rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${kindBadge.cls}`}
      >
        {kindBadge.label}
      </span>
      <span
        className={`text-right font-mono text-[11px] tabular-nums ${gainColor}`}
      >
        {gainText}
      </span>
    </div>
  )
}

