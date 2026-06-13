# Conventions Checklist — Bảng quyết định API Design

Dùng file này khi cần đưa ra quyết định convention cho dự án cụ thể. Với mỗi hạng mục: chọn 1 option, ghi lý do vào cột "Lý do chọn" của tài liệu.

---

## Cách dùng

Khi viết tài liệu API Design, copy bảng quyết định bên dưới vào `api-design.md` hoặc file `conventions-decisions.md` riêng, sau đó điền cột "Quyết định" và "Lý do" cho từng hạng mục.

Mọi hạng mục phải có lý do — "convention mặc định" không phải lý do.

---

## Bảng quyết định

| Hạng mục | Các lựa chọn | Câu hỏi để quyết định | Quyết định | Lý do |
|----------|-------------|----------------------|------------|-------|
| **Field naming** | `snake_case` / `camelCase` | Frontend dùng JS/TS nhiều? Backend là Python? | _(điền)_ | _(điền)_ |
| **Pagination** | Offset-based / Cursor-based | Data có real-time update? Cần nhảy trang? | _(điền)_ | _(điền)_ |
| **ID format** | UUID v4 / ULID / Nanoid | Cần sortable by time? Cần ngắn? | _(điền)_ | _(điền)_ |
| **Versioning** | Path (`/v1`) / Header / Query param | Có clients không thể set header? | `/v1` trong path | Dễ nhìn, dễ route, Zalando recommend |
| **Soft delete** | Soft (flag `deleted_at`) / Hard delete | Cần audit trail? Cần khôi phục? | _(điền)_ | _(điền)_ |
| **List endpoint empty** | `[]` / `{ data: [], total: 0 }` | Client cần total count? Có pagination? | _(điền)_ | _(điền)_ |
| **Partial update** | PATCH (partial) / PUT (full replace) | Client thường chỉ update 1-2 field? | _(điền)_ | _(điền)_ |
| **Boolean field prefix** | `is_active` / `active` | Nhất quán với field naming style? | _(điền)_ | _(điền)_ |
| **Nested vs flat resource** | Nested (`/orders/{id}/items`) / Flat (`/order-items?order_id=`) | Item có thể tồn tại độc lập không? | _(điền)_ | _(điền)_ |
| **Error detail language** | Tiếng Anh / Tiếng Việt / Theo locale | Client có i18n? End-user thấy error không? | _(điền)_ | _(điền)_ |

---

## Hướng dẫn từng hạng mục

### Field naming: snake_case vs camelCase

**Chọn `snake_case` khi:**
- Backend là Python (FastAPI, Django) — Pydantic dùng snake_case mặc định, tránh alias
- Team backend-heavy, frontend dùng adapter
- Nhất quán với database column names

**Chọn `camelCase` khi:**
- Frontend là JavaScript/TypeScript-first
- Dùng GraphQL song song (GraphQL convention là camelCase)
- SDK generate cho JS/TS clients

**Không được:** trộn lẫn snake_case và camelCase trong cùng một API version.

---

### Pagination: Offset-based vs Cursor-based

**Chọn Offset-based khi:**
- Dataset nhỏ/vừa (< 100k records)
- User cần nhảy đến trang bất kỳ ("trang 5 của 20")
- Admin dashboard, report, export
- Simple implementation — ưu tiên khi MVP

