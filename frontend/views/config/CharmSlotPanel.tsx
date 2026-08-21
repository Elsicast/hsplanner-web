import { Panel } from './configPrimitives'
import { useSettings } from '../../store/settings'

export default function CharmSlotPanel() {
  const extraCharmSlot = useSettings((s) => s.extraCharmSlot)
  const setExtraCharmSlot = useSettings((s) => s.setExtraCharmSlot)

  return (
    <Panel
      title="Charm 背包"
      subtitle="你的角色是否已在游戏内解锁额外的 Charm 格子。"
    >
      <label className="flex cursor-pointer flex-col gap-1">
        <span className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={extraCharmSlot}
            onChange={(e) => setExtraCharmSlot(e.target.checked)}
            className="shrink-0"
          />
          <span className="text-[13px] font-semibold text-text">
            已解锁额外 Charm 格
          </span>
        </span>
        <span className="pl-6 text-[12px] leading-snug text-muted">
          在「装备」页签的 Charm 网格中添加可解锁的第 30
          格。存储于本设备，所有构建共享。
        </span>
      </label>
    </Panel>
  )
}
