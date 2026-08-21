import { RARITY_LABEL } from '../views/gear/lib/rarity'
import {
  activeSeasonId,
  canStarForge,
  detectRuneword,
  effectiveStars,
  FORGE_KIND_LABEL,
  forgeKindFor,
  getAffix,
  getAugment,
  getCrystalMod,
  getGem,
  getItem,
  getItemGrantedSkillByName,
  getItemSet,
} from '@data'
import { BONUS_SOCKET_MOD_ID } from '../store/itemRules'
import type {
  Affix,
  EquippedAffix,
  EquippedItem,
  ItemBase,
  ItemGrantedSkill,
  ItemRarity,
  RangedValue,
} from '../types'
import {
  formatAffixRangeFromValues,
  formatValue,
  isZero,
  shouldScaleImplicit,
  statName,
} from '../utils/item/stats'
import { collectSocketGroups } from '../utils/item/socketStats'
import type { AffixValueOutput } from '../utils/calc/bridge'
import type { TooltipTone } from './tooltipTones'
import {
  translateItemEffect,
  translateItemName,
  translateItemType,
  translateSlotName,
} from '../utils/item/itemText'
import { displayStatName } from '../utils/item/itemStatText'

export type TooltipHeaderTone = 'gold' | 'orange' | 'red' | 'pink' | 'green' | 'muted'

// prefiks linii w 'set-items' — renderer po nim poznaje zalozona sztuke
export const EQUIPPED_MARK = '✓'

export type TooltipLineStyle =
  | 'implicit'
  | 'affix'
  | 'affix-missing'
  | 'unholy'
  | 'unholy-missing'
  | 'runeword'
  | 'forged'
  | 'socket'
  | 'set-active'
  | 'set-inactive'
  | 'set-items'
  | 'proc'
  | 'special'
  | 'unsupported'
  | 'muted'

export type TooltipLine =
  | { kind: 'row'; label: string; value: string }
  | {
      kind: 'text'
      text: string
      style: TooltipLineStyle
      italic?: boolean
      small?: boolean
      badge?: string
    }
  | {
      kind: 'entry'
      title: string
      style?: TooltipLineStyle
      suffix?: string
      desc?: string
      // Resolved to a sprite by the renderer.
      icon?: string
      lines: string[]
    }

export interface TooltipSectionModel {
  header?: { text: string; tone: TooltipHeaderTone; trailing?: string }
  lines: TooltipLine[]
  footnote?: string
}

export interface ItemTooltipModel {
  name: string
  tone: TooltipTone
  typeLine: string
  imageId: string
  sections: TooltipSectionModel[]
  footer?: string
}

export interface TooltipModelDeps {
  display: {
    implicitScaled: Record<string, [number, number]>
    skillRankScaled: Record<string, [number, number]>
    affixRanges: (AffixValueOutput | null)[]
  }
  inventory: Record<string, EquippedItem | null>
}

export const RARITY_TONE: Record<ItemRarity, TooltipTone> = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  mythic: 'mythic',
  satanic: 'satanic',
  heroic: 'heroic',
  angelic: 'angelic',
  satanic_set: 'satanic_set',
  unholy: 'unholy',
  relic: 'relic',
}

const TRIGGER_LABEL: Record<string, string> = {
  on_hit: '命中时',
  on_attack: '攻击时',
  when_struck: '受到攻击时',
  on_kill: '击杀时',
  on_cast: '施法时',
  on_block: '格挡时',
  on_death: '死亡时',
  aura: '光环：',
  passive: '',
}

const RECOGNIZED_EFFECTS = new Set([
  'attacks can hit multiple enemies',
  'cannot be frozen',
  'unholy',
  'movement phasing',
  'piercing attack',
  'half freeze duration',
  'double jump',
  'herobound',
  'all skills class',
])

const NOT_SUPPORTED_FOOTNOTE = '这些词缀尚未计入规划器计算。'

type TextLineExtra = { italic?: boolean; small?: boolean; badge?: string }

function textLine(
  text: string,
  style: TooltipLineStyle,
  extra?: TextLineExtra,
): TooltipLine {
  return { kind: 'text', text, style, ...extra }
}

