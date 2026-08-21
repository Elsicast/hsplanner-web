import { useState } from "react";
import { motion } from "motion/react";
import { hoverTap } from "../../utils/motion";
import { getSeason, SEASONS } from "@data/seasons/registry";
import { activeSeasonId } from "@data";
import { useBuild } from "../../store/build";
import {
  MODAL_BTN_PRIMARY_CLASS,
  MODAL_FOOTER_CLASS,
  Modal,
} from "../ui/Modal";
import Dropdown from "../ui/Dropdown";

export default function SeasonSwitcher() {
  const [pending, setPending] = useState<string | null>(null);
  const pendingSeason = pending ? getSeason(pending) : undefined;
  const activeBuildId = useBuild((s) => s.activeBuildId);
  const changeActiveSeason = useBuild((s) => s.changeActiveSeason);

  const confirm = () => {
    if (!pending) return;
    changeActiveSeason(pending);
  };

  return (
    <>
      <label data-tour="season" className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          赛季
        </span>
        <Dropdown
          compact
          searchable={false}
          value={activeSeasonId}
          onChange={(id) => {
            if (id && id !== activeSeasonId) setPending(id);
          }}
          options={SEASONS.map((s) => ({ id: s.id, label: s.name }))}
        />
      </label>
      {pendingSeason && (
        <Modal
          onClose={() => setPending(null)}
          panelClassName="w-[440px] max-w-[92vw]"
          eyebrow="赛季"
          title="切换赛季？"
          titleId="season-switch-title"
        >
          <section className="px-6 py-4">
            <p className="m-0 font-mono text-[12px] leading-relaxed tracking-[0.04em] text-muted">
              {activeBuildId ? "此构建将切换到 " : "新构建将开始于 "}
              <span className="text-accent-hot">{pendingSeason.name}</span>
              ，应用将重新加载。
            </p>
            <p className="m-0 mt-2 font-mono text-[12px] leading-relaxed tracking-[0.04em] text-muted">
              天赋树与以太的点数分配将被
              <span className="text-accent-hot">重置</span> — 装备和技能
              在目标赛季中仍然存在的部分会保留。
            </p>
          </section>
          <footer
            className={MODAL_FOOTER_CLASS}
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <motion.button
              {...hoverTap}
              type="button"
              onClick={confirm}
              className={MODAL_BTN_PRIMARY_CLASS}
              style={{
                background:
                  "linear-gradient(180deg, rgba(58,46,24,0.6), rgba(42,36,24,0.4))",
              }}
            >
              切换并重新加载
            </motion.button>
          </footer>
        </Modal>
      )}
    </>
  );
}
