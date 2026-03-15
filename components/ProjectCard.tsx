"use client";

import Link from "next/link";
import { deleteProject } from "@/app/actions";
import { confirmDeleteProject } from "@/lib/messages";
import { Trash } from "@/components/icons";

interface ProjectCardProps {
  id: string;
  name: string;
  emoji: string | null;
  boardCount: number;
}

export default function ProjectCard({ id, name, emoji, boardCount }: ProjectCardProps) {
  return (
    <div className="group relative rounded-xl border border-zinc-200 p-5 transition-colors duration-150 hover:bg-zinc-50 sm:p-6">
      <Link href={`/project/${id}`} className="block">
        <div className="text-3xl">{emoji || "📁"}</div>
        <h3 className="mt-3 text-sm font-medium">{name}</h3>
        <p className="mt-1 text-xs text-zinc-400">
          {boardCount} {boardCount === 1 ? "board" : "boards"}
        </p>
      </Link>
      <button
        onClick={() => {
          if (confirm(confirmDeleteProject(name))) {
            deleteProject(id);
          }
        }}
        className="absolute top-3 right-3 rounded-lg p-1.5 text-zinc-400 opacity-0 transition-colors duration-150 group-hover:opacity-100 hover:bg-zinc-100 hover:text-red-500"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
