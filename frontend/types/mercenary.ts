import type { SlotKey } from './game'
import type { MercClassZh, SkillZh } from './zh'

export type MercSkillKind = 'active' | 'passive'

export interface MercSkill {
  id: string
  name: string
  zh?: SkillZh
  kind: MercSkillKind
  damageType: string | null
  shared: boolean
  description: string
}

export interface MercClass {
  id: string
  name: string
  zh?: MercClassZh
  role: string
  location: string
  skills: MercSkill[]
}

export interface MercData {
  maxSkillRank: number
  slots: SlotKey[]
  classes: MercClass[]
}
