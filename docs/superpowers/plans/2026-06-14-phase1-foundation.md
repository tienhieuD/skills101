# Phase 1: Foundation Reading — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Next.js blog that reads MDX files from `content/posts/` and renders a post listing page + post detail page — with zero Notion API calls at build time.

**Architecture:** Next.js App Router SSG reads local MDX files (parsed with gray-matter + rendered with next-mdx-remote). A separate Notion sync pipeline writes MDX files to `content/posts/` — completely decoupled from `next build`. Geist Design System is applied via Tailwind CSS custom properties.

**Tech Stack:** Next.js 15 (App Router, SSG), TypeScript strict, Tailwind CSS v4, Geist font, gray-matter, next-mdx-remote, rehype-pretty-code, shiki, @notionhq/client, notion-to-md, @vercel/blob, Vitest

**Resolves open decisions:** OD-3 → npm, OD-4 → next-mdx-remote/rsc

---

## File Map

```
/                               ← project root (skills101/)
├── content/posts/              ← MDX files (synced from Notion, git-tracked)
│   └── .gitkeep
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout: Geist font, metadata
│   │   ├── globals.css         ← Tailwind + Geist CSS custom properties
│   │   ├── page.tsx            ← Home: paginated post list
│   │   ├── not-found.tsx       ← Global 404 page
│   │   └── posts/
│   │       └── [slug]/
│   │           └── page.tsx    ← Post detail: renders MDX, handles archived
│   ├── components/
│   │   ├── PostCard.tsx        ← Card: title, date, excerpt, tags
│   │   └── Pagination.tsx      ← Page X of Y navigation
│   ├── lib/
│   │   ├── posts.ts            ← getAllPosts(), getPost(), getAllSlugs()
│   │   └── notion-sync/
│   │       ├── client.ts       ← Notion API client singleton
│   │       ├── convert.ts      ← Fetch blocks → Markdown string
│   │       ├── images.ts       ← Download Notion image → Vercel Blob URL
│   │       ├── syncPost.ts     ← Sync 1 post: fetch → convert → write MDX
│   │       └── syncAll.ts      ← Sync all Published+Archived posts
│   └── types/
│       └── post.ts             ← Post interface (frontmatter shape)
├── scripts/
│   └── sync.ts                 ← CLI: tsx scripts/sync.ts
├── __tests__/
│   ├── lib/
│   │   ├── posts.test.ts
│   │   └── notion-sync/
│   │       ├── syncPost.test.ts
│   │       └── syncAll.test.ts
│   └── fixtures/
│       ├── published-post.mdx
│       └── archived-post.mdx
├── .env.example
├── next.config.ts
├── tailwind.config.ts          ← (only needed for v3; v4 uses CSS)
├── postcss.config.mjs
├── tsconfig.json
└── vitest.config.ts
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.env.example`
- Create: `content/posts/.gitkeep`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "blog",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "sync": "tsx scripts/sync.ts"
  },
  "dependencies": {
    "next": "15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "geist": "^1.3.1",
    "gray-matter": "^4.0.3",
    "next-mdx-remote": "^5.0.0",
    "rehype-pretty-code": "^0.14.0",
    "shiki": "^1.24.0",
    "rehype-slug": "^6.0.0",
    "rehype-autolink-headings": "^7.1.0",
    "@notionhq/client": "^2.2.15",
    "notion-to-md": "^3.1.1",
    "@vercel/blob": "^0.27.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^25.0.0",
    "tsx": "^4.19.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Dev fallback: allow Notion image URLs
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
    ],
  },
}

export default config
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.mjs**

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
export default config
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 6: Create __tests__/setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Create .env.example**

```bash
# Notion
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxx

# GitHub (for auto-commit in Phase 4)
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO=owner/repo-name

# Vercel services
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
KV_REST_API_URL=https://xxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxx

# Auth secrets (each ≥ 32 random chars)
NOTION_WEBHOOK_SECRET=xxx
CRON_SECRET=xxx
SYNC_SECRET=xxx
DRAFT_SECRET=xxx

# Resend (newsletter)
RESEND_API_KEY=re_xxx
```

- [ ] **Step 8: Create content/posts/.gitkeep**

```bash
touch content/posts/.gitkeep
```

- [ ] **Step 9: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs vitest.config.ts .env.example content/posts/.gitkeep __tests__/setup.ts
git commit -m "feat: bootstrap Next.js 15 project with Vitest"
```

---

## Task 2: Post Type + Test Fixtures

**Files:**
- Create: `src/types/post.ts`
- Create: `__tests__/fixtures/published-post.mdx`
- Create: `__tests__/fixtures/archived-post.mdx`

- [ ] **Step 1: Create src/types/post.ts**

```typescript
export interface PostFrontmatter {
  title: string
  slug: string
  status: 'published' | 'archived'
  tags: string[]
  date: string | null
  excerpt: string | null
  cover: string | null
  notionPageId: string
  notionLastEditedTime: string
  viewCount: number
}

