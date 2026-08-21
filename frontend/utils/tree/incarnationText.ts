const EXACT_TRANSLATIONS: Record<string, string> = {
  'After 5 attacks guardians unleash a Sand Beam':
    '守卫攻击 5 次后会释放一道沙之光束',
  'Chance on hit to unleash a Sand Ripple dealing damage on a radius around the target':
    '命中时有概率释放沙之涟漪，对目标周围造成范围伤害',
  'Gain 50% increased total cast rate but over heat after 10 casts causing decreased cast rate but increased total damage':
    '总施法速度提高 50%，但施法 10 次后会过热，降低施法速度并提高总伤害',
  'Increased Damaging Aura Radius': '提高伤害光环半径',
  'Life replenish now happens every 2 seconds with increased power':
    '生命恢复改为每 2 秒触发一次，但恢复效果增强',
  'Path to any Black Hole': '连接至任意黑洞节点',
  'Summon projectile chain hits unleash a Void Blast dealing damage around the target':
    '召唤物投射物连锁命中时释放虚空爆破，对目标周围造成伤害',
  'Summons explode at 25% life dealing area of effect fire damage based on their life':
    '召唤物在生命降至 25% 时爆炸，基于其生命造成火焰范围伤害',
  'Summons now explode instantly after coming in contact with a monster':
    '召唤物接触怪物后会立即爆炸',
  'You can no longer dodge monster attacks but also cannot be stunned or frozen':
    '你无法再闪避怪物攻击，但也不会被眩晕或冻结',
  'You can now dual wield Two Handed Melee Weapons': '你现在可以双持双手近战武器',
  'You cannot regenerate life from life replenish anymore':
    '你无法再通过生命恢复来回复生命',
  'Your Maximum All Resistances are capped to 50%': '你的最大全抗性上限固定为 50%',
  'Your skill weapon type restrictions are removed': '移除技能的武器类型限制',
}

