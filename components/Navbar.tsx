import Link from "next/link";
import { leaveWorkspace } from "@/app/actions";

interface NavbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Navbar({ breadcrumbs }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-lg font-bold">
          Sketchbase
        </Link>
        {breadcrumbs?.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-zinc-400">/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="text-zinc-600 hover:text-zinc-900">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          title="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
        <form action={leaveWorkspace}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100"
          >
            Exit Workspace
          </button>
        </form>
      </div>
    </nav>
  );
}
