import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Logo from '../ui/Logo'
import { HEADER_BTN_CLASS } from '../app/BuildsMenu'
import { useBuild } from '../../store/build'
import { getClass } from '@data'
import { getActiveProfile, type Folder } from '../../utils/build/savedBuilds'
import { decodeShareToBuild, parseBuildCodeFromInput } from '../../utils/build/shareBuild'
import {
  GistShareError,
  fetchBuildCodeFromGist,
  isGistReference,
} from '../../utils/build/gistShare'
import { ShareDialog } from '../app/ShareDialog'
import { readStorage, writeStorage } from '../../utils/storage'
import { approxKB } from './buildDisplay'
import { useBuildLibrary } from './useBuildLibrary'
import { FolderTree, type Scope, type SmartCounts } from './FolderTree'
import { BuildTable, type SortCol, type SortDir } from './BuildTable'
import { BuildPreview } from './BuildPreview'
import { type ContextMenuItem } from './ContextMenu'
import { BuildSelectToolbar } from './BuildSelectToolbar'
import { BuildSelectFooter } from './BuildSelectFooter'
import { BuildSelectOverlays } from './OverlayHost'
import {
  RECENT_LIMIT,
  SCOPE_LABEL,
  type BuildSelectProps,
  type CtxState,
  type Overlay,
} from './buildSelectTypes'
import { T_VIEW } from '../../utils/motion'

export const AUTO_OPEN_KEY = 'hsplanner.autoOpenLastBuild.v1'

