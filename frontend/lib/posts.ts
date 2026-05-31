import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { rehype } from 'rehype'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import type { PostListItem, PostDetail } from '@/types'

function isMarkdown(content: string): boolean {
  const trimmed = content.trimStart()
  // HTML starts with a tag; everything else is treated as Markdown
  return !trimmed.startsWith('<')
}

async function markdownToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
  return result.toString()
}

/** Process content string — handles both stored HTML and Markdown. */
export async function processContent(content: string): Promise<string> {
  if (isMarkdown(content)) return markdownToHtml(content)

  const result = await rehype()
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .process(content)
  return result.toString()
}

/** Extract headings for Table of Contents */
export function extractHeadings(html: string) {
  const matches = [...html.matchAll(/<h([2-4])[^>]*\sid="([^"]+)"[^>]*>(.*?)<\/h\1>/gi)]
  return matches.map(([, level, id, inner]) => ({
    id,
    level: Number(level),
    text: inner.replace(/<[^>]+>/g, '').trim(),
  }))
}

/* ── Mock data for preview when backend is offline ── */

const AUTHOR = {
  id: 'demo',
  username: 'traveler',
  display_name: 'Son Bui',
  avatar_url: null,
  bio: null,
}

export const MOCK_POSTS: PostListItem[] = [
  {
    id: '1',
    slug: 'tokyo-at-night',
    title: 'Tokyo After Dark: A Neon-Lit Journey Through Shinjuku',
    description:
      'The city transforms after 10pm. Streets that were orderly by day become rivers of light, sound, and endless possibility. This is Tokyo when it truly comes alive.',
    location: 'Tokyo, Japan',
    cover_image: null,
    tags: ['travel', 'Asia'],
    author: AUTHOR,
    view_count: 3412,
    favorite_count: 127,
    published_at: '2024-11-20T00:00:00Z',
    is_favorited: false,
  },
  {
    id: '2',
    slug: 'lisbon-trams',
    title: 'Riding the Yellow Trams of Lisbon',
    description:
      'Tram 28 is more than transport — it is a slow journey through the city\'s soul. Hills, cobblestones, fado drifting from open windows.',
    location: 'Lisbon, Portugal',
    cover_image: null,
    tags: ['travel', 'Europe'],
    author: AUTHOR,
    view_count: 2187,
    favorite_count: 94,
    published_at: '2024-10-05T00:00:00Z',
    is_favorited: false,
  },
  {
    id: '3',
    slug: 'build-blog-nextjs',
    title: 'Building a Production Blog with Next.js 14 and TypeScript',
    description:
      'App Router, Server Components, MDX, dark mode, Tailwind — everything I learned putting this site together.',
    location: null as unknown as string,
    cover_image: null,
    tags: ['code', 'tech'],
    author: AUTHOR,
    view_count: 5830,
    favorite_count: 211,
    published_at: '2024-09-12T00:00:00Z',
    is_favorited: false,
  },
  {
    id: '4',
    slug: 'hoi-an-lanterns',
    title: 'Hội An by Lantern Light',
    description:
      'Every full moon the lanterns come out and the old town becomes a dream. Candlelight on the Thu Bồn River, children floating paper boats, the smell of cao lầu from every corner.',
    location: 'Hội An, Vietnam',
    cover_image: null,
    tags: ['travel', 'Asia'],
    author: AUTHOR,
    view_count: 1923,
    favorite_count: 88,
    published_at: '2024-08-28T00:00:00Z',
    is_favorited: false,
  },
  {
    id: '5',
    slug: 'remote-work-setup',
    title: 'My Nomad Tech Stack: 2 Years of Working from Everywhere',
    description:
      'The gear, the apps, and the mental frameworks that let me work effectively from cafés in Saigon, beaches in Bali, and co-working spaces across Europe.',
    location: null as unknown as string,
    cover_image: null,
    tags: ['tech', 'life'],
    author: AUTHOR,
    view_count: 4102,
    favorite_count: 178,
    published_at: '2024-07-15T00:00:00Z',
    is_favorited: false,
  },
  {
    id: '6',
    slug: 'amalfi-coast-drive',
    title: 'The Amalfi Coast Road: Beautiful and Terrifying',
    description:
      'Two lanes. No guardrails. A sheer cliff on one side, the Tyrrhenian Sea 200 meters below on the other. The most scenic drive I have ever been afraid to enjoy.',
    location: 'Amalfi, Italy',
    cover_image: null,
    tags: ['travel', 'Europe'],
    author: AUTHOR,
    view_count: 2756,
    favorite_count: 103,
    published_at: '2024-06-03T00:00:00Z',
    is_favorited: false,
  },
]

export const MOCK_POST_DETAIL: PostDetail = {
  ...MOCK_POSTS[2],
  content: `
<h2>Why another blog post about Next.js?</h2>
<p>Because I actually built one and ran into every problem the tutorials don't mention.</p>
<p>This post covers the real decisions: route groups vs layouts, when to reach for <code>use client</code>, how to handle dark mode without flash, and why I switched from MDX files to a database-backed approach.</p>

<h2>Project structure</h2>
<p>The App Router is powerful but opinionated. Route groups let you share layouts without affecting URLs:</p>
<pre><code class="language-bash">app/
├── (site)/         # Navbar + Footer
│   ├── page.tsx    # /
│   ├── blog/
│   └── about/
└── (auth)/         # No navbar, full-screen
    ├── login/
    └── register/</code></pre>

<h2>Dark mode without flash</h2>
<p>The trick is <code>suppressHydrationWarning</code> on <code>&lt;html&gt;</code> and <code>next-themes</code> with <code>attribute="class"</code>:</p>
<pre><code class="language-tsx">export default function RootLayout({ children }) {
  return (
    &lt;html suppressHydrationWarning className={GeistSans.variable}&gt;
      &lt;body&gt;
        &lt;ThemeProvider&gt;{children}&lt;/ThemeProvider&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  )
}</code></pre>

<h3>Why suppressHydrationWarning?</h3>
<p>Next.js renders HTML on the server without knowing the user's theme preference. When <code>next-themes</code> applies the <code>dark</code> class on the client, React sees a mismatch. <code>suppressHydrationWarning</code> tells React to accept the client-side value silently.</p>

<h2>CSS variables for theming</h2>
<p>Instead of hardcoding colors, define tokens in <code>globals.css</code>:</p>
<pre><code class="language-css">:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --accent: 239 84% 67%; /* indigo-500 */
}
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
}</code></pre>
<p>Then map them in <code>tailwind.config.ts</code> so you can use <code>bg-background</code>, <code>text-foreground</code>, etc. This is exactly how shadcn/ui works.</p>

<h2>Performance</h2>
<p>A few things that moved the Lighthouse score from 78 to 97:</p>
<ul>
  <li>Geist font with <code>display: swap</code></li>
  <li>All data fetching in Server Components</li>
  <li><code>next/image</code> with proper <code>sizes</code> attribute</li>
  <li>No third-party analytics (you don't need it on a personal blog)</li>
</ul>
  `,
  created_at: '2024-09-01T00:00:00Z',
  updated_at: '2024-09-12T00:00:00Z',
}
