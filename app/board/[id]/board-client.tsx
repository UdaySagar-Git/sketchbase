"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import PasswordOverlay from "@/components/PasswordOverlay";
import TabBar, { type TabData } from "@/components/TabBar";
import BoardSidebar from "@/components/BoardSidebar";

// Dynamic imports for all tab editors (SSR disabled)
const ExcalidrawTab = dynamic(() => import("@/components/tabs/ExcalidrawTab"), { ssr: false });
const BlockNoteTab = dynamic(() => import("@/components/tabs/BlockNoteTab"), { ssr: false });
const TldrawTab = dynamic(() => import("@/components/tabs/TldrawTab"), { ssr: false });
const MindmapTab = dynamic(() => import("@/components/tabs/MindmapTab"), { ssr: false });

const SIDEBAR_KEY = "sketchbase-sidebar-open";

interface BoardClientProps {
  boardId: string;
  boardName: string;
  projectName: string;
  projectEmoji: string | null;
  projectId: string;
  initialTabs: TabData[];
  isLocked: boolean;
  isWorkspaceLocked: boolean;
  isOwner: boolean;
}

export default function BoardClient({
  boardId,
  boardName,
  projectName,
  projectEmoji,
  projectId,
  initialTabs,
  isLocked,
  isWorkspaceLocked,
  isOwner,
}: BoardClientProps) {
  const [unlocked] = useState(!isLocked && !isWorkspaceLocked);
  const [lockType] = useState<"board" | "workspace">(isWorkspaceLocked ? "workspace" : "board");
  const [tabs, setTabs] = useState<TabData[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored !== null ? stored === "true" : window.innerWidth >= 768;
  });

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const handleSaveStatus = useCallback((status: "idle" | "saving" | "saved" | "error") => {
    setSaveStatus(status);
    if (status === "saved") {
      setLastSaved(new Date());
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (!unlocked) {
    return (
      <PasswordOverlay
        boardId={boardId}
        type={lockType}
        onUnlock={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* Header */}
      {tabs.length > 0 && (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          boardId={boardId}
          boardName={boardName}
          projectName={projectName}
          projectEmoji={projectEmoji}
          projectId={projectId}
          isOwner={isOwner}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          onTabChange={setActiveTabId}
          onTabsUpdate={setTabs}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={toggleSidebar}
        />
      )}

      {/* Body: sidebar + content */}
      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar */}
        <BoardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isOwner={isOwner}
          boardId={boardId}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabsUpdate={setTabs}
        />

        {/* Tab editors — main content area */}
        <main className="relative min-w-0 flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="absolute inset-0"
              style={{ display: tab.id === activeTabId ? "block" : "none" }}
            >
              {tab.type === "EXCALIDRAW" && (
                <ExcalidrawTab
                  tabId={tab.id}
                  initialData={tab.content as Record<string, unknown> | null}
                  onSaveStatus={tab.id === activeTabId ? handleSaveStatus : undefined}
                />
              )}
              {tab.type === "BLOCKNOTE" && (
                <BlockNoteTab
                  tabId={tab.id}
                  initialData={tab.content}
                  onSaveStatus={tab.id === activeTabId ? handleSaveStatus : undefined}
                />
              )}
              {tab.type === "TLDRAW" && (
                <TldrawTab
                  tabId={tab.id}
                  initialData={tab.content}
                  onSaveStatus={tab.id === activeTabId ? handleSaveStatus : undefined}
                />
              )}
              {tab.type === "MINDMAP" && (
                <MindmapTab
                  tabId={tab.id}
                  initialData={tab.content}
                  onSaveStatus={tab.id === activeTabId ? handleSaveStatus : undefined}
                />
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
