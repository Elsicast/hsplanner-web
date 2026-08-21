import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ShareDialog } from './ShareDialog'

const noop = () => {}

function renderDialog() {
  window.history.replaceState({}, '', '/planner/?preview=1#skills')
  return render(<ShareDialog code="CODE" onClose={noop} />)
}

describe('ShareDialog', () => {
  it('显示构建代码且不再显示旧的分享方式', () => {
    renderDialog()
    expect(screen.getByDisplayValue('CODE')).toBeTruthy()
    expect(screen.queryByText('Gist 链接')).toBeNull()
    expect(screen.queryByText('hsplanner.app 链接')).toBeNull()
  })

  it('复制构建代码', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderDialog()

    await user.click(screen.getByRole('button', { name: '复制代码' }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('CODE')
    expect(await screen.findByText('代码已复制到剪贴板')).toBeTruthy()
  })

  it('复制包含构建代码的当前网页链接', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderDialog()

    await user.click(screen.getByRole('button', { name: '复制网页链接' }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'http://localhost:3000/planner/?b=CODE',
    )
    expect(await screen.findByText('网页链接已复制到剪贴板')).toBeTruthy()
  })
})
