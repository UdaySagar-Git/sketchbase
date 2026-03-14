"use client";

import { useActionState, useTransition } from "react";
import { updateWorkspacePassword, deleteWorkspace } from "@/app/actions";
import { formatDate } from "@/lib/date";
import { MSG_CONFIRM_DELETE_WORKSPACE } from "@/lib/messages";

interface SettingsClientProps {
  hasPassword: boolean;
  createdAt: string;
}

export default function SettingsClient({ hasPassword, createdAt }: SettingsClientProps) {
  const [state, formAction, isPending] = useActionState(updateWorkspacePassword, null);
  const [isDeleting, startDelete] = useTransition();

  return (
    <div className="mt-8 space-y-6 sm:space-y-8">
      {/* Workspace info */}
      <div className="rounded-xl border border-zinc-200 p-4 sm:p-5">
        <h2 className="font-semibold">Workspace Info</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Created</span>
            <span suppressHydrationWarning>{formatDate(createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Password protection</span>
            <span className={hasPassword ? "text-green-600" : "text-zinc-400"}>
              {hasPassword ? "Enabled" : "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Password section */}
      <div className="rounded-xl border border-zinc-200 p-4 sm:p-5">
        <h2 className="font-semibold">
          {hasPassword ? "Change or Remove Password" : "Set a Password"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {hasPassword
            ? "Update your password or remove it to make the workspace open access."
            : "Add a password so only people who know it can access this workspace."}
        </p>

        <form action={formAction} className="mt-4 space-y-3">
          {hasPassword && (
            <div>
              <label className="block text-sm font-medium text-zinc-700">Current password</label>
              <input
                type="password"
                name="currentPassword"
                required={hasPassword}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none sm:py-2"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              New password
              <span className="ml-1 font-normal text-zinc-400">
                {hasPassword ? "(leave blank to remove)" : "(optional)"}
              </span>
            </label>
            <input
              type="password"
              name="newPassword"
              className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none sm:py-2"
            />
          </div>

          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-600">{state.success}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50 sm:py-2"
          >
            {isPending ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 p-4 sm:p-5">
        <h2 className="font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Permanently delete this workspace and all its projects, boards, and data. This cannot be
          undone.
        </p>
        <button
          onClick={() => {
            if (confirm(MSG_CONFIRM_DELETE_WORKSPACE)) {
              startDelete(() => deleteWorkspace());
            }
          }}
          disabled={isDeleting}
          className="mt-4 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 sm:py-2"
        >
          {isDeleting ? "Deleting..." : "Delete Workspace"}
        </button>
      </div>
    </div>
  );
}
