import { useMemo, useState, type ReactNode } from 'react'
import PickerModal, { type PickerPanelState, type PickerRow } from '../PickerModal'
import { TooltipPanel } from '../../../components/ui/Tooltip'
import { augments, gameConfig, getAugment } from '@data'
import { AUGMENT_MAX_LEVEL } from '../../../types'
import type { EquippedItem } from '../../../types'
import { buildAugmentTooltip, NetChangeBlock } from '../tooltips'
import { withAugment, withAugmentLevel } from '../lib/itemEdits'
import { useHoverDpsDiff } from '../lib/useHoverDpsDiff'
import { augmentIconForId } from '../lib/gearIcons'
import { SectionCard } from '../SectionCard'
import {
  translateItemEffect,
  translateItemName,
} from '../../../utils/item/itemText'
import { displayStatName } from '../../../utils/item/itemStatText'

const AUGMENT_PICKER_ROWS: PickerRow[] = augments
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((a) => ({
    id: a.id,
    iconUrl: augmentIconForId(a.id),
    name: translateItemName(a.name),
    kindLabel: '强化石',
    meta: translateItemEffect(a.triggerNote),
    searchTerms: [
      a.name,
      translateItemName(a.name),
      a.description,
      translateItemEffect(a.description),
      a.triggerNote,
      translateItemEffect(a.triggerNote),
    ].join(' ').toLowerCase(),
    rarity: 'angelic' as const,
    tooltip: buildAugmentTooltip(a),
    tooltipTone: 'angelic' as const,
  }))

function AugmentSelectedPanel({
  state,
  equipped,
  level,
  dpsPreviewEnabled,
}: {
  state: PickerPanelState
  equipped: EquippedItem
  level: number
  dpsPreviewEnabled: boolean
}) {
  const sel = state.selectedId ? getAugment(state.selectedId) : undefined
  const hov =
    state.hoveredId && state.hoveredId !== state.selectedId
      ? getAugment(state.hoveredId)
      : undefined
  const variant = useMemo(
    () => (hov ? withAugmentLevel(withAugment(equipped, hov.id), level) : null),
    [equipped, hov, level],
  )
  const dps = useHoverDpsDiff('armor', equipped, variant, dpsPreviewEnabled)
  if (!sel) return null
  const tierAt = (a: NonNullable<typeof sel>) =>
    a.levels[Math.max(0, Math.min(a.levels.length - 1, level - 1))]
  const selTier = tierAt(sel)
  const hovTier = hov ? tierAt(hov) : undefined
  return (
    <TooltipPanel className="w-full" tone="angelic">
      {buildAugmentTooltip(hov ?? sel)}
      {selTier && hovTier && (
        <NetChangeBlock
          previous={selTier.stats}
          next={hovTier.stats}
          dpsDiffs={dps?.diffs}
          activeSkillName={dps?.activeSkillName}
        />
      )}
    </TooltipPanel>
  )
}

