# Coding Convention — Blog cá nhân về lập trình

**Version:** 1.0 | **Date:** 2026-06-14 | **Status:** Approved
**Ref:** [TAD](040_tad.md) | [API Design](050_api_design.md) | [DB Design](060_db_design.md)

---

## 1. Stack cố định (không thay đổi)

Các lựa chọn đã chốt trong TAD — không negotiate lại:

| Layer | Lựa chọn |
|-------|---------|
| Framework | Next.js 15 App Router + TypeScript strict |
| Styling | Tailwind CSS v4 + Geist Design System |
| Font | `geist/font/sans` + `geist/font/mono` |
| MDX renderer | `next-mdx-remote/rsc` (không `@next/mdx`) |
| Syntax highlight | `rehype-pretty-code` + `shiki` |
| Search | Pagefind (client-side static) |
| Comments | Giscus (không Disqus) |
| Email | Resend (không Mailchimp) |
| PWA | `@serwist/next` (không `next-pwa`) |
| Test runner | Vitest (không Jest) |
| Package manager | npm (không pnpm/yarn) |
| Hosting | Vercel Hobby tier |

---

## 2. TypeScript

### Compiler options bắt buộc

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Rules

| Rule | ✅ Làm | ❌ Không làm |
|------|--------|------------|
| Types | `interface` cho object shape, `type` cho union/alias | `any` — dùng `unknown` + narrow |
| Assertion | `value ?? fallback` | `value!` (non-null assertion) |
| Enum | `const OBJ = { A: 'a' } as const` + `typeof OBJ[keyof typeof OBJ]` | `enum` |
| Imports | `import type { Foo }` cho type-only | Import type lẫn value cùng dòng |
| Async | `async/await` + `try/catch` | `.then().catch()` |
| Parallel async | `Promise.all([...])` khi tasks không phụ thuộc | `await` trong `for` loop |

### Import order (ESLint enforce)

```typescript
// 1. Node built-ins
import fs from 'fs'
// 2. External packages
import matter from 'gray-matter'
// 3. Internal (alias @/)
import { getAllPosts } from '@/lib/posts'
import type { Post } from '@/types/post'
// 4. Relative
import { helper } from './utils'
```

---

## 3. React & Next.js

### Server vs Client Component

**Mặc định: Server Component.** Chỉ thêm `'use client'` khi cần:

| Cần `'use client'` | Không cần |
|---------------------|----------|
| `useState`, `useEffect`, `useRef` | Data fetching, `async/await` |
| Browser API (`window`, `localStorage`) | Static markup, formatting |
| Interactive event handlers | Server-only logic |

**Client components trong project này:** `ThemeToggle`, `SearchBox`, `MobileNav`, `GiscusComments`, `NewsletterForm`

### Next.js 15 — `params` là Promise

```typescript
// ✅ Next.js 15
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  const { slug } = await params
  const { page } = await searchParams
}
```

### Quy tắc Next.js

- **Không gọi Notion API tại build time** (REQ-BUILD-001) — chỉ đọc MDX files.
- **Không dùng ISR (`revalidate`)** — mỗi sync trigger deploy mới là đủ.
- **`next/image` thay `<img>`** — luôn có `width`+`height`; cover image (LCP) thêm `priority`.
- **`notFound()` thay `return null`** khi resource không tìm thấy.
- **`redirect('/')` thay render** khi post status là `archived` và không có debug token hợp lệ.
- Export `generateMetadata` cho mọi dynamic page.
- **Không export HTTP method không cần** trong Route Handler (`GET`/`DELETE` nếu route chỉ nhận `POST`).

### Component export

```typescript
// ✅ Named export (dễ refactor, IDE auto-import chính xác)
export function PostCard({ post }: PostCardProps) {}

// ❌ Default export (tránh với components)
export default function PostCard() {}
```

---

## 4. Styling — Tailwind + Geist

### Geist tokens (CSS custom properties)

```css
/* globals.css */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --gray-100: #f5f5f5;
  --gray-200: #e5e5e5;
  --gray-400: #a3a3a3;
  --gray-600: #525252;
  --gray-800: #262626;
  --border: #e5e5e5;
}
.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --border: #262626;
}
```

Không tự thêm màu ngoài Geist tokens.

### Tailwind rules

