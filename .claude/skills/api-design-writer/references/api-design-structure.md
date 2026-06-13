# Cấu trúc Tài liệu API Design (Tầng 1)

Tài liệu này mô tả chi tiết 6 section của API Design Tầng 1, kèm hướng dẫn viết và ví dụ tốt/xấu.

**Nhắc lại nguyên tắc phân tầng:** Tầng 1 (tài liệu này) = convention + contract-level. Tầng 2 (sinh từ code) = schema chi tiết từng field. Không lẫn lộn.

---

## Header & Revision History

```markdown
# API Design Document
## For {{tên hệ thống/dự án}}

Version 1.0
Prepared by {{tác giả}}
{{tổ chức}}
{{ngày}}

Liên quan: {{link SRS nếu có}}

## Revision History
| Date       | Version | Author | Changes |
|------------|---------|--------|---------|
| 2026-06-12 | 1.0     | ...    | Initial |
```

---

## Section 1 — Tổng quan & Resource Model

**Mục tiêu:** Đặt tên các "danh từ" chính của API và quan hệ giữa chúng. Người đọc phải hiểu hệ thống expose những gì mà không cần đọc code.

### Nội dung cần có

- **Base URL** và môi trường: production, staging, local dev
- **Danh sách resource chính** — tên số nhiều (plural), path cơ sở
- **Quan hệ giữa resource** — nested hay independent, ownership

### Ví dụ tốt

```markdown
## Base URL
- Production:  https://api.example.com/v1
- Staging:     https://api-staging.example.com/v1
- Local:       http://localhost:8000/v1

## Resources

| Resource        | Path                       | Mô tả                          |
|-----------------|----------------------------|--------------------------------|
| Users           | /users                     | Tài khoản người dùng           |
| Orders          | /orders                    | Đơn hàng của user              |
| Order Items     | /orders/{id}/items         | Sản phẩm trong đơn (nested)    |
| Products        | /products                  | Danh mục sản phẩm (independent)|

**Quan hệ:** Order Items là sub-resource của Orders (không tồn tại độc lập).
Products là independent resource — có thể query không qua Orders.
```

### Ví dụ xấu — sai tầng

```markdown
## Users Resource
POST /users
Request body:
  - name: string (required)
  - email: string (required, unique)
  - password: string (min 8 chars)
Response: { id, name, email, created_at }
```
> **Sai:** Đây là schema chi tiết — thuộc Tầng 2 (OpenAPI). Tầng 1 chỉ liệt kê resource tồn tại, không mô tả từng field.

---

## Section 2 — Conventions

**Mục tiêu:** Quy định nhất quán cho toàn API. Đây là phần "luật lệ" mà mọi engineer phải tuân theo khi thêm endpoint mới.

### 2.1 Naming

**Resource path:**
- Số nhiều (plural): `/orders`, `/products`, không phải `/order`, `/product`
- Kebab-case cho multi-word: `/payment-methods`, không phải `/paymentMethods`
- Lowercase: không dùng uppercase trong path

**Field name trong JSON:**
- Chọn 1 style duy nhất cho toàn API: `snake_case` hoặc `camelCase`
- Ghi rõ lý do chọn trong `conventions-checklist.md`

**Date/time:**
- Tên field kết thúc bằng `_at`: `created_at`, `updated_at`, `deleted_at`
- Format: ISO 8601 UTC — `"2026-06-12T10:00:00Z"`
- Không dùng Unix timestamp trong response (khó debug)

**ID:**
- Kiểu dữ liệu: opaque string (UUID v4 hoặc ULID)
- Không bao giờ tái sử dụng ID đã xóa
- Không expose internal database ID (integer sequence) trực tiếp

### 2.2 Versioning

- Version trong path: `/v1/...`, `/v2/...`
- Tăng major version khi có breaking change (xóa field, đổi kiểu dữ liệu, đổi auth)
- Additive changes (thêm field optional) KHÔNG cần tăng version
- Hỗ trợ version cũ tối thiểu {{N}} tháng sau khi release version mới — ghi rõ ở đây

### 2.3 Pagination

**Chọn 1 trong 2 strategy, ghi lý do:**

**Offset-based** (đơn giản, phù hợp data nhỏ/vừa, user cần "nhảy trang"):
```
GET /products?limit=20&offset=40
Response: { data: [...], total: 150, limit: 20, offset: 40 }
```

