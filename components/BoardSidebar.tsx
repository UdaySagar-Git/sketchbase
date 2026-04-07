"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getWorkspaceNav,
  createProject,
  createBoard,
  deleteProject,
  deleteBoard,
  createTab,
  deleteTab,
  renameTab,
} from "@/app/actions";
import { confirmDeleteBoard, confirmDeleteProject } from "@/lib/messages";
import {
  ChevronRight,
  Plus,
  TrashSimple,
  Lock,
  File,
  X,
  Home,
  Pencil,
  PenTool,
  FileText,
  GitBranch,
  Trash,
} from "@/components/icons";
import type { TabType } from "@prisma/client";

interface TabData {
  id: string;
  name: string;
  type: TabType;
  order: number;
  content: unknown;
}

type NavProject = {
  id: string;
  name: string;
  emoji: string | null;
  boards: { id: string; name: string; isLocked: boolean }[];
};

const TAB_TYPE_CONFIG: Record<TabType, { icon: typeof Pencil; label: string }> = {
  EXCALIDRAW: { icon: Pencil, label: "Drawing" },
  BLOCKNOTE: { icon: FileText, label: "Notes" },
  TLDRAW: { icon: PenTool, label: "Whiteboard" },
  MINDMAP: { icon: GitBranch, label: "Mind Map" },
};

const DEFAULT_TAB_NAMES: Record<TabType, string> = {
  EXCALIDRAW: "Drawing",
  BLOCKNOTE: "Notes",
  TLDRAW: "Whiteboard",
  MINDMAP: "Mind Map",
};

interface BoardSidebarProps {
  open: boolean;
  onClose: () => void;
  isOwner: boolean;
  boardId: string;
  tabs: TabData[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabsUpdate: (tabs: TabData[]) => void;
}

export default function BoardSidebar({
  open,
  onClose,
  isOwner,
  boardId,
  tabs,
  activeTabId,
  onTabChange,
  onTabsUpdate,
}: BoardSidebarProps) {
  const [projects, setProjects] = useState<NavProject[]>([]);
  const [manualExpanded, setExpanded] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(
    null
  );
  const pathname = usePathname();

  const expanded = useMemo(() => {
    const boardMatch = pathname.match(/^\/board\/(.+)/);
    if (boardMatch) {
      const bid = boardMatch[1];
      const proj = projects.find((p) => p.boards.some((b) => b.id === bid));
      if (proj) return { ...manualExpanded, [proj.id]: true };
    }
    return manualExpanded;
  }, [pathname, projects, manualExpanded]);

  const loadNav = useCallback(() => {
    startTransition(async () => {
      const data = await getWorkspaceNav();
      if (data) setProjects(data);
    });
  }, []);

  useEffect(() => {
    if (open && isOwner) loadNav();
  }, [open, isOwner, loadNav]);

  /* ---- tab handlers ---- */
  const handleCreateTab = useCallback(
    async (type: TabType) => {
      setShowNewMenu(false);
      const name = DEFAULT_TAB_NAMES[type];
      const tab = await createTab(boardId, type, name);
      onTabsUpdate([
        ...tabs,
        { id: tab.id, name: tab.name, type: tab.type, order: tab.order, content: tab.content },
      ]);
      onTabChange(tab.id);
    },
    [boardId, tabs, onTabsUpdate, onTabChange]
  );

  const handleDeleteTab = useCallback(
    async (tabId: string) => {
      setContextMenu(null);
      if (tabs.length <= 1) return;
      await deleteTab(tabId);
      const remaining = tabs.filter((t) => t.id !== tabId);
      onTabsUpdate(remaining);
      if (activeTabId === tabId) {
        onTabChange(remaining[0].id);
      }
    },
    [tabs, activeTabId, onTabsUpdate, onTabChange]
  );

  const handleRenameStart = useCallback(
    (tabId: string) => {
      setContextMenu(null);
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        setEditingTabId(tabId);
        setEditValue(tab.name);
      }
    },
    [tabs]
  );

  const handleRenameSubmit = useCallback(
    async (tabId: string) => {
      if (editValue.trim()) {
        await renameTab(tabId, editValue.trim());
        onTabsUpdate(tabs.map((t) => (t.id === tabId ? { ...t, name: editValue.trim() } : t)));
      }
      setEditingTabId(null);
    },
    [editValue, tabs, onTabsUpdate]
  );

  /* ---- nav handlers ---- */
  function handleAddProject() {
    if (!inputValue.trim()) return;
    const fd = new FormData();
    fd.set("name", inputValue.trim());
    startTransition(async () => {
      await createProject(fd);
      setInputValue("");
      setAdding(null);
      loadNav();
    });
  }

  function handleAddBoard(projectId: string) {
    if (!inputValue.trim()) return;
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("name", inputValue.trim());
    startTransition(async () => {
      await createBoard(fd);
      setInputValue("");
      setAdding(null);
      loadNav();
    });
  }

  function handleDeleteProject(id: string, name: string) {
    if (!confirm(confirmDeleteProject(name))) return;
    startTransition(async () => {
      await deleteProject(id);
      loadNav();
    });
  }

  function handleDeleteBoard(id: string, name: string) {
    if (!confirm(confirmDeleteBoard(name))) return;
    startTransition(async () => {
      await deleteBoard(id);
      loadNav();
    });
  }

