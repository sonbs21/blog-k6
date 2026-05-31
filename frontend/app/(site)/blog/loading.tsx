export default function BlogLoading() {
  return (
    <div className="site-container py-12 sm:py-16 animate-pulse">
      <div className="mb-10">
        <div className="h-8 w-20 rounded-md bg-muted mb-2" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
      <div className="flex gap-2 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-16 rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[16/9] rounded-lg bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
