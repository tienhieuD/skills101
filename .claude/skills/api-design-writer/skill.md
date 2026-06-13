---
name: api-design-writer
description: Hướng dẫn viết tài liệu API Design (tài liệu convention/contract-level, Tầng 1) cho REST API theo Zalando RESTful API Guidelines và RFC 7807. Sử dụng skill này khi user yêu cầu viết, tạo, hoặc cải thiện tài liệu API design, API contract, API convention, API specification cấp cao — không phải OpenAPI/Swagger chi tiết. Cũng dùng khi user hỏi về naming convention, error format, versioning, pagination strategy, hay cần chuẩn hóa API trước khi handoff sang dev.
---

# API Design Writer — Tài liệu API Convention/Contract (Tầng 1)

Skill này hướng dẫn viết **tài liệu API Design Tầng 1** — tài liệu viết tay, ổn định, không chứa schema chi tiết. Tài liệu này đứng sau SRS và trước khi code trong SDLC.

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **Phân tầng 2 lớp — nguyên tắc quan trọng nhất.**
   - **Tầng 1 (tài liệu này):** resource model, naming convention, error format, auth strategy, versioning, pagination. Ổn định, thay đổi ít. Viết tay.
   - **Tầng 2 (sinh từ code):** schema request/response chi tiết từng field, OpenAPI/Swagger export. Code là single source of truth.
   - Tài liệu Tầng 1 chỉ **point sang** Tầng 2 (link `/docs` hoặc `openapi_vN.json`), **không lặp lại** nội dung.
   - Nếu thấy mình đang viết request/response body đầy đủ từng field → sai tầng, dừng lại.

2. **Error format theo RFC 7807 (Problem Details for HTTP APIs).** Chuẩn IETF chính thức. Mọi error response dùng 5 trường: `type`, `title`, `status`, `detail`, `instance`.

3. **Naming convention dựa trên Zalando RESTful API Guidelines** — chỉ lấy phần áp dụng cho dự án nhỏ/vừa:
   - Resource path: plural, kebab-case (`/payment-methods`)
   - Field name: snake_case hoặc camelCase — chọn 1, nhất quán toàn API
   - Date/time field: hậu tố `_at` + ISO 8601 (`created_at: "2026-06-12T10:00:00Z"`)
   - ID: opaque string, ổn định, không tái sử dụng

4. **Versioning qua path:** `/v{n}/...` Ưu tiên tăng major version khi breaking change.

5. **FastAPI/Pydantic:** Pydantic models + route definitions tự sinh OpenAPI — đây là Tầng 2, không cần viết Swagger tay. Tài liệu này (Tầng 1) bổ sung phần convention và quyết định thiết kế mà code không tự sinh được.

## Quy trình viết

### Bước 1 — Thu thập input
Hỏi user: domain và resource chính của hệ thống, đã có SRS/REQ-ID chưa (để link traceability), framework backend dùng (để biết Tầng 2 sinh ra thế nào), và hệ thống đã có API chưa hay viết mới.

### Bước 2 — Đọc cấu trúc
Đọc `references/api-design-structure.md` trước khi viết. File này mô tả chi tiết 6 section và có ví dụ tốt/xấu cụ thể. KHÔNG viết tài liệu mà chưa đọc file này.

### Bước 3 — Điền Tầng 1 (6 section)
Viết từng section theo hướng dẫn trong `api-design-structure.md`. Với mọi convention cần quyết định (pagination style, field naming, v.v.) → đọc `references/conventions-checklist.md` để chọn và ghi rationale.

### Bước 4 — Điền conventions-checklist
Mỗi quyết định convention phải có lý do rõ ràng. Dùng bảng trong `conventions-checklist.md` làm template.

### Bước 5 — Self-review
Kiểm tra: (a) không có schema chi tiết bị lọt vào Tầng 1; (b) mọi endpoint đều có link Tầng 2; (c) mọi convention đã có rationale; (d) error format đúng RFC 7807.

## Cấu trúc output (Tầng 1)

```
1. Tổng quan & Resource Model    — danh sách resource chính, quan hệ, base URL
2. Conventions                    — naming, versioning, pagination, date/time
3. Authentication & Authorization — strategy, flow cấp cao, scope
4. Error Handling                 — format RFC 7807 + danh sách error code chung
5. Danh sách Endpoint (tổng quan) — bảng method / path / mô tả 1 câu / link Tầng 2
6. Tham chiếu                     — link OpenAPI spec, Swagger UI, SRS liên quan
```

Hai chế độ output:
- **Monolithic:** 1 file `api-design.md` (mặc định cho dự án nhỏ/vừa)
- **Breakout:** `api-design.md` làm index + file riêng cho từng resource lớn (dự án nhiều domain)

## Ngôn ngữ & quy ước

Viết tiếng Việt theo mặc định. Giữ nguyên tiếng Anh cho: HTTP method, status code, tên convention, tên trường/field, ví dụ code/JSON.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Bắt đầu viết hoặc chuẩn hóa API design có sẵn | `references/api-design-structure.md` |
| Cần quyết định convention cụ thể (naming, pagination, v.v.) | `references/conventions-checklist.md` |
| Viết section Error Handling | Cả hai — Section 4 trong api-design-structure + bảng RFC 7807 trong conventions-checklist |
| User hỏi "dùng offset hay cursor pagination?" | `references/conventions-checklist.md` phần Pagination |
