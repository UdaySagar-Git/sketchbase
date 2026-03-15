"use client";

import Link from "next/link";
import { deleteBoard } from "@/app/actions";
import { confirmDeleteBoard } from "@/lib/messages";
import { Lock, Trash } from "@/components/icons";

interface BoardCardProps {
  id: string;
  name: string;
  isLocked: boolean;
  updatedAt: string;
}

export default function BoardCard({ id, name, isLocked, updatedAt }: BoardCardProps) {
  return (
    <div className="group relative rounded-xl border border-zinc-200 p-4 transition-colors duration-150 hover:bg-zinc-50 sm:p-5">
      <Link href={`/board/${id}`} className="block">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{name}</h3>
          {isLocked && <Lock size={14} className="text-zinc-400" />}
        </div>
        <p className="mt-1 text-xs text-zinc-400">{updatedAt}</p>
      </Link>
      <button
        onClick={() => {
          if (confirm(confirmDeleteBoard(name))) {
            deleteBoard(id);
          }
        }}
        className="absolute top-3 right-3 rounded-lg p-1.5 text-zinc-400 opacity-0 transition-colors duration-150 group-hover:opacity-100 hover:bg-zinc-100 hover:text-red-500"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
