export default function ProjectLoading() {
  return (
    <div className="min-h-screen">
      {/* Navbar skeleton */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-28" />
          <div className="skeleton h-4 w-4 rounded-full" />
          <div className="skeleton h-5 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-md" />
          <div className="skeleton h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="skeleton h-8 w-48" />

        {/* Form skeleton */}
        <div className="mt-6 flex gap-3">
          <div className="skeleton h-10 flex-1" />
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-10 w-28" />
        </div>

        {/* Grid skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex items-center gap-2">
                <div className="skeleton h-5 w-28" />
                <div className="skeleton h-4 w-4 rounded-full" />
              </div>
              <div className="skeleton mt-2 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
