# API Design — Blog cá nhân về lập trình

**Version:** 1.0
**Date:** 2026-06-14
**Status:** Approved
**Liên kết:** [SRS](030_srs.md) | [TAD](040_tad.md)

---

## 1. Tổng quan & Resource Model

### 1.1 Phạm vi

Tài liệu này mô tả **Tầng 1 API Design** — conventions, auth strategy, error format, và danh sách endpoint tổng quan cho các internal API routes của blog. Đây không phải public API; tất cả routes đều phục vụ mục đích vận hành (sync, webhook, preview, analytics).

Tầng 2 (schema request/response chi tiết từng field) được sinh tự động từ TypeScript + Next.js Route Handler types.

### 1.2 Kiến trúc API

Blog này **không có public REST API** truyền thống. Toàn bộ nội dung được phục vụ qua SSG (Static Site Generation) — Next.js build đọc MDX files local, không có API nào trả dữ liệu bài viết cho client.

Các routes tồn tại thuộc một trong hai loại:

| Loại | Mô tả | Routes |
|------|-------|--------|
| **Operational** | Trigger nội bộ, không có giao diện | `/api/notion-webhook`, `/api/cron-sync`, `/api/sync` |
| **User-facing** | Client-side gọi từ browser | `/api/draft`, `/api/view`, `/api/newsletter` |

### 1.3 Base URL

```
Production:  https://<blog-domain>
Preview:     https://<preview-url>.vercel.app
```

### 1.4 Resource Model

Không có resource model REST truyền thống. Các "resources" chính:

```
Post (nguồn sự thật: Notion → MDX files)
  └── views (Vercel KV: views:<slug>)
  └── preview (Draft Mode cookie)

Sync State (Vercel KV)
  └── sync:last_run
  └── sync:running (mutex)

Newsletter Subscriber (Vercel KV: newsletter:subscribers set)
```

---

## 2. Conventions

### 2.1 Naming

| Item | Convention | Ví dụ |
|------|-----------|-------|
| Route path | kebab-case, plural resource khi có | `/api/notion-webhook`, `/api/cron-sync` |
| Request/Response field | camelCase | `pageId`, `lastEditedTime`, `isSuccess` |
| Timestamp field | hậu tố `At` + ISO 8601 UTC | `syncedAt: "2026-06-14T02:00:00Z"` |
| ID | opaque string | `pageId: "abc123"` |

### 2.2 Versioning

Không áp dụng versioning (tất cả routes là internal). Nếu cần breaking change → đổi tên route mới, xóa route cũ sau khi xác nhận không còn traffic.

### 2.3 HTTP Methods

| Method | Dùng cho |
|--------|---------|
| `POST` | Trigger action (sync, view increment, subscribe) |
| `GET` | Lấy dữ liệu hoặc redirect (draft preview) |

### 2.4 Date / Time

Tất cả timestamp theo ISO 8601 UTC: `"2026-06-14T10:00:00.000Z"`. Notion trả `last_edited_time` theo format này — dùng trực tiếp, không convert.

### 2.5 Content-Type

- Request body: `application/json`
- Response: `application/json` (trừ `/api/draft` redirect)

---

## 3. Authentication & Authorization

### 3.1 Chiến lược

Không có authn người dùng cuối. Tất cả auth là **server-to-server static Bearer token**, mỗi endpoint dùng secret riêng biệt.

| Secret | Env var | Dùng cho |
|--------|---------|---------|
| Webhook signature | `NOTION_WEBHOOK_SECRET` | Xác thực Notion webhook payload |
| Cron token | `CRON_SECRET` | Vercel Cron → `/api/cron-sync` |
| Sync token | `SYNC_SECRET` | Manual trigger → `/api/sync` |
| Draft token | `DRAFT_SECRET` | Author preview bài chưa publish |

### 3.2 Auth Flow

**Notion Webhook** (`NOTION_WEBHOOK_SECRET`):
```
POST /api/notion-webhook
  Header: notion-signature: <HMAC-SHA256 của raw body>
  → Server tính lại HMAC → so sánh → reject nếu không khớp
```
Lý do dùng HMAC thay vì Bearer: đây là chuẩn Notion webhook, không thể thay đổi phía client.

**Cron / Manual Sync** (`CRON_SECRET`, `SYNC_SECRET`):
```
POST /api/cron-sync
POST /api/sync
  Header: Authorization: Bearer <secret>
  → So sánh với env var → reject 401 nếu sai
```

**Draft Preview** (`DRAFT_SECRET`):
```
GET /api/draft?secret=<DRAFT_SECRET>&slug=<slug>
  → So sánh secret → enable Draft Mode cookie → redirect /posts/<slug>
```

### 3.3 Ràng buộc bảo mật

- Ba secrets phân biệt: `CRON_SECRET` ≠ `SYNC_SECRET` ≠ `DRAFT_SECRET` (REQ-SEC-004)
- `DRAFT_SECRET` ≥ 32 ký tự ngẫu nhiên (REQ-SEC-002)
- Không log secret dưới bất kỳ hình thức nào (REQ-SEC-003)
- Mọi request không xác thực được → 401, không thực hiện thay đổi (REQ-SEC-001)

