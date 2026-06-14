# Database Design — Blog cá nhân về lập trình

**Version:** 1.0
**Date:** 2026-06-14
**Status:** Approved
**Liên kết:** [SRS](030_srs.md) | [TAD](040_tad.md) | [API Design](050_api_design.md)

---

## 1. Tổng quan

### 1.1 Phạm vi

Blog này không sử dụng relational database truyền thống. Dữ liệu được lưu trữ ở **4 tầng** khác nhau:

| Tầng | Công nghệ | Nội dung | Vai trò |
|------|----------|---------|---------|
| **Content Source** | Notion Database | Bài viết gốc (source of truth) | Tác giả viết và quản lý |
| **Content Cache** | MDX files trong Git | Bài viết đã sync (build input) | Build-time read, không gọi Notion |
| **Runtime State** | Vercel KV (Redis) | View counters, subscribers, sync state | Low-latency runtime |
| **Binary Assets** | Vercel Blob | Ảnh re-hosted từ Notion | CDN, URL bền vĩnh |

### 1.2 Quyết định thiết kế chính

**Không có relational DB** — lý do:
- Nội dung là SSG (static), không cần DB query tại runtime
- Notion đã là CMS đầy đủ cho tác giả
- Vercel KV đủ cho view counter và newsletter subscriber list
- Relational DB sẽ tăng chi phí vận hành mà không mang lại lợi ích tương xứng

**Traceability:** Notion Database → `<!-- REQ-FUNC-016, REQ-FUNC-017, REQ-FUNC-018 -->`

---

## 2. Notion Database — "Posts"

### 2.1 Schema

Database duy nhất trong Notion, tên: **Posts**

```dbml
// Notation: DBML-style mô tả Notion database
// Notion không có FK theo nghĩa SQL, nhưng có property types tương đương

Table posts {
  id          string      [pk, note: "Notion page ID (UUID), opaque"]
  title       string      [not null, note: "Title property — tiêu đề bài viết"]
  slug        string      [unique, not null, note: "Text property — URL path segment, kebab-case"]
  status      select      [not null, note: "Select: Draft | Published | Archived"]
  tags        multi_select [note: "Multi-select — danh sách tag, mỗi tag là label string"]
  date        date        [note: "Date property — ngày xuất bản (YYYY-MM-DD)"]
  excerpt     string      [note: "Text property — mô tả ngắn, dùng cho SEO meta description"]
  cover       file        [note: "Files & media property — ảnh bìa (Notion hosted, signed URL)"]
  
  // Notion-managed metadata (không phải property, có trong page object)
  created_time      timestamp [note: "Auto-managed by Notion"]
  last_edited_time  timestamp [note: "Auto-managed by Notion — dùng để detect thay đổi khi sync"]
}
```

### 2.2 Data Dictionary

| Property | Type | Nullable | Mô tả nghiệp vụ | Ràng buộc |
|---------|------|---------|----------------|----------|
| `id` | Notion Page ID (UUID string) | No | Định danh duy nhất của page trong Notion. Opaque — không expose ra URL public. | Immutable, assigned by Notion |
| `title` | Text (plain_text) | No | Tiêu đề bài viết, hiển thị trên trang web và SEO title. | - |
| `slug` | Text (plain_text) | No | URL-safe identifier, dùng làm path `/posts/<slug>`. Phải unique trong database. | kebab-case, chỉ `[a-z0-9-]`, unique |
| `status` | Select | No | Trạng thái xuất bản. `Draft` = chưa công bố; `Published` = đang hiển thị; `Archived` = ẩn. | Enum: Draft \| Published \| Archived |
| `tags` | Multi-select | Yes | Danh sách chủ đề của bài. Dùng để lọc, trang tag, và filter sync. | Mỗi tag: chữ thường, không dấu, kebab-case khuyến nghị |
| `date` | Date | Yes | Ngày xuất bản chính thức, dùng để sort "mới nhất". Nếu null → dùng `created_time`. | ISO 8601 date (YYYY-MM-DD) |
| `excerpt` | Text (plain_text) | Yes | Đoạn mô tả ngắn (~150-160 ký tự), dùng cho `<meta description>` và card preview. | Max 200 ký tự khuyến nghị |
| `cover` | Files & media | Yes | Ảnh bìa. Notion trả về signed URL (hết hạn sau vài giờ) → sync pipeline re-host sang Vercel Blob. | Notion signed URL → replace bằng Blob URL |
| `last_edited_time` | ISO 8601 timestamp | No | Thời điểm Notion ghi nhận lần chỉnh sửa cuối. Dùng để phát hiện thay đổi trong `syncAll`. | Auto-managed by Notion |

