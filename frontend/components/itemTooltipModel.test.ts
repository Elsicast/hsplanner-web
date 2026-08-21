import { describe, expect, it } from 'vitest'
import { buildItemTooltipModel } from './itemTooltipModel'
import type { TooltipModelDeps } from './itemTooltipModel'
import {
  FORGE_KIND_LABEL,
  getAugment,
  getCrystalMod,
  getGem,
  getItem,
  getItemGrantedSkillByName,
  getItemSet,
  getRuneword,
} from '@data'
import { formatValue, statName } from '../utils/item/stats'
import { collectSocketGroups } from '../utils/item/socketStats'
import {
  translateItemEffect,
  translateItemName,
  translateSlotName,
} from '../utils/item/itemText'
import { displayStatName } from '../utils/item/itemStatText'
import type { EquippedItem } from '../types'

function eq(baseId: string, over: Partial<EquippedItem> = {}): EquippedItem {
  return {
    baseId,
    affixes: [],
    socketCount: 0,
    socketed: [],
    socketTypes: [],
    ...over,
  }
}

const emptyDisplay = (): TooltipModelDeps['display'] => ({
  implicitScaled: {},
  skillRankScaled: {},
  affixRanges: [],
})

function deps(over: Partial<TooltipModelDeps> = {}): TooltipModelDeps {
  return { display: emptyDisplay(), inventory: {}, ...over }
}