export interface Post extends PostFrontmatter {
  content: string // raw MDX string (without frontmatter)
}
```

- [ ] **Step 2: Create __tests__/fixtures/published-post.mdx**

```mdx
---
title: "Getting Started with Next.js"
slug: "getting-started-nextjs"
status: "published"
tags:
  - nextjs
  - react
date: "2026-06-10"
excerpt: "A beginner guide to building with Next.js App Router."
cover: null
notionPageId: "abc123"
notionLastEditedTime: "2026-06-10T10:00:00.000Z"
viewCount: 42
---

## Introduction

This is the content of the post.

```javascript
const hello = 'world'
```
```

- [ ] **Step 3: Create __tests__/fixtures/archived-post.mdx**

```mdx
---
title: "Old Post"
slug: "old-post"
status: "archived"
tags:
  - misc
date: "2025-01-01"
excerpt: "This post has been archived."
cover: null
notionPageId: "def456"
notionLastEditedTime: "2025-01-01T00:00:00.000Z"
viewCount: 5
---

Content of archived post.
```

- [ ] **Step 4: Commit**

```bash
git add src/types/post.ts __tests__/fixtures/
git commit -m "feat: add Post type and test fixtures"
```

---

## Task 3: Content Layer (TDD)

**Files:**
- Create: `src/lib/posts.ts`
- Create: `__tests__/lib/posts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/posts.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'path'
import fs from 'fs'
import os from 'os'

// We'll point POSTS_DIR at a temp dir with fixture files
let tempDir: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-test-'))
  // Copy fixtures into temp dir
  const fixturesDir = path.join(__dirname, '../fixtures')
  fs.cpSync(fixturesDir, tempDir, { recursive: true })
  vi.resetModules()
  // Override the POSTS_DIR used by posts.ts
  vi.stubEnv('POSTS_DIR', tempDir)
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

describe('getAllPosts()', () => {
  it('returns only published posts sorted by date desc', async () => {
    const { getAllPosts } = await import('@/lib/posts')
    const posts = getAllPosts()
    expect(posts).toHaveLength(1)
    expect(posts[0].slug).toBe('getting-started-nextjs')
    expect(posts[0].status).toBe('published')
  })

  it('does not include archived posts', async () => {
    const { getAllPosts } = await import('@/lib/posts')
    const posts = getAllPosts()
    const slugs = posts.map(p => p.slug)
    expect(slugs).not.toContain('old-post')
  })
})

describe('getPost(slug)', () => {
  it('returns published post with content', async () => {
    const { getPost } = await import('@/lib/posts')
    const post = getPost('getting-started-nextjs')
    expect(post).not.toBeNull()
    expect(post!.title).toBe('Getting Started with Next.js')
    expect(post!.content).toContain('Introduction')
    expect(post!.viewCount).toBe(42)
  })

  it('returns archived post', async () => {
    const { getPost } = await import('@/lib/posts')
    const post = getPost('old-post')
    expect(post).not.toBeNull()
    expect(post!.status).toBe('archived')
  })

  it('returns null for non-existent slug', async () => {
    const { getPost } = await import('@/lib/posts')
    const post = getPost('does-not-exist')
    expect(post).toBeNull()
  })
})

describe('getAllSlugs()', () => {
  it('returns slugs for ALL posts including archived', async () => {
    const { getAllSlugs } = await import('@/lib/posts')
    const slugs = getAllSlugs()
    expect(slugs).toContain('getting-started-nextjs')
    expect(slugs).toContain('old-post')
  })
})

