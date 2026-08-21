import {
  SELF_CONDITION_KEYS,
  SELF_CONDITION_LABELS,
} from '../../utils/tree/treeStats'

export const ENEMY_CONDITIONS: {
  key: string
  label: string
  color?: string
}[] = [
  { key: 'burning', label: '敌人灼烧', color: 'text-stat-red' },
  { key: 'poisoned', label: '敌人中毒', color: 'text-stat-green' },
  {
    key: 'frozenbite',
    label: '敌人 Frost Bitten',
    color: 'text-stat-blue',
  },
  { key: 'stunned', label: '敌人眩晕' },
  { key: 'bleeding', label: '敌人流血' },
  { key: 'shocked', label: '敌人 Stasis', color: 'text-stat-orange' },
  {
    key: 'deep_frozen',
    label: '敌人 Deep Frozen',
    color: 'text-stat-blue',
  },
  {
    key: 'shadow_burn',
    label: '敌人 Shadow Burned',
    color: 'text-stat-purple',
  },
  { key: 'frozen', label: '敌人冰冻', color: 'text-stat-blue' },
  { key: 'slow', label: '敌人减速' },
  { key: 'low_life', label: '敌人低血量' },
  { key: 'serrated_chains', label: '敌人带有 Serrated Chains' },
  {
    key: 'lightning_break',
    label: '敌人带有 Lightning Break',
    color: 'text-stat-orange',
  },
  { key: 'fire_break', label: '敌人带有 Fire Break', color: 'text-stat-red' },
  { key: 'cold_break', label: '敌人带有 Cold Break', color: 'text-stat-blue' },
  {
    key: 'arcane_break',
    label: '敌人带有 Arcane Break',
    color: 'text-stat-purple',
  },
  {
    key: 'poison_break',
    label: '敌人带有 Poison Break',
    color: 'text-stat-green',
  },
  { key: 'is_boss', label: '目标是首领' },
]

export const PLAYER_CONDITIONS: { key: string; label: string }[] =
  SELF_CONDITION_KEYS.map((k) => ({ key: k, label: SELF_CONDITION_LABELS[k] }))

export const ENEMY_RESISTANCE_TYPES: { key: string; label: string }[] = [
  { key: 'fire', label: '火' },
  { key: 'cold', label: '冰' },
  { key: 'lightning', label: '闪电' },
  { key: 'poison', label: '毒' },
  { key: 'arcane', label: '奥术' },
]

export const RESIST_COLOR: Record<string, string> = {
  fire: 'text-stat-red',
  cold: 'text-stat-blue',
  lightning: 'text-stat-orange',
  poison: 'text-stat-green',
  arcane: 'text-stat-purple',
}