**Cursor-based** (hiệu năng tốt hơn với data lớn/real-time, không hỗ trợ nhảy trang):
```
GET /orders?limit=20&cursor=eyJpZCI6...
Response: { data: [...], next_cursor: "eyJpZCI6...", has_more: true }
```

Xem `conventions-checklist.md` để chọn strategy phù hợp.

### 2.4 HTTP Methods

| Method | Dùng cho | Idempotent |
|--------|----------|------------|
| GET    | Đọc resource | Có |
| POST   | Tạo resource mới | Không |
| PUT    | Thay thế hoàn toàn | Có |
| PATCH  | Cập nhật một phần | Không (theo convention) |
| DELETE | Xóa resource | Có |

---

## Section 3 — Authentication & Authorization

**Mục tiêu:** Mô tả strategy và flow cấp cao. Chi tiết token format/claim → Tầng 2.

### Nội dung cần có

- **Mechanism:** Bearer token (JWT), API Key, OAuth2, v.v.
- **Flow cấp cao:** Cách client lấy token và đính kèm vào request
- **Scopes/permissions** nếu có phân quyền
- **Token expiry và refresh** strategy (nếu JWT)

### Ví dụ tốt

```markdown
## Authentication

**Mechanism:** Bearer JWT — header `Authorization: Bearer <token>`

**Lấy token:** POST /v1/auth/token với credentials → nhận access_token (15 phút)
và refresh_token (7 ngày). Xem Tầng 2 để biết request/response schema chi tiết.

**Refresh:** POST /v1/auth/refresh với refresh_token → nhận access_token mới.
Refresh token chỉ dùng 1 lần (rotation).

## Authorization

Role-based: `admin`, `member`, `readonly`
- Endpoint có yêu cầu role đặc biệt → ghi chú trong bảng endpoint (Section 5)
- Mặc định: mọi authenticated user đều có quyền đọc resource của chính họ
```

### Ví dụ xấu

```markdown
JWT payload: { sub: "user_id", email: "...", roles: [...], iat: ..., exp: ... }
```
> **Sai:** JWT payload structure thuộc Tầng 2. Tầng 1 chỉ nêu strategy, không expose internal token structure.

---

## Section 4 — Error Handling

**Mục tiêu:** Quy định format lỗi thống nhất toàn API theo RFC 7807 + danh sách error code dùng chung.

### RFC 7807 — Problem Details for HTTP APIs

Mọi error response PHẢI dùng format sau:

```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Field 'email' is required and must be a valid email address.",
  "instance": "/v1/users/register#req-abc123"
}
```

**5 trường bắt buộc:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `type` | URI | Định danh loại lỗi — URL đến trang mô tả lỗi (có thể là placeholder `about:blank` nếu chưa có) |
| `title` | string | Tóm tắt ngắn, không thay đổi theo instance (dùng để log/monitor) |
| `status` | integer | HTTP status code |
| `detail` | string | Mô tả cụ thể cho instance này (hiển thị cho người dùng hoặc developer) |
| `instance` | URI | URI định danh request cụ thể gây ra lỗi (dùng để trace) |

**Trường extension (tùy chọn):**
```json
{
  "type": "...",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Multiple fields failed validation.",
  "instance": "...",
  "errors": [
    { "field": "email", "message": "Required field missing" },
    { "field": "phone", "message": "Invalid format" }
  ]
}
```

### HTTP Status Code sử dụng

| Code | Tình huống |
|------|-----------|
| 200 OK | Thành công, có body |
| 201 Created | Tạo resource thành công — header `Location` chứa URL resource mới |
| 204 No Content | Thành công, không có body (DELETE, một số PUT) |
| 400 Bad Request | Request không đúng format / thiếu field bắt buộc |
| 401 Unauthorized | Chưa xác thực hoặc token hết hạn |
| 403 Forbidden | Đã xác thực nhưng không có quyền |
| 404 Not Found | Resource không tồn tại |
| 409 Conflict | Conflict với state hiện tại (vd: duplicate email) |
| 422 Unprocessable Entity | Request đúng format nhưng validation fail |
| 429 Too Many Requests | Rate limit |
| 500 Internal Server Error | Lỗi phía server — không expose detail nội bộ |

### Error Code chung (dùng trong `type`)

