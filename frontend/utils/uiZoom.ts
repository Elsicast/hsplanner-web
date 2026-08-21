export const UI_ZOOM_STEPS = [1, 1.15, 1.25, 1.5, 1.75, 2] as const

export type UiZoom = (typeof UI_ZOOM_STEPS)[number]

export function isUiZoom(value: unknown): value is UiZoom {
  return UI_ZOOM_STEPS.includes(value as UiZoom)
}

// screen.width is CSS px, so a display already scaled by the OS reports the
// smaller number and stays at 100%
export function autoUiZoom(screenWidth: number): UiZoom {
  if (screenWidth >= 3400) return 1.5
  if (screenWidth >= 2400) return 1.25
  return 1
}

export function detectUiZoom(): UiZoom {
  if (typeof window === 'undefined' || !window.screen) return 1
  return autoUiZoom(window.screen.width)
}

// 网页版用 CSS zoom（Chrome/Edge/Safari 原生支持，Firefox 126+ 支持）
export function applyUiZoom(zoom: UiZoom): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('zoom', String(zoom))
}
