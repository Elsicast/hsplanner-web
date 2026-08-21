import {
  Modal,
  MODAL_BTN_CLASS,
  MODAL_BTN_PRIMARY_CLASS,
  MODAL_FOOTER_CLASS,
} from '../ui/Modal'

export type DeepLinkPromptState =
  | { kind: 'confirm'; title: string; onConfirm: () => void }
  | { kind: 'error'; message: string }

export function DeepLinkPrompt({
  state,
  onClose,
}: {
  state: DeepLinkPromptState
  onClose: () => void
}) {
  return (
    <Modal
      onClose={onClose}
      panelClassName="w-[416px] max-w-[92vw]"
      eyebrow="共享构建"
      title={state.kind === 'confirm' ? '从网页导入？' : '无法打开链接'}
    >
      <div className="p-5">
        <p className="text-[12px] text-muted">
          {state.kind === 'confirm' ? (
            <>
              一个链接打开了共享构建 <span className="text-text">{state.title}</span>。
              要将它导入你的构建库吗？
            </>
          ) : (
            state.message
          )}
        </p>
      </div>
      <div className={MODAL_FOOTER_CLASS}>
        <button type="button" onClick={onClose} className={MODAL_BTN_CLASS}>
          {state.kind === 'confirm' ? '取消' : '关闭'}
        </button>
        {state.kind === 'confirm' && (
          <button
            type="button"
            onClick={() => {
              state.onConfirm()
              onClose()
            }}
            className={MODAL_BTN_PRIMARY_CLASS}
          >
            导入
          </button>
        )}
      </div>
    </Modal>
  )
}