  const sorted = [...tabs].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={onClose} />}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-12 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:relative md:top-0 md:z-auto ${
          open ? "translate-x-0" : "-translate-x-full md:-ml-64"
        }`}
      >
        {/* Pages section */}
        <div className="border-b border-zinc-100 px-3 pt-3 pb-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Pages
            </span>
            <div className="relative">
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                title="New page"
              >
                <Plus size={14} />
              </button>
              {showNewMenu && (
                <div className="absolute top-full right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                  {(Object.keys(TAB_TYPE_CONFIG) as TabType[]).map((type) => {
                    const config = TAB_TYPE_CONFIG[type];
                    const Icon = config.icon;
                    const count = tabs.filter((t) => t.type === type).length;
                    return (
                      <button
                        key={type}
                        onClick={() => handleCreateTab(type)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        <Icon size={14} className="text-zinc-400" />
                        <span className="flex-1">{config.label}</span>
                        {count > 0 && (
                          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            {sorted.map((tab) => {
              const config = TAB_TYPE_CONFIG[tab.type];
              const Icon = config.icon;
              const isActive = tab.id === activeTabId;

              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    if (!editingTabId) onTabChange(tab.id);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ tabId: tab.id, x: e.clientX, y: e.clientY });
                  }}
                  onDoubleClick={() => handleRenameStart(tab.id)}
                  className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-all ${
                    isActive
                      ? "bg-zinc-100 font-medium text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-zinc-700" : "text-zinc-400"} />
                  {editingTabId === tab.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(tab.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(tab.id);
                        if (e.key === "Escape") setEditingTabId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 border-b border-zinc-300 bg-transparent text-[13px] outline-none"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate">{tab.name}</span>
                  )}
                  {tabs.length > 1 && !editingTabId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTab(tab.id);
                      }}
                      className="shrink-0 rounded-md p-0.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                      title="Delete page"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigator section (owner only) */}
        {isOwner && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between px-3 pt-3 pb-1">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Workspace
              </span>
              {isPending && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />}
            </div>

            <div className="flex-1 overflow-y-auto px-1.5 pb-2" style={{ fontSize: 13 }}>
              {/* Shimmer loading state */}
              {isPending && projects.length === 0 && (
                <div className="space-y-2 px-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center gap-2 py-1">
                        <div className="skeleton h-3 w-3 rounded" />
                        <div className="skeleton h-4 w-4 rounded" />
                        <div
                          className="skeleton h-3.5 flex-1 rounded"
                          style={{ maxWidth: 120 + i * 20 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {projects.map((project) => (
                <div key={project.id} className="mb-0.5">
                  <div className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5">
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [project.id]: !prev[project.id] }))
                      }
                      className="flex shrink-0 items-center justify-center"
                      style={{ width: 16, height: 16 }}
                    >
                      <ChevronRight
                        size={10}
                        className={`text-zinc-400 transition-transform duration-150 ${expanded[project.id] ? "rotate-90" : ""}`}
                      />
                    </button>
                    <span className="shrink-0 text-sm">{project.emoji || "📁"}</span>
                    <Link
                      href={`/project/${project.id}`}
                      className="flex-1 truncate font-medium text-zinc-700 hover:text-zinc-900"
                    >
                      {project.name}
                    </Link>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setAdding(project.id);
                          setInputValue("");
                          setExpanded((prev) => ({ ...prev, [project.id]: true }));
                        }}
                        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        title="Add board"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                        title="Delete project"
                      >
                        <TrashSimple size={12} />
                      </button>
                    </div>
                  </div>

                  {expanded[project.id] && (
                    <div className="ml-4 border-l border-zinc-100 pl-2">
                      {project.boards.map((board) => {
                        const isActive = pathname === `/board/${board.id}`;
                        return (
                          <div
                            key={board.id}
                            className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 ${isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"}`}
                          >
                            <Link
                              href={`/board/${board.id}`}
                              className="flex flex-1 items-center gap-1.5 truncate"
                            >
                              {board.isLocked ? (
                                <Lock size={11} className="shrink-0 opacity-50" />
                              ) : (
                                <File size={11} className="shrink-0 opacity-30" />
                              )}
                              <span className="truncate">{board.name}</span>
                            </Link>
                            <button
                              onClick={() => handleDeleteBoard(board.id, board.name)}
                              className="shrink-0 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                              title="Delete board"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        );
                      })}

                      {adding === project.id && (
                        <div className="flex items-center gap-1 px-2 py-1">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddBoard(project.id);
                              if (e.key === "Escape") {
                                setAdding(null);
                                setInputValue("");
                              }
                            }}
                            placeholder="Board name..."
                            autoFocus
                            className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-300 focus:outline-none"
                          />
                        </div>
                      )}

                      {project.boards.length === 0 && adding !== project.id && (
                        <p className="px-2 py-1 text-xs text-zinc-300">No boards yet</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {projects.length === 0 && !isPending && (
                <p className="px-2 py-3 text-center text-xs text-zinc-400">No projects yet</p>
              )}

              {/* Add project */}
              {adding === "__project__" ? (
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddProject();
                      if (e.key === "Escape") {
                        setAdding(null);
                        setInputValue("");
                      }
                    }}
                    placeholder="Project name..."
                    autoFocus
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-300 focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAdding("__project__");
                    setInputValue("");
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                >
                  <Plus size={12} />
                  <span className="text-xs">New Project</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-100 px-3 py-2.5">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                <Home size={12} />
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999] w-36 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button
            onClick={() => handleRenameStart(contextMenu.tabId)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Pencil size={13} />
            Rename
          </button>
          {tabs.length > 1 && (
            <button
              onClick={() => handleDeleteTab(contextMenu.tabId)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash size={13} />
              Delete
            </button>
          )}
        </div>
      )}
    </>
  );
}
