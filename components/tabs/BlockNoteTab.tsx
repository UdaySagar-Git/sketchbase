"use client";

import { useCallback, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { saveTab } from "@/app/actions";
import {
  AUTOSAVE_DEBOUNCE_MS,
  SAVE_STATUS_DISPLAY_MS,
  ERROR_STATUS_DISPLAY_MS,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_CONTENT: any[] = [
  { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Untitled" }] },
  { type: "paragraph", content: [{ type: "text", text: "Start writing here..." }] },
];

interface BlockNoteTabProps {
  tabId: string;
  initialData: unknown;
  onSaveStatus?: (status: "idle" | "saving" | "saved" | "error") => void;
}

export default function BlockNoteTab({ tabId, initialData, onSaveStatus }: BlockNoteTabProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useCreateBlockNote({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: initialData ? (initialData as any[]) : DEFAULT_CONTENT,
  });

  const handleChange = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      onSaveStatus?.("saving");
      try {
        await saveTab(tabId, editor.document);
        onSaveStatus?.("saved");
        setTimeout(() => onSaveStatus?.("idle"), SAVE_STATUS_DISPLAY_MS);
      } catch {
        onSaveStatus?.("error");
        setTimeout(() => onSaveStatus?.("idle"), ERROR_STATUS_DISPLAY_MS);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [tabId, editor, onSaveStatus]);

  return (
    <div className="blocknote-wrapper h-full w-full overflow-y-auto bg-white pt-16">
      <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
    </div>
  );
}