Response format:
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 40
}
```

**Chọn Cursor-based khi:**
- Data lớn hoặc append-only (feed, log, timeline)
- Real-time data — offset bị lệch khi insert/delete giữa 2 trang
- Performance quan trọng — không cần `COUNT(*)`

Response format:
```json
{
  "data": [...],
  "next_cursor": "eyJpZCI6IjEyMyIsImNyZWF0ZWRfYXQiOiIyMDI2In0=",
  "has_more": true
}
```

**Không được:** để cursor là database ID hoặc offset — phải opaque (base64 encoded).

---

### ID format

**UUID v4** (ngẫu nhiên, không sortable):
- Dùng khi: không cần sort by creation time, ecosystem support tốt (PostgreSQL gen_random_uuid())
- Ví dụ: `"550e8400-e29b-41d4-a716-446655440000"`

**ULID** (sortable by time, monotonic):
- Dùng khi: cần sort by creation time mà không cần timestamp field, index locality tốt hơn UUID
- Ví dụ: `"01ARZ3NDEKTSV4RRFFQ69G5FAV"`
- Library: `python-ulid`, `ulid-ts`

**Quy tắc chung (bất kể format nào):**
- Luôn là string trong JSON — không expose integer sequence
- Không có thông tin đoán được về business logic
- Không tái sử dụng ID đã xóa

---

### RFC 7807 — Cách điền `type` URI

`type` phải là URI hợp lệ. 3 cách phổ biến:

**Option A — URL thực đến trang documentation (tốt nhất):**
```
"type": "https://api.example.com/errors/validation-failed"
```
Trang này giải thích lỗi, cách xử lý, ví dụ. Dùng khi có docs site.

**Option B — URN namespace của dự án (chấp nhận được):**
```
"type": "urn:example:api:errors:validation-failed"
```
Stable identifier, không cần URL thực.

**Option C — `about:blank` (dùng tạm khi chưa có docs):**
```
"type": "about:blank",
"title": "Validation Failed"
```
RFC 7807 cho phép, nhưng chỉ dùng tạm — title phải chuẩn hơn để compensate.

---

### Soft Delete

**Dùng Soft Delete khi:**
- Cần audit trail (ai xóa, khi nào)
- User có thể cần khôi phục
- Resource có foreign key từ bảng khác (tránh orphan references)
- Compliance/legal yêu cầu giữ data

Field: `deleted_at: "2026-06-12T10:00:00Z"` (null nếu chưa xóa)

**API behavior với soft delete:**
- GET /resources — mặc định KHÔNG trả về deleted records
- GET /resources?include_deleted=true — chỉ admin
- DELETE endpoint set `deleted_at`, trả về 204

**Dùng Hard Delete khi:**
- Data không cần giữ lại (cache, temp records)
- GDPR right-to-erasure — cần xóa thực sự

---

### Nested vs Flat resource

**Nested** (`/orders/{id}/items`):
- Dùng khi: item **không thể tồn tại** độc lập ngoài parent
- URL rõ ràng về ownership
- Không nest quá 2 cấp (`/a/{id}/b/{id}/c` → khó dùng)

**Flat** (`/order-items?order_id={id}`):
- Dùng khi: item có thể được query từ nhiều parent khác nhau
- Dễ thêm filter phức tạp hơn
- Cần khi client muốn bulk query nhiều parents

**Rule of thumb:** Nếu client luôn biết parent ID khi truy cập child → nested phù hợp hơn.

---

## Zalando Guidelines — điểm chính áp dụng cho dự án nhỏ/vừa

Dưới đây là tóm tắt các rule từ Zalando RESTful API Guidelines phù hợp nhất, kèm link section:

| Rule | Nội dung |
|------|---------|
| MUST use HTTP methods correctly | GET = read-only, idempotent; POST = create; PUT = full replace; PATCH = partial update; DELETE = delete |
| MUST use standard HTTP status codes | Dùng đúng code — không dùng 200 cho lỗi |
| MUST use lowercase kebab-case in path | `/payment-methods` không phải `/paymentMethods` |
| MUST pluralize resource names | `/orders` không phải `/order` |
| SHOULD use snake_case for query params | `?sort_by=created_at` |
| MUST use ISO 8601 for date/time | `"2026-06-12T10:00:00Z"` |
| SHOULD use problem JSON (RFC 7807) | Format lỗi thống nhất |
| MUST support pagination for list resources | Không trả về unlimited list |
| SHOULD use `cursor`-based pagination for large/real-time data | Tránh offset khi data > 100k |
| MUST NOT use actions in URL paths | `/orders/{id}/cancel` → PATCH `/orders/{id}` với `{ "status": "cancelled" }` |
| MUST version API via path | `/v1/...` |
| SHOULD avoid breaking changes | Thêm field mới là backward-compatible; xóa field là breaking |

Nguồn đầy đủ: https://opensource.zalando.com/restful-api-guidelines/