---

## 4. Error Handling

### 4.1 Format RFC 7807

Mọi error response dùng `Content-Type: application/problem+json`:

```json
{
  "type": "https://<blog-domain>/errors/<error-code>",
  "title": "Mô tả ngắn lỗi (human-readable)",
  "status": 401,
  "detail": "Chi tiết cụ thể cho lần gọi này",
  "instance": "/api/sync"
}
```

### 4.2 Error Codes chung

| HTTP Status | type (slug) | Tình huống |
|-------------|------------|-----------|
| `400 Bad Request` | `invalid-request` | Body thiếu field bắt buộc, email không hợp lệ |
| `401 Unauthorized` | `unauthorized` | Secret sai hoặc thiếu Authorization header |
| `404 Not Found` | `not-found` | Slug không tồn tại hoặc bài chưa publish |
| `409 Conflict` | `sync-in-progress` | Gọi `/api/sync` khi sync đang chạy (mutex) |
| `500 Internal Server Error` | `internal-error` | Lỗi không lường trước; không expose stack trace |

### 4.3 Nguyên tắc error handling

- **Không expose thông tin nhạy cảm** trong `detail` (key, path nội bộ, stack trace)
- **401 vs 403:** Dùng 401 cho tất cả auth failure (không phân biệt "chưa xác thực" vs "không có quyền" — đây là internal API)
- **Idempotency errors:** 409 chỉ dùng cho mutex conflict, không dùng cho duplicate resource
- **Sync partial failure:** Nếu syncAll xử lý 10 bài, 1 bài lỗi → log lỗi bài đó, tiếp tục bài khác, response vẫn 200 nhưng body ghi `failedSlugs: [...]`

---

## 5. Danh sách Endpoint (Tổng quan)

| Method | Path | Auth | Mô tả | REQ |
|--------|------|------|-------|-----|
| `POST` | `/api/notion-webhook` | HMAC signature | Nhận webhook từ Notion khi page thay đổi | REQ-FUNC-019 |
| `POST` | `/api/cron-sync` | Bearer CRON_SECRET | Vercel Cron trigger đồng bộ toàn bộ | REQ-FUNC-019 |
| `POST` | `/api/sync` | Bearer SYNC_SECRET | Manual trigger sync + mutex guard | REQ-FUNC-028 |
| `GET` | `/api/draft` | Query `secret` | Enable Draft Mode, redirect đến bài preview | REQ-FUNC-022 |
| `POST` | `/api/view` | None | Tăng view counter cho bài viết | REQ-FUNC-011 |
| `POST` | `/api/newsletter` | None | Đăng ký nhận email thông báo | REQ-FUNC-013 |

### 5.1 `/api/notion-webhook`

**Trigger:** Notion gửi khi page trong database "Posts" được cập nhật.

**Request:**
```
POST /api/notion-webhook
notion-signature: sha256=<hmac>
Content-Type: application/json

{
  "type": "page.updated",
  "entity": { "id": "<pageId>" },
  ...
}
```

**Flow:**
1. Đọc raw body (không parse trước khi verify)
2. Tính HMAC-SHA256 của raw body với `NOTION_WEBHOOK_SECRET`
3. So sánh với header `notion-signature` → 401 nếu sai
4. Xử lý `type === "page.updated"` → gọi `syncPost(pageId)`
5. Xử lý verification challenge (Notion gửi lần đầu) → trả token trong ≤ 3s
6. Các event khác → 200 (bỏ qua, không lỗi)

**Response:**
```json
200 OK
{ "synced": true, "slug": "bai-viet-slug" }
```

**Ràng buộc:** Phải respond ≤ 3s (Notion timeout). `syncPost` chạy background nếu cần.

### 5.2 `/api/cron-sync`

**Trigger:** Vercel Cron, mỗi ngày 2AM UTC (cấu hình trong `vercel.json`).

**Request:**
```
POST /api/cron-sync
Authorization: Bearer <CRON_SECRET>
```

**Flow:**
1. Verify Bearer token → 401 nếu sai
2. Gọi `syncAll()` — query Notion filter `last_edited_time > sync:last_run`
3. Cập nhật `sync:last_run` trong KV
4. Log kết quả (số bài sync, số lỗi)

**Response:**
```json
200 OK
{
  "synced": 3,
  "failed": 0,
  "syncedAt": "2026-06-14T02:00:00.000Z"
}
```

### 5.3 `/api/sync`

**Trigger:** Manual — tác giả gọi trực tiếp (curl, Postman, v.v.).

**Request:**
```
POST /api/sync
Authorization: Bearer <SYNC_SECRET>
```

**Flow:**
1. Verify Bearer `SYNC_SECRET` → 401 nếu sai
2. Check KV `sync:running` → 409 nếu tồn tại
3. Set KV `sync:running = "1"` với TTL 120s (mutex)
4. Gọi `syncAll()`
5. Cập nhật `sync:last_run`
6. Del `sync:running`

