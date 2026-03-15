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
import { islandStyle } from "@/lib/styles";
import { confirmDeleteBoard, confirmDeleteProject } from "@/lib/messages";
import { Grid, ChevronRight, Plus, TrashSimple, Lock, File, X, Home } from "@/components/icons";

type NavProject = {
  id: string;
  name: string;
  emoji: string | null;
  boards: { id: string; name: string; isLocked: boolean }[];
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!confirm(confirmDeleteProject(name))) return;
    startTransition(async () => {
      await deleteProject(id);
      loadNav();
    });
  }

  function handleDeleteBoard(id: string, name: string) {
    if (!confirm(confirmDeleteBoard(name))) return;
    startTransition(async () => {
      await deleteBoard(id);
      loadNav();
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-md transition-colors hover:bg-black/5"
        style={{ width: 24, height: 24 }}
        title="Navigator"
      >
        <Grid size={15} className={open ? "text-zinc-900" : "text-zinc-500"} />
      </button>

      {/* Dropdown panel — full-width on mobile, fixed-width on desktop */}
      {open && (
        <div
          ref={panelRef}
          className="fixed inset-x-2 bottom-[110px] z-50 flex max-h-[60vh] flex-col overflow-hidden rounded-2xl md:absolute md:inset-x-auto md:bottom-auto md:max-h-[calc(100vh-80px)] md:rounded-xl"
          style={{
            ...islandStyle,
            ...(typeof window !== "undefined" && window.innerWidth >= 768
              ? { top: 48, left: 0, width: 280 }
              : {}),
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              Navigator
            </span>
            <div className="flex items-center gap-2">
              {isPending && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />}
              <button
                onClick={() => {
                  setOpen(false);
                  onToggle?.(false);
                }}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 sm:hidden"
              >
                <X size={14} />
              </button>
            </div>
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
                      <div
                        className="skeleton h-3.5 flex-1 rounded"
                        style={{ maxWidth: 120 + i * 20 }}
                      />
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
                <div className="group flex items-center gap-1.5 rounded-lg px-2 py-2 hover:bg-zinc-50 sm:py-1.5">
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [project.id]: !prev[project.id] }))
                    }
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: 16, height: 16 }}
                  >
                    <ChevronRight
                      size={10}
                      className={`text-zinc-400 transition-transform duration-150 ${expanded[project.id] ? "rotate-90" : ""}`}
                    />
                  </button>
                  <span className="shrink-0 text-sm">{project.emoji || "📁"}</span>
                  <Link
                    href={`/project/${project.id}`}
                    onClick={() => {
                      setOpen(false);
                      onToggle?.(false);
                    }}
                    className="flex-1 truncate font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    {project.name}
                  </Link>
                  <div className="flex items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setAdding(project.id);
                        setInputValue("");
                        setExpanded((prev) => ({ ...prev, [project.id]: true }));
                      }}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 sm:p-1"
                      title="Add board"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 sm:p-1"
                      title="Delete project"
                    >
                      <TrashSimple size={12} />
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
                          className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 sm:py-1 ${isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"}`}
                        >
                          <Link
                            href={`/board/${board.id}`}
                            onClick={() => {
                              setOpen(false);
                              onToggle?.(false);
                            }}
                            className="flex flex-1 items-center gap-1.5 truncate"
                          >
                            {board.isLocked ? (
                              <Lock size={11} className="shrink-0 opacity-50" />
                            ) : (
                              <File size={11} className="shrink-0 opacity-30" />
                            )}
                            <span className="truncate">{board.name}</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteBoard(board.id, board.name)}
                            className="shrink-0 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                            title="Delete board"
                          >
                            <X size={11} />
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
                            if (e.key === "Escape") {
                              setAdding(null);
                              setInputValue("");
                            }
                          }}
                          placeholder="Board name..."
                          autoFocus
                          className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:ring-1 focus:ring-zinc-300 focus:outline-none sm:py-1"
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
                    if (e.key === "Escape") {
                      setAdding(null);
                      setInputValue("");
                    }
                  }}
                  placeholder="Project name..."
                  autoFocus
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:ring-1 focus:ring-zinc-300 focus:outline-none sm:py-1"
                />
              </div>
            ) : (
              <button
                onClick={() => {
                  setAdding("__project__");
                  setInputValue("");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 sm:py-1.5"
              >
                <Plus size={12} />
                <span className="text-xs">New Project</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 px-3 py-2.5 sm:py-2">
            <Link
              href="/dashboard"
              onClick={() => {
                setOpen(false);
                onToggle?.(false);
              }}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              <Home size={12} />
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
