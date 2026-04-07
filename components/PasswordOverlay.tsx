"use client";

import { useState, useTransition } from "react";
import { unlockBoard, unlockWorkspaceForBoard } from "@/app/actions";

interface PasswordOverlayProps {
  boardId: string;
  type?: "board" | "workspace";
  onUnlock: (content: Record<string, unknown> | null) => void;
}

export default function PasswordOverlay({
  boardId,
  type = "board",
  onUnlock,
}: PasswordOverlayProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isWorkspace = type === "workspace";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      if (isWorkspace) {
        const result = await unlockWorkspaceForBoard(boardId, password);
        if (result.success) {
          onUnlock(null);
        } else {
          setError(result.error || "Incorrect password");
        }
      } else {
        const result = await unlockBoard(boardId, password);
        if (result.success) {
          onUnlock(result.content ?? null);
        } else {
          setError(result.error || "Incorrect password");
        }
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8"
      >
        <div className="text-center">
          <div className="text-3xl">{isWorkspace ? "🔐" : "🔒"}</div>
          <h2 className="mt-2 text-base font-medium">
            {isWorkspace ? "This workspace is protected" : "This board is protected"}
          </h2>
          <p className="text-sm text-zinc-500">
            {isWorkspace
              ? "Enter the workspace password to access this board"
              : "Enter the password to view this board"}
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isWorkspace ? "Workspace password" : "Board password"}
          required
          autoFocus
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors focus:ring-1 focus:ring-zinc-300 focus:outline-none"
        />

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {isPending ? "Checking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
