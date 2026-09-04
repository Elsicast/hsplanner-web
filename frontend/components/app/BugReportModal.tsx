import { useId, useRef, useState, type ClipboardEvent } from 'react'
import { Modal, MODAL_BTN_PRIMARY_CLASS, MODAL_FOOTER_CLASS } from '../ui/Modal'
import Dropdown from '../ui/Dropdown'
import {
  BugReportError,
  MAX_CONTACT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_EXPECTED_LENGTH,
  MAX_SCREENSHOTS,
  MAX_SCREENSHOT_BYTES,
  MAX_STEPS_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MIN_TITLE_LENGTH,
  isBugReportConfigured,
  sendBugReport,
  type BugReportKind,
} from '../../utils/bugReport'

type SendState =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string }

const KIND_OPTIONS: { id: BugReportKind; label: string }[] = [
  { id: 'bug', label: '功能异常' },
  { id: 'data', label: '物品 / 技能数据有误' },
  { id: 'idea', label: '功能建议' },
]

const TITLE_PLACEHOLDER: Record<BugReportKind, string> = {
  bug: '冰霜新星显示 0 DPS',
  data: '某个物品的固有词条不对',
  idea: '希望能并排对比两个构建',
}

const DESCRIPTION_PLACEHOLDER: Record<BugReportKind, string> = {
  bug: '点了哪里之后发生了什么',
  data: '哪个物品或技能、正确的数值应该是什么',
  idea: '希望规划器做成什么样？',
}

const STEPS_PLACEHOLDER = "1. 进入「…」\n2. 点击「…」\n3. 向下滚动到「…」\n4. 看到错误"

const FIELD_CLASS =
  'w-full rounded-[3px] border border-border-2 px-3 py-2 text-[12px] text-text placeholder:text-faint focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent-hot/15'
const LABEL_CLASS = 'font-mono text-[10px] uppercase tracking-[0.18em] text-faint'
const FIELD_BG = { background: 'linear-gradient(180deg, #0d0e12, var(--color-panel-2))' }
const TEXTAREA_STYLE = { ...FIELD_BG, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }

export interface BugReportModalProps {
  buildCode: string | null
  buildLabel: string | null
  onClose: () => void
}