const PHRASE_TRANSLATIONS: Array<[string, string]> = [
  ['Critical Strike Chance', '暴击概率'],
  ['fire an additional projectile when performing a ranged attack', '进行远程攻击时发射一个额外投射物'],
  ['when performing a ranged attack', '进行远程攻击时'],
  ['fire an additional projectile', '发射一个额外投射物'],
  ['fire additional projectiles', '发射额外投射物'],
  ['fire multiple projectiles', '发射多个投射物'],
  ['fire a homing missile', '发射一枚追踪飞弹'],
  ['perform it an additional time', '额外执行一次'],
  ['of your', '你的'],
  ['Increased All Attributes', '全属性提高'],
  ['Critical Strike Damage', '暴击伤害'],
  ['Magic Skill Damage', '魔法技能伤害'],
  ['Ranged Projectile Damage', '远程投射物伤害'],
  ['Melee Projectile Damage', '近战投射物伤害'],
  ['Spell Projectile Damage', '法术投射物伤害'],
  ['Summon Projectile Damage', '召唤物投射物伤害'],
  ['Area of Effect Spell Damage', '范围法术伤害'],
  ['Area of Effect Damage', '范围伤害'],
  ['Area of Effect Radius', '范围半径'],
  ['Damage Returned to Attacker', '反伤'],
  ['Damage Returned against Bosses', '对首领反伤'],
  ['Damage Return against Bosses', '对首领反伤'],
  ['Damage Taken Recovered as Mana', '所受伤害转化为法力'],
  ['Damage Taken Reduced', '受到的伤害降低'],
  ['Damage Taken Mitigated', '所受伤害减免'],
  ['Maximum All Resistances', '最大全抗性'],
  ['Total All Resistances', '总全抗性'],
  ['All Resistances', '全抗性'],
  ['Maximum Life', '最大生命'],
  ['Maximum Mana', '最大法力'],
  ['Maximum Damage', '最大伤害'],
  ['Minimum Damage', '最小伤害'],
  ['Physical Damage Reduction', '物理伤害减免'],
  ['Magic Damage Reduction', '魔法伤害减免'],
  ['Physical Damage', '物理伤害'],
  ['Arcane Skill Damage', '奥术技能伤害'],
  ['Cold Skill Damage', '冰冷技能伤害'],
  ['Fire Skill Damage', '火焰技能伤害'],
  ['Lightning Skill Damage', '闪电技能伤害'],
  ['Poison Skill Damage', '毒素技能伤害'],
  ['Arcane Resistance', '奥术抗性'],
  ['Cold Resistance', '冰冷抗性'],
  ['Fire Resistance', '火焰抗性'],
  ['Lightning Resistance', '闪电抗性'],
  ['Poison Resistance', '毒素抗性'],
  ['Arcane Break', '奥术击破'],
  ['Cold Break', '冰冷击破'],
  ['Fire Break', '火焰击破'],
  ['Lightning Break', '闪电击破'],
  ['Poison Break', '毒素击破'],
  ['Elemental Break', '元素击破'],
  ['Attack Speed', '攻击速度'],
  ['Faster Cast Rate', '施法速度'],
  ['Movement Speed', '移动速度'],
  ['Attack Rating', '攻击命中'],
  ['Attack Range', '攻击范围'],
  ['Melee Attack Range', '近战攻击范围'],
  ['Melee Enhanced Damage', '近战强化伤害'],
  ['Ranged Enhanced Damage', '远程强化伤害'],
  ['Enhanced Damage', '强化伤害'],
  ['Spell Haste', '法术急速'],
  ['Spell Duration', '法术持续时间'],
  ['Spell Area of Effect', '法术范围'],
  ['Spell Mana Leech', '法术法力吸取'],
  ['Life Replenish', '生命恢复'],
  ['Mana Replenish', '法力恢复'],
  ['Life Steal', '生命偷取'],
  ['Mana Steal', '法力偷取'],
  ['Light Radius', '照明半径'],
  ['Crowd Control', '控制效果'],
  ['Damage Reduction', '伤害减免'],
  ['Damage Mitigation', '伤害缓解'],
  ['Damage Returned', '反伤'],
  ['Target Defense', '目标防御'],
  ['Critical Hits', '暴击'],
  ['Crushing Blow', '粉碎打击'],
  ['Deadly Blow', '致命一击'],
  ['Hit Recovery', '受击恢复'],
  ['Magic Find', '魔法发现'],
  ['Summon Attack Speed', '召唤物攻击速度'],
  ['Summon Attack Radius', '召唤物攻击范围'],
  ['Summon Maximum Life', '召唤物最大生命'],
  ['Summon Melee Damage', '召唤物近战伤害'],
  ['Summon Splash Damage', '召唤物溅射伤害'],
  ['Summon Damage', '召唤物伤害'],
  ['Summon Life', '召唤物生命'],
  ['Guardian Attack Speed', '守卫攻击速度'],
  ['Guardian Damage', '守卫伤害'],
  ['Sentry Attack Speed', '哨戒攻击速度'],
  ['Sentry Damage', '哨戒伤害'],
  ['Projectile Speed', '投射物速度'],
  ['Projectile Size', '投射物尺寸'],
  ['Projectile Damage', '投射物伤害'],
  ['Explosion Damage', '爆炸伤害'],
  ['Explosion Skills', '爆炸技能'],
  ['Explosion Area of Effect', '爆炸范围'],
  ['Orbital Spell Damage', '环绕法术伤害'],
  ['Orbital Spell Duration', '环绕法术持续时间'],
  ['Orbital Spell Size', '环绕法术尺寸'],
  ['Orbiting Skill Damage', '环绕技能伤害'],
  ['Orbiting Skill Duration', '环绕技能持续时间'],
  ['Orbiting Skill Size', '环绕技能尺寸'],
  ['Orbiting Skill Speed', '环绕技能速度'],
  ['Ailment Tick Frequency', '异常状态触发频率'],
  ['Ailment Frequency', '异常状态频率'],
  ['Ailment Damage', '异常状态伤害'],
  ['Bleed Frequency', '流血频率'],
  ['Bleed Damage', '流血伤害'],
  ['Bleeding Stacks', '流血层数'],
  ['Burning Duration', '燃烧持续时间'],
  ['Burning Damage', '燃烧伤害'],
  ['Burning Stacks', '燃烧层数'],
  ['Poisoned Duration', '中毒持续时间'],
  ['Poisoned Frequency', '中毒频率'],
  ['Poisoned Damage', '中毒伤害'],
  ['Poisoned Stacks', '中毒层数'],
  ['Stasis Duration', '停滞持续时间'],
  ['Stasis Damage', '停滞伤害'],
  ['Stasis Stacks', '停滞层数'],
  ['Frostbite Duration', '冻伤持续时间'],
  ['Shadowburn Duration', '暗影灼烧持续时间'],
  ['Two Handed Melee Weapon', '双手近战武器'],
  ['Two Handed Weapon', '双手武器'],
  ['Two-Handed', '双手'],
  ['dual wielding', '双持'],
  ['Dual Wielding', '双持'],
  ['when wielding', '装备'],
  ['while wielding', '装备'],
  ['when using', '使用'],
  ['while using', '使用'],
  ['at Full Life', '满生命时'],
  ['at Low Life', '低生命时'],
  ['below 40% Maximum Life', '低于 40% 最大生命时'],
  ['below 40% of Maximum Life', '低于 40% 最大生命时'],
  ['per second', '每秒'],
  ['per Stack', '每层'],
  ['per stack', '每层'],
  ['per point', '每点'],
  ['per points', '每点'],
  ['on hit', '命中时'],
  ['on cast', '施法时'],
  ['on attack', '攻击时'],
  ['when struck', '受到攻击时'],
  ['after being hit', '被命中后'],
  ['after kill', '击杀后'],
  ['for a short duration', '短时间内'],
  ['additional time', '额外一次'],
  ['additional projectile', '额外投射物'],
  ['additional monster', '额外怪物'],
  ['cannot be stunned or frozen', '免疫眩晕和冻结'],
  ['Chance to', '概率'],
  ['Chance for', '概率使'],
  ['Chance on', '概率在'],
  ['Increased Total', '总'],
  ['Increased', '提高'],
  ['increased', '提高'],
  ['Decreased', '降低'],
  ['Reduced', '降低'],
  ['converted to', '转化为'],
  ['Converted to', '转化为'],
  ['added as', '附加为'],
  ['Added as', '附加为'],
  ['dealt as', '造成'],
  ['based on', '基于'],
  ['Damage Taken', '所受伤害'],
  ['Incoming Damage', '受到的伤害'],
  ['Damage Dealt', '造成的伤害'],
  ['Maximum Stacks', '最大层数'],
  ['Maximum Summon Amount', '最大召唤数量'],
  ['Maximum Summoned Guardians', '最大守卫召唤数量'],
  ['Socketable Slot', '可镶嵌槽位'],
  ['First Aid', '急救'],
  ['Cooldown Recovered', '冷却时间恢复'],
  ['Excecution Treshold', '斩杀阈值'],
  ['Overflow Effectiveness', '溢出效果'],
  ['Stun & Freeze Immunity', '眩晕与冻结免疫'],
]

