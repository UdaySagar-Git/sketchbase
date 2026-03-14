"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { saveBoard } from "@/app/actions";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

interface ExcalidrawBoardProps {
  boardId: string;
  initialData: Record<string, unknown> | null;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ExcalidrawBoard({ boardId, initialData }: ExcalidrawBoardProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly unknown[], appState: any) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          const { collaborators, ...cleanAppState } = appState;
          void collaborators;
          await saveBoard(boardId, { elements, appState: cleanAppState });
          const now = new Date();
          setLastSaved(now);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 3000);
        } catch {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 4000);
        }
      }, 2000);
    },
    [boardId]
  );

  return (
    <div className="relative h-full w-full">
      <Excalidraw
        theme="light"
        initialData={initialData ? {
          elements: (initialData.elements as never[]) || [],
          appState: (() => {
            const { collaborators, ...rest } = (initialData.appState as Record<string, unknown>) || {};
            void collaborators;
            return { ...rest, theme: "light" };
          })(),
        } : undefined}
        onChange={handleChange}
      />

      {/* Save status — bottom right */}
      <div className="pointer-events-none absolute z-10" style={{ bottom: 15, right: 60 }}>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
          style={{
            fontFamily: "var(--ui-font, system-ui, sans-serif)",
            background: "rgba(255,255,255,0.95)",
            color: "#1b1b1f",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            border: "1px solid #e4e4e7",
          }}
        >
          {saveStatus === "saving" && (
            <>
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Saved</span>
              {lastSaved && (
                <span className="text-zinc-400">{formatTime(lastSaved)}</span>
              )}
            </>
          )}
          {saveStatus === "error" && (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span className="text-red-500">Save failed</span>
            </>
          )}
          {saveStatus === "idle" && lastSaved && (
            <span className="text-zinc-400">
              Last saved {formatTime(lastSaved)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