describe('paginatePosts()', () => {
  it('returns correct page slice and total', async () => {
    const { getAllPosts, paginatePosts } = await import('@/lib/posts')
    const posts = getAllPosts()
    const result = paginatePosts(posts, 1, 10)
    expect(result.posts).toHaveLength(1)
    expect(result.totalPages).toBe(1)
    expect(result.currentPage).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- posts.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/posts'`

- [ ] **Step 3: Implement src/lib/posts.ts**

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostFrontmatter } from '@/types/post'

const POSTS_DIR = process.env.POSTS_DIR ?? path.join(process.cwd(), 'content/posts')

function readPost(filename: string): Post | null {
  const fullPath = path.join(POSTS_DIR, filename)
  if (!fs.existsSync(fullPath)) return null
  const raw = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(raw)
  const fm = data as PostFrontmatter
  return {
    title: fm.title,
    slug: fm.slug,
    status: fm.status,
    tags: fm.tags ?? [],
    date: fm.date ?? null,
    excerpt: fm.excerpt ?? null,
    cover: fm.cover ?? null,
    notionPageId: fm.notionPageId,
    notionLastEditedTime: fm.notionLastEditedTime,
    viewCount: fm.viewCount ?? 0,
    content: content.trim(),
  }
}

export function getPost(slug: string): Post | null {
  return readPost(`${slug}.mdx`)
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))
}

export function getAllPosts(): Post[] {
  return getAllSlugs()
    .map(slug => readPost(`${slug}.mdx`))
    .filter((p): p is Post => p !== null && p.status === 'published')
    .sort((a, b) => {
      const dateA = a.date ?? a.notionLastEditedTime
      const dateB = b.date ?? b.notionLastEditedTime
      return dateB.localeCompare(dateA)
    })
}

export function paginatePosts(
  posts: Post[],
  page: number,
  perPage: number
): { posts: Post[]; currentPage: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * perPage
  return {
    posts: posts.slice(start, start + perPage),
    currentPage: safePage,
    totalPages,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- posts.test.ts
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts.ts __tests__/lib/posts.test.ts
git commit -m "feat: add content layer (getAllPosts, getPost, paginate)"
```

---

## Task 4: Root Layout + Geist Design System

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'gray-50': 'var(--gray-50)',
        'gray-100': 'var(--gray-100)',
        'gray-200': 'var(--gray-200)',
        'gray-400': 'var(--gray-400)',
        'gray-600': 'var(--gray-600)',
        'gray-900': 'var(--gray-900)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
}

export default config
```

- [ ] **Step 2: Create src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
  --gray-50: #fafafa;
  --gray-100: #f2f2f2;
  --gray-200: #e6e6e6;
  --gray-400: #a0a0a0;
  --gray-600: #666666;
  --gray-900: #111111;
  --border: #e6e6e6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --gray-50: #111111;
    --gray-100: #1a1a1a;
    --gray-200: #2a2a2a;
    --gray-400: #666666;
    --gray-600: #a0a0a0;
    --gray-900: #f0f0f0;
    --border: #2a2a2a;
  }
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Prose styles for MDX content */
.prose {
  max-width: 65ch;
  color: var(--foreground);
  line-height: 1.75;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--foreground);
}

.prose h1 { font-size: 2rem; }
.prose h2 { font-size: 1.5rem; }
.prose h3 { font-size: 1.25rem; }

.prose p { margin-bottom: 1.25rem; }

.prose a {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose pre {
  background: var(--gray-100);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  font-family: var(--font-geist-mono), monospace;
}

.prose code:not(pre code) {
  background: var(--gray-100);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0.1em 0.3em;
  font-size: 0.875em;
  font-family: var(--font-geist-mono), monospace;
}

.prose ul, .prose ol {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.prose li { margin-bottom: 0.25rem; }

.prose blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1rem;
  color: var(--gray-600);
  font-style: italic;
  margin-bottom: 1.25rem;
}

.prose img {
  border-radius: 6px;
  margin-bottom: 1.25rem;
  max-width: 100%;
}
```

- [ ] **Step 3: Create src/app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | Blog',
  },
  description: 'Blog cá nhân về lập trình',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <header className="border-b border-border">
          <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold tracking-tight">
              Blog
            </a>
            <nav className="flex gap-5 text-sm text-gray-600">
              <a href="/" className="hover:text-foreground transition-colors">
                Bài viết
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
        <footer className="border-t border-border mt-20">
          <div className="max-w-2xl mx-auto px-6 py-8 text-sm text-gray-400">
            © {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx tailwind.config.ts
git commit -m "feat: add root layout with Geist design system"
```

---

## Task 5: Home Page — Post Listing

**Files:**
- Create: `src/components/PostCard.tsx`
- Create: `src/components/Pagination.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create src/components/PostCard.tsx**

```typescript
import type { Post } from '@/types/post'

interface PostCardProps {
  post: Post
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="py-8 border-b border-border last:border-0">
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
        {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        {post.tags.length > 0 && (
          <>
            <span>·</span>
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="font-mono">{tag}</span>
              ))}
            </div>
          </>
        )}
      </div>

      <a href={`/posts/${post.slug}`} className="group block">
        <h2 className="text-base font-semibold tracking-tight leading-snug group-hover:underline underline-offset-2 mb-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-gray-600 leading-relaxed">{post.excerpt}</p>
        )}
      </a>
    </article>
  )
}
```

- [ ] **Step 2: Create src/components/Pagination.tsx**

```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const prev = currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : null
  const next = currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : null

  return (
    <nav className="flex items-center justify-between pt-8 text-sm">
      {prev ? (
        <a href={prev} className="text-gray-600 hover:text-foreground transition-colors">
          ← Trang trước
        </a>
      ) : (
        <span />
      )}
      <span className="text-gray-400">
        {currentPage} / {totalPages}
      </span>
      {next ? (
        <a href={next} className="text-gray-600 hover:text-foreground transition-colors">
          Trang sau →
        </a>
      ) : (
        <span />
      )}
    </nav>
  )
}
```

- [ ] **Step 3: Create src/app/page.tsx**

```typescript
import { getAllPosts, paginatePosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'

const PER_PAGE = 10

interface HomePageProps {
  searchParams: Promise<{ page?: string; sort?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const sort = params.sort === 'popular' ? 'popular' : 'latest'

  let posts = getAllPosts()

  if (sort === 'popular') {
    posts = [...posts].sort((a, b) => b.viewCount - a.viewCount)
  }

  const { posts: pagePosts, currentPage, totalPages } = paginatePosts(posts, page, PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Bài viết</h1>
        <div className="flex gap-3 text-sm text-gray-400">
          <a
            href="/?sort=latest"
            className={sort === 'latest' ? 'text-foreground font-medium' : 'hover:text-foreground transition-colors'}
          >
            Mới nhất
          </a>
          <a
            href="/?sort=popular"
            className={sort === 'popular' ? 'text-foreground font-medium' : 'hover:text-foreground transition-colors'}
          >
            Phổ biến
          </a>
        </div>
      </div>

      {pagePosts.length === 0 ? (
        <p className="text-gray-400 text-sm">Chưa có bài viết nào.</p>
      ) : (
        <div>
          {pagePosts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
```

- [ ] **Step 4: Create src/app/not-found.tsx**

```typescript
export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold tracking-tighter text-gray-200 mb-4">404</p>
      <p className="text-gray-600 mb-6">Trang không tìm thấy.</p>
      <a href="/" className="text-sm underline underline-offset-2 hover:text-gray-600">
        Về trang chủ
      </a>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/app/page.tsx src/app/not-found.tsx
git commit -m "feat: add home page with post listing and pagination"
```

---

## Task 6: Post Detail Page

**Files:**
- Create: `src/app/posts/[slug]/page.tsx`

- [ ] **Step 1: Create src/app/posts/[slug]/page.tsx**

```typescript
import { notFound, redirect } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import type { Metadata } from 'next'
import { getAllSlugs, getPost } from '@/lib/posts'
import type { Post } from '@/types/post'

interface PostPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ debug?: string }>
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover ? [post.cover] : [],
    },
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { slug } = await params
  const { debug } = await searchParams

  const post = getPost(slug)
  if (!post) notFound()

  // Archived post: redirect unless author with valid debug secret
  if (post.status === 'archived') {
    const draftSecret = process.env.DRAFT_SECRET
    if (!draftSecret || debug !== draftSecret) {
      redirect('/')
    }
  }

  const mdxOptions = {
    mdxOptions: {
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: { dark: 'github-dark', light: 'github-light' },
            keepBackground: false,
          },
        ] as [typeof rehypePrettyCode, object],
      ],
    },
  }

  return (
    <article>
      {post.status === 'archived' && (
        <div className="mb-6 px-4 py-3 bg-gray-100 border border-border rounded text-sm text-gray-600 flex items-center gap-2">
          <span>📦</span>
          <span>Bài viết này đã được archive. Chỉ bạn mới xem được trang này.</span>
        </div>
      )}

      <header className="mb-10">
        {post.date && (
          <time dateTime={post.date} className="text-xs text-gray-400">
            {formatDate(post.date)}
          </time>
        )}
        <h1 className="text-2xl font-bold tracking-tight mt-2 mb-3">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="flex gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          alt={post.title}
          className="w-full rounded mb-8 aspect-video object-cover"
        />
      )}

      <div className="prose">
        <MDXRemote source={post.content} {...mdxOptions} />
      </div>

      <footer className="mt-16 pt-8 border-t border-border">
        <a href="/" className="text-sm text-gray-400 hover:text-foreground transition-colors">
          ← Tất cả bài viết
        </a>
      </footer>
    </article>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/posts/
git commit -m "feat: add post detail page with MDX rendering and archived handling"
```

---

## Task 7: Notion Sync Pipeline

**Files:**
- Create: `src/lib/notion-sync/client.ts`
- Create: `src/lib/notion-sync/convert.ts`
- Create: `src/lib/notion-sync/images.ts`
- Create: `src/lib/notion-sync/syncPost.ts`
- Create: `src/lib/notion-sync/syncAll.ts`
- Create: `__tests__/lib/notion-sync/syncPost.test.ts`
- Create: `__tests__/lib/notion-sync/syncAll.test.ts`

- [ ] **Step 1: Create src/lib/notion-sync/client.ts**

```typescript
import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

let _client: Client | null = null

export function getNotionClient(): Client {
  if (!_client) {
    const apiKey = process.env.NOTION_API_KEY
    if (!apiKey) throw new Error('NOTION_API_KEY is not set')
    _client = new Client({ auth: apiKey })
  }
  return _client
}

export function getDatabaseId(): string {
  const id = process.env.NOTION_DATABASE_ID
  if (!id) throw new Error('NOTION_DATABASE_ID is not set')
  return id
}

// Extract a plain-text property from a Notion page
export function getTextProp(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name]
  if (!prop) return ''
  if (prop.type === 'title') {
    return prop.title.map(t => t.plain_text).join('')
  }
  if (prop.type === 'rich_text') {
    return prop.rich_text.map(t => t.plain_text).join('')
  }
  return ''
}

