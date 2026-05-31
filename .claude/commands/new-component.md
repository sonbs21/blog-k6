Create a new React component for the travel blog. Component description: $ARGUMENTS

Read `.claude/agents/frontend.md` and `.claude/skills/nextjs-patterns.md` before writing.

## Steps

1. **Determine the category**
   - `components/ui/` — generic, reusable primitive (Button, Card, Badge, Input)
   - `components/blog/` — blog-specific (PostCard, PostGrid, TagList, AuthorBio)
   - `components/layout/` — structural (Header, Footer, Sidebar, Container)

2. **Create the component file** (`components/{category}/{Name}.tsx`):

```tsx
// Props interface at top — always named {ComponentName}Props
interface {Name}Props {
  // ...
}

// Server Component by default
// Add "use client" only if you need: useState, useEffect, event handlers, browser APIs
export function {Name}({ ... }: {Name}Props) {
  return (
    // Tailwind only — no inline styles
    // Handle: loading state, empty state, error state where applicable
  )
}
```

3. **Update barrel export** — add to `components/{category}/index.ts`:
```ts
export { {Name} } from './{Name}'
```

4. **Add types** to `types/index.ts` if new shared interfaces are needed

5. **Show a usage example** — 5-line snippet with realistic props

## Checklist

- [ ] No `any` types
- [ ] `next/image` for all images with `width`/`height` or `fill` + `sizes`
- [ ] `next/link` for all internal navigation
- [ ] Mobile-first Tailwind classes (`sm:`, `md:`, `lg:` breakpoints)
- [ ] `aria-label` on icon-only interactive elements