### 2.3 Notes

- **`slug` uniqueness:** Notion không enforce unique constraint — tác giả tự đảm bảo. Nếu trùng slug → sync ghi đè file → lỗi hiển thị. Nên thêm Notion formula/validation nếu có thể.
- **`Archived` status:** File MDX được giữ lại với `status: archived`. Bài bị ẩn khỏi listing; truy cập trực tiếp → redirect 302 về `/`; truy cập với `?debug=<DRAFT_SECRET>` → hiển thị với ribbon "Archived". (REQ-FUNC-029)
- **Block content:** Nội dung bài viết (paragraphs, headings, code blocks, images) là Notion blocks — không có trong properties, được fetch riêng qua Blocks API và convert sang Markdown bởi `notion-to-md`.

---

## 3. MDX Frontmatter — Content Cache

MDX files trong `content/posts/*.mdx` là **cache trung gian** giữa Notion và build. Đây là input duy nhất của `next build` (REQ-BUILD-001).

### 3.1 Schema

```yaml
---
title: "Tiêu đề bài viết"
slug: "tieu-de-bai-viet"
status: "published"          # published | archived
tags:
  - nextjs
  - performance
date: "2026-06-14"           # ISO 8601 date
excerpt: "Mô tả ngắn dùng cho SEO..."
cover: "https://<blob-url>/posts/cover-image.jpg"   # Vercel Blob URL (permanent)
notionPageId: "abc123-def456-..."                   # Notion page ID gốc
notionLastEditedTime: "2026-06-14T10:00:00.000Z"   # Dùng để detect stale trong syncAll
viewCount: 142                                      # Snapshot từ KV, update mỗi lần sync
---

<!-- Nội dung Markdown/MDX bên dưới -->
```

### 3.2 Data Dictionary

| Field | Type | Nullable | Nguồn | Mô tả |
|-------|------|---------|-------|-------|
| `title` | string | No | Notion `title` | Tiêu đề bài viết |
| `slug` | string | No | Notion `slug` | URL path, dùng làm tên file và route |
| `status` | enum | No | Notion `status` (mapped) | `published` hoặc `archived` (Draft không được sync ra file) |
| `tags` | string[] | Yes | Notion `tags` | Danh sách tag, dùng để filter tại build time |
| `date` | string (YYYY-MM-DD) | Yes | Notion `date` | Ngày xuất bản; null → sort theo `notionLastEditedTime` |
| `excerpt` | string | Yes | Notion `excerpt` | SEO description |
| `cover` | string (URL) | Yes | Vercel Blob (re-hosted từ Notion) | Blob URL bền vĩnh, không hết hạn |
| `notionPageId` | string | No | Notion page ID | Dùng để link ngược về Notion nếu cần debug |
| `notionLastEditedTime` | string (ISO 8601) | No | Notion `last_edited_time` | Dùng trong `syncAll` để skip bài không thay đổi |
| `viewCount` | integer | No (default: 0) | Vercel KV `views:<slug>` | Snapshot view count, cập nhật mỗi lần sync; dùng để sort "phổ biến nhất" tại build time |

### 3.3 Sync Rules