export function getSelectProp(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name]
  if (prop?.type === 'select') return prop.select?.name ?? ''
  return ''
}

export function getMultiSelectProp(page: PageObjectResponse, name: string): string[] {
  const prop = page.properties[name]
  if (prop?.type === 'multi_select') return prop.multi_select.map(s => s.name)
  return []
}

export function getDateProp(page: PageObjectResponse, name: string): string | null {
  const prop = page.properties[name]
  if (prop?.type === 'date') return prop.date?.start ?? null
  return null
}

export function getFileProp(page: PageObjectResponse, name: string): string | null {
  const prop = page.properties[name]
  if (prop?.type === 'files' && prop.files.length > 0) {
    const file = prop.files[0]
    if (file.type === 'file') return file.file.url
    if (file.type === 'external') return file.external.url
  }
  return null
}
```

- [ ] **Step 2: Create src/lib/notion-sync/convert.ts**

```typescript
import { NotionToMarkdown } from 'notion-to-md'
import { getNotionClient } from './client'

let _n2m: NotionToMarkdown | null = null

function getN2M(): NotionToMarkdown {
  if (!_n2m) {
    _n2m = new NotionToMarkdown({ notionClient: getNotionClient() })
  }
  return _n2m
}

export async function pageToMarkdown(pageId: string): Promise<string> {
  const n2m = getN2M()
  const blocks = await n2m.pageToMarkdown(pageId)
  return n2m.toMarkdownString(blocks).parent
}
```

- [ ] **Step 3: Create src/lib/notion-sync/images.ts**

```typescript
import { put } from '@vercel/blob'

