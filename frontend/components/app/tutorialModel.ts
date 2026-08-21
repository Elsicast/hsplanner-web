import type { Section } from '../../App'

export const TUTORIAL_DONE_KEY = 'hsplanner.tutorial.done.v1'

export interface TutorialStep {
  target?: string
  section?: Section
  // CSS selector clicked on step entry (opens modals/overlays for the step)...
  act?: string
  // ...and one clicked on step exit to close what act opened
  undo?: string
  title: string
  body: string
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Le Fish au Tutorial',
    body: '*pulp* 一场带你走遍规划器每个角落的导览。使用“下一步”或方向键移动，随时按 Esc 跳过。',
  },
  {
    target: 'sections',
    title: '板块',
    body: '所有内容都在这些标签页里。教程会逐一讲解每个板块，然后再介绍它们周边的工具。',
  },
  {
    section: 'character',
    target: 'view',
    title: '角色',
    body: '整个构建的仪表盘（快速摘要）：总 DPS、抗性与防御、主动技能、增益和触发效果。',
  },
  {
    section: 'tree',
    target: 'view',
    title: '天赋树',
    body: '左键点击节点加点，右键点击移除点数。拖拽平移、滚轮缩放 — Ctrl+Z / Ctrl+Y 可撤销和重做任何改动。',
  },
  {
    section: 'tree',
    target: 'tree-search',
    title: '天赋树搜索',
    body: '按名称或内部 #id 查找节点 — 在本标签页任意位置按 Ctrl+F 即可聚焦搜索框。旁边是“适配”（Fit）和“重置”（Reset），“推荐”（Suggest）会建议接下来值得点出的节点。',
  },
  {
    section: 'tree',
    target: 'suggest-modal',
    act: '[data-tour="tree-suggest"]',
    undo: '[data-tour="suggest-modal"] [aria-label="关闭"]',
    title: '推荐',
    body: '设置 1 到 200 之间的点数预算，让引擎推荐有价值的化身（incarnation）节点。建议会先在树上预览，确认后再应用。',
  },
  {
    section: 'ether',
    target: 'view',
    title: '以太领域',
    body: '拥有独立点数池的第二棵树。操作方式与天赋树相同，包括 Ctrl+F 搜索。',
  },
  {
    section: 'skills',
    target: 'view',
    title: '技能',
    body: '你职业的技能树：分配技能等级、展开子技能，并标记你的构建正在使用的技能 — 伤害数值正是从这里得出的。',
  },
  {
    section: 'skills',
    target: 'subtree-button',
    title: '子技能按钮',
    body: '拥有子树的技能会在图标上显示这个齿轮徽标 — 并非每个技能都有。点击它即可打开子技能树。',
  },
  {
    section: 'skills',
    target: 'subtree-overlay',
    act: '[data-tour="subtree-button"]',
    undo: '[data-tour="subtree-overlay"] [aria-label="关闭"]',
    title: '子技能树',
    body: '子技能的选择会计入伤害计算。',
  },
  {
    section: 'gear',
    target: 'view',
    title: '装备',
    body: '你的装备栏，布局与游戏内一致 — 另有护符（charms）和逐构建的物品仓库。',
  },
  {
    section: 'gear',
    target: 'gear-doll',
    title: '装备栏',
    body: '点击任意槽位即可选择或编辑物品。悬停会显示带属性对比的完整提示。',
  },
  {
    section: 'gear',
    target: 'gear-slot-modal',
    act: '[data-tour="slot-weapon"]',
    undo: '[data-tour="gear-slot-modal"] [aria-label="关闭"]',
    title: '物品选择器',
    body: '每个槽位都会打开一个选择器：先选基底和稀有度，再配置词缀数值、插孔和星级。Edit Text（文本编辑）可让你直接以原始文本编辑物品。',
  },
  {
    section: 'gear',
    target: 'gear-stash',
    title: '仓库',
    body: "逐构建的备用物品仓库 — 暂存正在对比的装备，且不丢失它们的词缀数值。",
  },
  {
    section: 'gear',
    target: 'gear-upgrades',
    title: '升级顾问',
    body: '用引擎 DPS 将你的物品基底与每个槽位的最佳基底进行对比，并指出提升空间最大的槽位。',
  },
  {
    section: 'merc',
    target: 'view',
    title: '佣兵',
    body: "佣兵的配装与技能。佣兵装备和光环会反馈到你的英雄身上 — 包括 Magic Find，它会计入英雄的总量。",
  },
  {
    section: 'stats',
    target: 'view',
    title: '属性',
    body: '计算器产出的所有数值：基础属性、进攻、防御、EHP 以及逐技能的伤害明细。',
  },
  {
    section: 'stats',
    target: 'stats-search',
    title: '属性搜索',
    body: '搜索覆盖属性、基础属性和技能 — Ctrl+F 在这里同样可用。旁边的筛选标签可按类别过滤。',
  },
  {
    section: 'config',
    target: 'view',
    title: '配置',
    body: '职业、等级和属性点分配都在这里，此外还有战斗与遭遇设置：增益、触发、敌人状态，以及计算器会读取的手动覆盖项。',
  },
  {
    section: 'notes',
    target: 'view',
    title: '备注',
    body: '随构建一起保存的自由备注 — 手法循环、购物清单、备忘、攻略等。',
  },
  {
    section: 'filters',
    target: 'view',
    title: '拾取过滤器',
    body: '根据你构建身上的词缀生成拾取过滤器，并导出为可直接用于游戏的过滤字符串。它看起来就像 loot filter V2 :D',
  },
  {
    target: 'left-stats',
    title: '实时属性',
    body: '这个面板始终可见，你每加一个点、换一件装备、拨一个开关，它都会重新计算。',
  },
  {
    target: 'season',
    title: '赛季',
    body: '切换当前赛季 — 物品、天赋树和计算都会随之变化。每次切换赛季都会重置你的化身/以太树',
  },
  {
    target: 'bottombar',
    title: '状态栏',
    body: '保存状态在这里 — 默认开启自动保存，Ctrl+S 可手动保存。版本、更新日志和更新检查也在这里。',
  },
  {
    target: 'builds',
    title: '构建库',
    body: '保存、整理、打标签，并在多个构建之间切换。每个构建都保有各自的装备、天赋树、备注和仓库。',
  },
  {
    target: 'share',
    title: '分享',
    body: '将你的构建导出为代码、Gist 或网页链接，也可以导入他人分享的构建。',
  },
  {
    target: 'settings',
    title: '设置',
    body: '应用偏好设置 — 自动保存、数值格式等。',
  },
  {
    title: '信任，但要验证',
    body: '这里的 DPS 数值只是近似 — 计算出的伤害并不总是与游戏中的实际伤害一致。请务必在游戏内复核你的伤害。',
  },
  {
    title: '就到这里！',
    body: '随时点击顶栏的 ? 按钮重新打开本教程。祝规划愉快！',
  },
]