| Rule | ✅ | ❌ |
|------|----|----|
| Responsive | Mobile-first: `px-4 md:px-8` | Desktop-first |
| Dynamic styles | `style={{ width: \`${val}%\` }}` chỉ cho giá trị JS | `style={{ padding: '16px' }}` |
| Dark mode | `dark:text-gray-100` (class strategy) | CSS media query thủ công |
| Touch targets | `min-w-[44px] min-h-[44px]` cho interactive elements | Element nhỏ hơn 44×44px |
| Component-level CSS | Tailwind utilities | File `.css` riêng cho component |

**`globals.css`** chỉ chứa: Tailwind directives, CSS custom properties, global resets, prose styles cho MDX.

**`cn()` helper** (cần khi có conditional classes):

```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs))
```

---

## 5. Naming

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| React component file | PascalCase | `PostCard.tsx` |
| Next.js special file | lowercase | `page.tsx`, `layout.tsx`, `route.ts` |
| Utility / lib | camelCase | `posts.ts`, `syncPost.ts` |
| Test file | `<name>.test.ts` | `posts.test.ts` |
| MDX content file | kebab-case = slug | `nextjs-tips.mdx` |
| Variable | camelCase | `postCount`, `isLoading` |
| Module-level constant | SCREAMING_SNAKE_CASE | `MAX_POSTS_PER_PAGE` |
| Boolean variable | `is/has/should` prefix | `isPublished`, `hasViewCount` |
| Function | động từ + danh từ | `getPost`, `syncAll`, `buildFrontmatter` |
| Event handler | `handle` prefix | `handleSubmit`, `handleTagClick` |
| Props interface | `ComponentNameProps` | `PostCardProps` |
| API JSON field | camelCase | `pageId`, `syncedAt`, `viewCount` |
| Timestamp field | hậu tố `At` | `syncedAt`, `createdAt` |
| KV key | `namespace:id` | `views:nextjs-tips`, `sync:last_run` |

---

## 6. Linting & Formatting

### ESLint (flat config — Next.js 15 + ESLint 9)

```javascript
// eslint.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
```

### Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`prettier-plugin-tailwindcss` tự sort Tailwind classes — không sort thủ công.

### Scripts

```json
{
  "lint": "next lint",
  "format": "prettier --write .",
  "type-check": "tsc --noEmit"
}
```

---

## 7. Testing

### Setup

- **Vitest** — environment `node` mặc định; `jsdom` khi test components.
- **Không mock `fs`** — dùng temp directory thật (tránh false positive).
- **Không mock database/KV** — dùng in-memory hoặc real instance.

### Test isolation cho `process.env`

```typescript
beforeEach(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-test-'))
  vi.stubEnv('POSTS_DIR', tempDir)
  vi.resetModules()
  const module = await import('@/lib/posts')
  getPost = module.getPost
})
afterEach(() => {
  fs.rmSync(tempDir, { recursive: true })
  vi.unstubAllEnvs()
})
```

### Rules

| Rule | |
|------|-|
| TDD | Viết test trước (Red → Green → Refactor) |
| Test behavior | Không test implementation details (spy calls) |
| Test isolation | Không share mutable state giữa tests |
| `vi.mock()` | Đặt trước imports; chỉ mock external services |
| Naming | `describe('functionName') > it('does X when Y')` |

### Coverage targets

| Module | Target |
|--------|--------|
| `src/lib/posts.ts` | ≥ 90% |
| `src/lib/notion-sync/*.ts` | ≥ 80% |
| `src/app/api/*/route.ts` | Happy path + auth failure |
| `src/components/` | Manual + Lighthouse (không bắt buộc unit test) |

---

## 8. Git & Commit

### Conventional Commits

Format: `<type>(<scope>): <task_id> <subject>` — subject viết thường, imperative, không dấu chấm.

`task_id` là ID từ `080_coding_tasks.md` (ví dụ `T-022`). Bỏ qua nếu commit không liên quan task cụ thể (hotfix, chore).

```
feat(sync): T-022 add mutex lock to prevent concurrent runs
fix(api): T-040 return 401 when webhook signature is invalid
chore(deps): upgrade next to 15.3.4
docs: update TAD with OD-2 resolution
test(posts): T-024 add test for archived post filtering
refactor(sync): T-022 extract buildFrontmatter helper
perf(images): T-021 parallelize image re-hosting in syncPost
```

