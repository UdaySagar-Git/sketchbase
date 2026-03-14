"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { saveBoard } from "@/app/actions";
import {
  AUTOSAVE_DEBOUNCE_MS,
  SAVE_STATUS_DISPLAY_MS,
  ERROR_STATUS_DISPLAY_MS,
} from "@/lib/constants";
import { MSG_SAVING, MSG_SAVED, MSG_SAVE_FAILED, MSG_LAST_SAVED } from "@/lib/messages";
import { formatTime } from "@/lib/date";
import { Check } from "@/components/icons";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false,
});

interface ExcalidrawBoardProps {
  boardId: string;
  initialData: Record<string, unknown> | null;
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
          setTimeout(() => setSaveStatus("idle"), SAVE_STATUS_DISPLAY_MS);
        } catch {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), ERROR_STATUS_DISPLAY_MS);
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [boardId]
  );

  return (
    <div className="relative h-full w-full">
      <Excalidraw
        theme="light"
        initialData={
          initialData
            ? {
                elements: (initialData.elements as never[]) || [],
                appState: (() => {
                  const { collaborators, ...rest } =
                    (initialData.appState as Record<string, unknown>) || {};
                  void collaborators;
                  return { ...rest, theme: "light" };
                })(),
              }
            : undefined
        }
        onChange={handleChange}
      />

      {/* Save status — bottom-right */}
      <div className="pointer-events-none absolute right-3 bottom-[70px] z-10 md:right-[60px] md:bottom-[15px]">
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
              <span>{MSG_SAVING}</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check size={12} className="text-green-500" />
              <span>{MSG_SAVED}</span>
              {lastSaved && <span className="text-zinc-400">{formatTime(lastSaved)}</span>}
            </>
          )}
          {saveStatus === "error" && (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span className="text-red-500">{MSG_SAVE_FAILED}</span>
            </>
          )}
          {saveStatus === "idle" && lastSaved && (
            <span className="text-zinc-400">
              {MSG_LAST_SAVED} {formatTime(lastSaved)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
