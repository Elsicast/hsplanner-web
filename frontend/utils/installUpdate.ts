// 网页版更新逻辑：桌面端通过 Tauri updater 安装的能力不存在，
// 退化为跳转发布页下载；保留 inTauriRuntime 导出以兼容现有 UI 分支。

export type InstallPhase =
  | "idle"
  | "checking"
  | "downloading"
  | "installing"
  | "done"
  | "error";

export interface InstallProgress {
  phase: InstallPhase;
  bytesDownloaded?: number;
  bytesTotal?: number;
  error?: string;
}

export type ProgressCallback = (p: InstallProgress) => void;

export function inTauriRuntime(): boolean {
  return false;
}

function isSafeUpdateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function installUpdate(
  fallbackAssetUrl: string | undefined,
  onProgress: ProgressCallback,
): Promise<void> {
  if (fallbackAssetUrl && isSafeUpdateUrl(fallbackAssetUrl)) {
    window.open(fallbackAssetUrl, "_blank", "noopener,noreferrer");
  }
  onProgress({ phase: "done" });
}

export async function installUpdateOnQuit(): Promise<void> {
  // 网页版没有关窗钩子，无需处理
}
