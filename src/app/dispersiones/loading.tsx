export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
    </div>
  );
}
