"use client";

import { useCallback, useRef } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { saveTab } from "@/app/actions";
import {
  AUTOSAVE_DEBOUNCE_MS,
  SAVE_STATUS_DISPLAY_MS,
  ERROR_STATUS_DISPLAY_MS,
} from "@/lib/constants";

interface TldrawTabProps {
  tabId: string;
  initialData: unknown;
  onSaveStatus?: (status: "idle" | "saving" | "saved" | "error") => void;
}

export default function TldrawTab({ tabId, initialData, onSaveStatus }: TldrawTabProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMount = useCallback(
    (editor: Editor) => {
      // Load initial snapshot if available
      if (initialData) {
        try {
          editor.loadSnapshot(initialData as Parameters<typeof editor.loadSnapshot>[0]);
        } catch {
          // ignore invalid snapshot
        }
      }

      // Listen for changes and debounce save
      editor.store.listen(
        () => {
          if (timerRef.current) clearTimeout(timerRef.current);

          timerRef.current = setTimeout(async () => {
            onSaveStatus?.("saving");
            try {
              const snapshot = editor.getSnapshot();
              await saveTab(tabId, snapshot);
              onSaveStatus?.("saved");
              setTimeout(() => onSaveStatus?.("idle"), SAVE_STATUS_DISPLAY_MS);
            } catch {
              onSaveStatus?.("error");
              setTimeout(() => onSaveStatus?.("idle"), ERROR_STATUS_DISPLAY_MS);
            }
          }, AUTOSAVE_DEBOUNCE_MS);
        },
        { scope: "document", source: "user" }
      );
    },
    [tabId, initialData, onSaveStatus]
  );

  return (
    <div className="h-full w-full">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
