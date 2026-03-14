"use client";

import { useState } from "react";
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
  isOwner: boolean;
}

export default function BoardClient({
  boardId,
  boardName,
  projectName,
  projectEmoji,
  projectId,
  initialData,
  isLocked,
  isOwner,
}: BoardClientProps) {
  const [unlocked, setUnlocked] = useState(!isLocked);
  const [boardData, setBoardData] = useState(initialData);

  if (!unlocked) {
    return (
      <PasswordOverlay
        boardId={boardId}
        onUnlock={(content) => {
          setBoardData(content);
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen">
      {/* Breadcrumb island — bottom-left on mobile, top-left on desktop */}
      <div
        className="pointer-events-auto absolute bottom-[70px] left-3 z-20 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-1.5 sm:text-xs md:top-[15px] md:bottom-auto md:left-[60px]"
        style={islandStyle}
      >
        {/* Navigator — only for workspace owners */}
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
      </div>

      {/* Canvas */}
      <ExcalidrawBoard boardId={boardId} initialData={boardData} />
    </div>
  );
}
