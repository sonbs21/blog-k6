# Next.js 14 Patterns — Travel Blog

Conventions and patterns used throughout this codebase.
Apply these automatically — do not ask whether to follow them.

## App Router Mental Model

```
Server Component  →  async function, can await, runs on server, no hooks
Client Component  →  "use client" directive, can use hooks, runs in browser
```

**Decision rule**: Start as Server Component. Add `"use client"` only when you need:
- `useState`, `useReducer`, `useRef`
- `useEffect`, `useLayoutEffect`
- Browser-only APIs (`window`, `document`, `localStorage`)
- Event listeners or form interactivity

## Data Fetching

```tsx
// ✅ Server Component — fetch at build time
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)  // lib/posts.ts
  return <PostBody post={post} />
}

// ✅ Static paths — required for output: 'export'
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

// ✅ Metadata — colocated with page
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  return {
    title: post.title,
    description: post.description,
    openGraph: { images: [post.coverImage] }
  }
}
```

## Tailwind Conventions

```tsx
// ✅ Use cn() for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg border bg-white p-4',
  isActive && 'border-blue-500 shadow-md',
  className  // always accept className prop for composability
)} />

// ✅ Responsive: mobile-first
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" />

// ✅ Dark mode via class strategy
<p className="text-gray-900 dark:text-gray-100" />
```

## TypeScript Patterns

```ts
// types/index.ts — all shared types here

export interface PostMeta {
  slug: string
  title: string
  date: string          // ISO 8601 string (serializable for RSC)
  description: string
  tags: string[]
  location: string
  coverImage: string
  draft: boolean
}

export interface Post extends PostMeta {
  content: string       // compiled MDX string
  readingTime: number   // minutes
}

// Path alias — always use @/ not relative ../../
import { cn } from '@/lib/utils'        // ✅
import { cn } from '../../../lib/utils' // ✗
```

## MDX Component Overrides

Custom components passed to `MDXRemote` live in `lib/mdx-components.tsx`:

```tsx
export const mdxComponents = {
  img: (props) => <Image {...props} />,         // next/image
  a: (props) => <Link {...props} />,            // next/link for internal
  blockquote: (props) => <Callout {...props} />,
  // Add custom shortcodes: <Gallery />, <Map />, <TipBox />
}
```

## File Conventions Summary

| What | Where | Example |
|---|---|---|
| Pages | `app/(blog)/posts/[slug]/page.tsx` | Post detail |
| Shared layout | `app/(blog)/layout.tsx` | Blog chrome |
| API routes | `app/api/{name}/route.ts` | Search |
| UI primitives | `components/ui/` | Button, Badge |
| Blog components | `components/blog/` | PostCard |
| Content helpers | `lib/posts.ts` | getAllPosts |
| MDX processing | `lib/mdx.ts` | compilePost |
| Shared types | `types/index.ts` | Post, PostMeta |
| Static assets | `public/images/posts/{slug}/` | Post images |
