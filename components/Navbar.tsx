import Link from "next/link";
import { leaveWorkspace } from "@/app/actions";
import { Settings } from "@/components/icons";

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
          <Settings size={18} />
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