- **`viewCount`:** Không bao giờ reset về 0. Khi sync, đọc giá trị hiện tại từ KV và ghi vào frontmatter. Nếu KV không có key → giữ nguyên giá trị cũ trong file.
- **`status`:** Chỉ `Published` → `published` trong MDX. `Draft` không được tạo file. `Archived` → giữ file với `status: archived`, ẩn khỏi listing (REQ-FUNC-029).
- **Diff check:** Sync chỉ ghi file nếu nội dung thực sự thay đổi (so sánh hash hoặc string diff) — tránh commit thừa (REQ-FUNC-021).

---

## 4. Vercel KV — Runtime State

Vercel KV là Redis-compatible key-value store. Tất cả keys follow convention `<namespace>:<identifier>`.

### 4.1 Key Patterns

```
views:<slug>              → STRING (integer, view count)
newsletter:subscribers    → SET (set of email strings)
sync:last_run             → STRING (ISO 8601 timestamp)
sync:running              → STRING ("1", với TTL 120s — mutex lock)
```

### 4.2 Data Dictionary

| Key Pattern | Type | TTL | Mô tả | Nguồn | Đọc bởi |
|------------|------|-----|-------|-------|---------|
| `views:<slug>` | STRING (integer) | Không có | Số lượt xem của bài `<slug>`. Tăng qua `INCR` khi `/api/view` được gọi. | `/api/view` | `syncAll` (ghi vào MDX), `/api/view` (trả về cho client) |
| `newsletter:subscribers` | SET | Không có | Tập hợp email đã đăng ký nhận thông báo. Dùng Redis SET để tự deduplicate. | `/api/newsletter` | Job gửi newsletter (Resend) |
| `sync:last_run` | STRING | Không có | Timestamp lần sync cuối thành công. Dùng để filter Notion query `last_edited_time >`. | `syncAll`, `syncPost` | `syncAll` (khi khởi động) |
| `sync:running` | STRING | **120s** | Mutex lock. Tồn tại = đang có sync chạy. TTL tự xóa sau 120s nếu process crash. | `/api/sync`, `syncAll` | `/api/sync` (check trước khi chạy) |

### 4.3 Notes

- **`sync:running` TTL:** 120s đủ cho `syncAll` với ~50 bài (worst case ~10s/bài × 50 = 500s → cần review nếu scale). Hiện tại: estimate < 30 bài, ~5s/bài → safe với 120s. (REQ-FUNC-028)
- **`newsletter:subscribers` privacy:** Không expose qua API. Chỉ Job gửi mail được đọc. Không log danh sách này (REQ-COMP-001).
- **Vercel KV free tier:** 256MB storage, 30,000 requests/month. Với scale hiện tại (<100 bài, <1000 subscribers) đủ dùng.

---

## 5. Vercel Blob — Binary Assets

### 5.1 Cấu trúc

Vercel Blob lưu ảnh được re-host từ Notion. Notion cung cấp signed URL hết hạn sau vài giờ — sync pipeline download và upload lên Blob để có URL permanent.

```
Blob URL pattern:
  https://<blob-store-id>.public.blob.vercel-storage.com/posts/<slug>/<filename>

Ví dụ:
  https://abc123.public.blob.vercel-storage.com/posts/nextjs-performance/cover.jpg
  https://abc123.public.blob.vercel-storage.com/posts/nextjs-performance/inline-image-1.png
```

### 5.2 Metadata

| Field | Giá trị | Mô tả |
|-------|---------|-------|
| `pathname` | `posts/<slug>/<original-filename>` | Path trong Blob store |
| `contentType` | `image/jpeg`, `image/png`, `image/webp`, v.v. | MIME type của ảnh |
| `url` | URL public permanent | Thay thế Notion signed URL trong MDX |

### 5.3 Notes

