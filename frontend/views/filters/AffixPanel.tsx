import { memo, useCallback, useMemo, useState } from 'react'
import type { LootFilter } from '../../types'
import { Panel } from '../../components/ui/Panel'
import {
  FILTER_STATS,
  ITEM_TYPE_LABELS,
  TIER_LABELS,
  type LootFilterStat,
} from '../../utils/lootfilter/constants'
import type { ApplyFilter } from './FilterEditor'
import { FILTER_BTN_CLASS, FILTER_CHIP_CLASS, FilterCell } from './FilterCells'
import type { CellState } from './filterModel'
import {
  isAffixRowEdited,
  setAffixesVisible,
  toggleAffixHighlight,
  toggleAffixRow,
  toggleAffixVisible,
  toggleTierColumn,
  typeSummary,
} from './filterModel'

const CELL_STATES: Record<string, CellState> = {
  h: 'hidden',
  H: 'highlighted',
  v: 'visible',
}

interface AffixPanelProps {
  filter: LootFilter
  typeId: number
  apply: ApplyFilter
}

export function AffixPanel({ filter, typeId, apply }: AffixPanelProps) {
  const [query, setQuery] = useState('')
  const [editedOnly, setEditedOnly] = useState(false)
  const type = filter.types[typeId]
  const label = ITEM_TYPE_LABELS.get(typeId) ?? `t${typeId}`

  const listed = useMemo(() => {
    if (!type) return []
    const needle = query.trim().toLowerCase()
    const keep = (stat: LootFilterStat) =>
      (!needle || stat.name.toLowerCase().includes(needle)) &&
      (!editedOnly || isAffixRowEdited(type, stat.id))
    return FILTER_STATS.filter(keep)
  }, [type, query, editedOnly])

  const onToggleRow = useCallback(
    (statId: number) => apply((prev) => toggleAffixRow(prev, typeId, statId)),
    [apply, typeId],
  )
  const onCell = useCallback(
    (statId: number, tier: number, highlight: boolean) =>
      apply((prev) =>
        highlight
          ? toggleAffixHighlight(prev, typeId, tier, statId)
          : toggleAffixVisible(prev, typeId, tier, statId),
      ),
    [apply, typeId],
  )

  const tierSets = useMemo(
    () =>
      (type?.tiers ?? []).map((t) => ({
        hidden: new Set(t.hidden),
        highlighted: new Set(t.highlighted),
      })),
    [type],
  )
  const summary = useMemo(() => (type ? typeSummary(type) : null), [type])

  if (!type || !summary) return null

  const statesFor = (statId: number) =>
    tierSets
      .map((t) => (t.hidden.has(statId) ? 'h' : t.highlighted.has(statId) ? 'H' : 'v'))
      .join('')

  const listedIds = listed.map((s) => s.id)
  const filtered = listed.length !== FILTER_STATS.length

  return (
    <Panel
      title={`${label} · 词缀`}
      trailing={
        <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          <span>
            <span className={summary.hidden.size > 0 ? 'text-text' : 'text-muted'}>
              {summary.hidden.size}
            </span>{' '}
            已隐藏
          </span>
          <span aria-hidden className="h-[12px] w-px bg-border" />
          <span>
            <span
              className={
                summary.highlighted.size > 0 ? 'text-accent-hot' : 'text-muted'
              }
            >
              {summary.highlighted.size}
            </span>{' '}
            已高亮
          </span>
        </span>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索词缀…"
            aria-label="搜索词缀"
            spellCheck={false}
            className="h-[28px] w-[200px] rounded-[3px] border border-border-2 bg-panel-2 pl-2 pr-6 text-[12px] text-text outline-none transition-colors placeholder:text-faint focus:border-accent-deep"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="清空搜索"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] text-faint transition-colors hover:text-accent-hot"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setEditedOnly((v) => !v)}
          title="仅显示含有隐藏或高亮阶级的词缀"
          className={`${FILTER_CHIP_CLASS} h-[28px] ${
            editedOnly
              ? 'border-accent-deep text-accent-hot'
              : 'border-border-2 text-faint hover:text-muted'
          }`}
        >
          仅看已编辑
        </button>

        <span aria-hidden className="mx-1 h-[20px] w-px bg-border" />

        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
          阶级
        </span>
        <div className="flex items-center gap-1">
          {TIER_LABELS.map((t, tier) => (
            <button
              key={t}
              type="button"
              title={`为列出的 ${listed.length} 个词缀切换阶级 ${t}`}
              disabled={listed.length === 0}
              onClick={() =>
                apply((prev) => toggleTierColumn(prev, typeId, tier, listedIds))
              }
              className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-border-2 font-mono text-[11px] font-semibold text-accent-deep transition-colors hover:border-accent-deep hover:text-accent-hot disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t}
            </button>
          ))}
        </div>

        <span aria-hidden className="mx-1 h-[20px] w-px bg-border" />

        <button
          type="button"
          onClick={() => apply((prev) => setAffixesVisible(prev, typeId, listedIds, true))}
          disabled={listed.length === 0}
          className={FILTER_BTN_CLASS}
        >
          {filtered ? `显示 ${listed.length} 项` : '全部显示'}
        </button>
        <button
          type="button"
          onClick={() => apply((prev) => setAffixesVisible(prev, typeId, listedIds, false))}
          disabled={listed.length === 0}
          className={FILTER_BTN_CLASS}
        >
          {filtered ? `隐藏 ${listed.length} 项` : '全部隐藏'}
        </button>

        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          <span className="text-muted">{listed.length}</span> / {FILTER_STATS.length}{' '}
          个词缀
        </span>
      </div>

      {listed.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-faint">
          {query.trim() ? `没有匹配“${query.trim()}”的词缀` : '没有可显示的词缀'}
          {editedOnly && ' · 仅看已编辑'}。
        </p>
      ) : (
        <div className="[column-gap:2rem] [column-width:290px]">
          {listed.map((stat) => (
            <AffixRow
              key={stat.id}
              stat={stat}
              states={statesFor(stat.id)}
              onToggleRow={onToggleRow}
              onCell={onCell}
            />
          ))}
        </div>
      )}
    </Panel>
  )
}

const AffixRow = memo(function AffixRow({
  stat,
  states,
  onToggleRow,
  onCell,
}: {
  stat: LootFilterStat
  states: string
  onToggleRow: (statId: number) => void
  onCell: (statId: number, tier: number, highlight: boolean) => void
}) {
  const edited = /[hH]/.test(states)
  return (
    <div className="flex break-inside-avoid items-center justify-between gap-2 py-[2px]">
      <button
        type="button"
        title="切换该词缀的所有阶级"
        onClick={() => onToggleRow(stat.id)}
        className={`min-w-0 truncate text-left text-[12px] transition-colors hover:text-accent-hot ${
          edited ? 'text-text' : 'text-muted'
        }`}
      >
        {stat.name}
      </button>
      <div className="flex gap-[3px]">
        {TIER_LABELS.map((t, tier) => (
          <FilterCell
            key={t}
            state={CELL_STATES[states[tier]!] ?? 'visible'}
            title={`${stat.name} · 阶级 ${t}`}
            onToggle={() => onCell(stat.id, tier, false)}
            onHighlight={() => onCell(stat.id, tier, true)}
          />
        ))}
      </div>
    </div>
  )
})
