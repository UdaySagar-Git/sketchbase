"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getWorkspaceNav,
  createProject,
  createBoard,
  deleteProject,
  deleteBoard,
} from "@/app/actions";

type NavProject = {
  id: string;
  name: string;
  emoji: string | null;
  boards: { id: string; name: string; isLocked: boolean }[];
};

const islandStyle: React.CSSProperties = {
  fontFamily: "var(--ui-font, system-ui, sans-serif)",
  background: "rgba(255,255,255,0.97)",
  color: "#1b1b1f",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  border: "1px solid #e4e4e7",
};

export default function BoardSidebar({ onToggle }: { onToggle?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<NavProject[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boardMatch = pathname.match(/^\/board\/(.+)/);
    if (boardMatch) {
      const boardId = boardMatch[1];
      const proj = projects.find((p) => p.boards.some((b) => b.id === boardId));
      if (proj) setExpanded((prev) => ({ ...prev, [proj.id]: true }));
    }
    const projMatch = pathname.match(/^\/project\/(.+)/);
    if (projMatch) {
      setExpanded((prev) => ({ ...prev, [projMatch[1]]: true }));
    }
  }, [pathname, projects]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        onToggle?.(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onToggle]);

  function loadNav() {
    startTransition(async () => {
      const data = await getWorkspaceNav();
      if (data) setProjects(data);
    });
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
    if (next) loadNav();
  }

  function handleAddProject() {
    if (!inputValue.trim()) return;
    const fd = new FormData();
    fd.set("name", inputValue.trim());
    startTransition(async () => {
      await createProject(fd);
      setInputValue("");
      setAdding(null);
      loadNav();
    });
  }

  function handleAddBoard(projectId: string) {
    if (!inputValue.trim()) return;
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("name", inputValue.trim());
    startTransition(async () => {
      await createBoard(fd);
      setInputValue("");
      setAdding(null);
      loadNav();
    });
  }

  function handleDeleteProject(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its boards?`)) return;
    startTransition(async () => {
      await deleteProject(id);
      loadNav();
    });
  }

  function handleDeleteBoard(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      await deleteBoard(id);
      loadNav();
    });
  }

  return (
    <>
      {/* Trigger button — rendered inline where placed */}
      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-md transition-colors hover:bg-black/5"
        style={{ width: 24, height: 24 }}
        title="Navigator"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={open ? "#6965db" : "#71717a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute z-50 flex flex-col overflow-hidden rounded-xl"
          style={{
            ...islandStyle,
            top: 48,
            left: 0,
            width: 280,
            maxHeight: "calc(100vh - 80px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              Navigator
            </span>
            {isPending && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            )}
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto px-1.5 py-2" style={{ fontSize: 13 }}>
            {/* Shimmer loading state */}
            {isPending && projects.length === 0 && (
              <div className="space-y-2 px-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2 py-1">
                      <div className="skeleton h-3 w-3 rounded" />
                      <div className="skeleton h-4 w-4 rounded" />
                      <div className="skeleton h-3.5 flex-1 rounded" style={{ maxWidth: 120 + i * 20 }} />
                    </div>
                    {i === 0 && (
                      <div className="ml-6 space-y-1 border-l border-zinc-100 pl-2">
                        <div className="flex items-center gap-1.5 py-0.5">
                          <div className="skeleton h-3 w-3 rounded" />
                          <div className="skeleton h-3 w-24 rounded" />
                        </div>
                        <div className="flex items-center gap-1.5 py-0.5">
                          <div className="skeleton h-3 w-3 rounded" />
                          <div className="skeleton h-3 w-20 rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {projects.map((project) => (
              <div key={project.id} className="mb-0.5">
                {/* Project row */}
                <div className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-zinc-50">
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [project.id]: !prev[project.id] }))
                    }
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: 16, height: 16 }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#a1a1aa"
                      strokeWidth="2.5"
                      className={`transition-transform duration-150 ${expanded[project.id] ? "rotate-90" : ""}`}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  <span className="shrink-0 text-sm">{project.emoji || "📁"}</span>
                  <Link
                    href={`/project/${project.id}`}
                    onClick={() => { setOpen(false); onToggle?.(false); }}
                    className="flex-1 truncate font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    {project.name}
                  </Link>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setAdding(project.id);
                        setInputValue("");
                        setExpanded((prev) => ({ ...prev, [project.id]: true }));
                      }}
                      className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      title="Add board"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete project"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Boards */}
                {expanded[project.id] && (
                  <div className="ml-4 border-l border-zinc-100 pl-2">
                    {project.boards.map((board) => {
                      const isActive = pathname === `/board/${board.id}`;
                      return (
                        <div
                          key={board.id}
                          className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 ${isActive ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"}`}
                        >
                          <Link
                            href={`/board/${board.id}`}
                            onClick={() => { setOpen(false); onToggle?.(false); }}
                            className="flex flex-1 items-center gap-1.5 truncate"
                          >
                            {board.isLocked ? (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-50">
                                <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            ) : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-30">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            )}
                            <span className="truncate">{board.name}</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteBoard(board.id, board.name)}
                            className="shrink-0 rounded-md p-0.5 text-zinc-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                            title="Delete board"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}

                    {adding === project.id && (
                      <div className="flex items-center gap-1 px-2 py-1">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddBoard(project.id);
                            if (e.key === "Escape") { setAdding(null); setInputValue(""); }
                          }}
                          placeholder="Board name..."
                          autoFocus
                          className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-violet-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {project.boards.length === 0 && adding !== project.id && (
                      <p className="px-2 py-1 text-xs text-zinc-300">No boards yet</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {projects.length === 0 && !isPending && (
              <p className="px-2 py-3 text-center text-xs text-zinc-400">No projects yet</p>
            )}

            {/* Add project */}
            {adding === "__project__" ? (
              <div className="flex items-center gap-1 px-2 py-1.5">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddProject();
                    if (e.key === "Escape") { setAdding(null); setInputValue(""); }
                  }}
                  placeholder="Project name..."
                  autoFocus
                  className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-violet-400 focus:outline-none"
                />
              </div>
            ) : (
              <button
                onClick={() => { setAdding("__project__"); setInputValue(""); }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-xs">New Project</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 px-3 py-2">
            <Link
              href="/dashboard"
              onClick={() => { setOpen(false); onToggle?.(false); }}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