export function AugmentSection({
  equipped,
  onSetAugment,
  onSetAugmentLevel,
  dpsPreviewEnabled = true,
}: {
  equipped: EquippedItem
  onSetAugment: (id: string | null) => void
  onSetAugmentLevel: (level: number) => void
  dpsPreviewEnabled?: boolean
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const aug = equipped.augment ? getAugment(equipped.augment.id) : undefined
  const level = equipped.augment?.level ?? 1
  const tier = aug?.levels[Math.max(0, Math.min(aug.levels.length - 1, level - 1))]

  const renderSelectedPanel = (state: PickerPanelState): ReactNode =>
    state.selectedId ? (
      <AugmentSelectedPanel
        state={state}
        equipped={equipped}
        level={level}
        dpsPreviewEnabled={dpsPreviewEnabled}
      />
    ) : null

  return (
    <SectionCard
      label="天使增幅"
      tone="angelic"
      rightSlot={
        aug ? (
          <button
            onClick={() => onSetAugment(null)}
            className="rounded-xs border border-border-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-stat-red hover:text-stat-red"
            aria-label="移除强化石"
          >
            移除
          </button>
        ) : undefined
      }
      bodyClassName="p-3 space-y-2.5"
    >
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="group flex w-full items-center justify-between gap-2 rounded-[3px] border border-yellow-200/30 px-3 py-2 text-left transition-all hover:border-yellow-200/60 hover:shadow-[0_0_12px_rgba(252,233,128,0.15)]"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,29,36,0.7), rgba(13,14,18,0.5))',
        }}
      >
        <span className="flex min-w-0 items-center gap-2">
          {aug && augmentIconForId(aug.id) && (
            <img
              src={augmentIconForId(aug.id)}
              alt=""
              width={22}
              height={22}
              style={{ imageRendering: 'pixelated' }}
            />
          )}
          <span
            className={`truncate text-[13px] font-medium ${
              aug ? 'text-yellow-200' : 'text-faint italic'
            }`}
          >
            {aug ? translateItemName(aug.name) : '选择强化石…'}
          </span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint group-hover:text-yellow-200">
          浏览 →
        </span>
      </button>

      {pickerOpen && (
        <PickerModal
          title="选择天使增幅"
          sectionLabel="强化石"
          rows={AUGMENT_PICKER_ROWS}
          selectedId={equipped.augment?.id ?? null}
          searchPlaceholder="搜索强化石…"
          emptyMessage="没有匹配的强化石"
          width={680}
          allowClear={!!equipped.augment}
          onClear={() => onSetAugment(null)}
          onSelect={(id) => onSetAugment(id)}
          onClose={() => setPickerOpen(false)}
          selectedPanel={renderSelectedPanel}
        />
      )}

      {aug && tier && (
        <div className="space-y-2.5">
          <div
            className="flex items-center gap-2.5 rounded-[3px] border border-yellow-200/15 bg-bg/40 px-2.5 py-1.5"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-yellow-200/70">
              等级
            </span>
            <input
              type="range"
              min={1}
              max={AUGMENT_MAX_LEVEL}
              value={level}
              onChange={(e) => onSetAugmentLevel(Number(e.target.value))}
              className="flex-1"
              style={{
                ['--sl-pct' as never]:
                  ((level - 1) / Math.max(1, AUGMENT_MAX_LEVEL - 1)) * 100 +
                  '%',
              }}
            />
            <span className="w-7 text-center font-mono text-[12px] tabular-nums text-yellow-200">
              {level}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-faint">
              / {AUGMENT_MAX_LEVEL}
            </span>
          </div>

          <p className="text-[11px] leading-snug text-text/85">
            {translateItemEffect(aug.description)}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-xs border border-yellow-200/25 bg-bg/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-yellow-200/80">
              {translateItemEffect(aug.triggerNote)}
            </span>
            {tier.procChance !== undefined && tier.procChance !== null && (
              <span className="rounded-xs border border-yellow-200/25 bg-bg/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-yellow-200/80">
                触发 {tier.procChance}%
              </span>
            )}
            {tier.procDurationSec !== undefined &&
              tier.procDurationSec !== null && (
                <span className="rounded-xs border border-yellow-200/25 bg-bg/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-yellow-200/80">
                  {tier.procDurationSec}s
                </span>
              )}
            {tier.cost !== undefined && (
              <span className="rounded-xs border border-yellow-200/25 bg-bg/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-yellow-200/80">
                消耗 {tier.cost} 把钥匙
              </span>
            )}
          </div>

          {Object.keys(tier.stats).length > 0 && (
            <div className="rounded-[3px] border border-yellow-200/15 bg-bg/40 p-2">
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-yellow-200/70">
                属性
              </div>
              <ul className="space-y-0.5 text-[11px]">
                {Object.entries(tier.stats).map(([key, val]) => {
                  const def = gameConfig.stats.find((s) => s.key === key)
                  const label = displayStatName(key)
                  const sign = (val as number) >= 0 ? '+' : ''
                  const suffix = def?.format === 'percent' ? '%' : ''
                  return (
                    <li key={key} className="flex justify-between">
                      <span className="text-text/80">{label}</span>
                      <span className="font-mono tabular-nums text-yellow-200">
                        {sign}
                        {val as number}
                        {suffix}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {tier.meta && Object.keys(tier.meta).length > 0 && (
            <ul className="space-y-0.5 px-1 text-[10px] text-faint">
              {Object.entries(tier.meta).map(([key, val]) => (
                <li key={key} className="flex justify-between">
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono">{val as number}</span>
                </li>
              ))}
            </ul>
          )}

          {aug.rangedOnly && (
            <div className="rounded-xs border border-orange-300/40 bg-orange-300/5 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-orange-300/85">
              需要远程武器
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}
