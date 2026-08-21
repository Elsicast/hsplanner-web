import { describe, expect, it } from 'vitest'
import {
  translateItemName,
  translateItemType,
  translateSlotName,
} from './itemText'

describe('物品展示翻译', () => {
  it('翻译物品名称并正确处理所有格', () => {
    expect(translateItemName("Desert's Wrath")).toBe('沙漠的愤怒')
    expect(translateItemName('Pearlescent Dream')).toBe('珠光梦境')
    expect(translateItemName('Chipped Amethyst')).toBe('碎裂的紫水晶')
  })

  it('翻译物品类型与带编号的装备槽位', () => {
    expect(translateItemType('Body Armor')).toBe('胸甲')
    expect(translateSlotName('Offhand')).toBe('副手')
    expect(translateSlotName('Ring 2')).toBe('戒指 2')
    expect(translateSlotName('charm_12')).toBe('咒符 12')
  })
})