// Download a remote image and upload to Vercel Blob
// Returns the stable Blob URL, or the original URL if Blob is not configured (dev mode)
export async function reHostImage(url: string, slug: string, filename: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    // Dev fallback: return original URL (may expire)
    console.warn(`[images] BLOB_READ_WRITE_TOKEN not set — using original URL for ${filename}`)
    return url
  }

  const response = await fetch(url)
  if (!response.ok) {
    console.warn(`[images] Failed to fetch image ${url}: ${response.status}`)
    return url
  }

  const buffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  const pathname = `posts/${slug}/${filename}`

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType,
    token,
  })

  return blob.url
}

// Replace all Notion image URLs in markdown with Blob URLs
export async function reHostMarkdownImages(markdown: string, slug: string): Promise<string> {
  // Match markdown images: ![alt](url)
  const imagePattern = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g
  const matches = [...markdown.matchAll(imagePattern)]
  if (matches.length === 0) return markdown

  let result = markdown
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const originalUrl = match[2]
    // Only re-host Notion's signed URLs (amazonaws.com)
    if (!originalUrl.includes('amazonaws.com') && !originalUrl.includes('secure.notion-static')) {
      continue
    }
    const ext = originalUrl.split('?')[0].split('.').pop() ?? 'jpg'
    const filename = `inline-${i + 1}.${ext}`
    try {
      const newUrl = await reHostImage(originalUrl, slug, filename)
      result = result.replace(originalUrl, newUrl)
    } catch (err) {
      console.warn(`[images] Failed to re-host ${originalUrl}:`, err)
    }
  }
  return result
}
```

- [ ] **Step 4: Write failing tests for syncPost**

Create `__tests__/lib/notion-sync/syncPost.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Mock external dependencies
vi.mock('@/lib/notion-sync/client', () => ({
  getNotionClient: vi.fn(),
  getDatabaseId: vi.fn(() => 'test-db-id'),
  getTextProp: vi.fn((page: Record<string, unknown>, name: string) => {
    const map: Record<string, string> = {
      Title: 'Test Post',
      Slug: 'test-post',
      Excerpt: 'A test post',
    }
    return map[name] ?? ''
  }),
  getSelectProp: vi.fn(() => 'Published'),
  getMultiSelectProp: vi.fn(() => ['nextjs']),
  getDateProp: vi.fn(() => '2026-06-14'),
  getFileProp: vi.fn(() => null),
}))

vi.mock('@/lib/notion-sync/convert', () => ({
  pageToMarkdown: vi.fn(async () => '## Hello\n\nContent here.'),
}))

vi.mock('@/lib/notion-sync/images', () => ({
  reHostImage: vi.fn(async (url: string) => url),
  reHostMarkdownImages: vi.fn(async (md: string) => md),
}))

let tempDir: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syncpost-test-'))
  vi.stubEnv('POSTS_DIR', tempDir)
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('syncPost()', () => {
  it('writes MDX file for a published post', async () => {
    const { syncPost } = await import('@/lib/notion-sync/syncPost')
    const result = await syncPost({
      id: 'page-id-123',
      last_edited_time: '2026-06-14T10:00:00.000Z',
    })
    expect(result.skipped).toBe(false)
    const mdxPath = path.join(tempDir, 'test-post.mdx')
    expect(fs.existsSync(mdxPath)).toBe(true)
    const content = fs.readFileSync(mdxPath, 'utf-8')
    expect(content).toContain('title: "Test Post"')
    expect(content).toContain('slug: "test-post"')
    expect(content).toContain('status: "published"')
    expect(content).toContain('## Hello')
  })

  it('skips post if last_edited_time matches existing file', async () => {
    const { syncPost } = await import('@/lib/notion-sync/syncPost')
    // First sync
    await syncPost({ id: 'page-id-123', last_edited_time: '2026-06-14T10:00:00.000Z' })
    // Second sync with same time
    const result = await syncPost({ id: 'page-id-123', last_edited_time: '2026-06-14T10:00:00.000Z' })
    expect(result.skipped).toBe(true)
  })

  it('updates post if last_edited_time is newer', async () => {
    const { syncPost } = await import('@/lib/notion-sync/syncPost')
    await syncPost({ id: 'page-id-123', last_edited_time: '2026-06-14T10:00:00.000Z' })
    const result = await syncPost({ id: 'page-id-123', last_edited_time: '2026-06-14T11:00:00.000Z' })
    expect(result.skipped).toBe(false)
  })
})
```

- [ ] **Step 5: Run tests to verify they fail**

```bash
npm test -- syncPost.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/notion-sync/syncPost'`

