"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveTab } from "@/app/actions";
import {
  AUTOSAVE_DEBOUNCE_MS,
  SAVE_STATUS_DISPLAY_MS,
  ERROR_STATUS_DISPLAY_MS,
} from "@/lib/constants";

const DEFAULT_MINDMAP = `# Project Roadmap
## Phase 1 — Research
### User interviews
### Competitor analysis
### Define requirements
## Phase 2 — Design
### Wireframes
### Prototypes
### Design review
## Phase 3 — Build
### Frontend
### Backend
### Testing
## Phase 4 — Launch
### Beta release
### Feedback & iterate
### Public launch`;

const MARKMAP_DOCS_URL = "https://markmap.js.org/docs/markmap";

interface MindmapTabProps {
  tabId: string;
  initialData: unknown;
  onSaveStatus?: (status: "idle" | "saving" | "saved" | "error") => void;
}

export default function MindmapTab({ tabId, initialData, onSaveStatus }: MindmapTabProps) {
  const [markdown, setMarkdown] = useState<string>((initialData as string) || DEFAULT_MINDMAP);
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<{ mm: unknown; transformer: unknown } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize markmap (client-only)
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { Transformer } = await import("markmap-lib");
      const { Markmap } = await import("markmap-view");
      if (cancelled || !svgRef.current) return;

      const transformer = new Transformer();
      const { root } = transformer.transform(markdown);
      const mm = Markmap.create(svgRef.current, undefined, root);
      markmapRef.current = { mm, transformer };
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markmap on markdown change (debounced 300ms)
  useEffect(() => {
    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    renderTimerRef.current = setTimeout(() => {
      if (!markmapRef.current || !svgRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformer = markmapRef.current.transformer as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mm = markmapRef.current.mm as any;
      const { root } = transformer.transform(markdown);
      mm.setData(root);
      mm.fit();
    }, 300);
  }, [markdown]);

  const handleChange = useCallback(
    (value: string) => {
      setMarkdown(value);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        onSaveStatus?.("saving");
        try {
          await saveTab(tabId, value);
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
    <div className="flex h-full w-full">
      {/* Left: Markdown editor */}
      <div className="flex h-full w-1/3 min-w-[250px] flex-col border-r border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
          <span className="text-xs font-medium text-zinc-500">Markdown</span>
          <a
            href={MARKMAP_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
            title="Markmap syntax guide"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Syntax guide
          </a>
        </div>
        <textarea
          value={markdown}
          onChange={(e) => handleChange(e.target.value)}
          className="h-full flex-1 resize-none p-4 font-mono text-sm leading-relaxed text-zinc-800 outline-none"
          placeholder={"# Main Topic\n## Branch 1\n### Sub-item\n## Branch 2"}
          spellCheck={false}
        />
      </div>

      {/* Right: Rendered mindmap */}
      <div className="flex-1 bg-zinc-50">
        <svg ref={svgRef} className="h-full w-full" />
      </div>
    </div>
  );
}