**Types:** `feat` | `fix` | `chore` | `docs` | `test` | `refactor` | `perf` | `style`
**Scopes:** `sync` | `api` | `posts` | `ui` | `deps` | `pwa`

### Branches

```
main        ← production, deployed to Vercel
feature/*   ← new features (PR required)
fix/*       ← bug fixes
chore/*     ← maintenance
```

Không commit trực tiếp vào `main`.

---

## 9. Thư viện

### Approved

| Thư viện | Mục đích |
|---------|---------|
| `next` 15.x | Framework |
| `geist` | Font + Design System |
| `gray-matter` | Parse MDX frontmatter |
| `next-mdx-remote/rsc` | Render MDX (Server Components) |
| `rehype-pretty-code` + `shiki` | Syntax highlighting |
| `rehype-slug` + `rehype-autolink-headings` | Heading anchors |
| `@notionhq/client` | Notion API (sync only) |
| `notion-to-md` | Notion blocks → Markdown |
| `@vercel/blob` | Re-host Notion images |
| `@vercel/kv` | View counter, subscribers, sync state |
| `pagefind` | Static search index |
| `next-themes` | Dark/light mode |
| `clsx` + `tailwind-merge` | Conditional Tailwind classes |
| `@serwist/next` | PWA / Service Worker |
| `resend` | Email newsletter |
| `prettier-plugin-tailwindcss` | Sort Tailwind classes |

### Không dùng (và thay thế)

| Không dùng | Thay bằng | Lý do |
|-----------|---------|-------|
| `axios` | `fetch` native | Next.js extends native fetch |
| `moment` / `date-fns` | `Intl.DateTimeFormat` / ISO string | ISO 8601 đủ dùng |
| `lodash` | Native ES2022+ | Không cần dependency thêm |
| `styled-components` / `emotion` | Tailwind | Conflict với Geist approach |
| `redux` / `zustand` | URL state + Server Components | Không có global state phức tạp |
| `react-query` | Next.js fetch + Server Components | SSG không cần client fetch |
| `@mui/*` / `shadcn/ui` | Geist + custom | Conflict với design tối giản |
| `next-pwa` | `@serwist/next` | Không maintain cho App Router |
| `jest` | Vitest | ESM compatibility tốt hơn |

**Quy tắc thêm thư viện mới:** Kiểm tra native alternative → bundle size (bundlephobia.com) → last publish + weekly downloads → thêm vào bảng trên trước khi `npm install`.

---

## 10. Bảo mật

### Secrets

- **Không commit `.env`** (trong `.gitignore`). **Commit `.env.example`** với placeholder.
- Tất cả secrets qua Vercel Environment Variables.
- Không log secret trong bất kỳ `console.*` hay error response.
- Validate secrets tại module load time (fail fast), không tại mỗi request.

### API Security patterns

```typescript
// 1. Webhook — verify HMAC trước khi parse body
const rawBody = await request.text()            // đọc raw
if (!verifyHmac(rawBody, signature)) return 401 // verify
const payload = JSON.parse(rawBody)             // parse sau

// 2. Constant-time comparison (tránh timing attack)
import { timingSafeEqual } from 'crypto'
const safe = timingSafeEqual(Buffer.from(a), Buffer.from(b))

// 3. Input validation tại API boundary
const SLUG_REGEX = /^[a-z0-9-]+$/
if (!SLUG_REGEX.test(slug)) return 400

// 4. Không expose internal error
console.error('details:', err)                  // log đầy đủ server-side
return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
```

### Error response format (RFC 7807)

```json
{
  "type": "https://<domain>/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or missing Authorization header",
  "instance": "/api/sync"
}
```

Content-Type: `application/problem+json`

---

## 11. Error Handling

### Nguyên tắc

| Nguyên tắc | |
|-----------|--|
| Validate sớm | Kiểm tra input tại system boundary (API route, CLI entry point) — không deep trong business logic |
| Fail fast | Throw rõ ràng thay vì silent fail hoặc trả về `null`/`undefined` giả mạo "success" |
| Atomic operation | Sync pipeline: lỗi ở bất kỳ bước → throw lên caller, không ghi file bán phần |
| Batch isolation | `syncAll`: 1 bài lỗi → log + continue, không abort toàn batch |
| No swallow | Không `catch` rồi bỏ qua (`catch {}`) — ít nhất phải `console.error` |

