import type { Folder } from '../../utils/build/savedBuilds'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'
import {
  ConfirmOverlay,
  ImportOverlay,
  MoveToFolderOverlay,
  TagsOverlay,
  TextPromptOverlay,
} from './overlays'
import type { CtxState, Overlay } from './buildSelectTypes'

interface BuildSelectOverlaysProps {
  ctx: CtxState | null
  ctxItems: ContextMenuItem[]
  ctxHeader: string | undefined
  onCloseCtx: () => void

  overlay: Overlay | null
  onCloseOverlay: () => void
  folders: Folder[]

  onImport: (text: string) => Promise<string | null>
  onImportNamed: (code: string, name: string) => void
  onCreateBuild: (name: string) => void
  onRenameBuild: (buildId: string, name: string) => void
  onSaveTags: (buildId: string, tags: string[]) => void
  onMove: (buildId: string, folderId: string | null) => void
  onCreateFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (folderId: string, name: string) => void
  onDeleteBuild: (buildId: string) => void
  onDeleteFolder: (folderId: string) => void
  onAddProfile: (buildId: string, name: string) => void
  onRenameProfile: (buildId: string, profileId: string, name: string) => void
  onDeleteProfile: (buildId: string, profileId: string) => void
}

export function BuildSelectOverlays({
  ctx,
  ctxItems,
  ctxHeader,
  onCloseCtx,
  overlay,
  onCloseOverlay,
  folders,
  onImport,
  onImportNamed,
  onCreateBuild,
  onRenameBuild,
  onSaveTags,
  onMove,
  onCreateFolder,
  onRenameFolder,
  onDeleteBuild,
  onDeleteFolder,
  onAddProfile,
  onRenameProfile,
  onDeleteProfile,
}: BuildSelectOverlaysProps) {
  return (
    <>
      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          header={ctxHeader}
          items={ctxItems}
          onClose={onCloseCtx}
        />
      )}

      {overlay?.kind === 'import' && (
        <ImportOverlay onImport={onImport} onClose={onCloseOverlay} />
      )}
      {overlay?.kind === 'nameImport' && (
        <TextPromptOverlay
          section="导入"
          title="为导入构建命名"
          label="构建名称"
          initial={overlay.defaultName}
          submitLabel="Save & open"
          hint="保存到构建库后自动打开。"
          onSubmit={(name) => onImportNamed(overlay.code, name)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'newBuild' && (
        <TextPromptOverlay
          section="创建"
          title="新建构建"
          label="构建名称"
          placeholder="例如：闪电神射手"
          submitLabel="创建"
          hint="保存到构建库后自动打开。"
          onSubmit={onCreateBuild}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'renameBuild' && (
        <TextPromptOverlay
          section="重命名"
          title="重命名构建"
          label="新名称"
          initial={overlay.current}
          submitLabel="保存"
          onSubmit={(name) => onRenameBuild(overlay.buildId, name)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'tags' && (
        <TagsOverlay
          initial={overlay.current}
          onSave={(tags) => onSaveTags(overlay.buildId, tags)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'move' && (
        <MoveToFolderOverlay
          folders={folders}
          currentFolderId={overlay.current}
          onMove={(folderId) => onMove(overlay.buildId, folderId)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'newFolder' && (
        <TextPromptOverlay
          section="整理"
          title="新建文件夹"
          label="文件夹名称"
          placeholder="例如：第 7 赛季构筑"
          submitLabel="创建"
          onSubmit={(name) => onCreateFolder(name, overlay.parentId)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'renameFolder' && (
        <TextPromptOverlay
          section="整理"
          title="重命名文件夹"
          label="新名称"
          initial={overlay.current}
          submitLabel="保存"
          onSubmit={(name) => onRenameFolder(overlay.folderId, name)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'deleteBuild' && (
        <ConfirmOverlay
          section="删除"
          title="删除构建"
          danger
          confirmLabel="删除构建"
          message={
            <>
              Permanently delete{' '}
              <span className="text-accent-hot">{overlay.name}</span> and all its
              profiles? This cannot be undone.
            </>
          }
          onConfirm={() => onDeleteBuild(overlay.buildId)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'deleteFolder' && (
        <ConfirmOverlay
          section="删除"
          title="删除文件夹"
          danger
          confirmLabel="删除文件夹"
          message={
            <>
              Delete <span className="text-accent-hot">{overlay.name}</span>?
              {overlay.count > 0 ? (
                <>
                  {' '}
                  Its {overlay.count} build{overlay.count === 1 ? '' : 's'} will
                  be moved to Unfiled.
                </>
              ) : (
                ' It is empty.'
              )}
            </>
          }
          onConfirm={() => onDeleteFolder(overlay.folderId)}
          onClose={onCloseOverlay}
        />
      )}

      {overlay?.kind === 'addProfile' && (
        <TextPromptOverlay
          section="配置档"
          title="新建配置档"
          label="配置档名称"
          placeholder="例如：Boss 配装"
          submitLabel="创建"
          hint="以此构建的当前配置档为模板。"
          onSubmit={(name) => onAddProfile(overlay.buildId, name)}
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'renameProfile' && (
        <TextPromptOverlay
          section="配置档"
          title="重命名配置档"
          label="新名称"
          initial={overlay.current}
          submitLabel="保存"
          onSubmit={(name) =>
            onRenameProfile(overlay.buildId, overlay.profileId, name)
          }
          onClose={onCloseOverlay}
        />
      )}
      {overlay?.kind === 'deleteProfile' && (
        <ConfirmOverlay
          section="删除"
          title="删除配置档"
          danger
          confirmLabel="删除配置档"
          message={
            <>
              Permanently delete profile{' '}
              <span className="text-accent-hot">{overlay.name}</span>? This cannot
              be undone.
            </>
          }
          onConfirm={() => onDeleteProfile(overlay.buildId, overlay.profileId)}
          onClose={onCloseOverlay}
        />
      )}
    </>
  )
}