interface GrantedSkillEntry {
  skill: ItemGrantedSkill
  displayRank: string
  lines: string[]
}

export function buildItemTooltipModel(
  base: ItemBase,
  equipped: EquippedItem | undefined,
  deps: TooltipModelDeps,
): ItemTooltipModel {
  const { display, inventory } = deps

  const runeword = equipped ? detectRuneword(base, equipped.socketed) : undefined
  const tone: TooltipTone = runeword ? 'rare' : RARITY_TONE[base.rarity]

  const set = base.setId ? getItemSet(base.setId) : undefined
  const equippedPieceIds = new Set(
    Object.values(inventory).flatMap((eq) => (eq ? [eq.baseId] : [])),
  )
  const setEquippedCount = base.setId
    ? Object.values(inventory).reduce((acc, eq) => {
        if (!eq) return acc
        const b = getItem(eq.baseId)
        return b?.setId === base.setId ? acc + 1 : acc
      }, 0)
    : 0

  const typeLine = buildTypeLine(base, equipped, runeword)

  const scaleImplicit = shouldScaleImplicit(!!runeword)
  const implicitEntries = buildImplicitEntries(base, equipped, display, scaleImplicit)
  const skillBonusEntries = base.skillBonuses ? Object.entries(base.skillBonuses) : []

  const grantedSkillEntries = buildGrantedSkillEntries(base, display)
  const grantedSkillNames = new Set(
    grantedSkillEntries.map((e) => e.skill.name.trim().toLowerCase()),
  )
  const visibleSkillBonusEntries = skillBonusEntries.filter(
    ([skill]) => !grantedSkillNames.has(skill.trim().toLowerCase()),
  )
  const runewordEntries = runeword
    ? Object.entries(runeword.stats).filter(([, v]) => v !== 0)
    : []

  const socketGroups = equipped ? collectSocketGroups(equipped, base) : []
  const displayName = buildDisplayName(base, equipped, runeword)
  const equippedForgedMods = equipped?.forgedMods ?? []
  const forgeKind = canStarForge(base.slot, activeSeasonId)
    ? forgeKindFor(base.rarity)
    : null

  const sections: TooltipSectionModel[] = []

  const baseStatRows = buildBaseStatRows(base)
  if (baseStatRows.length > 0) sections.push({ lines: baseStatRows })

  const implicitLines: TooltipLine[] = [
    ...implicitEntries.map(([key, value, isCustom]) =>
      textLine(
        `${formatValue(value, key)} ${displayStatName(key)}`,
        'implicit',
        isCustom ? { badge: 'custom' } : undefined,
      ),
    ),
    ...visibleSkillBonusEntries.map(([skill, val]) =>
      textLine(`${formatValue(val, '')} ${translateItemName(skill)}`, 'implicit'),
    ),
  ]
  if (implicitLines.length > 0) {
    sections.push({ header: { text: '固有属性', tone: 'gold' }, lines: implicitLines })
  }

  if (grantedSkillEntries.length > 0) {
    sections.push({
      header: { text: '授予技能效果', tone: 'orange' },
      lines: grantedSkillEntries.map((e): TooltipLine => ({
        kind: 'entry',
        title: translateItemName(e.skill.name),
        suffix: `等级 ${e.displayRank}`,
        ...(e.skill.description ? { desc: translateItemEffect(e.skill.description) } : {}),
        lines: e.lines.map(translateItemEffect),
      })),
    })
  }

  if (runewordEntries.length > 0) {
    sections.push({
      lines: runewordEntries.map(([key, val]) =>
        textLine(`${formatValue(val as number, key)} ${displayStatName(key)}`, 'runeword'),
      ),
    })
  }

  const { standard, unholy } = buildAffixLines(equipped?.affixes ?? [], display)
  if (standard.length > 0) sections.push({ lines: standard })
  if (unholy.length > 0) {
    sections.push({ header: { text: '邪秽词缀', tone: 'pink' }, lines: unholy })
  }

  if (equippedForgedMods.length > 0 && forgeKind) {
    const forgedLines = equippedForgedMods
      .map((eq) => getCrystalMod(eq.affixId))
      .filter((mod): mod is Affix => !!mod)
      .map((mod) => textLine(translateItemEffect(mod.description), 'forged'))
    if (forgedLines.length > 0) {
      sections.push({
        header: {
          text: `锻造 · ${translateItemName(FORGE_KIND_LABEL[forgeKind])}`,
          tone: 'red',
        },
        lines: forgedLines,
      })
    }
  }

  if (socketGroups.length > 0) {
    sections.push({
      header: { text: '镶嵌属性', tone: 'gold' },
      lines: socketGroups.map((group): TooltipLine => ({
        kind: 'entry',
        style: 'socket',
        title: group.count > 1
          ? `${translateItemName(group.name)} ×${group.count}`
          : translateItemName(group.name),
        icon: group.name,
        lines: group.stats.map(([k, v]) => `${formatValue(v, k)} ${displayStatName(k)}`),
      })),
    })
  }

  const augment = equipped?.augment ? getAugment(equipped.augment.id) : undefined
  const augmentTier = augment
    ? augment.levels[
        Math.max(
          0,
          Math.min(augment.levels.length - 1, (equipped?.augment?.level ?? 1) - 1),
        )
      ]
    : undefined
  if (augment && augmentTier) {
    const augmentLines = Object.entries(augmentTier.stats)
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => `${formatValue(v as number, k)} ${displayStatName(k)}`)
    if (augmentTier.procChance !== undefined) {
      const duration = augmentTier.procDurationSec
      augmentLines.push(
        `${augmentTier.procChance}% ${augment.triggerNote.toLowerCase()}${
          duration !== undefined ? ` · ${duration}s` : ''
        }`,
      )
    }
    sections.push({
      header: { text: '天使增幅', tone: 'gold' },
      lines: [
        {
          kind: 'entry',
          title: translateItemName(augment.name),
          icon: augment.id,
          suffix: `等级 ${equipped?.augment?.level ?? 1}`,
          desc: translateItemEffect(augment.description),
          lines: augmentLines.map(translateItemEffect),
        },
      ],
    })
  }

  if (set && set.bonuses.length > 0) {
    sections.push({
      header: {
        text: translateItemName(set.name),
        tone: 'green',
        trailing: `${setEquippedCount}/${set.items.length} 件`,
      },
      lines: [
        ...set.bonuses.map((bonus): TooltipLine => {
          const active = setEquippedCount >= bonus.pieces
          return {
            kind: 'entry',
            title: active ? `${bonus.pieces} 件套（已激活）` : `${bonus.pieces} 件套`,
            style: active ? 'set-active' : 'set-inactive',
            lines: (bonus.descriptions ?? []).map(translateItemEffect),
          }
        }),
        {
          kind: 'entry',
          title: '套装物品',
          style: 'set-items',
          lines: set.items.map(
            (piece) =>
              `${equippedPieceIds.has(piece.itemId) ? EQUIPPED_MARK : '·'} ${translateItemName(piece.name)}（${translateSlotName(piece.slot)}）`,
          ),
        },
      ],
    })
  }

  if (base.procs && base.procs.length > 0) {
    sections.push({
      lines: base.procs.map((p): TooltipLine => {
        const chancePart = p.chance !== undefined ? `${p.chance}% ` : ''
        const triggerPart = TRIGGER_LABEL[p.trigger]
          ? `Chance ${TRIGGER_LABEL[p.trigger]} to `
          : ''
        return {
          kind: 'entry',
          title: translateItemEffect(`${chancePart}${triggerPart}${p.description}`),
          style: 'proc',
          ...(p.details ? { desc: translateItemEffect(p.details) } : {}),
          lines: [],
        }
      }),
    })
  }

  if (base.uniqueEffects && base.uniqueEffects.length > 0) {
    const effects = base.uniqueEffects
    const special = effects.filter((e) => RECOGNIZED_EFFECTS.has(e.trim().toLowerCase()))
    const notSupported = effects.filter(
      (e) => !RECOGNIZED_EFFECTS.has(e.trim().toLowerCase()),
    )
    if (special.length > 0) {
      sections.push({
        header: { text: '特殊效果', tone: 'gold' },
        lines: special.map((e) => textLine(translateItemEffect(e), 'special')),
      })
    }
    if (notSupported.length > 0) {
      sections.push({
        header: { text: '暂未支持', tone: 'muted' },
        lines: notSupported.map((e) => textLine(translateItemEffect(e), 'unsupported')),
        footnote: NOT_SUPPORTED_FOOTNOTE,
      })
    }
  }

  const descLines: TooltipLine[] = []
  if (base.description) descLines.push(textLine(translateItemEffect(base.description), 'muted', { italic: true }))
  if (base.flavor) descLines.push(textLine(translateItemEffect(base.flavor), 'muted', { italic: true }))
  if (descLines.length > 0) sections.push({ lines: descLines })

  const footer = buildFooter(base, runeword)

  return {
    name: displayName,
    tone,
    typeLine,
    imageId: base.id,
    sections,
    ...(footer ? { footer } : {}),
  }
}

