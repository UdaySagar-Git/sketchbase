"use client";

import Link from "next/link";
import { deleteProject } from "@/app/actions";

interface ProjectCardProps {
  id: string;
  name: string;
  emoji: string | null;
  boardCount: number;
}

export default function ProjectCard({ id, name, emoji, boardCount }: ProjectCardProps) {
  return (
    <div className="group relative rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400">
      <Link href={`/project/${id}`} className="block">
        <div className="text-3xl">{emoji || "📁"}</div>
        <h3 className="mt-3 font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {boardCount} {boardCount === 1 ? "board" : "boards"}
        </p>
      </Link>
      <button
        onClick={() => {
          if (confirm(`Delete "${name}" and all its boards?`)) {
            deleteProject(id);
          }
        }}
        className="absolute top-3 right-3 hidden rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 group-hover:block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
