export default function BoardLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50">
      {/* Breadcrumb island skeleton — matches top:20, left:100 */}
      <div
        className="absolute rounded-xl px-2.5 py-1.5"
        style={{
          top: 20,
          left: 100,
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          border: "1px solid #e4e4e7",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="skeleton h-5 w-5 rounded-md" />
          <div className="h-4 w-px bg-zinc-200" />
          <div className="skeleton h-3.5 w-3.5 rounded-full" />
          <div className="skeleton h-3 w-1" />
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-1" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>

      {/* Save status skeleton — matches bottom:15, right:60 */}
      <div
        className="absolute rounded-lg px-3 py-1.5"
        style={{
          bottom: 15,
          right: 60,
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          border: "1px solid #e4e4e7",
        }}
      >
        <div className="skeleton h-3 w-24" />
      </div>

      {/* Center loading */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
        <span className="text-sm text-zinc-400">Loading board...</span>
      </div>
    </div>
  );
}
