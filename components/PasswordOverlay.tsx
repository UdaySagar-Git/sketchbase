"use client";

import { useState, useTransition } from "react";
import { unlockBoard } from "@/app/actions";

interface PasswordOverlayProps {
  boardId: string;
  onUnlock: (content: Record<string, unknown> | null) => void;
}

export default function PasswordOverlay({ boardId, onUnlock }: PasswordOverlayProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await unlockBoard(boardId, password);
      if (result.success) {
        onUnlock(result.content ?? null);
      } else {
        setError(result.error || "Incorrect password");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-black/5 sm:p-8"
      >
        <div className="text-center">
          <div className="text-3xl">🔒</div>
          <h2 className="mt-2 text-lg font-semibold">This board is protected</h2>
          <p className="text-sm text-zinc-500">Enter the password to view this board</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Board password"
          required
          autoFocus
          className="rounded-xl border border-zinc-200 px-4 py-3 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
        />

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-zinc-900 py-3 font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Checking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