export const CARD_WIDTH = 400
// first-frame fallback; the overlay passes the measured card height afterward
export const CARD_HEIGHT_ESTIMATE = 370
const CARD_GAP = 10
const EDGE_MARGIN = 12
const TALL_TARGET_RATIO = 0.55

export interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

export interface CardPlacement {
  placement: 'below' | 'above' | 'center'
  top: number
  left: number
}

export function placeCard(
  target: TargetRect | null,
  viewport: { width: number; height: number },
  cardHeight: number = CARD_HEIGHT_ESTIMATE,
): CardPlacement {
  if (!target || target.height > viewport.height * TALL_TARGET_RATIO) {
    return {
      placement: 'center',
      top: viewport.height / 2,
      left: viewport.width / 2,
    }
  }
  const left = Math.min(
    Math.max(EDGE_MARGIN, target.left + target.width / 2 - CARD_WIDTH / 2),
    Math.max(EDGE_MARGIN, viewport.width - CARD_WIDTH - EDGE_MARGIN),
  )
  const below = target.top + target.height + CARD_GAP
  if (below + cardHeight <= viewport.height - EDGE_MARGIN) {
    return { placement: 'below', top: below, left }
  }
  const above = target.top - CARD_GAP
  if (above - cardHeight >= EDGE_MARGIN) {
    return { placement: 'above', top: above, left }
  }
  return {
    placement: 'center',
    top: viewport.height / 2,
    left: viewport.width / 2,
  }
}
