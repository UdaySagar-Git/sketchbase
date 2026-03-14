"use client";

import Link from "next/link";
import { deleteBoard } from "@/app/actions";

interface BoardCardProps {
  id: string;
  name: string;
  isLocked: boolean;
  updatedAt: string;
}

export default function BoardCard({ id, name, isLocked, updatedAt }: BoardCardProps) {
  return (
    <div className="group relative rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400">
      <Link href={`/board/${id}`} className="block">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{name}</h3>
          {isLocked && (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500">{updatedAt}</p>
      </Link>
      <button
        onClick={() => {
          if (confirm(`Delete "${name}"?`)) {
            deleteBoard(id);
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
