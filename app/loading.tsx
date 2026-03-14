export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="skeleton h-10 w-48" />
      <div className="skeleton h-5 w-64" />
      <div className="flex w-full max-w-sm flex-col gap-3">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}