- **Không xóa ảnh cũ tự động:** Nếu tác giả thay ảnh trong Notion → sync upload ảnh mới, URL mới. Ảnh cũ vẫn còn trong Blob (tốn storage). Cleanup thủ công khi cần.
- **Cover image:** Được xử lý cùng flow với inline images trong content.
- **Vercel Blob free tier:** 500MB storage. Với blog cá nhân (<500 bài, ảnh resize qua `next/image`) đủ dùng lâu dài.

---

## 6. Relationships & Data Flow

```
Tác giả viết bài
    │
    ▼
Notion "Posts" Database
    │  (Notion Webhook hoặc Cron trigger)
    │
    ▼
syncPost(pageId) / syncAll()
    ├─ Fetch page properties từ Notion API
    ├─ Fetch blocks → notion-to-md → Markdown string
    ├─ Download ảnh Notion → upload Vercel Blob → replace URLs
    ├─ Đọc viewCount từ Vercel KV `views:<slug>`
    └─ Ghi content/posts/<slug>.mdx (nếu có thay đổi)
         │
         ▼
    GitHub commit → Vercel deploy
         │
         ▼
    next build (đọc content/posts/*.mdx)
         │
         ├─ Sinh static pages /posts/[slug]
         ├─ Pagefind build search index
         └─ Serwist build service worker
                  │
                  ▼
         Người đọc truy cập blog
              │
              ├─ POST /api/view → KV INCR views:<slug>
              └─ POST /api/newsletter → KV SADD newsletter:subscribers
```

---

## 7. Indexing Strategy

### 7.1 Notion (không áp dụng index SQL)
- Query chính: `filter: { property: "Status", select: { equals: "Published" } }` + `filter: { timestamp: "last_edited_time", last_edited_time: { after: <sync:last_run> } }`
- Notion tự optimize query trên database properties. Không có index tùy chỉnh.

### 7.2 MDX Files (filesystem)
- `next build` đọc tất cả `.mdx` files một lần (glob pattern)
- Filter/sort/pagination xử lý in-memory tại build time (số lượng nhỏ, đủ nhanh)
- Không có index filesystem

### 7.3 Vercel KV
- `views:<slug>`: O(1) INCR/GET by key
- `newsletter:subscribers`: O(1) SADD/SISMEMBER, O(N) SMEMBERS khi gửi mail
- `sync:last_run`, `sync:running`: O(1) GET/SET/DEL

### 7.4 Pagefind Search Index
- Build tại `next build` phase sau khi static pages đã được render
- Index file: `public/_pagefind/` — client-side query, không cần server
- Tìm kiếm: inverted index theo term; không cần config thêm

---

## 8. Migration & Versioning

### 8.1 Notion Schema

Notion schema thay đổi ảnh hưởng đến sync pipeline. Quy trình khi thêm/đổi property:

1. Thêm property trong Notion
2. Cập nhật TypeScript type trong `src/lib/notion-sync/client.ts`
3. Cập nhật `syncPost` để map property mới sang frontmatter
4. Cập nhật MDX frontmatter schema (tài liệu này, Section 3.1)
5. Chạy `syncAll` manual để backfill tất cả bài hiện có

### 8.2 MDX Frontmatter

Thêm field mới vào frontmatter: backward compatible (file cũ không có field → code phải handle `undefined` với default).

Xóa field: cần `syncAll` để cleanup file cũ (hoặc để lại — không ảnh hưởng build nếu code không đọc).

### 8.3 Vercel KV

Thêm key pattern mới: không cần migration (Redis schema-free). Ghi chú key mới vào Section 4.

Xóa key pattern: dọn dẹp thủ công qua Vercel dashboard hoặc script nếu cần.

---

## Phụ lục: OD-2 — Resolved (v1.1)

**Quyết định:** Giữ file MDX với `status: archived`. Bài bị ẩn khỏi mọi listing công khai. URL trực tiếp → redirect 302 về `/`. URL với `?debug=<DRAFT_SECRET>` → hiển thị nội dung đầy đủ với ribbon "Archived" (chỉ tác giả biết secret).

Xem REQ-FUNC-029 trong SRS.