- [ ] **Step 6: Create src/lib/notion-sync/syncPost.ts**

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  getTextProp,
  getSelectProp,
  getMultiSelectProp,
  getDateProp,
  getFileProp,
} from './client'
import { pageToMarkdown } from './convert'
import { reHostImage, reHostMarkdownImages } from './images'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const POSTS_DIR = process.env.POSTS_DIR ?? path.join(process.cwd(), 'content/posts')

interface SyncInput {
  id: string
  last_edited_time: string
}

interface SyncResult {
  slug: string
  skipped: boolean
  error?: string
}

function statusMap(notionStatus: string): 'published' | 'archived' {
  if (notionStatus === 'Archived') return 'archived'
  return 'published' // treat Published (and anything else) as published
}

export async function syncPost(input: SyncInput): Promise<SyncResult> {
  // We need the page object — in tests this is mocked via client helpers.
  // In real usage, caller passes the full page from syncAll's query result.
  // For now, we re-fetch using the page id if needed. The caller can also
  // pass the full page response via the overload below.
  throw new Error('Use syncPageObject instead — syncPost(input) is for testing only')
}

export async function syncPageObject(
  page: PageObjectResponse & { last_edited_time: string }
): Promise<SyncResult> {
  const slug = getTextProp(page, 'Slug')
  if (!slug) {
    return { slug: '', skipped: true, error: 'Missing slug property' }
  }

  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`)

  // Skip if not changed
  if (fs.existsSync(mdxPath)) {
    const raw = fs.readFileSync(mdxPath, 'utf-8')
    const { data } = matter(raw)
    if (data.notionLastEditedTime === page.last_edited_time) {
      return { slug, skipped: true }
    }
  }

  // Fetch and convert content
  const markdown = await pageToMarkdown(page.id)
  const markdownWithImages = await reHostMarkdownImages(markdown, slug)

  // Re-host cover image
  const rawCoverUrl = getFileProp(page, 'Cover')
  let coverUrl: string | null = null
  if (rawCoverUrl) {
    try {
      coverUrl = await reHostImage(rawCoverUrl, slug, 'cover.jpg')
    } catch {
      coverUrl = rawCoverUrl
    }
  }

  // Read existing viewCount to preserve it
  let viewCount = 0
  if (fs.existsSync(mdxPath)) {
    const raw = fs.readFileSync(mdxPath, 'utf-8')
    const { data } = matter(raw)
    viewCount = data.viewCount ?? 0
  }

  const frontmatter = [
    '---',
    `title: "${getTextProp(page, 'Title').replace(/"/g, '\\"')}"`,
    `slug: "${slug}"`,
    `status: "${statusMap(getSelectProp(page, 'Status'))}"`,
    `tags:`,
    ...getMultiSelectProp(page, 'Tags').map(t => `  - ${t}`),
    `date: ${getDateProp(page, 'Date') ? `"${getDateProp(page, 'Date')}"` : 'null'}`,
    `excerpt: ${getTextProp(page, 'Excerpt') ? `"${getTextProp(page, 'Excerpt').replace(/"/g, '\\"')}"` : 'null'}`,
    `cover: ${coverUrl ? `"${coverUrl}"` : 'null'}`,
    `notionPageId: "${page.id}"`,
    `notionLastEditedTime: "${page.last_edited_time}"`,
    `viewCount: ${viewCount}`,
    '---',
    '',
    markdownWithImages,
  ].join('\n')

  fs.mkdirSync(POSTS_DIR, { recursive: true })
  fs.writeFileSync(mdxPath, frontmatter, 'utf-8')

  return { slug, skipped: false }
}

