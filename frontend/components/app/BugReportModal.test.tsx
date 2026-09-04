import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as BugReportModule from '../../utils/bugReport'

vi.mock('../../utils/bugReport', async () => {
  const actual = await vi.importActual<typeof BugReportModule>('../../utils/bugReport')
  return {
    ...actual,
    isBugReportConfigured: vi.fn(() => true),
    sendBugReport: vi.fn(async () => undefined),
  }
})

import BugReportModal from './BugReportModal'
import { BugReportError, isBugReportConfigured, sendBugReport } from '../../utils/bugReport'

afterEach(() => {
  vi.clearAllMocks()
  vi.mocked(isBugReportConfigured).mockReturnValue(true)
  vi.mocked(sendBugReport).mockResolvedValue(undefined)
})

const noop = () => {}

function renderModal(props?: { buildCode?: string | null; buildLabel?: string | null }) {
  return render(
    <BugReportModal
      buildCode={props?.buildCode ?? 'BUILDCODE'}
      buildLabel={props?.buildLabel ?? 'Necromancer 100 · s10'}
      onClose={noop}
    />,
  )
}

const titleField = () => screen.getByLabelText(/^标题$/)
const descField = () => screen.getByLabelText(/问题描述/)
const sendButton = () => screen.getByRole('button', { name: /发送反馈/ })

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(titleField(), 'Frost Nova shows 0 DPS')
  await user.type(descField(), 'Frost Nova DPS reads zero')
}

const png = (name: string) => new File([new Uint8Array(8)], name, { type: 'image/png' })

describe('BugReportModal', () => {
  it('keeps send disabled until both the title and description are filled in', async () => {
    const user = userEvent.setup()
    renderModal()
    expect(sendButton()).toBeDisabled()
    await user.type(descField(), 'Frost Nova DPS reads zero')
    expect(sendButton()).toBeDisabled()
    await user.type(titleField(), 'Frost Nova shows 0 DPS')
    expect(sendButton()).toBeEnabled()
  })

  it('sends every filled field including steps, expected and contact', async () => {
    const user = userEvent.setup()
    renderModal()
    await fillRequired(user)
    await user.type(screen.getByLabelText(/复现步骤/), '1. Open Stats')
    await user.type(screen.getByLabelText(/期望的结果/), 'Non-zero DPS')
    await user.type(screen.getByLabelText(/Discord 名字/), 'zium')
    await user.click(sendButton())

    await waitFor(() => expect(sendBugReport).toHaveBeenCalledTimes(1))
    expect(sendBugReport).toHaveBeenCalledWith({
      kind: 'bug',
      title: 'Frost Nova shows 0 DPS',
      description: 'Frost Nova DPS reads zero',
      steps: '1. Open Stats',
      expected: 'Non-zero DPS',
      contact: 'zium',
      buildLabel: 'Necromancer 100 · s10',
      buildCode: 'BUILDCODE',
      screenshots: [],
    })
  })

  it('hides the reproduction fields for an idea', async () => {
    const user = userEvent.setup()
    renderModal()
    expect(screen.getByLabelText(/复现步骤/)).toBeInTheDocument()
    await user.click(screen.getByText('功能异常'))
    await user.click(screen.getByText('功能建议'))
    expect(screen.queryByLabelText(/复现步骤/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/期望的结果/)).not.toBeInTheDocument()
  })

  it('attaches picked screenshots and can remove them again', async () => {
    const user = userEvent.setup()
    renderModal()
    await fillRequired(user)
    await user.upload(screen.getByLabelText(/添加截图/), [png('one.png'), png('two.png')])
    expect(screen.getByText('one.png')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /移除 one\.png/i }))
    expect(screen.queryByText('one.png')).not.toBeInTheDocument()

    await user.click(sendButton())
    await waitFor(() => expect(sendBugReport).toHaveBeenCalledTimes(1))
    const sent = vi.mocked(sendBugReport).mock.calls[0]![0]
    expect(sent.screenshots?.map((f) => f.name)).toEqual(['two.png'])
  })

  it('omits the build code when the attach toggle is off', async () => {
    const user = userEvent.setup()
    renderModal()
    await fillRequired(user)
    await user.click(screen.getByLabelText(/附上我的构建/))
    await user.click(sendButton())

    await waitFor(() => expect(sendBugReport).toHaveBeenCalledTimes(1))
    expect(vi.mocked(sendBugReport).mock.calls[0]![0]).toMatchObject({
      buildCode: null,
      buildLabel: null,
    })
  })

  it('shows a thank-you state after a successful send', async () => {
    const user = userEvent.setup()
    renderModal()
    await fillRequired(user)
    await user.click(sendButton())
    expect(await screen.findByText(/反馈已发送/)).toBeInTheDocument()
  })

  it('surfaces the error message when sending fails', async () => {
    vi.mocked(sendBugReport).mockRejectedValue(
      new BugReportError('rate-limited', '反馈发送太频繁，请稍后再试。'),
    )
    const user = userEvent.setup()
    renderModal()
    await fillRequired(user)
    await user.click(sendButton())
    expect(await screen.findByText(/反馈发送太频繁/)).toBeInTheDocument()
  })

  it('disables sending when reporting is not configured in this build', async () => {
    vi.mocked(isBugReportConfigured).mockReturnValue(false)
    const user = userEvent.setup()
    renderModal()
    await fillRequired(user)
    expect(sendButton()).toBeDisabled()
    expect(screen.getByText(/未配置反馈通道/)).toBeInTheDocument()
  })
})
