export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="skeleton h-7 w-36" />
      <div className="skeleton h-4 w-56" />
      <div className="flex w-full max-w-sm flex-col gap-3">
        <div className="skeleton h-9 w-full" />
        <div className="skeleton h-9 w-full" />
        <div className="skeleton h-9 w-full" />
      </div>
    </div>
  );
}