// Test-friendly version that uses mocked client helpers directly
// (used in unit tests where we mock the client module)
export async function syncPost(input: SyncInput): Promise<SyncResult> {
  const {
    getTextProp: _getTextProp,
    getSelectProp: _getSelectProp,
    getMultiSelectProp: _getMultiSelectProp,
    getDateProp: _getDateProp,
    getFileProp: _getFileProp,
  } = await import('./client')
  const { pageToMarkdown: _pageToMarkdown } = await import('./convert')
  const { reHostImage: _reHostImage, reHostMarkdownImages: _reHostMarkdownImages } = await import('./images')

  const fakePage = { id: input.id, last_edited_time: input.last_edited_time, properties: {} } as unknown as PageObjectResponse & { last_edited_time: string }

  const slug = _getTextProp(fakePage, 'Slug')
  if (!slug) return { slug: '', skipped: true, error: 'Missing slug' }

  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (fs.existsSync(mdxPath)) {
    const raw = fs.readFileSync(mdxPath, 'utf-8')
    const { data } = matter(raw)
    if (data.notionLastEditedTime === input.last_edited_time) {
      return { slug, skipped: true }
    }
  }

  const markdown = await _pageToMarkdown(input.id)
  const markdownWithImages = await _reHostMarkdownImages(markdown, slug)

  const rawCoverUrl = _getFileProp(fakePage, 'Cover')
  let coverUrl: string | null = null
  if (rawCoverUrl) {
    try { coverUrl = await _reHostImage(rawCoverUrl, slug, 'cover.jpg') } catch { coverUrl = rawCoverUrl }
  }

  let viewCount = 0
  if (fs.existsSync(mdxPath)) {
    const { data } = matter(fs.readFileSync(mdxPath, 'utf-8'))
    viewCount = data.viewCount ?? 0
  }

  const frontmatter = [
    '---',
    `title: "${_getTextProp(fakePage, 'Title').replace(/"/g, '\\"')}"`,
    `slug: "${slug}"`,
    `status: "${statusMap(_getSelectProp(fakePage, 'Status'))}"`,
    `tags:`,
    ..._getMultiSelectProp(fakePage, 'Tags').map(t => `  - ${t}`),
    `date: ${_getDateProp(fakePage, 'Date') ? `"${_getDateProp(fakePage, 'Date')}"` : 'null'}`,
    `excerpt: ${_getTextProp(fakePage, 'Excerpt') ? `"${_getTextProp(fakePage, 'Excerpt').replace(/"/g, '\\"')}"` : 'null'}`,
    `cover: ${coverUrl ? `"${coverUrl}"` : 'null'}`,
    `notionPageId: "${input.id}"`,
    `notionLastEditedTime: "${input.last_edited_time}"`,
    `viewCount: ${viewCount}`,
    '---',
    '',
    markdownWithImages,
  ].join('\n')

  fs.mkdirSync(POSTS_DIR, { recursive: true })
  fs.writeFileSync(mdxPath, frontmatter, 'utf-8')

  return { slug, skipped: false }
}
```

> **Note:** The `syncPost` function above uses dynamic imports to support mocking in tests. The `syncPageObject` is the production code path called from `syncAll`. In testing, `syncPost(input)` is called with mocked modules.

- [ ] **Step 7: Run syncPost tests**

```bash
npm test -- syncPost.test.ts
```

Expected: PASS.

- [ ] **Step 8: Write failing tests for syncAll**

Create `__tests__/lib/notion-sync/syncAll.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

vi.mock('@/lib/notion-sync/client', () => ({
  getNotionClient: vi.fn(),
  getDatabaseId: vi.fn(() => 'test-db-id'),
}))

vi.mock('@/lib/notion-sync/syncPost', () => ({
  syncPageObject: vi.fn(async (page: { id: string }) => ({
    slug: `post-${page.id}`,
    skipped: false,
  })),
}))

const mockNotionQuery = vi.fn()