function buildTypeLine(
  base: ItemBase,
  equipped: EquippedItem | undefined,
  runeword: ReturnType<typeof detectRuneword>,
): string {
  const stars = effectiveStars(base.slot, activeSeasonId, equipped?.stars) ?? 0
  const starSuffix = stars > 0 ? ` · ${'★'.repeat(stars)}` : ''
  const handSuffix =
    base.slot === 'weapon' ? (base.twoHanded ? ' · 双手' : ' · 单手') : ''
  const isTinkered = !!equipped?.forgedMods?.some(
    (m) => m.affixId === BONUS_SOCKET_MOD_ID,
  )
  const tinkeredSuffix = isTinkered ? ' · 已工艺改造' : ''
  const rarityLabel = runeword ? '符文之语' : RARITY_LABEL[base.rarity]
  return `${rarityLabel} · ${translateItemType(base.baseType)}${handSuffix}${starSuffix}${tinkeredSuffix}`
}

function buildDisplayName(
  base: ItemBase,
  equipped: EquippedItem | undefined,
  runeword: ReturnType<typeof detectRuneword>,
): string {
  if (runeword) return translateItemName(runeword.name)
  const gemNames: string[] = []
  if (equipped && base.socketTransforms) {
    for (const id of equipped.socketed) {
      if (id && base.socketTransforms[id]) {
        const gem = getGem(id)
        if (gem) gemNames.push(translateItemName(gem.name))
      }
    }
  }
  const baseName = translateItemName(base.name)
  return gemNames.length > 0 ? `${baseName}（${gemNames.join(' + ')}）` : baseName
}

