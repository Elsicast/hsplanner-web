import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import Dropdown from "../ui/Dropdown";
import {
  GistShareError,
  isGistSharingConfigured,
  uploadBuildToGist,
} from "../../utils/build/gistShare";
import { isWebShareConfigured, WebShareError } from "../../utils/build/webShare";

export type ShareMethod = "code" | "gist" | "web";

type LinkState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "done"; url: string; copied: boolean }
  | { kind: "error"; message: string };

type CopyStatus = "idle" | "copied" | "error";

const METHOD_OPTIONS: { id: ShareMethod; label: string }[] = [
  { id: "code", label: "构建代码" },
  { id: "gist", label: "Gist 链接" },
  { id: "web", label: "hsplanner.app 链接" },
];

const METHOD_HINT: Record<ShareMethod, string> = {
  code: "粘贴到 构建 → 导入，即可在其他设备上加载。",
  gist: "将构建代码上传到私有 GitHub Gist 并复制链接。",
  web: "在 hsplanner.app 发布一个只读构建页面并复制链接。",
};

const BTN_PRIMARY_CLASS =
  "rounded-[3px] border border-accent-deep px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-hot transition-colors hover:border-accent-hot hover:text-[#fff0c4] disabled:cursor-not-allowed disabled:opacity-50";
const BTN_BG = { background: "linear-gradient(180deg, #3a2f1a, #2a2418)" };
const FIELD_BG = {
  background: "linear-gradient(180deg, #0d0e12, var(--color-panel-2))",
};

export interface ShareDialogProps {
  code: string;
  meta?: { className?: string; level?: number };
  createWebShare: () => Promise<{ url: string }>;
  onClose: () => void;
}

export function ShareDialog({
  code,
  meta,
  createWebShare,
  onClose,
}: ShareDialogProps) {
  const [method, setMethod] = useState<ShareMethod>("code");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [gist, setGist] = useState<LinkState>({ kind: "idle" });
  const [web, setWeb] = useState<LinkState>({ kind: "idle" });

  const gistConfigured = isGistSharingConfigured();
  const webConfigured = isWebShareConfigured();
  const configured =
    method === "gist" ? gistConfigured : method === "web" ? webConfigured : true;

  const link = method === "gist" ? gist : method === "web" ? web : null;
  const setLink = method === "gist" ? setGist : setWeb;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    setTimeout(() => setCopyStatus("idle"), 2500);
  };

  const copyUrl = async (url: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  const onCreateLink = async () => {
    setLink({ kind: "busy" });
    try {
      const { url } =
        method === "gist"
          ? await uploadBuildToGist(code, meta)
          : await createWebShare();
      setLink({ kind: "done", url, copied: await copyUrl(url) });
    } catch (e) {
      const message =
        e instanceof GistShareError || e instanceof WebShareError
          ? e.message
          : "分享失败。";
      setLink({ kind: "error", message });
    }
  };

  const onCopyLink = async (url: string) => {
    const copied = await copyUrl(url);
    setLink({ kind: "done", url, copied });
  };

  const statusText =
    method === "code"
      ? copyStatus === "copied"
        ? "代码已复制到剪贴板"
        : copyStatus === "error"
          ? "写入剪贴板失败"
          : `${code.length} 个字符`
      : link?.kind === "busy"
        ? "正在创建链接…"
        : link?.kind === "done"
          ? link.copied
            ? "链接已复制到剪贴板"
            : "链接已就绪"
          : link?.kind === "error"
            ? link.message
            : configured
              ? "创建可分享的链接"
              : "此构建中未配置。";

  const isError =
    (method === "code" && copyStatus === "error") || link?.kind === "error";
  const isSuccess =
    (method === "code" && copyStatus === "copied") ||
    (link?.kind === "done" && link.copied);
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
          分享方式
        </span>
        <Dropdown
          value={method}
          options={METHOD_OPTIONS}
          onChange={(id) => {
            if (id) setMethod(id as ShareMethod);
          }}
          searchable={false}
          compact
        />

        {method === "code" ? (
          <textarea
            value={code}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            rows={6}
            className="w-full rounded-[3px] border border-border-2 px-3 py-2 font-mono text-[11px] tabular-nums text-text focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent-hot/15"
            style={{ ...FIELD_BG, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
          />
        ) : link?.kind === "done" ? (
          <input
            readOnly
            value={link.url}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-[3px] border border-border-2 px-3 py-2 font-mono text-[11px] text-text focus:border-accent-deep focus:outline-none"
            style={FIELD_BG}
          />
        ) : null}

        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
          {METHOD_HINT[method]}
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
          {method === "code" ? (
            <button
              onClick={onCopyCode}
              className={BTN_PRIMARY_CLASS}
              style={BTN_BG}
            >
              {copyStatus === "copied"
                ? "已复制"
                : copyStatus === "error"
                  ? "复制失败"
                  : "复制代码"}
            </button>
          ) : link?.kind === "done" ? (
            <button
              onClick={() => onCopyLink(link.url)}
              className={BTN_PRIMARY_CLASS}
              style={BTN_BG}
            >
              复制链接
            </button>
          ) : (
            <button
              onClick={onCreateLink}
              disabled={!configured || link?.kind === "busy"}
              title={
                configured ? METHOD_HINT[method] : "此构建中未配置"
              }
              className={BTN_PRIMARY_CLASS}
              style={BTN_BG}
            >
              {link?.kind === "busy" ? "创建中…" : "创建链接"}
            </button>
          )}
        </div>
      </footer>
    </Modal>
  );
}
