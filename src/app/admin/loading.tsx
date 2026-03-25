export default function AdminLoading() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/50" />
      ))}
    </div>
  );
}
