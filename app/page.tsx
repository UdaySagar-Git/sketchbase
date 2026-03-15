"use client";

import { useActionState } from "react";
import { enterWorkspace } from "./actions";

export default function Home() {
  const [state, formAction, isPending] = useActionState(enterWorkspace, null);

  return (
    <div className="dot-grid relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs text-zinc-500 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Free &amp; open — no account needed
        </div>

        <h1 className="text-2xl font-medium tracking-tight">Sketchbase</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your visual workspace. Draw, plan, collaborate.
        </p>

        <form action={formAction} className="mt-8 flex w-full flex-col gap-3">
          <input
            type="text"
            name="key"
            placeholder="Enter your workspace key"
            required
            autoFocus
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm transition-colors focus:ring-1 focus:ring-zinc-300 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (optional)"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm transition-colors focus:ring-1 focus:ring-zinc-300 focus:outline-none"
          />

          {state?.error && <p className="text-center text-sm text-red-500">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {isPending ? "Opening..." : "Open My Workspace"}
          </button>
        </form>

        <p className="mt-5 max-w-xs text-center text-xs text-zinc-400">
          Your key is your identity. Same key = same workspace. Add a password to protect it, or
          leave blank for open access.
        </p>
      </div>
    </div>
  );
}
