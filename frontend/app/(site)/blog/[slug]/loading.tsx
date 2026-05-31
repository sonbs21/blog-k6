export default function PostLoading() {
  return (
    <div className="site-container py-10 sm:py-14 animate-pulse">
      <div className="h-4 w-20 rounded bg-muted mb-10" />
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-16">
        <div>
          <div className="aspect-[2/1] rounded-xl bg-muted mb-8" />
          <div className="flex gap-2 mb-5">
            <div className="h-5 w-14 rounded-full bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
          </div>
          <div className="h-9 w-4/5 rounded bg-muted mb-3" />
          <div className="h-7 w-3/5 rounded bg-muted mb-8" />
          <div className="flex gap-4 mb-10 pb-8 border-b border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-20 rounded bg-muted" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`h-4 rounded bg-muted ${i % 4 === 3 ? 'w-3/4' : 'w-full'}`} />
            ))}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted" style={{ width: `${60 + i * 8}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
