"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import PasswordOverlay from "@/components/PasswordOverlay";
import TabBar, { type TabData } from "@/components/TabBar";

// Dynamic imports for all tab editors (SSR disabled)
const ExcalidrawTab = dynamic(() => import("@/components/tabs/ExcalidrawTab"), { ssr: false });
const BlockNoteTab = dynamic(() => import("@/components/tabs/BlockNoteTab"), { ssr: false });
const TldrawTab = dynamic(() => import("@/components/tabs/TldrawTab"), { ssr: false });
const MindmapTab = dynamic(() => import("@/components/tabs/MindmapTab"), { ssr: false });

interface BoardClientProps {
  boardId: string;
  boardName: string;
  projectName: string;
  projectEmoji: string | null;
  projectId: string;
  initialTabs: TabData[];
  isLocked: boolean;
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
  isOwner,
}: BoardClientProps) {
  const [unlocked] = useState(!isLocked);
  const [tabs, setTabs] = useState<TabData[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSaveStatus = useCallback((status: "idle" | "saving" | "saved" | "error") => {
    setSaveStatus(status);
    if (status === "saved") {
      setLastSaved(new Date());
    }
  }, []);

  if (!unlocked) {
    return (
      <PasswordOverlay
        boardId={boardId}
        onUnlock={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen">
      {/* Unified floating toolbar — draggable */}
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
        />
      )}

      {/* Tab editors — use display:none to keep mounted */}
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
    </div>
  );
}
