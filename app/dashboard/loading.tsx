export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      {/* Navbar skeleton */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
        <div className="skeleton h-4 w-24" />
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-md" />
          <div className="skeleton h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="skeleton h-5 w-28" />

        {/* Form skeleton */}
        <div className="mt-6 flex gap-3">
          <div className="skeleton h-9 w-14" />
          <div className="skeleton h-9 flex-1" />
          <div className="skeleton h-9 w-28" />
        </div>

        {/* Grid skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-5">
              <div className="skeleton h-8 w-8 rounded-md" />
              <div className="skeleton mt-3 h-4 w-24" />
              <div className="skeleton mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
