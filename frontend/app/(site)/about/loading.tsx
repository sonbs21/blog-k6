export default function AboutLoading() {
  return (
    <div className="site-container py-12 sm:py-16 animate-pulse">
      <div className="prose-container space-y-4">
        <div className="h-9 w-32 rounded bg-muted mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-muted" style={{ width: `${85 + Math.random() * 10}%` }} />
        ))}
      </div>
    </div>
  )
}