function buildBaseStatRows(base: ItemBase): TooltipLine[] {
  const rows: TooltipLine[] = []
  if (base.defenseMin !== undefined && base.defenseMax !== undefined) {
    rows.push({ kind: 'row', label: '防御', value: `${base.defenseMin}–${base.defenseMax}` })
  }
  if (base.damageMin !== undefined && base.damageMax !== undefined) {
    rows.push({ kind: 'row', label: '伤害', value: `${base.damageMin}–${base.damageMax}` })
  }
  if (base.blockChance !== undefined) {
    rows.push({ kind: 'row', label: '格挡', value: `${base.blockChance}%` })
  }
  if (base.attackSpeed !== undefined) {
    rows.push({ kind: 'row', label: '每秒攻击次数', value: `${base.attackSpeed}` })
  }
  return rows
}

function buildImplicitEntries(
  base: ItemBase,
  equipped: EquippedItem | undefined,
  display: TooltipModelDeps['display'],
  scaleImplicit: boolean,
): Array<[string, RangedValue, boolean]> {
  const implicitOverrides = equipped?.implicitOverrides
  const baseImplicitEntries: Array<[string, RangedValue, boolean]> = base.implicit
    ? Object.entries(base.implicit)
        .map(([k, v]): [string, RangedValue, boolean] => {
          const override = implicitOverrides?.[k]
          if (override !== undefined) return [k, override, true]
          const scaled = scaleImplicit ? (display.implicitScaled[k] ?? v) : v
          return [k, scaled, false]
        })
        .filter(([, v]) => !isZero(v))
    : []
  const extraImplicitEntries: Array<[string, RangedValue, boolean]> = implicitOverrides
    ? Object.entries(implicitOverrides)
        .filter(([k]) => !base.implicit || !(k in base.implicit))
        .map(([k, v]): [string, RangedValue, boolean] => [k, v, true])
    : []
  return [...baseImplicitEntries, ...extraImplicitEntries]
}