export default function BuildSelect({
  onOpenBuild,
  onClose,
  canClose,
}: BuildSelectProps) {
  const lib = useBuildLibrary()
  const activeBuildId = useBuild((s) => s.activeBuildId)

  const importCodeToLibrary = useBuild((s) => s.importCodeToLibrary)
  const saveCurrentAsNewBuild = useBuild((s) => s.saveCurrentAsNewBuild)
  const duplicateSavedBuild = useBuild((s) => s.duplicateSavedBuild)
  const renameSavedBuild = useBuild((s) => s.renameSavedBuild)
  const deleteSavedBuild = useBuild((s) => s.deleteSavedBuild)
  const setSavedBuildFavorite = useBuild((s) => s.setSavedBuildFavorite)
  const setSavedBuildTags = useBuild((s) => s.setSavedBuildTags)
  const moveSavedBuildToFolder = useBuild((s) => s.moveSavedBuildToFolder)
  const switchSavedBuildProfile = useBuild((s) => s.switchSavedBuildProfile)
  const addSavedBuildProfile = useBuild((s) => s.addSavedBuildProfile)
  const renameSavedBuildProfile = useBuild((s) => s.renameSavedBuildProfile)
  const duplicateSavedBuildProfile = useBuild(
    (s) => s.duplicateSavedBuildProfile,
  )
  const removeSavedBuildProfile = useBuild((s) => s.removeSavedBuildProfile)
  const createSavedFolder = useBuild((s) => s.createSavedFolder)
  const renameSavedFolder = useBuild((s) => s.renameSavedFolder)
  const deleteSavedFolder = useBuild((s) => s.deleteSavedFolder)

  const [scope, setScope] = useState<Scope>({ kind: 'recent' })
  const [selectedId, setSelectedId] = useState<string | null>(
    () => useBuild.getState().activeBuildId,
  )
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [levelFilter, setLevelFilter] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [ctx, setCtx] = useState<CtxState | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [autoOpen, setAutoOpen] = useState(
    () => readStorage(AUTO_OPEN_KEY) === '1',
  )

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 2200)
    return () => window.clearTimeout(t)
  }, [notice])

  const flash = (msg: string) => setNotice(msg)

  const descendantFolderIds = useMemo(() => {
    return (rootId: string): Set<string> => {
      const out = new Set<string>([rootId])
      let added = true
      while (added) {
        added = false
        for (const f of lib.folders) {
          if (f.parentId && out.has(f.parentId) && !out.has(f.id)) {
            out.add(f.id)
            added = true
          }
        }
      }
      return out
    }
  }, [lib.folders])

  const folderCounts = useMemo(() => {
    const direct: Record<string, number> = {}
    for (const b of lib.builds) {
      if (b.folderId) direct[b.folderId] = (direct[b.folderId] ?? 0) + 1
    }
    const memo: Record<string, number> = {}
    const compute = (id: string): number => {
      if (memo[id] !== undefined) return memo[id]!
      let c = direct[id] ?? 0
      for (const child of lib.childFolders[id] ?? []) c += compute(child.id)
      memo[id] = c
      return c
    }
    for (const f of lib.folders) compute(f.id)
    return memo
  }, [lib])

  const smartCounts: SmartCounts = useMemo(
    () => ({
      recent: Math.min(lib.builds.length, RECENT_LIMIT),
      all: lib.builds.length,
      favorites: lib.builds.filter((b) => b.favorite).length,
      unfiled: lib.builds.filter((b) => b.folderId === null).length,
    }),
    [lib.builds],
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const b of lib.builds) for (const t of b.tags) set.add(t)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [lib.builds])

  const scopedBuilds = useMemo(() => {
    if (scope.kind === 'favorites') return lib.builds.filter((b) => b.favorite)
    if (scope.kind === 'unfiled')
      return lib.builds.filter((b) => b.folderId === null)
    if (scope.kind === 'folder') {
      const subtree = descendantFolderIds(scope.id)
      return lib.builds.filter(
        (b) => b.folderId !== null && subtree.has(b.folderId),
      )
    }
    return lib.builds
  }, [lib.builds, scope, descendantFolderIds])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = scopedBuilds.filter((b) => {
      if (activeTags.length && !activeTags.every((t) => b.tags.includes(t)))
        return false
      if (levelFilter && (lib.meta[b.id]?.level ?? 0) < 90) return false
      if (q) {
        const m = lib.meta[b.id]
        const hay = `${b.name} ${m?.className ?? ''} ${b.tags.join(' ')} ${b.profiles
          .map((p) => p.name)
          .join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    if (scope.kind === 'recent') {
      list = [...list]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, RECENT_LIMIT)
    }
    const dir = sortDir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortCol) {
        case 'favorite':
          cmp = (a.favorite ? 1 : 0) - (b.favorite ? 1 : 0)
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'class':
          cmp = (lib.meta[a.id]?.className ?? '').localeCompare(
            lib.meta[b.id]?.className ?? '',
          )
          break
        case 'level':
          cmp = (lib.meta[a.id]?.level ?? 0) - (lib.meta[b.id]?.level ?? 0)
          break
        case 'date':
          cmp = a.updatedAt.localeCompare(b.updatedAt)
          break
      }
      return cmp * dir
    })
    return list
  }, [scopedBuilds, search, activeTags, levelFilter, sortCol, sortDir, scope, lib.meta])

  const totalCount =
    scope.kind === 'recent'
      ? Math.min(scopedBuilds.length, RECENT_LIMIT)
      : scopedBuilds.length

  const effectiveSelectedId =
    selectedId && filtered.some((b) => b.id === selectedId)
      ? selectedId
      : (filtered[0]?.id ?? null)
  const selectedBuild =
    lib.builds.find((b) => b.id === effectiveSelectedId) ?? null

  const handleSort = (col: SortCol) => {
    if (col === sortCol) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir(col === 'name' || col === 'class' ? 'asc' : 'desc')
    }
  }

  const handleImport = async (text: string): Promise<string | null> => {
    let raw = text
    if (isGistReference(text)) {
      try {
        raw = await fetchBuildCodeFromGist(text)
      } catch (e) {
        return e instanceof GistShareError ? e.message : '无法获取该 Gist'
      }
    }
    const code = parseBuildCodeFromInput(raw)
    if (!code) return '无法从输入中读取构建代码'
    const decoded = decodeShareToBuild(code)
    if (!decoded) return '构建代码无效或已损坏'
    const cls = decoded.snapshot.classId
      ? getClass(decoded.snapshot.classId)
      : undefined
    setOverlay({
      kind: 'nameImport',
      code,
      defaultName: `导入的 ${cls?.name ?? '构建'}`,
    })
    return null
  }

  const handleImportNamed = (code: string, name: string) => {
    const rec = importCodeToLibrary(code)
    setOverlay(null)
    if (!rec) {
      flash('构建代码无效或已损坏')
      return
    }
    renameSavedBuild(rec.id, name)
    onOpenBuild(rec.id)
  }

  const handleLibraryImport = async (text: string) => {
    let raw = text
    const isGist = isGistReference(text)
    if (isGist) {
      try {
        raw = await fetchBuildCodeFromGist(text)
      } catch (e) {
        flash(
          e instanceof GistShareError ? e.message : '无法获取该 Gist',
        )
        return
      }
    }
    const rec = importCodeToLibrary(parseBuildCodeFromInput(raw))
    if (!rec) {
      if (isGist) flash('构建代码无效或已损坏')
      return
    }
    setSelectedId(rec.id)
    if (scope.kind === 'folder' || scope.kind === 'favorites') {
      setScope({ kind: 'unfiled' })
    }
    flash(`已将“${rec.name}”导入到未分组`)
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return
      if (overlay || ctx) return
      const text = e.clipboardData?.getData('text') ?? ''
      if (text.trim()) void handleLibraryImport(text)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  })

  const handleCopy = (buildId: string) => {
    const rec = duplicateSavedBuild(buildId)
    if (rec) {
      setSelectedId(rec.id)
      flash(`已创建“${rec.name}”的副本`)
    }
  }

  const [shareBuildId, setShareBuildId] = useState<string | null>(null)

  const handleShare = (buildId: string) => {
    const build = lib.builds.find((b) => b.id === buildId)
    const profile = build ? getActiveProfile(build) : null
    if (!profile) {
      flash('没有可分享的内容')
      return
    }
    setShareBuildId(buildId)
  }

  const shareBuild = shareBuildId
    ? (lib.builds.find((b) => b.id === shareBuildId) ?? null)
    : null
  const shareProfile = shareBuild ? getActiveProfile(shareBuild) : null

  const handleCreateNew = (name: string) => {
    useBuild.getState().resetBuild()
    const folderId = scope.kind === 'folder' ? scope.id : null
    const rec = saveCurrentAsNewBuild(name, '', folderId)
    if (!rec) return
    setOverlay(null)
    onOpenBuild(rec.id)
  }

  const toggleTag = (tag: string) =>
    setActiveTags((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    )

  const toggleExpand = (folderId: string) =>
    setExpanded((cur) => {
      const next = new Set(cur)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })

  const openContextForBuild = (e: React.MouseEvent, buildId: string) => {
    e.preventDefault()
    setSelectedId(buildId)
    setCtx({ x: e.clientX, y: e.clientY, kind: 'build', id: buildId })
  }
  const openContextForFolder = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault()
    setCtx({ x: e.clientX, y: e.clientY, kind: 'folder', id: folder.id })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (overlay || ctx || shareBuildId) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setOverlay({ kind: 'newBuild' })
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (filtered.length === 0) return
        const idx = filtered.findIndex((b) => b.id === effectiveSelectedId)
        const next =
          e.key === 'ArrowDown'
            ? Math.min(filtered.length - 1, idx + 1)
            : Math.max(0, idx - 1)
        setSelectedId(filtered[next]!.id)
      } else if (e.key === 'Enter' && effectiveSelectedId) {
        e.preventDefault()
        onOpenBuild(effectiveSelectedId)
      } else if (e.key === 'F2' && selectedBuild) {
        setOverlay({
          kind: 'renameBuild',
          buildId: selectedBuild.id,
          current: selectedBuild.name,
        })
      } else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedBuild
      ) {
        setOverlay({
          kind: 'deleteBuild',
          buildId: selectedBuild.id,
          name: selectedBuild.name,
        })
      } else if (e.key === 'Escape' && canClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtered, effectiveSelectedId, selectedBuild, overlay, ctx, shareBuildId, canClose, onClose, onOpenBuild])

  const ctxItems: ContextMenuItem[] = useMemo(() => {
    if (!ctx) return []
    if (ctx.kind === 'build') {
      const build = lib.builds.find((b) => b.id === ctx.id)
      if (!build) return []
      return [
        { label: '打开构建', kbd: '↵', onClick: () => onOpenBuild(build.id) },
        { label: '创建副本', onClick: () => handleCopy(build.id) },
        {
          label: '重命名…',
          kbd: 'F2',
          onClick: () =>
            setOverlay({
              kind: 'renameBuild',
              buildId: build.id,
              current: build.name,
            }),
        },
        {
          label: build.favorite ? '取消收藏' : '收藏',
          onClick: () => setSavedBuildFavorite(build.id, !build.favorite),
        },
        {
          label: '移动到文件夹…',
          onClick: () =>
            setOverlay({
              kind: 'move',
              buildId: build.id,
              current: build.folderId,
            }),
        },
        {
          label: '编辑标签…',
          onClick: () =>
            setOverlay({
              kind: 'tags',
              buildId: build.id,
              current: build.tags,
            }),
        },
        { label: '分享…', onClick: () => handleShare(build.id) },
        {
          label: '删除',
          kbd: 'Del',
          danger: true,
          separatorBefore: true,
          onClick: () =>
            setOverlay({
              kind: 'deleteBuild',
              buildId: build.id,
              name: build.name,
            }),
        },
      ]
    }
    const folder = lib.folders.find((f) => f.id === ctx.id)
    if (!folder) return []
    return [
      {
        label: '新建子文件夹…',
        onClick: () => setOverlay({ kind: 'newFolder', parentId: folder.id }),
      },
      {
        label: '重命名文件夹…',
        onClick: () =>
          setOverlay({
            kind: 'renameFolder',
            folderId: folder.id,
            current: folder.name,
          }),
      },
      {
        label: '删除文件夹',
        danger: true,
        separatorBefore: true,
        onClick: () =>
          setOverlay({
            kind: 'deleteFolder',
            folderId: folder.id,
            name: folder.name,
            count: folderCounts[folder.id] ?? 0,
          }),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, lib.builds, lib.folders, folderCounts])

  const breadcrumb =
    scope.kind === 'folder'
      ? (lib.folders.find((f) => f.id === scope.id)?.name ?? '文件夹')
      : SCOPE_LABEL[scope.kind]

  return (
    <motion.div
      className="grid h-screen w-screen grid-rows-[auto_38px_1fr_28px] overflow-hidden text-text"
      style={{ background: 'var(--color-panel)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={T_VIEW}
    >
      <header
        className="relative flex h-11 shrink-0 items-center gap-0 border-b border-border pl-3 pr-3"
        style={{
          background:
            'linear-gradient(180deg, var(--color-panel-2), var(--color-panel))',
          boxShadow:
            'inset 0 -1px 0 rgba(201,165,90,0.08), 0 1px 0 rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-2 border-r border-border pr-3">
          <Logo size={22} glow title="HSPlanner" />
          <span
            className="select-none font-mono text-[11px] uppercase tracking-[0.18em] text-accent-hot"
            style={{ textShadow: '0 0 10px rgba(224,184,100,0.25)' }}
          >
            HSPlanner
          </span>
        </div>
        <div className="ml-2.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          <span className="text-faint">构建库</span>
          <span className="text-faint">/</span>
          <span className="text-accent-hot">{breadcrumb}</span>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {canClose && (
            <button type="button" onClick={onClose} className={HEADER_BTN_CLASS}>
              <span aria-hidden>←</span>
              <span>规划器</span>
            </button>
          )}
        </div>
      </header>

      <BuildSelectToolbar
        scope={scope}
        search={search}
        selectedBuild={selectedBuild}
        onSearchChange={setSearch}
        onNewBuild={() => setOverlay({ kind: 'newBuild' })}
        onOverlay={setOverlay}
        onCopy={handleCopy}
      />

      <main className="grid min-h-0 grid-cols-[240px_1fr_360px] border-t border-border">
        <FolderTree
          childFolders={lib.childFolders}
          scope={scope}
          onScopeChange={setScope}
          smartCounts={smartCounts}
          folderCounts={folderCounts}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onNewFolder={() =>
            setOverlay({
              kind: 'newFolder',
              parentId: scope.kind === 'folder' ? scope.id : null,
            })
          }
          onFolderContextMenu={openContextForFolder}
          footer={
            <>
              <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-faint">
                本地资料库
              </span>
              <span className="text-muted">{lib.builds.length}</span> 个构建 ·{' '}
              <span className="text-muted">
                {approxKB({ builds: lib.builds, folders: lib.folders })}
              </span>
            </>
          }
        />

        <BuildTable
          builds={filtered}
          meta={lib.meta}
          selectedId={effectiveSelectedId}
          activeBuildId={activeBuildId}
          sortCol={sortCol}
          sortDir={sortDir}
          onSort={handleSort}
          onSelect={setSelectedId}
          onOpen={onOpenBuild}
          onContextMenu={openContextForBuild}
          onToggleFavorite={(id) => {
            const b = lib.builds.find((x) => x.id === id)
            if (b) setSavedBuildFavorite(id, !b.favorite)
          }}
          allTags={allTags}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          levelFilter={levelFilter}
          onToggleLevelFilter={() => setLevelFilter((v) => !v)}
          onClearFilters={() => {
            setActiveTags([])
            setLevelFilter(false)
          }}
          totalCount={totalCount}
          listKey={
            scope.kind === 'folder' ? `folder:${scope.id}` : scope.kind
          }
          onDropCode={(text) => void handleLibraryImport(text)}
        />

        <BuildPreview
          build={selectedBuild}
          meta={selectedBuild ? lib.meta[selectedBuild.id] : undefined}
          onOpen={onOpenBuild}
          onShare={handleShare}
          onSwitchProfile={(buildId, profileId) => {
            if (switchSavedBuildProfile(buildId, profileId))
              flash('已切换配置档')
          }}
          onAddProfile={(buildId) => setOverlay({ kind: 'addProfile', buildId })}
          onRenameProfile={(buildId, profileId, current) =>
            setOverlay({ kind: 'renameProfile', buildId, profileId, current })
          }
          onDuplicateProfile={(buildId, profileId) => {
            if (duplicateSavedBuildProfile(buildId, profileId))
              flash('配置档已复制')
          }}
          onRemoveProfile={(buildId, profileId, name) =>
            setOverlay({ kind: 'deleteProfile', buildId, profileId, name })
          }
        />
      </main>

      <BuildSelectFooter
        buildCount={lib.builds.length}
        folderCount={lib.folders.length}
        notice={notice}
        autoOpen={autoOpen}
        onToggleAutoOpen={(checked) => {
          setAutoOpen(checked)
          writeStorage(AUTO_OPEN_KEY, checked ? '1' : '0')
        }}
      />

      <BuildSelectOverlays
        ctx={ctx}
        ctxItems={ctxItems}
        ctxHeader={
          ctx?.kind === 'build'
            ? lib.builds.find((b) => b.id === ctx.id)?.name
            : ctx
              ? lib.folders.find((f) => f.id === ctx.id)?.name
              : undefined
        }
        onCloseCtx={() => setCtx(null)}
        overlay={overlay}
        onCloseOverlay={() => setOverlay(null)}
        folders={lib.folders}
        onImport={handleImport}
        onImportNamed={handleImportNamed}
        onCreateBuild={handleCreateNew}
        onRenameBuild={(buildId, name) => {
          renameSavedBuild(buildId, name)
          setOverlay(null)
          flash('构建已重命名')
        }}
        onSaveTags={(buildId, tags) => {
          setSavedBuildTags(buildId, tags)
          setOverlay(null)
          flash('标签已更新')
        }}
        onMove={(buildId, folderId) => {
          moveSavedBuildToFolder(buildId, folderId)
          setOverlay(null)
          flash('构建已移动')
        }}
        onCreateFolder={(name, parentId) => {
          const folder = createSavedFolder(name, parentId)
          if (folder && parentId) {
            setExpanded((cur) => new Set(cur).add(parentId))
          }
          setOverlay(null)
          flash('文件夹已创建')
        }}
        onRenameFolder={(folderId, name) => {
          renameSavedFolder(folderId, name)
          setOverlay(null)
          flash('文件夹已重命名')
        }}
        onDeleteBuild={(buildId) => {
          deleteSavedBuild(buildId)
          setOverlay(null)
          flash('构建已删除')
        }}
        onDeleteFolder={(folderId) => {
          deleteSavedFolder(folderId, false)
          if (scope.kind === 'folder' && scope.id === folderId) {
            setScope({ kind: 'all' })
          }
          setOverlay(null)
          flash('文件夹已删除')
        }}
        onAddProfile={(buildId, name) => {
          const id = addSavedBuildProfile(buildId, name)
          setOverlay(null)
          flash(
            id
              ? '配置档已添加'
              : 'Could not add profile — build code unreadable',
          )
        }}
        onRenameProfile={(buildId, profileId, name) => {
          renameSavedBuildProfile(buildId, profileId, name)
          setOverlay(null)
          flash('配置档已重命名')
        }}
        onDeleteProfile={(buildId, profileId) => {
          removeSavedBuildProfile(buildId, profileId)
          setOverlay(null)
          flash('配置档已删除')
        }}
      />

      {shareBuild && shareProfile && (
        <ShareDialog
          code={shareProfile.code}
          onClose={() => setShareBuildId(null)}
        />
      )}
    </motion.div>
  )
}