| Code | HTTP | Tình huống |
|------|------|-----------|
| `validation-failed` | 422 | Input validation fail |
| `resource-not-found` | 404 | Resource không tồn tại |
| `unauthorized` | 401 | Token không hợp lệ / hết hạn |
| `forbidden` | 403 | Không có quyền |
| `conflict` | 409 | Duplicate hoặc state conflict |
| `rate-limited` | 429 | Vượt rate limit |
| `internal-error` | 500 | Lỗi server nội bộ |

---

## Section 5 — Danh sách Endpoint (Tổng quan)

**Mục tiêu:** Bảng tổng quan các endpoint — đủ để biết API làm được gì và link sang Tầng 2 để xem chi tiết.

**KHÔNG viết:** request/response body, query params đầy đủ, validation rules — những thứ này thuộc Tầng 2.

### Format bảng

```markdown
## Endpoint Overview

### Users

| Method | Path                | Mô tả                          | Auth | Tầng 2 |
|--------|---------------------|--------------------------------|------|--------|
| POST   | /v1/auth/token      | Đăng nhập, lấy access token   | Không | [spec](/docs#post-/v1/auth/token) |
| POST   | /v1/users           | Tạo tài khoản mới              | Không | [spec](/docs#post-/v1/users) |
| GET    | /v1/users/me        | Lấy thông tin user hiện tại   | JWT  | [spec](/docs#get-/v1/users/me) |
| PATCH  | /v1/users/me        | Cập nhật profile               | JWT  | [spec](/docs#patch-/v1/users/me) |

### Orders

| Method | Path                | Mô tả                          | Auth | Tầng 2 |
|--------|---------------------|--------------------------------|------|--------|
| GET    | /v1/orders          | Danh sách đơn hàng của user   | JWT  | [spec](/docs#get-/v1/orders) |
| POST   | /v1/orders          | Tạo đơn hàng mới              | JWT  | [spec](/docs#post-/v1/orders) |
| GET    | /v1/orders/{id}     | Chi tiết một đơn hàng         | JWT  | [spec](/docs#get-/v1/orders/{id}) |
| DELETE | /v1/orders/{id}     | Hủy đơn hàng (soft delete)    | JWT, owner | [spec](/docs#delete-/v1/orders/{id}) |
```

**Ghi chú cột Auth:**
- `Không` — public endpoint
- `JWT` — cần Bearer token
- `JWT, admin` — cần token và role admin
- `JWT, owner` — chỉ chủ resource mới có quyền

---

## Section 6 — Tham chiếu

```markdown
## Tham chiếu

### Tầng 2 — API Specification (Single Source of Truth)
- Swagger UI (staging): https://api-staging.example.com/docs
- OpenAPI JSON export: `docs/openapi_v1.json` (export định kỳ từ FastAPI)
- Hướng dẫn generate: `make export-openapi`

### Tài liệu liên quan
- SRS: `docs/srs.md` (REQ-INT-001 → REQ-INT-0xx mô tả các API requirement)
- ADR về versioning: `docs/adr/ADR-003-api-versioning.md`

### Chuẩn tham chiếu
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
```

---

## Checklist self-review

```
CẤU TRÚC
□ Đủ 6 section; section không áp dụng ghi "N/A — lý do"
□ Revision history được khởi tạo
□ Base URL đủ 3 môi trường (prod, staging, local)

PHÂN TẦNG
□ Không có schema request/response chi tiết từng field trong Tầng 1
□ Mọi endpoint trong Section 5 đều có link sang Tầng 2
□ Section 6 có link tới OpenAPI spec thực tế (hoặc placeholder rõ ràng)

CONVENTIONS
□ Tất cả convention có rationale trong conventions-checklist.md
□ Field naming style (snake_case/camelCase) nhất quán — đã chọn 1
□ Pagination strategy đã chọn — đã ghi lý do
□ Date/time field dùng hậu tố `_at` + ISO 8601

ERROR HANDLING
□ Format RFC 7807 với đủ 5 trường bắt buộc
□ Có danh sách error code chung (ít nhất 5 code)
□ Status code mapping nhất quán với bảng HTTP Methods

AUTH
□ Mechanism đã xác định rõ (JWT/API Key/OAuth2)
□ Refresh strategy có nếu dùng JWT
□ Role/scope đã liệt kê nếu có phân quyền
```
