import { SKILL_ELEMENTS } from '../../../types'
import type { EquippedItem, SkillElement } from '../../../types'
import Dropdown from '../../../components/ui/Dropdown'
import { SectionCard } from '../SectionCard'
import { SectionIcon } from '../sectionIcons'

const ELEMENT_LABEL: Record<string, string> = {
  fire: '火焰',
  cold: '冰霜',
  lightning: '闪电',
  poison: '毒素',
  arcane: '奥术',
  physical: '物理',
}

const OPTIONS = SKILL_ELEMENTS.map((e) => ({
  id: e,
  label: `${ELEMENT_LABEL[e] ?? e}技能`,
}))

export function RandomElementSection({
  equipped,
  onChange,
}: {
  equipped: EquippedItem
  onChange: (element: SkillElement | null) => void
}) {
  const picked = equipped.randomSkillElement ?? null

  return (
    <SectionCard
      label="随机技能元素"
      icon={<SectionIcon kind="element" />}
      collapsible
      defaultOpen={picked != null}
      rightSlot={
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.04em] ${
            picked ? 'text-accent-hot' : 'text-faint'
          }`}
        >
          {picked ? (ELEMENT_LABEL[picked] ?? picked) : '未随机'}
        </span>
      }
    >
      <Dropdown
        value={picked}
        options={OPTIONS}
        onChange={(id) => onChange(id as SkillElement | null)}
        placeholder="选择随机到的元素"
        clearLabel="无元素"
        searchable={false}
      />
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] leading-snug text-faint">
        该元素在游戏内为随机获得——选择你实际随机到的元素，以计入其技能等级。
      </p>
    </SectionCard>
  )
}
