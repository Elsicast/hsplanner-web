import { translateIncarnationText } from '../tree/incarnationText'

const ITEM_TYPE_LABELS: Record<string, string> = {
  '1-Handed Throwing Weapon': '单手投掷武器',
  Amulet: '护符', Armor: '护甲', Axe: '斧', Belt: '腰带', 'Body Armor': '胸甲',
  Book: '法典', Boots: '靴子', Bow: '弓', Cane: '手杖', Chainsaw: '链锯', Charm: '咒符',
  Claw: '爪', Dagger: '匕首', Flask: '药剂瓶', Gloves: '手套', Gun: '枪械', Helmet: '头盔',
  Mace: '钉锤', Polearm: '长柄武器', Potion: '药水', Relic: '遗物', Ring: '戒指', Shield: '盾牌',
  Spell: '法术', Spellblade: '魔法刃', Staff: '法杖', Sword: '剑', Throwing: '投掷武器', Wand: '魔杖',
}

const ITEM_NAME_WORDS: Record<string, string> = {
  amulet: '护符', armor: '护甲', axe: '斧', battle: '战斗', belt: '腰带', blade: '之刃', blood: '鲜血',
  book: '法典', boots: '战靴', bow: '弓', bracelet: '手镯', breastplate: '胸甲', charm: '咒符', claw: '利爪',
  cloak: '斗篷', coat: '外套', compass: '罗盘', crown: '王冠', cuirass: '胸甲', dagger: '匕首', death: '死亡',
  demon: '恶魔', dragon: '巨龙', eye: '之眼', fall: '陨落', fire: '火焰', flame: '烈焰', flask: '药剂瓶',
  frozen: '冰封', gauntlets: '护手', gem: '宝石', girdle: '腰封', gloves: '手套', hammer: '战锤', head: '首级',
  heart: '之心', helm: '战盔', helmet: '头盔', honor: '荣耀', ice: '寒冰', insignia: '徽记', katana: '武士刀',
  king: '国王', knight: '骑士', lance: '长枪', leather: '皮甲', light: '光明', lord: '领主', mace: '钉锤',
  marchers: '行军靴', mask: '面具', medal: '勋章', necklace: '项链', orb: '宝珠', pendant: '吊坠', plate: '板甲',
  potion: '药水', prophet: '先知', relic: '遗物', ring: '戒指', sacred: '神圣', sand: '流沙', sash: '腰带',
  scythe: '镰刀', shadow: '暗影', shadows: '暗影', shield: '盾牌', signet: '印戒', skull: '颅骨', spear: '长矛',
  spirit: '灵魂', staff: '法杖', stone: '之石', storm: '风暴', sword: '长剑', talisman: '护符', thunder: '雷霆',
  venom: '剧毒', vial: '小瓶', visage: '面容', wall: '壁垒', wand: '魔杖', war: '战争', ward: '守护', wealth: '财富',
  wings: '羽翼', wrath: '愤怒', ancient: '远古', arcane: '奥术', burning: '燃烧', broken: '破碎', charcoal: '木炭',
  dark: '黑暗', eternal: '永恒', great: '伟大', high: '高阶', holy: '神圣', lost: '失落', mighty: '强大',
  molten: '熔火', precious: '珍宝', ritual: '仪式', shining: '闪耀', steel: '钢铁', treasure: '宝藏', unfathomable: '深不可测',
  agony: '痛苦', authority: '权柄', beacon: '信标', command: '统御', demise: '终结', eternity: '永恒', existence: '存在',
  fury: '狂怒', hunt: '狩猎', master: '大师', protection: '庇护', scorn: '蔑视', soulstone: '灵魂石', tooth: '尖牙', valor: '英勇',
  amethyst: '紫水晶', angelic: '天使', chipped: '碎裂的', crystal: '水晶', diamond: '钻石', dream: '梦境',
  emerald: '绿宝石', flawed: '有瑕的', jewel: '珠宝', pearlescent: '珠光', perfect: '完美的',
  ruby: '红宝石', rune: '符文', sapphire: '蓝宝石', satanic: '撒旦', topaz: '黄玉', augment: '增幅',
  bloodthirsty: '嗜血者', chestplate: '胸甲', coldsnap: '寒潮', curio: '奇物', devil: '魔鬼', eagle: '雄鹰',
  earth: '大地', elder: '长老', emblem: '徽章', engineer: '工程师', foliage: '枝叶', fractal: '分形',
  mark: '印记', medallion: '勋章', memento: '信物', pearl: '珍珠', philosopher: '贤者', robes: '长袍',
  satan: '撒旦', seeing: '洞察', sigil: '符印', tear: '泪滴',
}

const CONNECTORS: Record<string, string> = {
  of: '之', the: '', and: '与', for: '为', from: '自', in: '于',
}

const SLOT_LABELS: Record<string, string> = {
  Amulet: '项链', Armor: '护甲', Belt: '腰带', Boots: '靴子', Charm: '咒符',
  Gloves: '手套', Helmet: '头盔', Offhand: '副手', Potion: '药水', Relic: '遗物',
  Ring: '戒指', Weapon: '武器', amulet: '项链', armor: '护甲', belt: '腰带',
  boots: '靴子', charm: '咒符', gloves: '手套', helmet: '头盔', offhand: '副手',
  potion: '药水', relic: '遗物', ring: '戒指', weapon: '武器',
}

export function translateItemType(value: string): string {
  return ITEM_TYPE_LABELS[value] ?? translateIncarnationText(value)
}

export function translateItemName(value: string): string {
  return value
    .replace(/[´’]/g, "'")
    .split(/(\s+|-)/)
    .map((part) => {
      if (/^\s+$|^-$/.test(part)) return ' '
      const lower = part.toLowerCase()
      const possessive = lower.endsWith("'s")
      const root = possessive ? lower.slice(0, -2) : lower
      const rawRoot = possessive ? part.slice(0, -2) : part
      const translated =
        ITEM_NAME_WORDS[root] ?? CONNECTORS[root] ?? translateIncarnationText(rawRoot)
      return possessive ? `${translated}的` : translated
    })
    .join('')
    .replace(/([\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function translateItemEffect(value: string): string {
  return translateIncarnationText(value)
}

export function translateSlotName(value: string): string {
  const indexed = value.match(/^(.*?)(?:[_ ](\d+))$/)
  if (indexed) {
    const rawName = indexed[1]!
    const index = indexed[2]!
    return `${SLOT_LABELS[rawName] ?? translateItemType(rawName)} ${index}`
  }
  return SLOT_LABELS[value] ?? translateItemType(value)
}
