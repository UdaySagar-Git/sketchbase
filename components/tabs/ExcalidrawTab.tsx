"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { saveTab } from "@/app/actions";
import {
  AUTOSAVE_DEBOUNCE_MS,
  SAVE_STATUS_DISPLAY_MS,
  ERROR_STATUS_DISPLAY_MS,
} from "@/lib/constants";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false,
});

interface ExcalidrawTabProps {
  tabId: string;
  initialData: Record<string, unknown> | null;
  onSaveStatus?: (status: "idle" | "saving" | "saved" | "error") => void;
}

export default function ExcalidrawTab({ tabId, initialData, onSaveStatus }: ExcalidrawTabProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly unknown[], appState: any) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        onSaveStatus?.("saving");
        try {
          const { collaborators, ...cleanAppState } = appState;
          void collaborators;
          await saveTab(tabId, { elements, appState: cleanAppState });
          onSaveStatus?.("saved");
          setTimeout(() => onSaveStatus?.("idle"), SAVE_STATUS_DISPLAY_MS);
        } catch {
          onSaveStatus?.("error");
          setTimeout(() => onSaveStatus?.("idle"), ERROR_STATUS_DISPLAY_MS);
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [tabId, onSaveStatus]
  );

  return (
    <div className="h-full w-full">
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
    </div>
  );
}
