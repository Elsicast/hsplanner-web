import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../utils/build/gistShare', () => {
  class GistShareError extends Error {
    kind: string
    constructor(kind: string, message: string) {
      super(message)
      this.kind = kind
    }
  }
  return {
    GistShareError,
    isGistSharingConfigured: vi.fn(() => true),
    uploadBuildToGist: vi.fn(async () => ({
      id: 'abc123',
      url: 'https://gist.github.com/u/abc123',
    })),
  }
})

vi.mock('../../utils/build/webShare', () => {
  class WebShareError extends Error {
    kind: string
    constructor(kind: string, message: string) {
      super(message)
      this.kind = kind
    }
  }
  return {
    WebShareError,
    isWebShareConfigured: vi.fn(() => true),
  }
})

import { ShareDialog } from './ShareDialog'
import {
  isGistSharingConfigured,
  uploadBuildToGist,
} from '../../utils/build/gistShare'
import { isWebShareConfigured, WebShareError } from '../../utils/build/webShare'

afterEach(() => {
  vi.clearAllMocks()
  vi.mocked(isGistSharingConfigured).mockReturnValue(true)
  vi.mocked(isWebShareConfigured).mockReturnValue(true)
})

const noop = () => {}

function renderDialog(overrides?: {
  createWebShare?: () => Promise<{ url: string }>
}) {
  return render(
    <ShareDialog
      code="CODE"
      meta={{ className: 'amazon', level: 50 }}
      createWebShare={
        overrides?.createWebShare ??
        (async () => ({ url: 'https://hsplanner.app/b/XK3FQ2' }))
      }
      onClose={noop}
    />,
  )
}

async function pickMethod(
  user: ReturnType<typeof userEvent.setup>,
  label: string | RegExp,
) {
  await user.click(
    screen.getByRole('button', { name: /构建代码|Gist 链接|hsplanner\.app/ }),
  )
  await user.click(screen.getByRole('option', { name: label }))
}

describe('ShareDialog — build code', () => {
  it('shows the code and copies it to the clipboard', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderDialog()
    expect(screen.getByDisplayValue('CODE')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /复制代码/ }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('CODE')
    expect(await screen.findByText(/代码已复制/)).toBeTruthy()
  })
})

describe('ShareDialog — gist link', () => {
  it('creates a gist and shows the copied link', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderDialog()
    await pickMethod(user, 'Gist 链接')
    await user.click(screen.getByRole('button', { name: /创建链接/ }))
    await waitFor(() =>
      expect(
        screen.getByDisplayValue('https://gist.github.com/u/abc123'),
      ).toBeTruthy(),
    )
    expect(vi.mocked(uploadBuildToGist)).toHaveBeenCalledWith('CODE', {
      className: 'amazon',
      level: 50,
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://gist.github.com/u/abc123',
    )
  })

  it('disables link creation when gist sharing is not configured', async () => {
    vi.mocked(isGistSharingConfigured).mockReturnValue(false)
    const user = userEvent.setup()
    renderDialog()
    await pickMethod(user, 'Gist 链接')
    expect(screen.getByRole('button', { name: /创建链接/ })).toBeDisabled()
    expect(screen.getByText(/此构建中未配置/)).toBeTruthy()
  })
})

describe('ShareDialog — hsplanner.app link', () => {
  it('creates a web share and shows the copied link', async () => {
    const createWebShare = vi.fn(async () => ({
      url: 'https://hsplanner.app/b/XK3FQ2',
    }))
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderDialog({ createWebShare })
    await pickMethod(user, /hsplanner\.app 链接/)
    await user.click(screen.getByRole('button', { name: /创建链接/ }))
    await waitFor(() =>
      expect(
        screen.getByDisplayValue('https://hsplanner.app/b/XK3FQ2'),
      ).toBeTruthy(),
    )
    expect(createWebShare).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://hsplanner.app/b/XK3FQ2',
    )
  })

  it('surfaces web share errors', async () => {
    const createWebShare = vi.fn(async () => {
      throw new WebShareError('too-large', 'This build is too large to share to the web.')
    })
    const user = userEvent.setup()
    renderDialog({ createWebShare })
    await pickMethod(user, /hsplanner\.app 链接/)
    await user.click(screen.getByRole('button', { name: /创建链接/ }))
    expect(
      await screen.findByText(/too large to share/i),
    ).toBeTruthy()
  })

  it('disables link creation when web sharing is not configured', async () => {
    vi.mocked(isWebShareConfigured).mockReturnValue(false)
    const user = userEvent.setup()
    renderDialog()
    await pickMethod(user, /hsplanner\.app 链接/)
    expect(screen.getByRole('button', { name: /创建链接/ })).toBeDisabled()
    expect(screen.getByText(/此构建中未配置/)).toBeTruthy()
  })
})