const WORD_TRANSLATIONS: Record<string, string> = {
  absolute: '绝对', weakness: '弱点', accurate: '精准', cleaver: '劈砍者',
  agile: '敏捷', vigor: '活力', wizard: '巫师', agitation: '躁动', agonizing: '痛苦', heat: '灼热',
  ailment: '异常状态', all: '全部', attributes: '属性', resistances: '抗性', amplified: '强化',
  armor: '护甲', dexterity: '敏捷', intelligence: '智力', strength: '力量', energy: '能量', vitality: '耐力',
  ant: '蚂蚁', crusher: '粉碎者', anti: '反', magic: '魔法', shell: '护壳', warrior: '战士',
  apothecary: '药剂师', arcana: '奥秘', arcane: '奥术', destruction: '毁灭', touch: '之触',
  break: '击破', damage: '伤害', impact: '冲击', resistance: '抗性', arcanist: '奥术师',
  area: '范围', effect: '效果', conversion: '转化', armory: '军械库', artillery: '炮击',
  asphyxiating: '窒息', astral: '星界', tank: '壁垒', attack: '攻击', range: '范围', rating: '命中', speed: '速度',
  aura: '光环', radius: '半径', avalanche: '雪崩', boulders: '巨石', axe: '斧', bad: '恶臭', gas: '毒气',
  barrel: '桶', battle: '战斗', toughness: '坚韧', black: '黑色', hole: '洞', bleed: '流血', bleeding: '流血',
  blessed: '祝福', knight: '骑士', vanguard: '先锋', blindspot: '盲区', bloating: '膨胀', organs: '器官', blood: '鲜血', loss: '流失',
  blunt: '钝击', trauma: '创伤', bounty: '赏金', hunting: '狩猎', bow: '弓', mastery: '精通', buffing: '增益', bulk: '厚重',
  bulwark: '壁垒', burn: '燃烧', burning: '燃烧', burstshot: '爆裂射击', carnage: '杀戮', carving: '雕琢', sharpness: '锋锐', shot: '射击',
  chaining: '连锁', malignance: '恶意', chaos: '混沌', meteor: '陨石', charge: '冲锋', citadel: '堡垒', cleaving: '劈裂', spirits: '灵魂',
  close: '近身', combat: '战斗', cold: '冰冷', collateral: '波及', explosion: '爆炸', colossal: '巨型', monstrosity: '怪物', projectiles: '投射物',
  colossus: '巨像', slayer: '杀手', mitigation: '减免', combusting: '燃烧', carcass: '躯体', commander: '指挥官', concentrated: '集中', concentration: '专注',
  conjured: '召唤', legion: '军团', corroded: '腐蚀', veins: '血脉', covering: '覆盖', battlefield: '战场', critical: '暴击', absolution: '赦免',
  crowd: '群体', control: '控制', diminish: '衰减', cull: '斩杀', weak: '弱者', dagger: '匕首', defense: '防御', defensive: '防御型',
  battlemage: '战斗法师', fighter: '斗士', deflecting: '偏转', aegis: '神盾', delayed: '延迟', gratification: '满足', desert: '沙漠', ripple: '涟漪',
  divine: '神圣', essence: '精华', dodge: '闪避', master: '大师', double: '双重', cast: '施法', jump: '跳跃', duration: '持续时间',
  echoing: '回响', failure: '失败', failior: '失败', effective: '有效', suppression: '压制', elemental: '元素', energetic: '能量充沛', enlarged: '增大',
  storm: '风暴', ether: '以太', pull: '牵引', evading: '闪避', force: '力量', evasion: '闪避', tactics: '战术', explosive: '爆炸', expertise: '专精',
  extra: '额外', projectile: '投射物', faster: '更快', wands: '魔杖', feast: '盛宴', elements: '元素', festering: '溃烂', fire: '火焰',
  first: '第一', aid: '援助', flask: '药剂', regeneration: '恢复', flying: '飞散', debris: '碎片', forking: '分叉', fragile: '脆弱', berserker: '狂战士',
  frostbite: '冻伤', frozen: '冰冻', fulminating: '爆燃', flames: '烈焰', furious: '狂怒', smash: '猛击', garrote: '绞杀', giant: '巨人',
  gigantus: '巨灵', guardian: '守卫', gun: '枪械', heart: '核心', hercules: '赫拉克勒斯', grip: '之握', holy: '神圣', presence: '气息',
  homing: '追踪', missile: '飞弹', hulking: '庞大', hunger: '饥渴', mana: '法力', hunter: '猎人', resilience: '韧性', hurricane: '飓风', bones: '骸骨',
  ignoring: '无视', pain: '痛苦', immortal: '不朽', goliath: '巨人', immovable: '不可撼动', object: '之物', increased: '提高',
  jewelry: '珠宝', power: '力量', leech: '吸取', life: '生命', light: '光明', darkness: '黑暗', lightning: '闪电', lingering: '延续',
  living: '活体', long: '长距', orbit: '轨道', lost: '失去', lower: '降低', mage: '法师', guard: '守卫', tolerance: '耐受',
  magister: '魔导师', intellect: '智慧', malicious: '恶毒', funnel: '灌注', infused: '灌注', hour: '时', glass: '沙漏', redirection: '转移',
  steal: '偷取', fueled: '驱动', fury: '狂怒', well: '源泉', staves: '法杖', wand: '魔杖', handler: '驾驭者', mechanical: '机械', engineering: '工程学',
  melee: '近战', minimum: '最小', maximum: '最大', mirage: '海市蜃楼', mirror: '镜像', valhalla: '英灵殿', monsters: '怪物', rest: '安息', peace: '安宁',
  multishot: '多重射击', multiforking: '多重分叉', nature: '自然', prophet: '先知', escape: '逃脱', nowhere: '无处', hide: '藏身', oak: '橡木', shield: '盾牌',
  orbital: '环绕', orbiting: '环绕', landmass: '陆块', paid: '献祭', paradox: '悖论', patience: '耐心', peak: '巅峰', phasing: '穿行',
  physical: '物理', piercing: '穿透', frostburn: '霜灼', ignition: '点燃', stasis: '停滞', toxins: '毒素', poison: '毒素', poisoned: '中毒',
  precision: '精准', precise: '精准', striking: '打击', pyromancer: '火焰术士', quickstep: '迅步', quillboar: '刺鬃兽', rage: '怒气', raging: '狂怒',
  maniac: '狂人', titan: '泰坦', ramming: '冲撞', rampage: '暴走', ramping: '叠升', pulse: '脉冲', advantage: '优势', ranger: '游侠',
  rapid: '迅捷', corrosion: '腐蚀', mending: '修复', rays: '射线', replenishing: '恢复', retaliatory: '反击', returned: '反伤', risky: '冒险',
  rocket: '火箭', barrage: '齐射', roll: '投掷', dice: '骰子', rupturing: '破裂', safe: '安全', landing: '着陆', sand: '沙之', beam: '光束',
  self: '自我', flagellation: '鞭笞', sentry: '哨戒', shadowburn: '暗影灼烧', sharp: '尖锐', thorns: '荆棘', shattering: '粉碎', maiden: '少女',
  siphoning: '虹吸', skill: '技能', stacks: '层数', slow: '缓慢', slug: '重弹', slinger: '射手', soldier: '士兵', prayer: '祈祷', soul: '灵魂',
  soulburn: '灵魂灼烧', spacetime: '时空', spacial: '空间', spell: '法术', spellbender: '法术操纵者', spellfork: '法术分叉',
  spirit: '灵体', scatter: '散射', spiritual: '灵性', fulfilment: '圆满', stacked: '叠加', pandemic: '瘟疫', stacking: '叠加', stampede: '践踏',
  static: '静电', shock: '冲击', turbulence: '湍流', surging: '奔涌', swinging: '旋转', axes: '斧刃', temporal: '时间', echo: '回响',
  ripper: '撕裂者', thorned: '荆棘', throwing: '投掷', thundergod: '雷神', time: '时间', surge: '涌动', total: '总', trembling: '震荡',
  headshot: '爆头', tundramagus: '苔原法师', unarmed: '徒手', wargod: '战神', unholy: '邪秽', unstable: '不稳定', powder: '火药',
  valkyrie: '女武神', embrace: '拥抱', vampiric: '吸血', vampirism: '吸血术', venomancer: '毒术师', venomous: '剧毒', viking: '维京',
  last: '最后', stand: '坚守', vile: '邪恶', pustules: '脓疱', vital: '生命', spirituality: '灵性', vitalizing: '焕发生机', void: '虚空', blast: '爆破',
  wallbanger: '撞墙者', warlock: '术士', wizardry: '巫术', wrath: '愤怒', wood: '伐木', cutter: '工', ying: '阴', yang: '阳',
  big: '核心', keystone: '基石', notable: '核心天赋', minor: '小天赋', root: '起始', warp: '传送门', socket: '插槽',
  second: '第二', normal: '普通',
  bull: '公牛', eye: '之眼', reach: '延伸', deadeye: '神射手', marksman: '射手', deadly: '致命', parkour: '腾跃',
  just: '只要', dont: '别', get: '被', hit: '命中', knockback: '击退', manafury: '法力狂怒', manahunger: '法力饥渴',
  manawell: '法力源泉', powerfunnel: '力量灌注', powerfunneled: '力量灌注', lifespan: '生命力', powershot: '强力射击', struck: '受击', effectiveness: '效果',
  from: '从', to: '至', of: '之', the: '', and: '与', against: '对抗', over: '持续',
}