### API Routes — Error response

Dùng RFC 7807 (`application/problem+json`) cho tất cả error:

```typescript
// src/lib/api-error.ts
import { NextResponse } from 'next/server'

export function apiError(
  status: number,
  code: string,
  title: string,
  detail: string,
  instance: string
) {
  return NextResponse.json(
    { type: `/errors/${code}`, title, status, detail, instance },
    { status, headers: { 'Content-Type': 'application/problem+json' } }
  )
}

// Usage
return apiError(401, 'unauthorized', 'Unauthorized', 'Invalid Authorization header', '/api/sync')
return apiError(409, 'sync-in-progress', 'Sync đang chạy', 'Thử lại sau 120 giây.', '/api/sync')
```

**HTTP status codes dùng trong project:**

| Status | Code slug | Tình huống |
|--------|----------|-----------|
| 400 | `invalid-request` | Body thiếu field, email sai format, slug không hợp lệ |
| 401 | `unauthorized` | Secret sai hoặc thiếu header — dùng cho mọi auth failure |
| 404 | `not-found` | Slug không tồn tại hoặc bài chưa publish |
| 409 | `sync-in-progress` | Gọi `/api/sync` khi mutex lock đang active |
| 500 | `internal-error` | Lỗi không lường trước — không expose stack trace |

### Sync Pipeline — Error handling pattern

```typescript
// syncPost: atomic — lỗi bất kỳ bước → throw
export async function syncPageObject(page: PageObjectResponse): Promise<void> {
  const slug = getTextProp(page.properties.Slug)
  try {
    const markdown = await pageToMarkdown(page.id)     // step 1
    const content = await reHostMarkdownImages(markdown, slug) // step 2
    await writePost(slug, page, content)               // step 3
  } catch (err) {
    // Re-throw với context — caller (syncAll) sẽ log và continue
    throw new Error(`syncPost failed for ${slug}: ${err instanceof Error ? err.message : err}`)
  }
}

// syncAll: batch isolation — 1 lỗi không block các bài khác
export async function syncAll() {
  const results = { synced: 0, skipped: 0, failed: 0, failedSlugs: [] as string[] }
  for (const page of pages) {
    try {
      await syncPageObject(page)
      results.synced++
    } catch (err) {
      console.error(JSON.stringify({ slug, error: String(err), timestamp: new Date().toISOString() }))
      results.failed++
      results.failedSlugs.push(slug)
    }
  }
  return results
}
```

### Structured logging format

Mọi log trong sync pipeline dùng JSON (không plain text):

```typescript
// ✅ Structured log
console.error(JSON.stringify({
  timestamp: new Date().toISOString(),
  trigger: 'webhook' | 'cron' | 'manual',
  pageId: 'abc123',
  slug: 'post-slug',
  result: 'failed',
  durationMs: 1234,
  error: 'Error message (không có stack trace, không có secret)',
}))

// ❌ Plain text (khó parse)
console.error(`Sync failed for ${slug}: ${err.message}`)
```

Secrets và token **không bao giờ** xuất hiện trong log.

### TypeScript Error handling

```typescript
// Unknown type trong catch — narrow trước khi dùng
catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(message)
}

// Custom error class khi cần phân biệt error type
class SyncError extends Error {
  constructor(public readonly slug: string, message: string) {
    super(message)
    this.name = 'SyncError'
  }
}
```

---

## 12. Performance Checklist

Chạy trước khi merge tính năng UI mới:

**Images**
- [ ] Dùng `next/image`, không `<img>`
- [ ] Cover image (LCP element) có `priority` prop
- [ ] Mọi `<Image>` có `width` + `height`
- [ ] Ảnh re-hosted sang Vercel Blob (không Notion signed URL)

**Bundle**
- [ ] Component mới là Server Component (kiểm tra không có `'use client'` thừa)
- [ ] Third-party embeds dùng `next/dynamic` + lazy loading

**CLS**
- [ ] Mọi ảnh có kích thước rõ ràng (không layout shift)
- [ ] Font dùng `next/font` (font-display managed)

**Core Web Vitals targets**

| Metric | Target |
|--------|--------|
| LCP | ≤ 2.5s |
| CLS | ≤ 0.1 |
| INP | ≤ 200ms |
| Lighthouse Performance (mobile) | ≥ 95 |
| Build time (50 bài) | ≤ 60s |
