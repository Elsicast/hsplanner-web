import { useMemo, useState } from 'react'
import type { Inventory, SavedLootFilter } from '../../types'
import { Modal, MODAL_BTN_PRIMARY_CLASS } from '../../components/ui/Modal'
import { encodeLootFilter } from '../../utils/lootfilter/codec'
import { FILTER_STAT_BY_ID } from '../../utils/lootfilter/constants'
import {
  buildFilterForStats,
  collectBuildStats,
  filterStatIdsFor,
} from '../../utils/lootfilter/buildFilter'
import { createFilter } from '../../utils/lootfilter/savedFilters'

interface GenerateFromBuildModalProps {
  buildId: string
  buildName: string | null
  inventory: Inventory
  onClose: () => void
  onDone: (record: SavedLootFilter) => void
}

export function GenerateFromBuildModal({
  buildId,
  buildName,
  inventory,
  onClose,
  onDone,
}: GenerateFromBuildModalProps) {
  const stats = useMemo(() => collectBuildStats(inventory), [inventory])
  const statIds = useMemo(() => filterStatIdsFor(stats), [stats])
  const affixes = useMemo(
    () =>
      statIds
        .map((id) => ({ id, name: FILTER_STAT_BY_ID.get(id)?.name }))
        .filter((a): a is { id: number; name: string } => Boolean(a.name))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [statIds],
  )

  const [selected, setSelected] = useState<ReadonlySet<number>>(
    () => new Set(statIds),
  )
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const [hideRest, setHideRest] = useState(false)
  const [name, setName] = useState(`${buildName ?? '构建'} · 自动`)
  const [error, setError] = useState<string | null>(null)

  const unmatched = stats.length - statIds.length

  const submit = () => {
    if (selected.size === 0) return
    try {
      const filter = buildFilterForStats([...selected], { hideRest })
      onDone(
        createFilter(buildId, name.trim() || '构建过滤规则', encodeLootFilter(filter)),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : '无法创建过滤规则。')
    }
  }

  return (
    <Modal
      onClose={onClose}
      panelClassName="w-[min(560px,92vw)]"
      eyebrow="拾取过滤规则"
      title="从构建生成"
    >
      <div className="flex flex-col gap-3 px-6 py-4">
        {statIds.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-muted">
            该构建的装备上还没有词缀，暂无可高亮的内容。请先在装备页签装备一些物品。
          </p>
        ) : (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                名称
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                }}
                className="rounded-[3px] border border-border-2 bg-panel-2 px-2 py-1.5 text-[12px] text-text outline-none transition-colors focus:border-accent-deep"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                  将高亮你装备词缀中的 {selected.size}/{affixes.length} 项
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelected(new Set(statIds))}
                    className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint transition-colors hover:text-accent-hot"
                  >
                    全部
                  </button>
                  <span className="text-[9.5px] text-faint">·</span>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint transition-colors hover:text-accent-hot"
                  >
                    全不选
                  </button>
                </div>
              </div>
              <div className="flex max-h-[160px] flex-wrap gap-1 overflow-y-auto rounded-[3px] border border-border-2 bg-panel-2 p-2">
                {affixes.map((a) => {
                  const on = selected.has(a.id)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(a.id)}
                      aria-pressed={on}
                      className={`rounded-[2px] border px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
                        on
                          ? 'border-accent-deep bg-accent-hot/10 text-accent-hot'
                          : 'border-border-2 text-faint hover:text-muted'
                      }`}
                    >
                      {a.name}
                    </button>
                  )
                })}
              </div>
              {unmatched > 0 && (
                <span className="text-[11px] text-faint">
                  装备上有 {unmatched} 项属性在游戏过滤规则中没有对应项，已跳过。
                </span>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={hideRest}
                onChange={(e) => setHideRest(e.target.checked)}
                className="mt-[3px] accent-[var(--color-accent-deep)]"
              />
              <span className="text-[12px] leading-relaxed text-muted">
                隐藏所有其他词缀
                <span className="block text-[11px] text-faint">
                  激进模式 — 含有你尚未使用词缀的掉落将不再显示。
                </span>
              </span>
            </label>
          </>
        )}
        {error && <span className="text-[11px] text-stat-red">{error}</span>}
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3">
        <button
          type="button"
          onClick={submit}
          disabled={selected.size === 0}
          className={`${MODAL_BTN_PRIMARY_CLASS} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          创建过滤规则
        </button>
      </div>
    </Modal>
  )
}
