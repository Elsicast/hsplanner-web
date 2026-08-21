import CharacterBasics from './config/CharacterBasics'
import CharmSlotPanel from './config/CharmSlotPanel'
import { GroupHeading } from './config/configPrimitives'
import ActiveBuffsPanel from './config/ActiveBuffsPanel'
import ActiveAuraPanel from './config/ActiveAuraPanel'
import ProcsPanel from './config/ProcsPanel'
import EnemyConditionsPanel from './config/EnemyConditionsPanel'
import PlayerConditionsPanel from './config/PlayerConditionsPanel'
import ItemBlessingsPanel from './config/ItemBlessingsPanel'
import ResistancesPanel from './config/ResistancesPanel'
import SkillProjectilesPanel from './config/SkillProjectilesPanel'
import EntityRatePanel from './config/EntityRatePanel'
import CustomStatsPanel from './config/CustomStatsPanel'

export default function ConfigView() {
  return (
    <div className="space-y-8">
      <header>
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rotate-45 bg-accent-hot"
            style={{ boxShadow: '0 0 8px rgba(224,184,100,0.6)' }}
          />
          设定 · 角色与遭遇
        </div>
        <h2
          className="m-0 text-[22px] font-semibold tracking-[0.02em] text-accent-hot"
          style={{ textShadow: '0 0 16px rgba(224,184,100,0.18)' }}
        >
          配置
        </h2>
      </header>

      <section className="space-y-4">
        <GroupHeading
          title="角色"
          subtitle="职业、等级与属性点分配。"
        />
        <CharacterBasics />
        <CharmSlotPanel />
      </section>

      <section className="space-y-4">
        <GroupHeading
          title="遭遇与战斗"
          subtitle="增益、触发效果、敌人与玩家状态，以及计算器读取的手动覆盖项。"
        />

        <div className="grid items-start gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <ActiveBuffsPanel />
            <ActiveAuraPanel />
            <ProcsPanel />
            <ItemBlessingsPanel />
            <EntityRatePanel />
          </div>
          <div className="space-y-4">
            <EnemyConditionsPanel />
            <PlayerConditionsPanel />
            <ResistancesPanel />
            <SkillProjectilesPanel />
            <CustomStatsPanel />
          </div>
        </div>
      </section>
    </div>
  )
}
