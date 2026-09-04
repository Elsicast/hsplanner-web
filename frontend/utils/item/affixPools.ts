import { affixPools } from '@data'
import type { Affix, ItemBase } from '../../types'

// Item-type names as the game's affix tables use them (see data/affix-pools.json).
export type AffixPoolType = string

const POOL_BY_SLOT: Record<string, AffixPoolType> = {
  helmet: 'Helmet',
  armor: 'Chest',
  boots: 'Boots',
  gloves: 'Gloves',
  belt: 'Belt',
  amulet: 'Amulet',
  ring: 'Ring',
  charm: 'Charm',
  offhand: 'Shield',
  potion: 'Flask',
}

const POOL_BY_WEAPON_BASE: Record<string, AffixPoolType> = {
  Sword: 'Weapon:Melee',
  Mace: 'Weapon:Melee',
  Dagger: 'Weapon:Melee',
  Claw: 'Weapon:Melee',
  Axe: 'Weapon:Melee',
  Polearm: 'Weapon:Melee',
  Chainsaw: 'Weapon:Melee',
  Novelty: 'Weapon:Melee',
  Bow: 'Weapon:Ranged',
  Gun: 'Weapon:Ranged',
  'Rifle Gun': 'Weapon:Ranged',
  Throwing: 'Weapon:Ranged',
  '1-Handed Throwing Weapon': 'Weapon:Ranged',
  Staff: 'Weapon:Caster',
  Cane: 'Weapon:Caster',
  Wand: 'Weapon:Caster',
  Book: 'Weapon:Caster',
  Spellblade: 'Weapon:Caster',
  Flask: 'Weapon:Caster',
}

/** null = no pool data for this base, so nothing gets filtered out. */
export function affixPoolTypeFor(base: ItemBase | undefined): AffixPoolType | null {
  if (!base) return null
  if (base.slot === 'weapon') return POOL_BY_WEAPON_BASE[base.baseType] ?? null
  return POOL_BY_SLOT[base.slot.replace(/_\d+$/, '')] ?? null
}

const POOL_LABELS: Record<AffixPoolType, string> = {
  Helmet: '头盔',
  Chest: '胸甲',
  Boots: '鞋子',
  Gloves: '手套',
  Belt: '腰带',
  Amulet: '项链',
  Ring: '戒指',
  Charm: '护符',
  Shield: '盾牌',
  Flask: '药瓶',
  'Weapon:Melee': '近战武器',
  'Weapon:Ranged': '远程武器',
  'Weapon:Caster': '法系武器',
}

export function affixPoolLabel(poolType: AffixPoolType): string {
  return POOL_LABELS[poolType] ?? poolType
}

export function affixFitsPool(affix: Affix, poolType: AffixPoolType | null): boolean {
  if (!poolType) return true
  const pool = affixPools[affix.groupId]
  return pool ? pool.includes(poolType) : true
}
