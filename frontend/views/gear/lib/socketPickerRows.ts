import type { PickerRow } from '../PickerModal'
import { gems, runes } from '@data'
import { formatValue } from '../../../utils/item/stats'
import { gemColorForName, socketableIconForName } from './gearIcons'
import { buildSocketableTooltip } from '../tooltips'
import {
  translateItemEffect,
  translateItemName,
} from '../../../utils/item/itemText'
import { displayStatName } from '../../../utils/item/itemStatText'

let cache: PickerRow[] | null = null

function translatedStats(stats: Record<string, number>): string {
  return Object.entries(stats)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => `${formatValue(value, key)} ${displayStatName(key)}`)
    .join(' · ')
}

export function getSocketPickerRows(): PickerRow[] {
  if (cache) return cache
  const out: PickerRow[] = []
  for (const g of gems) {
    const isJewel = g.name.toLowerCase().includes('jewel')
    const kind = isJewel ? '珠宝' : '宝石'
    out.push({
      id: g.id,
      name: translateItemName(g.name),
      tier: g.tier,
      kindLabel: kind,
      group: isJewel ? '珠宝' : '宝石',
      meta: translatedStats(g.stats) || '—',
      searchTerms: [
        g.name,
        translateItemName(g.name),
        g.description ?? '',
        g.description ? translateItemEffect(g.description) : '',
        ...Object.keys(g.stats).flatMap((key) => [key, displayStatName(key)]),
      ].join(' ').toLowerCase(),
      iconColor: gemColorForName(g.name),
      iconUrl: socketableIconForName(g.name),
      tooltip: buildSocketableTooltip(g, isJewel ? 'JEWEL' : 'GEM'),
    })
  }
  for (const r of runes) {
    out.push({
      id: r.id,
      name: translateItemName(r.name),
      tier: r.tier,
      kindLabel: '符文',
      group: '符文',
      meta: translatedStats(r.stats) || '—',
      searchTerms: [
        r.name,
        translateItemName(r.name),
        r.description ?? '',
        r.description ? translateItemEffect(r.description) : '',
        ...Object.keys(r.stats).flatMap((key) => [key, displayStatName(key)]),
      ].join(' ').toLowerCase(),
      iconColor: 'var(--color-accent)',
      iconUrl: socketableIconForName(r.name),
      tooltip: buildSocketableTooltip(r, 'RUNE'),
    })
  }
  cache = out
  return out
}
