import Link from "next/link";
import { leaveWorkspace } from "@/app/actions";
import { Settings } from "@/components/icons";

interface NavbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Navbar({ breadcrumbs }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-1.5 text-xs sm:gap-2">
        <Link href="/dashboard" className="shrink-0 text-sm font-medium">
          Sketchbase
        </Link>
        {breadcrumbs?.map((crumb, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span className="shrink-0 text-zinc-400">/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="truncate text-zinc-600 hover:text-zinc-900">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate text-zinc-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/settings"
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
          title="Settings"
        >
          <Settings size={18} />
        </Link>
        <form action={leaveWorkspace}>
          <button
            type="submit"
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            <span className="hidden sm:inline">Exit Workspace</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