const TAG_TRANSLATIONS: Record<string, string> = {
  'Area of Effect': '范围效果',
  Passive: '被动',
  Spell: '法术',
  Projectile: '投射物',
  Ranged: '远程',
  Melee: '近战',
  Shield: '盾牌',
  Summon: '召唤物',
  Aura: '光环',
  Elemental: '元素',
  Attack: '攻击',
  Defense: '防御',
  Utility: '功能',
}

const EXTRA_WORD_TRANSLATIONS: Record<string, string> = {
  absorb: '吸收', additional: '额外', after: '之后', ailments: '异常状态', antimagus: '反魔法师',
  applicable: '适用', arrow: '箭矢', attacker: '攻击者', attacks: '攻击', baseline: '基础', bone: '骸骨', branch: '分支',
  cane: '手杖', cap: '上限', chance: '概率', charging: '冲锋', cloud: '云雾', costs: '消耗', critically: '暴击', crushing: '粉碎',
  damaging: '伤害型', dark: '黑暗', deal: '造成', death: '死亡', does: '会', duality: '双重性', enables: '启用', evade: '闪避',
  every: '每', far: '远处', fired: '发射', flasks: '药剂', fork: '分叉', fragment: '碎片', gain: '获得', handed: '手', healed: '治疗',
  hitting: '命中', ignored: '无视', immunity: '免疫', increases: '提高', inflicted: '施加', knock: '击退', leap: '跃击', leeching: '吸取',
  level: '等级', low: '低', maces: '锤', manacost: '法力消耗', manafueled: '法力驱动', manafunnel: '法力灌注', manainfused: '法力灌注',
  mitigated: '减免', monster: '怪物', negative: '负值', offense: '进攻', overflowing: '溢出', ranged: '远程', rate: '速率',
  reaching: '延伸', replenished: '恢复', return: '反伤', seconds: '秒', sentries: '哨戒', shattered: '击破', shatters: '击破',
  shockwave: '冲击波', short: '短距', skills: '技能', spellhit: '法术命中', spells: '法术', staff: '法杖', stolen: '偷取', stun: '眩晕',
  suffocating: '窒息', summon: '召唤物', suppressed: '压制', suppressive: '压制', swords: '剑', tnt: '炸药', tarethiel: '塔瑞希尔',
  them: '它们', throw: '投掷', till: '直到', transfusion: '灌注', two: '双', up: '上', weapon: '武器', when: '当', wielder: '持盾者',
  you: '你', your: '你的', added: '附加', air: '空中', also: '同时', amount: '数量', any: '任意', around: '周围', arrows: '箭矢',
  attacking: '攻击时', away: '远离', back: '回', below: '低于', block: '格挡', boss: '首领', bosses: '首领', both: '两者', branches: '分支',
  buff: '增益', call: '召唤', can: '可以', cannot: '无法', capping: '达到上限', casting: '施法', casts: '次施法', cause: '使',
  certain: '特定', chain: '连锁', colliding: '碰撞', combination: '组合', cone: '锥形', converted: '转化', cooldowns: '冷却时间',
  creates: '产生', current: '当前', daggers: '匕首', damaged: '受伤', dealing: '造成', destroy: '摧毁', down: '倒地', drained: '消耗',
  each: '每个', effects: '效果', element: '元素', executed: '斩杀', explode: '爆炸', explosions: '爆炸', gaining: '获得', grant: '赋予',
  grenades: '手榴弹', half: '一半', happens: '触发', havoc: '肆虐', heals: '治疗', immune: '免疫', incoming: '受到的', increasing: '提高',
  inflict: '施加', inherited: '继承', instant: '立即', instead: '改为', into: '进入', jumping: '跳跃', knocking: '击退', leave: '留下',
  less: '较少', longer: '更久', lowered: '降低', mid: '半', missiles: '飞弹', multiple: '多个', nearby: '附近', non: '非',
  odin: '奥丁', one: '一次', only: '仅', other: '其他', outwards: '向外', perform: '执行', performed: '执行', performing: '进行',
  point: '点', points: '点', poisonous: '剧毒', proc: '触发', provides: '提供', reaking: '肆虐', recover: '恢复', regenerated: '恢复',
  removed: '移除', replenish: '恢复', restrictions: '限制', same: '相同', scaling: '加成', single: '单次', slain: '被击杀', sources: '来源',
  spawn: '生成', spikes: '尖刺', splash: '溅射', stack: '层', stunning: '眩晕', summoning: '召唤时', summons: '召唤物', suppress: '压制',
  suppressing: '压制时', take: '承受', taken: '受到', taking: '承受', target: '目标', terrain: '地形', through: '穿过', tick: '每跳',
  towards: '朝向', trees: '天赋树', type: '类型', unleash: '释放', unleashed: '释放', value: '数值', weapons: '武器', while: '当',
  wield: '装备', with: '使用', work: '生效', zaps: '电击', applicableto: '适用于',
  dual: '双持', per: '每', rd: '阶',
}