describe('buildItemTooltipModel', () => {
  it('puts base stats first as row lines (Defense/Damage/Block/Attacks per sec)', () => {
    const base = getItem('sword_angelic_st_mika_s_zweih_nder')
    if (!base) throw new Error('fixture item missing from game data')
    const model = buildItemTooltipModel(base, eq(base.id), deps())
    expect(model.sections[0].header).toBeUndefined()
    expect(model.sections[0].lines).toEqual([
      { kind: 'row', label: '伤害', value: `${base.damageMin}–${base.damageMax}` },
      { kind: 'row', label: '每秒攻击次数', value: `${base.attackSpeed}` },
    ])
  })

  it('renders implicit section with custom-override badge', () => {
    const base = getItem('boots_satanic_boots_of_wild')
    if (!base) throw new Error('fixture item missing from game data')
    expect(base.implicit).toHaveProperty('movement_speed')
    const model = buildItemTooltipModel(
      base,
      eq(base.id, { implicitOverrides: { movement_speed: 77 } }),
      deps(),
    )
    const impl = model.sections.find((s) => s.header?.text === '固有属性')
    if (!impl) throw new Error('implicit section missing')
    expect(impl.header).toEqual({ text: '固有属性', tone: 'gold' })
    expect(impl.lines).toContainEqual({
      kind: 'text',
      text: `${formatValue(77, 'movement_speed')} ${displayStatName('movement_speed')}`,
      style: 'implicit',
      badge: 'custom',
    })
  })

  it('splits affixes into standard (affix) and Unholy Affixes section (unholy)', () => {
    const base = getItem('boots_satanic_boots_of_wild')
    if (!base) throw new Error('fixture item missing from game data')
    const model = buildItemTooltipModel(
      base,
      eq(base.id, {
        affixes: [
          { affixId: '15_30_to_life_t1_bear', tier: 1, roll: 0, customValue: 99 },
          { affixId: 'random_unholy_to_strength', tier: 1, roll: 0, customValue: 50 },
        ],
      }),
      deps(),
    )
    const standard = model.sections.find(
      (s) => !s.header && s.lines.some((l) => l.kind === 'text' && l.style === 'affix'),
    )
    if (!standard) throw new Error('standard affix section missing')
    const stdLine = standard.lines.find((l) => l.kind === 'text' && l.style === 'affix')
    expect(stdLine).toMatchObject({ kind: 'text', style: 'affix', badge: 'custom' })
    expect(stdLine && stdLine.kind === 'text' && stdLine.text).toMatch(/^\+99 .*生命$/)
    const unholy = model.sections.find((s) => s.header?.text === '邪秽词缀')
    if (!unholy) throw new Error('unholy affix section missing')
    expect(unholy.header).toEqual({ text: '邪秽词缀', tone: 'pink' })
    const unLine = unholy.lines.find((l) => l.kind === 'text' && l.style === 'unholy')
    expect(unLine).toMatchObject({ kind: 'text', style: 'unholy', badge: 'custom' })
    expect(unLine && unLine.kind === 'text' && unLine.text).toMatch(/^\+50 .*力量$/)
  })

  it('builds granted skill entries with rank suffix, desc and computed lines', () => {
    const base = getItem('boots_heroic_pearlescent_dream')
    if (!base) throw new Error('fixture item missing from game data')
    const skill = getItemGrantedSkillByName('Holy Aura')
    if (!skill) throw new Error('granted skill Holy Aura missing from game data')
    const model = buildItemTooltipModel(
      base,
      eq(base.id),
      deps({
        display: {
          implicitScaled: {},
          skillRankScaled: { 'Holy Aura': [3, 3] },
          affixRanges: [],
        },
      }),
    )
    const section = model.sections.find((s) => s.header?.text === '授予技能效果')
    if (!section) throw new Error('granted skill section missing')
    expect(section.header).toEqual({ text: '授予技能效果', tone: 'orange' })
    const entry = section.lines.find(
      (l) => l.kind === 'entry' && l.title === translateItemName('Holy Aura'),
    )
    if (!entry || entry.kind !== 'entry') throw new Error('Holy Aura entry missing')
    expect(entry).toMatchObject({
      kind: 'entry',
      title: translateItemName('Holy Aura'),
      suffix: '等级 3',
      desc: translateItemEffect(skill.description),
    })
    expect(entry.lines).toEqual([
      `${formatValue(6, 'attack_damage')} ${statName('attack_damage')}`,
      `${formatValue(7.5, 'magic_skill_damage')} ${statName('magic_skill_damage')}`,
    ].map(translateItemEffect))
  })

  it('adds the flat base to conversion lines (Radiant Power on the Mantle)', () => {
    const base = getItem('body_armor_unholy_grand_arch_wizard_s_mantle')
    if (!base) throw new Error('fixture item missing from game data')
    const model = buildItemTooltipModel(
      base,
      eq(base.id),
      deps({
        display: {
          implicitScaled: {},
          skillRankScaled: { 'Radiant Power': [5, 15] },
          affixRanges: [],
        },
      }),
    )
    const section = model.sections.find((s) => s.header?.text === '授予技能效果')
    const entry = section?.lines.find(
      (l) => l.kind === 'entry' && l.title === translateItemName('Radiant Power'),
    )
    if (!entry || entry.kind !== 'entry') throw new Error('Radiant Power entry missing')
    expect(entry.suffix).toBe('等级 5-15')
    expect(entry.lines).toEqual([
      `0.95–1.45% of ${statName('mana')} added as ${statName('magic_skill_damage')}`,
    ].map(translateItemEffect))
  })

  it('uses runeword name, rare tone and runeword stat lines when detected', () => {
    const base = getItem('helmet_normal_cap')
    if (!base) throw new Error('fixture item missing from game data')
    const rw = getRuneword('rw_desert_s_wrath')
    if (!rw) throw new Error('runeword rw_desert_s_wrath missing from game data')
    const socketed = ['rune_nut', 'rune_pul', 'rune_old', 'rune_um']
    const model = buildItemTooltipModel(
      base,
      eq(base.id, {
        socketed,
        socketCount: 4,
        socketTypes: ['normal', 'normal', 'normal', 'normal'],
      }),
      deps(),
    )
    expect(model.name).toBe(translateItemName(rw.name))
    expect(model.tone).toBe('rare')
    expect(model.typeLine.startsWith('符文之语 · ')).toBe(true)
    const section = model.sections.find((s) =>
      s.lines.some((l) => l.kind === 'text' && l.style === 'runeword'),
    )
    if (!section) throw new Error('runeword stat section missing')
    for (const [k, v] of Object.entries(rw.stats)) {
      expect(section.lines).toContainEqual({
        kind: 'text',
        text: `${formatValue(v as number, k)} ${displayStatName(k)}`,
        style: 'runeword',
      })
    }
  })

  it('adds Forged section with FORGE_KIND_LABEL and forged style lines', () => {
    const base = getItem('boots_satanic_boots_of_wild')
    if (!base) throw new Error('fixture item missing from game data')
    const mod = getCrystalMod('crystal_satanic_to_strength')
    if (!mod) throw new Error('crystal mod missing from game data')
    const model = buildItemTooltipModel(
      base,
      eq(base.id, { forgedMods: [{ affixId: mod.id, tier: 1, roll: 1 }] }),
      deps(),
    )
    const section = model.sections.find((s) => s.header?.text?.startsWith('锻造 · '))
    if (!section) throw new Error('forged section missing')
    expect(section.header).toEqual({
      text: `锻造 · ${translateItemName(FORGE_KIND_LABEL.satanic_crystal)}`,
      tone: 'red',
    })
    expect(section.lines).toContainEqual({
      kind: 'text',
      text: translateItemEffect(mod.description),
      style: 'forged',
    })
  })

  it('adds From Sockets lines and set section with pieces trailing and active flags', () => {
    const base = getItem('amulet_satanic_anubis_oculus')
    if (!base || !base.setId) throw new Error('fixture set item missing from game data')
    const set = getItemSet(base.setId)
    if (!set) throw new Error('item set missing from game data')
    const gem = getGem('gem_chipped_amethyst')
    if (!gem) throw new Error('gem missing from game data')
    const equipped = eq(base.id, {
      socketed: [gem.id],
      socketCount: 1,
      socketTypes: ['normal'],
    })
    const member = eq(base.id)
    const bonus = set.bonuses[0]

    const active = buildItemTooltipModel(
      base,
      equipped,
      deps({ inventory: { a: member, b: member, c: member } }),
    )
    const sockets = active.sections.find((s) => s.header?.text === '镶嵌属性')
    if (!sockets) throw new Error('From Sockets section missing')
    expect(sockets.header).toEqual({ text: '镶嵌属性', tone: 'gold' })
    expect(sockets.lines).toEqual(
      collectSocketGroups(equipped, base).map((group) => ({
        kind: 'entry',
        style: 'socket',
        title: translateItemName(group.name),
        icon: group.name,
        lines: group.stats.map(
          ([k, v]) => `${formatValue(v, k)} ${displayStatName(k)}`,
        ),
      })),
    )
    const setActive = active.sections.find(
      (s) => s.header?.text === translateItemName(set.name),
    )
    if (!setActive) throw new Error('set section (active) missing')
    expect(setActive.header).toEqual({
      text: translateItemName(set.name),
      tone: 'green',
      trailing: `3/${set.items.length} 件`,
    })
    expect(setActive.lines).toContainEqual({
      kind: 'entry',
      title: `${bonus.pieces} 件套（已激活）`,
      style: 'set-active',
      lines: (bonus.descriptions ?? []).map(translateItemEffect),
    })
    expect(setActive.lines.at(-1)).toEqual({
      kind: 'entry',
      title: '套装物品',
      style: 'set-items',
      lines: set.items.map(
        (piece) =>
          `${piece.itemId === base.id ? '✓' : '·'} ${translateItemName(piece.name)}（${translateSlotName(piece.slot)}）`,
      ),
    })

    const inactive = buildItemTooltipModel(
      base,
      equipped,
      deps({ inventory: { a: member, b: member } }),
    )
    const setInactive = inactive.sections.find(
      (s) => s.header?.text === translateItemName(set.name),
    )
    if (!setInactive) throw new Error('set section (inactive) missing')
    expect(setInactive.header).toEqual({
      text: translateItemName(set.name),
      tone: 'green',
      trailing: `2/${set.items.length} 件`,
    })
    const locked = set.bonuses.find((b) => b.pieces > 2)
    if (!locked) throw new Error('set has no bonus above 2 pieces')
    expect(setInactive.lines).toContainEqual({
      kind: 'entry',
      title: `${locked.pieces} 件套`,
      style: 'set-inactive',
      lines: (locked.descriptions ?? []).map(translateItemEffect),
    })
  })

  it('adds procs, special effects and Not Yet Supported with footnote', () => {
    const stMika = getItem('sword_angelic_st_mika_s_zweih_nder')
    if (!stMika) throw new Error('fixture item missing from game data')
    if (!stMika.procs || stMika.procs.length === 0) throw new Error('fixture has no procs')
    const base = {
      ...stMika,
      uniqueEffects: ['Attacks can hit multiple enemies', 'Some Unsupported Mod'],
    }
    const model = buildItemTooltipModel(base, eq(base.id), deps())

    const proc0 = stMika.procs[0]
    const procSec = model.sections.find((s) =>
      s.lines.some((l) => l.kind === 'entry' && l.style === 'proc'),
    )
    if (!procSec) throw new Error('proc section missing')
    const procLine = procSec.lines.find((l) => l.kind === 'entry' && l.style === 'proc')
    if (!procLine || procLine.kind !== 'entry') throw new Error('proc entry missing')
    expect(procLine.title).toContain(translateItemEffect(proc0.description))
    expect(procLine.title).toContain(`${proc0.chance}%`)
    expect(procLine.desc).toBe(
      proc0.details ? translateItemEffect(proc0.details) : undefined,
    )

    const special = model.sections.find((s) => s.header?.text === '特殊效果')
    if (!special) throw new Error('special effects section missing')
    expect(special.header).toEqual({ text: '特殊效果', tone: 'gold' })
    expect(special.lines).toContainEqual({
      kind: 'text',
      text: translateItemEffect('Attacks can hit multiple enemies'),
      style: 'special',
    })

    const notSup = model.sections.find((s) => s.header?.text === '暂未支持')
    if (!notSup) throw new Error('not-yet-supported section missing')
    expect(notSup.header).toEqual({ text: '暂未支持', tone: 'muted' })
    expect(notSup.lines).toContainEqual({
      kind: 'text',
      text: translateItemEffect('Some Unsupported Mod'),
      style: 'unsupported',
    })
    expect(notSup.footnote).toBe('这些词缀尚未计入规划器计算。')
  })

  it('renders the Angelic Augment section with the stats of the selected level', () => {
    const base = getItem('boots_satanic_boots_of_wild')
    if (!base) throw new Error('fixture item missing from game data')
    const augment = getAugment('spell_slinger')
    if (!augment) throw new Error('fixture augment missing from game data')
    const level = 7
    const tier = augment.levels[level - 1]!
    const model = buildItemTooltipModel(
      base,
      eq(base.id, { augment: { id: augment.id, level } }),
      deps(),
    )
    const section = model.sections.find(
      (s) => s.header?.text === '天使增幅',
    )
    if (!section) throw new Error('augment section missing')
    expect(section.lines).toEqual([
      {
        kind: 'entry',
        title: translateItemName(augment.name),
        icon: augment.id,
        suffix: `等级 ${level}`,
        desc: translateItemEffect(augment.description),
        lines: Object.entries(tier.stats).map(
          ([k, v]) => `${formatValue(v as number, k)} ${displayStatName(k)}`,
        ),
      },
    ])
  })

  it('composes footer from Req Level, iLvl and Tier', () => {
    const boots = getItem('boots_satanic_boots_of_wild')
    if (!boots) throw new Error('fixture item missing from game data')
    expect(boots.requiresLevel).toBeDefined()
    expect(boots.grade).toBeDefined()
    const base = { ...boots, itemLevel: 60 }
    const model = buildItemTooltipModel(base, eq(base.id), deps())
    expect(model.footer).toBe(
      `需求等级 ${boots.requiresLevel} · 物品等级 60 · 阶级 ${boots.grade}`,
    )
  })
})
