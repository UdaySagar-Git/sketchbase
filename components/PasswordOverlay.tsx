"use client";

import { useState, useTransition } from "react";
import { verifyBoardPassword } from "@/app/actions";

interface PasswordOverlayProps {
  boardId: string;
  onUnlock: () => void;
}

export default function PasswordOverlay({ boardId, onUnlock }: PasswordOverlayProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await verifyBoardPassword(boardId, password);
      if (result.success) {
        sessionStorage.setItem(`board-unlocked-${boardId}`, "true");
        onUnlock();
      } else {
        setError(result.error || "Incorrect password");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-lg"
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
          className="rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-zinc-500 focus:outline-none"
        />

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {isPending ? "Checking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
