# Content Tool — Create MDX Post (local content only)
# For the full feature implementation (API + UI), see: .claude/commands/author/create-post.md

Create a new MDX blog post file for the travel blog. Post topic: $ARGUMENTS

## Steps

1. **Derive the slug** from the topic — lowercase, hyphenated, ASCII only (e.g., `hanoi-street-food`)

2. **Create the MDX file** at `content/posts/{slug}.mdx` with this frontmatter:

```mdx
---
title: "{Generated title from topic}"
date: "{today's date as YYYY-MM-DD}"
description: "{One compelling sentence, max 160 chars, for SEO}"
tags: ["{tag1}", "{tag2}"]
location: "{City, Country}"
coverImage: "/images/posts/{slug}/cover.jpg"
draft: true
---

## Introduction

{2–3 sentence hook that sets the scene for the destination.}

## {Section 1 — first aspect of the destination}

{Content}

## {Section 2 — second aspect}

{Content}

## {Section 3 — practical tips or highlights}

{Content}

## Final Thoughts

{Closing paragraph with a recommendation or takeaway.}
```

3. **Create the image directory**: `public/images/posts/{slug}/`
   - Add a `README.md` placeholder noting: "Add cover.jpg (1200×630px, WebP preferred)"

4. **Verify** the post appears in the listing by checking `lib/posts.ts` — ensure the slug will resolve via `getPostBySlug`

## Rules

- Set `draft: true` until the post is ready to publish
- Tags: 2–4 tags, lowercase, no spaces (use hyphens)
- Description must be under 160 characters
- Do not fabricate specific facts (prices, dates, addresses) — use placeholders like `[ADD: opening hours]`
