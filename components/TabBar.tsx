"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createTab, deleteTab, renameTab, reorderTabs } from "@/app/actions";
import {
  Plus,
  Pencil,
  PenTool,
  FileText,
  GitBranch,
  Trash,
  Home,
  Check,
  GripVertical,
} from "@/components/icons";
import BoardSidebar from "@/components/BoardSidebar";
import { islandStyle } from "@/lib/styles";
import { MSG_SAVING, MSG_SAVED, MSG_SAVE_FAILED } from "@/lib/messages";
import { formatTime } from "@/lib/date";
import { useDraggable } from "@/hooks/useDraggable";
import type { TabType } from "@prisma/client";

export interface TabData {
  id: string;
  name: string;
  type: TabType;
  order: number;
  content: unknown;
}

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

/* ------------------------------------------------------------------ */
/*  DragHandle — shared grip icon for both islands                    */
/* ------------------------------------------------------------------ */
function DragHandle({ handleRef }: { handleRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={handleRef}
      className="flex cursor-grab items-center rounded-md p-0.5 text-zinc-300 transition-colors hover:text-zinc-500 active:cursor-grabbing"
      title="Drag to move"
    >
      <GripVertical size={14} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface TabBarProps {
  tabs: TabData[];
  activeTabId: string;
  boardId: string;
  boardName: string;
  projectName: string;
  projectEmoji: string | null;
  projectId: string;
  isOwner: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  onTabChange: (tabId: string) => void;
  onTabsUpdate: (tabs: TabData[]) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  boardId,
  boardName,
  projectName,
  projectEmoji,
  projectId,
  isOwner,
  saveStatus,
  lastSaved,
  onTabChange,
  onTabsUpdate,
}: TabBarProps) {
  /* ---- draggable instances ---- */
  const {
    containerRef: navContainerRef,
    handleRef: navHandleRef,
    style: navStyle,
  } = useDraggable({ anchor: "top", storageKey: "nav" });
  const {
    containerRef: pagesContainerRef,
    handleRef: pagesHandleRef,
    style: pagesStyle,
  } = useDraggable({ anchor: "bottom", storageKey: "pages" });

  /* ---- tab management state ---- */
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(
    null
  );
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dragTabId, setDragTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  /* ---- handlers ---- */
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

  const handleDragStart = useCallback((tabId: string) => {
    setDragTabId(tabId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, tabId: string) => {
      e.preventDefault();
      if (dragTabId && dragTabId !== tabId) {
        setDragOverTabId(tabId);
      }
    },
    [dragTabId]
  );

  const handleDrop = useCallback(
    async (targetTabId: string) => {
      if (!dragTabId || dragTabId === targetTabId) {
        setDragTabId(null);
        setDragOverTabId(null);
        return;
      }
      const reordered = [...tabs];
      const fromIndex = reordered.findIndex((t) => t.id === dragTabId);
      const toIndex = reordered.findIndex((t) => t.id === targetTabId);
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      const updated = reordered.map((t, i) => ({ ...t, order: i }));
      onTabsUpdate(updated);
      await reorderTabs(
        boardId,
        updated.map((t) => t.id)
      );
      setDragTabId(null);
      setDragOverTabId(null);
    },
    [dragTabId, tabs, boardId, onTabsUpdate]
  );

  const sorted = [...tabs].sort((a, b) => a.order - b.order);
  const showSaveIndicator = saveStatus !== "idle" || lastSaved;

  return (
    <>
      {/* ============================================================ */}
      {/*  ISLAND 1 — Navigator (top-center, draggable)                */}
      {/* ============================================================ */}
      <div
        ref={navContainerRef}
        className="pointer-events-auto rounded-xl"
        style={{ ...navStyle, ...islandStyle }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] sm:gap-2 sm:text-xs">
          <DragHandle handleRef={navHandleRef} />

          <div className="h-4 w-px bg-zinc-100" />

          {isOwner && (
            <>
              <BoardSidebar />
              <div className="hidden h-4 w-px bg-zinc-200 sm:block" />
              <Link
                href="/dashboard"
                className="hidden items-center text-zinc-400 transition-colors hover:text-zinc-600 sm:flex"
                title="Dashboard"
              >
                <Home size={13} />
              </Link>
              <span className="hidden text-zinc-300 sm:inline">/</span>
            </>
          )}

          <Link
            href={isOwner ? `/project/${projectId}` : "#"}
            className={`max-w-[80px] truncate text-zinc-500 transition-colors sm:max-w-none ${isOwner ? "hover:text-zinc-800" : "pointer-events-none"}`}
          >
            {projectEmoji && `${projectEmoji} `}
            {projectName}
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="max-w-[80px] truncate font-medium text-zinc-800 sm:max-w-none">
            {boardName}
          </span>

          {showSaveIndicator && (
            <>
              <div className="mx-0.5 h-4 w-px bg-zinc-100" />
              <div className="flex shrink-0 items-center gap-1.5 text-[11px]">
                {saveStatus === "saving" && (
                  <>
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
                    <span className="text-zinc-400">{MSG_SAVING}</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <Check size={10} className="text-emerald-500" />
                    <span className="text-zinc-400">{MSG_SAVED}</span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-red-400">{MSG_SAVE_FAILED}</span>
                  </>
                )}
                {saveStatus === "idle" && lastSaved && (
                  <span className="text-zinc-300">{formatTime(lastSaved)}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  ISLAND 2 — Pages / Tabs (bottom-center, draggable)          */}
      {/* ============================================================ */}
      <div
        ref={pagesContainerRef}
        className="pointer-events-auto rounded-xl"
        style={{ ...pagesStyle, ...islandStyle }}
      >
        <div className="flex items-center gap-0.5 px-1.5 py-1.5">
          <DragHandle handleRef={pagesHandleRef} />

          <div className="mx-0.5 h-4 w-px bg-zinc-100" />

          {sorted.map((tab) => {
            const config = TAB_TYPE_CONFIG[tab.type];
            const Icon = config.icon;
            const isActive = tab.id === activeTabId;

            return (
              <div
                key={tab.id}
                draggable
                onDragStart={() => handleDragStart(tab.id)}
                onDragOver={(e) => handleDragOver(e, tab.id)}
                onDrop={() => handleDrop(tab.id)}
                onDragEnd={() => {
                  setDragTabId(null);
                  setDragOverTabId(null);
                }}
                onClick={() => !editingTabId && onTabChange(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ tabId: tab.id, x: e.clientX, y: e.clientY });
                }}
                onDoubleClick={() => handleRenameStart(tab.id)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all select-none ${
                  isActive
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                } ${dragOverTabId === tab.id ? "ring-2 ring-zinc-400" : ""}`}
              >
                <Icon size={13} />
                {editingTabId === tab.id ? (
                  <input
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(tab.id);
                      if (e.key === "Escape") setEditingTabId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 border-b border-zinc-300 bg-transparent text-xs outline-none"
                  />
                ) : (
                  <span className="max-w-[80px] truncate">{tab.name}</span>
                )}
              </div>
            );
          })}

          {/* New tab button */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
            >
              <Plus size={14} />
            </button>

            {showNewMenu && (
              <div
                className="absolute bottom-full left-0 z-[9999999] mb-2 w-44 overflow-hidden rounded-xl py-1 shadow-lg"
                style={{
                  ...islandStyle,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                }}
              >
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
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-[9999999] w-36 overflow-hidden rounded-xl py-1 shadow-lg"
          style={{
            ...islandStyle,
            left: contextMenu.x,
            top: contextMenu.y,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
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
