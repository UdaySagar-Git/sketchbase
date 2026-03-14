"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ExcalidrawBoard from "@/components/ExcalidrawBoard";
import PasswordOverlay from "@/components/PasswordOverlay";
import BoardSidebar from "@/components/BoardSidebar";
import { islandStyle } from "@/lib/styles";
import { Home } from "@/components/icons";

interface BoardClientProps {
  boardId: string;
  boardName: string;
  projectName: string;
  projectEmoji: string | null;
  projectId: string;
  initialData: Record<string, unknown> | null;
  isLocked: boolean;
}

export default function BoardClient({
  boardId,
  boardName,
  projectName,
  projectEmoji,
  projectId,
  initialData,
  isLocked,
}: BoardClientProps) {
  const [unlocked, setUnlocked] = useState(!isLocked);

  useEffect(() => {
    if (isLocked) {
      const wasUnlocked = sessionStorage.getItem(`board-unlocked-${boardId}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (wasUnlocked === "true") setUnlocked(true);
    }
  }, [boardId, isLocked]);

  if (!unlocked) {
    return <PasswordOverlay boardId={boardId} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="h-screen w-screen">
      {/* Breadcrumb island — top left, offset to clear Excalidraw menu */}
      <div
        className="pointer-events-auto absolute z-20 flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs"
        style={{ top: 15, left: 60, ...islandStyle }}
      >
        {/* Sidebar toggle — integrated into breadcrumb */}
        <BoardSidebar />

        <div className="h-4 w-px bg-zinc-200" />

        <Link
          href="/dashboard"
          className="flex items-center text-zinc-400 transition-colors hover:text-zinc-600"
          title="Dashboard"
        >
          <Home size={13} />
        </Link>
        <span className="text-zinc-300">/</span>
        <Link
          href={`/project/${projectId}`}
          className="text-zinc-500 transition-colors hover:text-zinc-800"
        >
          {projectEmoji && `${projectEmoji} `}
          {projectName}
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="font-medium text-zinc-800">{boardName}</span>
      </div>

      {/* Canvas */}
      <ExcalidrawBoard boardId={boardId} initialData={initialData} />
    </div>
  );
}
