import { useState } from "react";
import { activeSeasonId, seasonDataErrors } from "@data";

export default function SeasonErrorBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || seasonDataErrors.length === 0) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-3 border-b border-red-900/60 bg-red-950/60 px-3 py-1.5"
    >
      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-red-300">
        赛季数据错误（{activeSeasonId}）— 当前使用基础数据
      </span>
      <span className="truncate text-[11px] text-red-200/80">
        {seasonDataErrors[0]}
        {seasonDataErrors.length > 1
          ? `（还有 ${seasonDataErrors.length - 1} 条）`
          : ""}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="关闭"
        className="ml-auto shrink-0 text-[11px] text-red-300 transition-colors hover:text-red-100"
      >
        ✕
      </button>
    </div>
  );
}
