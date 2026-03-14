"use client";

import { useActionState } from "react";
import { enterWorkspace } from "./actions";

export default function Home() {
  const [state, formAction, isPending] = useActionState(enterWorkspace, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Sketchbase</h1>
        <p className="mt-3 text-zinc-500">Your visual workspace. Draw, plan, collaborate.</p>
      </div>

      <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="text"
          name="key"
          placeholder="Enter your workspace key"
          required
          autoFocus
          className="rounded-xl border border-zinc-200 px-4 py-3 text-center text-lg transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (optional)"
          className="rounded-xl border border-zinc-200 px-4 py-3 text-center transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none"
        />

        {state?.error && <p className="text-center text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Opening..." : "Open My Workspace"}
        </button>
      </form>

      <p className="max-w-xs text-center text-sm text-zinc-400">
        Your key is your identity. Same key = same workspace. Add a password to protect it, or leave
        blank for open access.
      </p>
    </div>
  );
}
