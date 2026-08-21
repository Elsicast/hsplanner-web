import { useMemo } from 'react'
import type { LootFilter } from '../../types'
import { Panel } from '../../components/ui/Panel'
import { ITEM_TYPES } from '../../utils/lootfilter/constants'
import { typeSummary } from './filterModel'

interface TypeRailProps {
  filter: LootFilter
  activeId: number
  onSelect: (typeId: number) => void
}

export function TypeRail({ filter, activeId, onSelect }: TypeRailProps) {
  const rows = useMemo(
    () =>
      ITEM_TYPES.flatMap(({ id, label }) => {
        const type = filter.types[id]
        return type ? [{ id, label, summary: typeSummary(type) }] : []
      }),
    [filter],
  )
  const editedCount = rows.filter((r) => r.summary.edited).length

  return (
    <Panel
      title="物品类型"
      trailing={
        <span
          title={`${editedCount}/${rows.length} 个类型已编辑`}
          className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-faint"
        >
          <span className={editedCount > 0 ? 'text-accent-hot' : 'text-muted'}>
            {editedCount}
          </span>
          /{rows.length}
        </span>
      }
    >
      <ul className="flex flex-col gap-1">
        {rows.map(({ id, label, summary }) => {
          const active = id === activeId
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active}
                className={`group flex h-[32px] w-full items-center gap-2 rounded-[3px] border px-2 text-left transition-colors ${
                  active
                    ? 'border-accent-hot bg-accent-hot/10 ring-1 ring-accent-hot/40'
                    : 'border-border-2 hover:border-accent-deep'
                }`}
              >
                <span
                  className={`min-w-0 flex-1 truncate text-[12px] font-medium transition-colors ${
                    active ? 'text-accent-hot' : 'text-muted group-hover:text-text'
                  }`}
                >
                  {label}
                </span>
                {summary.edited ? (
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9px] tabular-nums">
                    {summary.raritiesHidden > 0 && (
                      <span
                        className="text-stat-red/80"
                        title={`${summary.raritiesHidden} 个稀有度/阶级单元格已隐藏`}
                      >
                        ◆
                      </span>
                    )}
                    {summary.hidden.size > 0 && (
                      <span
                        className="text-faint"
                        title={`${summary.hidden.size} 个词缀已隐藏`}
                      >
                        ✕{summary.hidden.size}
                      </span>
                    )}
                    {summary.highlighted.size > 0 && (
                      <span
                        className="text-accent-hot"
                        title={`${summary.highlighted.size} 个词缀已高亮`}
                      >
                        ★{summary.highlighted.size}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-faint/50">
                    默认
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