**Response thành công:**
```json
200 OK
{ "synced": 5, "failed": 0, "syncedAt": "2026-06-14T10:30:00.000Z" }
```

**Response khi mutex lock:**
```json
409 Conflict
Content-Type: application/problem+json
{
  "type": "https://<blog-domain>/errors/sync-in-progress",
  "title": "Sync đang chạy",
  "status": 409,
  "detail": "Một tiến trình sync khác đang chạy. Thử lại sau 120 giây.",
  "instance": "/api/sync"
}
```

### 5.4 `/api/draft`

**Trigger:** Tác giả nhấp link preview bài chưa publish.

**Request:**
```
GET /api/draft?secret=<DRAFT_SECRET>&slug=<slug>
```

**Flow:**
1. So sánh `secret` với `DRAFT_SECRET` env var → 401 nếu sai
2. `draftMode().enable()` — set secure cookie
3. Redirect `302` → `/posts/<slug>`
4. Trang `/posts/[slug]` detect Draft Mode → fetch live từ Notion API (kể cả bài Draft)

**Response:** `302 Redirect` đến `/posts/<slug>` (không có body JSON).

**Bảo mật:**
- Link preview KHÔNG xuất hiện trong sitemap, RSS, hoặc source code public (REQ-SEC-002)
- Cookie Draft Mode là httpOnly, secure

### 5.5 `/api/view`

**Trigger:** Client-side, gọi 1 lần khi trang bài viết load (`useEffect` hoặc Server Action).

**Request:**
```
POST /api/view
Content-Type: application/json

{ "slug": "bai-viet-slug" }
```

**Flow:**
1. Validate `slug` có trong danh sách MDX đã build (ngăn spam với slug bịa)
2. `KV.incr("views:<slug>")`
3. Chỉ tăng 1 lần/lượt tải trang — không tăng khi re-render cùng page

**Response:**
```json
200 OK
{ "views": 142 }
```

**Ràng buộc:** Không có rate limit phức tạp. Việc chỉ tăng 1 lần/page load được đảm bảo bởi `useEffect` chỉ chạy 1 lần (REQ-FUNC-011).

### 5.6 `/api/newsletter`

**Trigger:** Người đọc submit form đăng ký email.

**Request:**
```
POST /api/newsletter
Content-Type: application/json

{ "email": "reader@example.com" }
```

**Flow:**
1. Validate email format server-side (regex chuẩn) → 400 nếu không hợp lệ
2. Kiểm tra email đã tồn tại trong `newsletter:subscribers` → 200 (idempotent, không báo lỗi để tránh email enumeration)
3. Thêm vào KV set `newsletter:subscribers`
4. Gọi Resend API để gửi email xác nhận (có unsubscribe link)

**Response thành công:**
```json
200 OK
{ "subscribed": true }
```

**Response email không hợp lệ:**
```json
400 Bad Request
Content-Type: application/problem+json
{
  "type": "https://<blog-domain>/errors/invalid-request",
  "title": "Email không hợp lệ",
  "status": 400,
  "detail": "Địa chỉ email 'abc@' không đúng định dạng.",
  "instance": "/api/newsletter"
}
```

**Ràng buộc:**
- Email chỉ dùng để gửi thông báo bài mới, không chia sẻ bên thứ ba (REQ-COMP-001)
- Mỗi email gửi ra PHẢI có unsubscribe link (REQ-FUNC-013)
- Không expose danh sách subscriber qua bất kỳ API nào

---

## 6. Tham chiếu

| Tài liệu | Link |
|---------|------|
| SRS | [030_srs.md](030_srs.md) |
| TAD (kiến trúc sync pipeline) | [040_tad.md](040_tad.md) |
| RFC 7807 — Problem Details | https://www.rfc-editor.org/rfc/rfc7807 |
| Notion Webhook docs | https://developers.notion.com/docs/webhooks |
| Next.js Draft Mode | https://nextjs.org/docs/app/building-your-application/configuring/draft-mode |
| Resend API | https://resend.com/docs |
| Tầng 2 (OpenAPI) | Sinh tự động từ TypeScript types — xem `/docs` khi dev server chạy |

---

## Phụ lục: Conventions Decisions

| Quyết định | Lựa chọn | Rationale |
|-----------|---------|-----------|
| Field naming | camelCase | Nhất quán với TypeScript/Next.js ecosystem; JSON response không cần transform |
| Versioning | Không áp dụng | All routes internal; breaking change → rename route |
| Error format | RFC 7807 | IETF standard; `type` URL cho phép extend per-error metadata |
| Timestamp format | ISO 8601 UTC | Notion native format; không cần transform layer |
| Auth style | Static Bearer secret per route | Đủ cho internal API; không có user session cần quản lý |
| Pagination | Không áp dụng | Không có listing API — SSG đọc MDX trực tiếp |
| Webhook auth | HMAC-SHA256 (không Bearer) | Notion quy định format; không thể thay đổi phía client |
