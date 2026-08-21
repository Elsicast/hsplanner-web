import type { MouseEvent } from 'react'

// 网页版直接走 <a target="_blank" rel="noopener"> 默认行为，无需拦截。
export function openExternalLink(_e: MouseEvent, _href: string): void {
  void _e
  void _href
}
