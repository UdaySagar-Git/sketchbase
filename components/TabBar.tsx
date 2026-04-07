"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createTab, deleteTab, renameTab } from "@/app/actions";
import {
  Plus,
  Pencil,
  PenTool,
  FileText,
  GitBranch,
  Trash,
  Home,
  Check,
  PanelLeft,
  Settings,
} from "@/components/icons";
import { MSG_SAVING, MSG_SAVED, MSG_SAVE_FAILED } from "@/lib/messages";
import { formatTime } from "@/lib/date";
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
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
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
  sidebarOpen,
  onSidebarToggle,
}: TabBarProps) {
  /* ---- tab management state ---- */
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(
    null
  );
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

  const sorted = [...tabs].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* ============================================================ */}
      {/*  HEADER BAR — fixed top                                      */}
      {/* ============================================================ */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-2 sm:px-4">
        {/* Left section: sidebar toggle + breadcrumbs */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <button
            onClick={onSidebarToggle}
            className="flex items-center justify-center rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <PanelLeft size={18} />
          </button>

          <div className="hidden h-5 w-px bg-zinc-200 sm:block" />

          {isOwner && (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center text-zinc-400 transition-colors hover:text-zinc-600 sm:flex"
                title="Dashboard"
              >
                <Home size={15} />
              </Link>
              <span className="hidden text-zinc-300 sm:inline">/</span>
            </>
          )}

          <Link
            href={isOwner ? `/project/${projectId}` : "#"}
            className={`hidden max-w-[120px] truncate text-xs text-zinc-500 transition-colors sm:block ${isOwner ? "hover:text-zinc-800" : "pointer-events-none"}`}
          >
            {projectEmoji && `${projectEmoji} `}
            {projectName}
          </Link>
          <span className="hidden text-zinc-300 sm:inline">/</span>
          <span className="max-w-[120px] truncate text-xs font-medium text-zinc-800 sm:max-w-[200px]">
            {boardName}
          </span>
        </div>

        {/* Mobile: current tab indicator */}
        {(() => {
          const activeTab = tabs.find((t) => t.id === activeTabId);
          if (!activeTab) return null;
          const config = TAB_TYPE_CONFIG[activeTab.type];
          const Icon = config.icon;
          return (
            <button
              onClick={onSidebarToggle}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 md:hidden"
            >
              <Icon size={13} />
              <span className="max-w-[80px] truncate">{activeTab.name}</span>
            </button>
          );
        })()}

        {/* Center section: tab switcher (desktop) */}
        <div className="hidden items-center gap-0.5 md:flex">
          {sorted.map((tab) => {
            const config = TAB_TYPE_CONFIG[tab.type];
            const Icon = config.icon;
            const isActive = tab.id === activeTabId;

            return (
              <button
                key={tab.id}
                onClick={() => !editingTabId && onTabChange(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ tabId: tab.id, x: e.clientX, y: e.clientY });
                }}
                onDoubleClick={() => handleRenameStart(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                  isActive
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                }`}
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
              </button>
            );
          })}

          {/* New tab button */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
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

        {/* Right section: save status + settings */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {saveStatus === "saving" && (
              <>
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
                <span className="hidden text-zinc-400 sm:inline">{MSG_SAVING}</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check size={10} className="text-emerald-500" />
                <span className="hidden text-zinc-400 sm:inline">{MSG_SAVED}</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="hidden text-red-400 sm:inline">{MSG_SAVE_FAILED}</span>
              </>
            )}
            {saveStatus === "idle" && lastSaved && (
              <span className="hidden text-zinc-300 sm:inline">{formatTime(lastSaved)}</span>
            )}
          </div>

          {isOwner && (
            <Link
              href="/settings"
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
              title="Settings"
            >
              <Settings size={16} />
            </Link>
          )}
        </div>
      </header>

      {/* Context menu (right-click on tabs) */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-[9999] w-36 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
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
