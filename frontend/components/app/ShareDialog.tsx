import { useEffect, useMemo, useState } from "react";
import { createBuildShareUrl } from "../../utils/build/shareBuild";
import { Modal } from "../ui/Modal";

type CopyTarget = "code" | "link";
type CopyState = { target: CopyTarget; status: "copied" | "error" } | null;

const BTN_PRIMARY_CLASS =
  "rounded-[3px] border border-accent-deep px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-hot transition-colors hover:border-accent-hot hover:text-[#fff0c4]";
const BTN_BG = { background: "linear-gradient(180deg, #3a2f1a, #2a2418)" };
const FIELD_BG = {
  background: "linear-gradient(180deg, #0d0e12, var(--color-panel-2))",
};

export interface ShareDialogProps {
  code: string;
  onClose: () => void;
}

export function ShareDialog({ code, onClose }: ShareDialogProps) {
  const [copyState, setCopyState] = useState<CopyState>(null);
  const shareUrl = useMemo(() => createBuildShareUrl(code), [code]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onCopy = async (target: CopyTarget, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState({ target, status: "copied" });
    } catch {
      setCopyState({ target, status: "error" });
    }
    window.setTimeout(() => setCopyState(null), 2500);
  };

  const statusText = copyState
    ? copyState.status === "error"
      ? "写入剪贴板失败"
      : copyState.target === "code"
        ? "代码已复制到剪贴板"
        : "网页链接已复制到剪贴板"
    : `${code.length} 个字符 · 网页链接无需上传到服务器`;

  const isError = copyState?.status === "error";
  const isSuccess = copyState?.status === "copied";
  const statusColor = isSuccess
    ? "text-accent-hot"
    : isError
      ? "text-stat-red"
      : "text-faint";

  return (
    <Modal
      onClose={onClose}
      eyebrow="分享"
      title="分享构建"
      panelClassName="max-h-[88vh] w-[34rem] max-w-[94vw]"
    >
      <div className="flex flex-col gap-3 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          构建代码
        </span>
        <textarea
          value={code}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          rows={6}
          className="w-full rounded-[3px] border border-border-2 px-3 py-2 font-mono text-[11px] tabular-nums text-text focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent-hot/15"
          style={{ ...FIELD_BG, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          可复制构建代码手动导入，或复制可直接打开此构建的网页链接。
        </p>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border bg-black/30 px-4 py-3">
        <div
          className={`flex min-w-0 flex-1 items-center gap-2 font-mono text-[11px] tracking-[0.06em] ${statusColor}`}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: isSuccess
                ? "var(--color-accent-hot)"
                : isError
                  ? "var(--color-stat-red)"
                  : "var(--color-faint)",
              boxShadow: isSuccess
                ? "0 0 8px rgba(224,184,100,0.6)"
                : isError
                  ? "0 0 8px rgba(217,107,90,0.6)"
                  : "0 0 6px var(--color-faint)",
            }}
          />
          <span className="truncate">{statusText}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onCopy("code", code)}
            className={BTN_PRIMARY_CLASS}
            style={BTN_BG}
          >
            {copyState?.target === "code" && copyState.status === "copied"
              ? "已复制代码"
              : "复制代码"}
          </button>
          <button
            onClick={() => onCopy("link", shareUrl)}
            className={BTN_PRIMARY_CLASS}
            style={BTN_BG}
          >
            {copyState?.target === "link" && copyState.status === "copied"
              ? "已复制链接"
              : "复制网页链接"}
          </button>
        </div>
      </footer>
    </Modal>
  );
}
