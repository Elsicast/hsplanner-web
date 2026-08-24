import { useMemo } from 'react'
import { skills } from '@data'
import type { EquippedItem, RandomSkillPool } from '../../../types'
import Dropdown from '../../../components/ui/Dropdown'
import { SectionCard } from '../SectionCard'

export function RandomSkillSection({
  equipped,
  pool,
  onChange,
}: {
  equipped: EquippedItem
  pool: RandomSkillPool
  onChange: (skillId: string | null) => void
}) {
  const options = useMemo(
    () =>
      skills
        .filter((s) => s.classId === pool.classId && s.tree === pool.tree)
        .map((s) => ({ id: s.id, label: s.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [pool.classId, pool.tree],
  )

  const picked = equipped.randomSkillId ?? null

  return (
    <SectionCard
      label="随机技能"
      rightSlot={
        <span
          className={`font-mono text-[10px] tracking-[0.04em] ${
            picked ? 'text-accent-hot' : 'text-faint'
          }`}
        >
          {picked ? '已随机' : '未随机'}
        </span>
      }
    >
      <Dropdown
        value={picked}
        options={options}
        onChange={onChange}
        placeholder="选择随机到的技能"
        searchPlaceholder="搜索技能…"
        clearLabel="无技能"
      />
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] leading-snug text-faint">
        该技能在游戏内为随机获得——选择你实际随机到的技能，以计入其等级。
      </p>
    </SectionCard>
  )
}
