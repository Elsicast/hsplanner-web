import { useMemo } from 'react'
import { getAffix, getGem, getRune } from '@data'
import { formatValue, socketableStatLines, statName } from '../../utils/item/stats'
import { useAffixDisplayRanges } from '../gear/sections/AffixesSection'
import type { TreeSocketContent } from '../../types'
import {
  TooltipSection,
  TooltipSectionHeader,
  TooltipText,
} from '../../components/ui/Tooltip'

export function JewelrySocketSection({
  content,
  isAllocated,
}: {
  content: TreeSocketContent | null
  isAllocated: boolean
}) {
  const craftedAffixes = useMemo(
    () => (content && content.kind !== 'item' ? content.affixes : []),
    [content],
  )
  const craftedItems = useMemo(
    () =>
      craftedAffixes.map((eq) => ({
        def: getAffix(eq.affixId),
        roll: eq.roll,
      })),
    [craftedAffixes],
  )
  const craftedValues = useAffixDisplayRanges(craftedItems)

  if (!content) {
    return (
      <TooltipSection>
        <TooltipSectionHeader tone="gold">已镶嵌</TooltipSectionHeader>
        <TooltipText>
          <span className="text-faint italic">
            空插槽{isAllocated ? ' — 右键镶嵌' : ''}
          </span>
        </TooltipText>
      </TooltipSection>
    )
  }

  let socketedTitle: string
  let socketedSubtitle: string | null = null
  let statLines: { key: string; text: string }[] = []

  if (content.kind === 'item') {
    const source = getGem(content.id) ?? getRune(content.id)
    if (!source) {
      return (
        <TooltipSection>
          <TooltipSectionHeader tone="gold">已镶嵌</TooltipSectionHeader>
          <TooltipText>
            <span className="text-stat-red">
              未知可镶嵌物：{content.id}
            </span>
          </TooltipText>
        </TooltipSection>
      )
    }
    socketedTitle = source.name
    socketedSubtitle = `T${source.tier}`
    statLines = socketableStatLines(source.stats)
  } else {
    socketedTitle = '未切割珠宝'
    socketedSubtitle = `${content.affixes.length} 条词缀`
    statLines = craftedAffixes
      .map((eq, idx) => {
        const def = getAffix(eq.affixId)
        if (!def || !def.statKey) return null
        const value = craftedValues[idx]?.value ?? 0
        if (value === 0) return null
        return {
          key: def.statKey,
          text: `${formatValue(value, def.statKey)} ${statName(def.statKey)}`,
        }
      })
      .filter((x): x is { key: string; text: string } => x !== null)
  }

  return (
    <>
      <TooltipSection>
        <TooltipSectionHeader tone="gold" trailing={socketedSubtitle}>
          已镶嵌
        </TooltipSectionHeader>
        <div className="text-[12px] font-medium text-accent-hot">
          {socketedTitle}
        </div>
      </TooltipSection>
      {statLines.length > 0 && (
        <TooltipSection>
          <TooltipSectionHeader tone="gold">来自插槽的属性</TooltipSectionHeader>
          <ul className="space-y-0.5 text-[12px]">
            {statLines.map(({ key, text }) => (
              <li key={key} className="text-accent">
                {text}
              </li>
            ))}
          </ul>
        </TooltipSection>
      )}
    </>
  )
}
