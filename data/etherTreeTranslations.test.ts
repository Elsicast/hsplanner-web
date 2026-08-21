import { describe, expect, it } from 'vitest'
import etherTreeJson from './ether-tree.json'
import etherTreeZhCnJson from './ether-tree.zh-CN.json'
import etherTreeS10PatchJson from './seasons/s10/ether-tree.patch.json'

describe('以太树中文翻译', () => {
  it('覆盖基础与赛季新增的所有属性', () => {
    const expectedKeys = new Set([
      ...Object.keys(etherTreeJson.stats),
      ...Object.keys(etherTreeS10PatchJson.stats.add),
    ])

    expect(Object.keys(etherTreeZhCnJson).sort()).toEqual(
      [...expectedKeys].sort(),
    )
  })

  it('所有名称和说明都包含中文', () => {
    for (const translation of Object.values(etherTreeZhCnJson)) {
      expect(translation.label).toMatch(/[\u3400-\u9fff]/)
      expect(translation.desc).toMatch(/[\u3400-\u9fff]/)
    }
  })
})