const round2 = (n: number): number => Math.round(n * 100) / 100

function buildGrantedSkillEntries(
  base: ItemBase,
  display: TooltipModelDeps['display'],
): GrantedSkillEntry[] {
  if (!base.skillBonuses) return []
  const out: GrantedSkillEntry[] = []
  for (const skillName of Object.keys(base.skillBonuses)) {
    const skill = getItemGrantedSkillByName(skillName)
    if (!skill) continue
    const [sMin, sMax] = display.skillRankScaled[skillName] ?? [0, 0]
    const rMin = Math.round(sMin)
    const rMax = Math.round(sMax)
    if (rMax <= 0) continue
    const displayRank = rMin === rMax ? String(rMin) : `${rMin}-${rMax}`
    const lines: string[] = []
    if (skill.passiveConverts) {
      for (const c of skill.passiveConverts.perRank) {
        const pctMin = round2((c.basePct ?? 0) + c.pct * rMin)
        const pctMax = round2((c.basePct ?? 0) + c.pct * rMax)
        const pctText = pctMin === pctMax ? `${pctMin}%` : `${pctMin}–${pctMax}%`
        lines.push(`${pctText} of ${statName(c.from)} added as ${statName(c.to)}`)
      }
    }
    if (skill.passiveStats) {
      const { base: baseStats, perRank } = skill.passiveStats
      const totals: Record<string, [number, number]> = {}
      if (baseStats) {
        for (const [k, v] of Object.entries(baseStats)) totals[k] = [v, v]
      }
      if (perRank) {
        for (const [k, v] of Object.entries(perRank)) {
          const cur = totals[k] ?? [0, 0]
          totals[k] = [cur[0] + v * rMin, cur[1] + v * rMax]
        }
      }
      for (const [k, pair] of Object.entries(totals)) {
        const [a, b] = pair
        if (a === 0 && b === 0) continue
        lines.push(`${formatValue(a === b ? a : pair, k)} ${statName(k)}`)
      }
    }
    out.push({ skill, displayRank, lines })
  }
  return out
}

function buildAffixLines(
  equippedAffixes: EquippedAffix[],
  display: TooltipModelDeps['display'],
): { standard: TooltipLine[]; unholy: TooltipLine[] } {
  const standard: TooltipLine[] = []
  const unholy: TooltipLine[] = []
  equippedAffixes.forEach((eq, idx) => {
    const affix = getAffix(eq.affixId)
    if (!affix) return
    const isUnholy = affix.groupId === 'random_unholy'
    const line = buildAffixLine(eq, affix, isUnholy, display.affixRanges[idx] ?? null)
    ;(isUnholy ? unholy : standard).push(line)
  })
  return { standard, unholy }
}

function buildAffixLine(
  eq: EquippedAffix,
  affix: Affix,
  isUnholy: boolean,
  range: AffixValueOutput | null,
): TooltipLine {
  if (!affix.statKey) {
    return textLine(translateItemEffect(affix.description), isUnholy ? 'unholy-missing' : 'affix-missing')
  }
  const descNoValue = translateItemEffect(affix.description)
    .replace(/^[+-]?\[?[^\]]*]?%?\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
  const valueDisplay =
    eq.customValue !== undefined
      ? formatValue(eq.customValue, affix.statKey)
      : formatAffixRangeFromValues(affix, range)
  return textLine(
    `${valueDisplay} ${descNoValue}`,
    isUnholy ? 'unholy' : 'affix',
    eq.customValue !== undefined ? { badge: 'custom' } : undefined,
  )
}

function buildFooter(
  base: ItemBase,
  runeword: ReturnType<typeof detectRuneword>,
): string | undefined {
  const requiresLevel = runeword?.requiresLevel ?? base.requiresLevel
  const footerBits: string[] = []
  if (requiresLevel !== undefined) footerBits.push(`需求等级 ${requiresLevel}`)
  if (base.itemLevel) footerBits.push(`物品等级 ${base.itemLevel}`)
  if (base.grade) footerBits.push(`阶级 ${base.grade}`)
  return footerBits.length > 0 ? footerBits.join(' · ') : undefined
}