export default function BugReportModal({ buildCode, buildLabel, onClose }: BugReportModalProps) {
  const ids = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<BugReportKind>('bug')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  const [expected, setExpected] = useState('')
  const [contact, setContact] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [attachBuild, setAttachBuild] = useState(true)
  const [state, setState] = useState<SendState>({ kind: 'idle' })

  const configured = isBugReportConfigured()
  const incomplete =
    title.trim().length < MIN_TITLE_LENGTH ||
    description.trim().length < MIN_DESCRIPTION_LENGTH
  const canSend = configured && !incomplete && state.kind !== 'busy' && state.kind !== 'sent'
  const withBuild = attachBuild && buildCode !== null
  const isRepro = kind !== 'idea'

  const addFiles = (incoming: FileList | File[] | null) => {
    const images = Array.from(incoming ?? []).filter(
      (f) => f.type.startsWith('image/') && f.size <= MAX_SCREENSHOT_BYTES,
    )
    if (images.length === 0) return
    setScreenshots((current) => [...current, ...images].slice(0, MAX_SCREENSHOTS))
  }

  const onPasteScreenshot = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files.length > 0) addFiles(e.clipboardData.files)
  }

  const onSend = async () => {
    setState({ kind: 'busy' })
    try {
      await sendBugReport({
        kind,
        title: title.trim(),
        description: description.trim(),
        steps: isRepro ? steps.trim() : '',
        expected: isRepro ? expected.trim() : '',
        contact: contact.trim(),
        buildLabel: withBuild ? buildLabel : null,
        buildCode: withBuild ? buildCode : null,
        screenshots,
      })
      setState({ kind: 'sent' })
    } catch (e) {
      const message = e instanceof BugReportError ? e.message : '发送反馈失败。'
      setState({ kind: 'error', message })
    }
  }

  const status = !configured
    ? '当前构建未配置反馈通道。'
    : state.kind === 'busy'
      ? '发送中…'
      : state.kind === 'sent'
        ? '反馈已发送，感谢！'
        : state.kind === 'error'
          ? state.message
          : incomplete
            ? '需要填写标题和问题描述。'
            : `将随反馈发送应用版本、操作系统${withBuild ? '和你的构建代码' : ''}。`

  const isError = state.kind === 'error' || !configured
  const isSuccess = state.kind === 'sent'

  return (
    <Modal
      onClose={onClose}
      eyebrow="问题反馈"
      title="向我们反馈问题"
      subtitle="反馈将直接发送给开发者，无需 GitHub 账号。"
      panelClassName="w-[36rem] max-w-[94vw] max-h-[88vh]"
    >
      <div className="flex flex-col gap-2.5 overflow-y-auto p-5">
        <span className={LABEL_CLASS}>类型</span>
        <Dropdown
          value={kind}
          options={KIND_OPTIONS}
          onChange={(id) => {
            if (id) setKind(id as BugReportKind)
          }}
          searchable={false}
          compact
        />

        <label htmlFor={`${ids}-title`} className={`${LABEL_CLASS} mt-1.5`}>
          标题
        </label>
        <input
          id={`${ids}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          placeholder={TITLE_PLACEHOLDER[kind]}
          className={FIELD_CLASS}
          style={FIELD_BG}
        />

        <label htmlFor={`${ids}-desc`} className={`${LABEL_CLASS} mt-1.5`}>
          问题描述
        </label>
        <textarea
          id={`${ids}-desc`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onPaste={onPasteScreenshot}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={4}
          placeholder={DESCRIPTION_PLACEHOLDER[kind]}
          className={FIELD_CLASS}
          style={TEXTAREA_STYLE}
        />

        {isRepro && (
          <>
            <label htmlFor={`${ids}-steps`} className={`${LABEL_CLASS} mt-1.5`}>
              复现步骤（可选）
            </label>
            <textarea
              id={`${ids}-steps`}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              onPaste={onPasteScreenshot}
              maxLength={MAX_STEPS_LENGTH}
              rows={4}
              placeholder={STEPS_PLACEHOLDER}
              className={FIELD_CLASS}
              style={TEXTAREA_STYLE}
            />

            <label htmlFor={`${ids}-expected`} className={`${LABEL_CLASS} mt-1.5`}>
              期望的结果（可选）
            </label>
            <textarea
              id={`${ids}-expected`}
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              onPaste={onPasteScreenshot}
              maxLength={MAX_EXPECTED_LENGTH}
              rows={2}
              placeholder="简要描述你原本期望出现的结果。"
              className={FIELD_CLASS}
              style={TEXTAREA_STYLE}
            />
          </>
        )}

        <span className={`${LABEL_CLASS} mt-1.5`}>截图（可选）</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={screenshots.length >= MAX_SCREENSHOTS}
            className="rounded-[3px] border border-border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent-deep hover:text-accent-hot disabled:cursor-not-allowed disabled:opacity-40"
          >
            添加图片
          </button>
          <span className="text-[11px] text-faint">
            或在任意输入框按 Ctrl+V 粘贴 — 最多 {MAX_SCREENSHOTS} 张，每张不超过 8 MB
          </span>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            aria-label="添加截图"
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
        {screenshots.length > 0 && (
          <ul className="flex flex-col gap-1">
            {screenshots.map((shot, i) => (
              <li
                key={`${shot.name}-${i}`}
                className="flex items-center gap-2 text-[11px] text-muted"
              >
                <span className="truncate">{shot.name}</span>
                <button
                  type="button"
                  aria-label={`移除 ${shot.name}`}
                  onClick={() => setScreenshots((c) => c.filter((_, j) => j !== i))}
                  className="text-faint transition-colors hover:text-stat-red"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <label htmlFor={`${ids}-contact`} className={`${LABEL_CLASS} mt-1.5`}>
          Discord 名字（可选）
        </label>
        <input
          id={`${ids}-contact`}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={MAX_CONTACT_LENGTH}
          placeholder="方便向你追问细节"
          className={FIELD_CLASS}
          style={FIELD_BG}
        />

        {buildCode !== null && (
          <label
            htmlFor={`${ids}-attach`}
            className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] text-muted"
          >
            <input
              id={`${ids}-attach`}
              type="checkbox"
              checked={attachBuild}
              onChange={(e) => setAttachBuild(e.target.checked)}
              className="accent-[var(--color-accent-deep)]"
            />
            附上我的构建（{buildLabel ?? '当前构建'}）以便复现
          </label>
        )}
      </div>

      <footer className={MODAL_FOOTER_CLASS}>
        <span
          className={`mr-auto min-w-0 flex-1 truncate font-mono text-[11px] ${
            isSuccess ? 'text-stat-green' : isError ? 'text-stat-red' : 'text-faint'
          }`}
        >
          {status}
        </span>
        <button
          type="button"
          onClick={isSuccess ? onClose : onSend}
          disabled={!isSuccess && !canSend}
          className={MODAL_BTN_PRIMARY_CLASS}
          style={{ background: 'linear-gradient(180deg, #3a2f1a, #2a2418)' }}
        >
          {isSuccess ? '完成' : state.kind === 'busy' ? '发送中…' : '发送反馈'}
        </button>
      </footer>
    </Modal>
  )
}
