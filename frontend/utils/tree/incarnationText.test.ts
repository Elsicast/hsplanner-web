import { describe, expect, it } from 'vitest'
import incarnationNodesJson from '@data/incarnation-nodes.json'
import incarnationS10PatchJson from '@data/seasons/s10/incarnation-nodes.patch.json'
import {
  translateIncarnationTag,
  translateIncarnationText,
  translateIncarnationTitle,
} from './incarnationText'

const HAN = /[\u3400-\u9fff]/
const allNodes = [
  ...Object.values(incarnationNodesJson),
  ...Object.values(incarnationS10PatchJson.add),
]

describe('化身树中文翻译', () => {
  it('覆盖所有赛季的节点标题、属性、注释和标签', () => {
    const missing: string[] = []
    for (const info of allNodes) {
      if (!HAN.test(translateIncarnationTitle(info.t))) missing.push(info.t)
      for (const line of info.l) {
        if (!HAN.test(translateIncarnationText(line))) missing.push(line)
      }
      if ('note' in info && info.note) {
        if (!HAN.test(translateIncarnationText(info.note))) missing.push(info.note)
      }
      if ('g' in info && info.g) {
        for (const tag of info.g) {
          if (!HAN.test(translateIncarnationTag(tag))) missing.push(tag)
        }
      }
    }
    expect([...new Set(missing)].sort()).toEqual([])
  })

  it('保留计算用原文中的数值', () => {
    expect(translateIncarnationText('+25 to Maximum Life')).toContain('+25')
    expect(translateIncarnationText('+8% Increased Physical Damage')).toContain(
      '+8%',
    )
  })

  it('展示文案不残留英文单词', () => {
    const remaining = new Set<string>()
    const collect = (text: string) => {
      for (const word of text.match(/[A-Za-z]{2,}/g) ?? []) remaining.add(word)
    }
    for (const info of allNodes) {
      collect(translateIncarnationTitle(info.t))
      info.l.map(translateIncarnationText).forEach(collect)
      if ('note' in info && info.note) collect(translateIncarnationText(info.note))
      if ('g' in info && info.g) info.g.map(translateIncarnationTag).forEach(collect)
    }
    expect([...remaining].sort()).toEqual([])
  })
})