const OMIT_WORDS = new Set([
  'a', 'an', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'in', 'is', 'it',
  'its', 'no', 'not', 'now', 'of', 'on', 'or', 'that', 'the', 'to', 'with',
])

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeText(value: string): string {
  return value.replace(/[´’]/g, "'").trim()
}

export function translateIncarnationText(value: string): string {
  let normalized = normalizeText(value)
  const exact = EXACT_TRANSLATIONS[normalized]
  if (exact) return exact

  const numericPrefix = '([+\\-]+\\d+(?:\\.\\d+)?%?)'
  normalized = normalized
    .replace(
      new RegExp(`^${numericPrefix}\\s+Chance to inflict\\s+(.+)\\s+on hit$`, 'i'),
      '$1 命中时施加 $2 的概率',
    )
    .replace(new RegExp(`^${numericPrefix}\\s+Chance to\\s+(.+)$`, 'i'), '$1 $2 的概率')
    .replace(new RegExp(`^${numericPrefix}\\s+Chance for\\s+(.+)$`, 'i'), '$1 $2 的概率')
    .replace(new RegExp(`^${numericPrefix}\\s+Increased Total\\s+`, 'i'), '$1 总')
    .replace(new RegExp(`^${numericPrefix}\\s+Increased\\s+`, 'i'), '$1 ')
    .replace(new RegExp(`^${numericPrefix}\\s+to\\s+`, 'i'), '$1 ')

  let translated = normalized
  translated = translated.replace(/(\d+(?:\.\d+)?)\s*s\b/gi, '$1 秒')
  for (const [source, target] of PHRASE_TRANSLATIONS) {
    translated = translated.replace(
      new RegExp(`\\b${escapeRegExp(source)}\\b`, 'gi'),
      target,
    )
  }
  translated = translated.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (word) => {
    const key = word.toLowerCase()
    const possessive = key.endsWith("'s")
    const root = possessive ? key.slice(0, -2) : key
    const replacement =
      WORD_TRANSLATIONS[root] ?? EXTRA_WORD_TRANSLATIONS[root] ??
      (OMIT_WORDS.has(root) ? '' : word)
    return possessive && replacement !== word ? `${replacement}的` : replacement
  })
  return translated
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/,\s*/g, '，')
    .replace(/;\s*/g, '；')
    .replace(/\.\s*/g, '。')
    .replace(/([\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function translateIncarnationTitle(value: string): string {
  return translateIncarnationText(value)
}

export function translateIncarnationTag(value: string): string {
  return TAG_TRANSLATIONS[value] ?? translateIncarnationText(value)
}

export function translateIncarnationKind(value: string): string {
  if (value === 'root') return '起始节点'
  if (value === 'warp') return '传送门节点'
  if (value === 'jewelry') return '珠宝插槽'
  if (value === 'big') return '核心天赋'
  return '小天赋'
}
