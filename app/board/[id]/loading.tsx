export default function BoardLoading() {
  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header skeleton */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="skeleton h-7 w-7 rounded-lg" />
          <div className="hidden h-5 w-px bg-zinc-200 sm:block" />
          <div className="skeleton hidden h-3.5 w-3.5 rounded-full sm:block" />
          <div className="skeleton hidden h-3 w-1 sm:block" />
          <div className="skeleton hidden h-3 w-20 sm:block" />
          <div className="skeleton hidden h-3 w-1 sm:block" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-6 rounded-lg" />
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar skeleton (desktop only) */}
        <div className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-3 md:block">
          <div className="mb-3 flex items-center justify-between">
            <div className="skeleton h-3 w-12 rounded" />
            <div className="skeleton h-5 w-5 rounded" />
          </div>
          <div className="space-y-1">
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
          </div>
        </div>

        {/* Content area */}
        <div className="flex min-w-0 flex-1 items-center justify-center bg-zinc-50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
            <span className="text-sm text-zinc-400">Loading board...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
