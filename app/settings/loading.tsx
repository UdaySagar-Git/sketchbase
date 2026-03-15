export default function SettingsLoading() {
  return (
    <div className="min-h-screen">
      {/* Navbar skeleton */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-3 rounded-full" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-md" />
          <div className="skeleton h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 py-10">
        <div className="skeleton h-5 w-36" />
        <div className="skeleton mt-2 h-4 w-64" />

        <div className="mt-8 space-y-8">
          {/* Info card skeleton */}
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="skeleton h-4 w-24" />
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          </div>

          {/* Password card skeleton */}
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="skeleton h-4 w-36" />
            <div className="skeleton mt-2 h-3 w-full" />
            <div className="mt-4 space-y-3">
              <div className="skeleton h-9 w-full" />
              <div className="skeleton h-9 w-full" />
              <div className="skeleton h-8 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
