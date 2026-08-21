import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { parseDeepLinkUrl, getInitialDeepLinkUrls } from './deepLink'

describe('parseDeepLinkUrl', () => {
  it('extracts the id from a well-formed hsp://b/<ID> url', () => {
    expect(parseDeepLinkUrl('hsp://b/XK3FQ2')).toBe('XK3FQ2')
  })

  it('rejects the wrong scheme', () => {
    expect(parseDeepLinkUrl('https://b/XK3FQ2')).toBeNull()
  })

  it('rejects the wrong path', () => {
    expect(parseDeepLinkUrl('hsp://x/XK3FQ2')).toBeNull()
  })

  it('rejects an id with excluded letters or wrong length', () => {
    expect(parseDeepLinkUrl('hsp://b/XKILO2')).toBeNull()
    expect(parseDeepLinkUrl('hsp://b/SHORT')).toBeNull()
  })

  it('rejects a malformed url without throwing', () => {
    expect(parseDeepLinkUrl('not a url')).toBeNull()
  })
})

describe('fetchSharedBuildCode', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_WEB_SHARE_GET_URL', 'https://get-build.example.appwrite.run')
  })

  it('returns the code on 200', async () => {
    fetchMock.mockResolvedValue({ status: 200, json: async () => ({ code: 'abc123', appVersion: '0.11.0-season-10' }) })
    const { fetchSharedBuildCode } = await import('./deepLink')
    const code = await fetchSharedBuildCode('XK3FQ2')
    expect(code).toBe('abc123')
    expect(fetchMock).toHaveBeenCalledWith('https://get-build.example.appwrite.run?id=XK3FQ2')
  })

  it('throws on 404', async () => {
    fetchMock.mockResolvedValue({ status: 404, json: async () => ({ error: 'not_found' }) })
    const { fetchSharedBuildCode, WebShareError } = await import('./deepLink')
    await expect(fetchSharedBuildCode('XK3FQ2')).rejects.toThrow(WebShareError)
  })
})

describe('getInitialDeepLinkUrls', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('把 ?b=<短id> 转成等效的 hsp:// 深链接', async () => {
    window.history.replaceState({}, '', '/?b=XK3FQ2')
    await expect(getInitialDeepLinkUrls()).resolves.toEqual(['hsp://b/XK3FQ2'])
  })

  it('把 ?b=<完整code> 转成 web-code:// 伪 URL', async () => {
    window.history.replaceState({}, '', '/?b=someLzStringCode123')
    await expect(getInitialDeepLinkUrls()).resolves.toEqual([
      'web-code://someLzStringCode123',
    ])
  })

  it('无参数时返回空数组', async () => {
    await expect(getInitialDeepLinkUrls()).resolves.toEqual([])
  })
})

describe('createDeepLinkDispatcher', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_WEB_SHARE_GET_URL', 'https://get-build.example.appwrite.run')
    fetchMock.mockResolvedValue({ status: 404, json: async () => ({ error: 'not_found' }) })
  })

  it('ignores a live event that repeats the initial batch exactly once, then an identical retry dispatches again', async () => {
    const onReady = vi.fn()
    const onError = vi.fn()
    const { createDeepLinkDispatcher } = await import('./deepLink')
    const { dispatchInitial, dispatchLive } = createDeepLinkDispatcher(onReady, onError)

    await dispatchInitial(['hsp://b/XK3FQ2'])
    expect(onError).toHaveBeenCalledTimes(1)

    await dispatchLive(['hsp://b/XK3FQ2'])
    expect(onError).toHaveBeenCalledTimes(1)

    await dispatchLive(['hsp://b/XK3FQ2'])
    expect(onError).toHaveBeenCalledTimes(2)
  })

  it('always dispatches a distinct event after the cold-start batch', async () => {
    const onReady = vi.fn()
    const onError = vi.fn()
    const { createDeepLinkDispatcher } = await import('./deepLink')
    const { dispatchInitial, dispatchLive } = createDeepLinkDispatcher(onReady, onError)

    await dispatchInitial(['hsp://b/XK3FQ2'])
    expect(onError).toHaveBeenCalledTimes(1)

    await dispatchLive(['hsp://b/7MZH4V'])
    expect(onError).toHaveBeenCalledTimes(2)
  })
})