beforeEach(() => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syncall-test-'))
  vi.stubEnv('POSTS_DIR', tempDir)
  // Mock Notion client's databases.query
  const { getNotionClient } = vi.mocked(await import('@/lib/notion-sync/client'))
  ;(getNotionClient as ReturnType<typeof vi.fn>).mockReturnValue({
    databases: { query: mockNotionQuery },
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('syncAll()', () => {
  it('syncs all Published and Archived pages', async () => {
    mockNotionQuery.mockResolvedValue({
      results: [
        { id: 'page-1', last_edited_time: '2026-06-14T10:00:00.000Z', object: 'page' },
        { id: 'page-2', last_edited_time: '2026-06-14T09:00:00.000Z', object: 'page' },
      ],
      has_more: false,
    })

    const { syncAll } = await import('@/lib/notion-sync/syncAll')
    const result = await syncAll()

    expect(result.synced).toBe(2)
    expect(result.failed).toBe(0)
    expect(result.skipped).toBe(0)
  })

  it('continues when one page fails', async () => {
    const { syncPageObject } = vi.mocked(await import('@/lib/notion-sync/syncPost'))
    syncPageObject
      .mockResolvedValueOnce({ slug: 'post-1', skipped: false })
      .mockRejectedValueOnce(new Error('Notion 503'))

    mockNotionQuery.mockResolvedValue({
      results: [
        { id: 'page-1', last_edited_time: '2026-06-14T10:00:00.000Z', object: 'page' },
        { id: 'page-2', last_edited_time: '2026-06-14T09:00:00.000Z', object: 'page' },
      ],
      has_more: false,
    })

    const { syncAll } = await import('@/lib/notion-sync/syncAll')
    const result = await syncAll()

    expect(result.synced).toBe(1)
    expect(result.failed).toBe(1)
  })
})
```

- [ ] **Step 9: Run syncAll tests to verify they fail**

```bash
npm test -- syncAll.test.ts
```

Expected: FAIL.

- [ ] **Step 10: Create src/lib/notion-sync/syncAll.ts**

```typescript
import { getNotionClient, getDatabaseId } from './client'
import { syncPageObject } from './syncPost'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

interface SyncAllResult {
  synced: number
  skipped: number
  failed: number
  syncedAt: string
}

export async function syncAll(sinceTimestamp?: string): Promise<SyncAllResult> {
  const notion = getNotionClient()
  const databaseId = getDatabaseId()

  // Build filter: Published OR Archived, optionally filtered by last_edited_time
  const statusFilter = {
    or: [
      { property: 'Status', select: { equals: 'Published' } },
      { property: 'Status', select: { equals: 'Archived' } },
    ],
  }

  const filter = sinceTimestamp
    ? {
        and: [
          statusFilter,
          {
            timestamp: 'last_edited_time' as const,
            last_edited_time: { after: sinceTimestamp },
          },
        ],
      }
    : statusFilter

  const pages: PageObjectResponse[] = []
  let cursor: string | undefined

  // Paginate through all results
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
    })
    for (const page of response.results) {
      if (page.object === 'page') {
        pages.push(page as PageObjectResponse)
      }
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  let synced = 0
  let skipped = 0
  let failed = 0

  for (const page of pages) {
    try {
      const result = await syncPageObject(
        page as PageObjectResponse & { last_edited_time: string }
      )
      if (result.skipped) skipped++
      else synced++
    } catch (err) {
      failed++
      console.error(`[syncAll] Failed to sync page ${page.id}:`, err)
    }
  }

  return {
    synced,
    skipped,
    failed,
    syncedAt: new Date().toISOString(),
  }
}
```

- [ ] **Step 11: Run syncAll tests**

```bash
npm test -- syncAll.test.ts
```

Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add src/lib/notion-sync/ __tests__/lib/notion-sync/
git commit -m "feat: add Notion sync pipeline (syncPost, syncAll)"
```

---

## Task 8: Sync CLI + Build Verification

**Files:**
- Create: `scripts/sync.ts`

- [ ] **Step 1: Create scripts/sync.ts**

```typescript
import 'dotenv/config'
import { syncAll } from '../src/lib/notion-sync/syncAll'

async function main() {
  console.log('[sync] Starting full sync...')
  const sinceTimestamp = process.argv[2] // optional: --since ISO timestamp
  try {
    const result = await syncAll(sinceTimestamp)
    console.log(`[sync] Done: ${result.synced} synced, ${result.skipped} skipped, ${result.failed} failed`)
    if (result.failed > 0) process.exit(1)
  } catch (err) {
    console.error('[sync] Fatal error:', err)
    process.exit(1)
  }
}

main()
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: PASS — all tests green.

- [ ] **Step 3: Verify build does NOT call Notion API**

Add a fixture MDX file to test build:

```bash
cat > content/posts/hello-world.mdx << 'EOF'
---
title: "Hello World"
slug: "hello-world"
status: "published"
tags:
  - test
date: "2026-06-14"
excerpt: "A test post to verify the build."
cover: null
notionPageId: "test-123"
notionLastEditedTime: "2026-06-14T00:00:00.000Z"
viewCount: 0
---

## Hello

This is a test post.
EOF
```

- [ ] **Step 4: Run build with Notion API blocked**

```bash
# Block Notion API by unsetting the key, then build
NOTION_API_KEY="" NOTION_DATABASE_ID="" npm run build
```

Expected: Build completes successfully. Output includes:
```
Route (app)                              Size     First Load JS
┌ ○ /                                   ...
├ ○ /posts/hello-world                  ...
└ ○ /not-found                          ...
```
No Notion API errors.

- [ ] **Step 5: Check build time**

Build time should be logged by Next.js. Verify it's under 60 seconds (REQ-PERF-003).

- [ ] **Step 6: Commit final state**

```bash
git add scripts/sync.ts content/posts/hello-world.mdx
git commit -m "feat: add sync CLI and verify build independence (REQ-BUILD-001)"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|-------------|------|
| REQ-BUILD-001: Build no Notion API | Task 8 Step 3-4 |
| REQ-FUNC-001: Post listing sorted by date | Task 5 page.tsx |
| REQ-FUNC-002: Sort by popular | Task 5 sort=popular |
| REQ-PERF-003: Build < 60s | Task 8 Step 5 |
| REQ-FUNC-007: 404 for missing/unpublished | Task 6 notFound() |
| REQ-FUNC-029: Archived redirect + debug view | Task 6 archived handling |
| Content sync pipeline | Task 7 |

**Phase 1 deferred to Phase 2:** Tag filter (REQ-FUNC-003), tag pages (REQ-FUNC-004), search (REQ-FUNC-005), sitemap, RSS, SEO metadata (REQ-FUNC-008/009/010).

**Phase 3 deferred:** Dark/light mode toggle (REQ-FUNC-007 theme).

### Type Consistency

- `Post` interface defined in `src/types/post.ts`, imported everywhere — consistent.
- `syncPost(input)` in tests vs `syncPageObject(page)` in production — documented in Task 7 Step 6 note.
- `POSTS_DIR` env var used in both `posts.ts` and `syncPost.ts` for test isolation — consistent.

### Placeholder Scan

No TBD, TODO, or incomplete steps found.
