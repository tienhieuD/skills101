---
name: db-design-writer
description: Hướng dẫn viết tài liệu Database Design (tài liệu #7 trong SDLC, sau SRS, song song với API Design) — không phụ thuộc DBMS cụ thể. Sử dụng skill này khi user yêu cầu viết, tạo, hoặc cải thiện tài liệu database design, ERD, data dictionary, schema design, hoặc cần chuẩn hóa thiết kế cơ sở dữ liệu trước khi code. Cũng dùng khi user hỏi về naming convention cho table/column, quan hệ giữa entity, indexing strategy, hoặc thiết kế vector store cho hệ thống RAG/AI.
---

# DB Design Writer — Tài liệu Database Design

Skill này hướng dẫn viết tài liệu Database Design DBMS-agnostic. Tài liệu này đứng sau SRS, song song với API Design trong SDLC.

**Không có chuẩn ISO/IEEE chặt** cho tài liệu này (khác SRS-29148). Cấu trúc dựa trên convention/notation phổ biến trong ngành.

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **ERD dùng notation Crow's Foot** — de facto standard, mọi ERD tool hiện đại đều hỗ trợ. Viết bằng DBML (Database Markup Language) để version-control được dưới dạng text, render ERD hình ảnh qua dbdiagram.io.

2. **Data Dictionary mô tả 2 chiều cho mỗi field:**
   - *Business meaning* — câu mô tả ngôn ngữ tự nhiên: field này đại diện cho cái gì trong nghiệp vụ
   - *Technical spec* — kiểu dữ liệu, constraint, nullable, default. Ở tài liệu gốc này dùng kiểu **generic** (STRING, INTEGER, TIMESTAMP, BOOLEAN). Nếu có skill DBMS-specific, dùng kiểu cụ thể từ skill đó.

3. **Naming convention (snake_case, DBMS-agnostic):**
   - Table name: số nhiều (`orders`, `users`) — không dùng prefix `tbl_`
   - Primary key: `id` (opaque, không expose sequence integer ra ngoài)
   - Foreign key: `<singular_table>_id` (vd: `user_id`, `order_id`)
   - Timestamp: hậu tố `_at` + UTC — `created_at`, `updated_at`, `deleted_at` — đồng bộ với API Design convention
   - Boolean: hậu tố `is_` hoặc `has_` (`is_active`, `has_invoice`)

4. **Vector Store (cho hệ thống AI/RAG): section riêng, không lẫn vào ERD.** Mô tả: collection/index name, metadata fields, embedding dimension, distance metric (cosine/L2/dot product). Không vẽ vector store vào ERD relational.

5. **Traceability:** mỗi table/entity nên trace được về REQ-ID trong SRS (nếu project đã có SRS). Ghi chú `<!-- REQ-FUNC-001 -->` ở phần DBML hoặc Data Dictionary.

6. **Skill mở rộng DBMS-specific:** nếu user xác định DBMS cụ thể (PostgreSQL, MySQL, SQLite...), kiểm tra xem có skill `db-design-<dbms>-writer` tương ứng không. Nếu có — đọc thêm skill đó để lấy convention/kiểu dữ liệu/index type cụ thể. **Không tự đoán** syntax DBMS-specific nếu không có skill đó.

## Quy trình viết

### Bước 1 — Thu thập input
Hỏi user: domain và entity chính của hệ thống, đã có SRS (REQ-ID) và API Design chưa, có dùng vector store không, DBMS cụ thể là gì (để quyết định có cần load skill mở rộng).

### Bước 2 — Đọc cấu trúc
Đọc `references/db-design-structure.md` trước khi viết. File này mô tả 8 section chi tiết kèm ví dụ. KHÔNG viết tài liệu mà chưa đọc.

### Bước 3 — Vẽ ERD bằng DBML
Đọc `references/erd-dbml-guide.md` để viết DBML đúng syntax và convention Crow's Foot. Vẽ ERD trước Data Dictionary — ERD là nguồn sự thật cho quan hệ giữa entity.

### Bước 4 — Điền Data Dictionary
Mỗi table cần bảng 2 chiều: business meaning + technical spec. Dùng kiểu generic nếu không có skill DBMS-specific; ghi rõ `<!-- DBMS-specific: điền kiểu cụ thể khi chọn DBMS -->` tại chỗ cần bổ sung.

### Bước 5 — Self-review
Kiểm tra: (a) mỗi table trace được về REQ-ID nếu có SRS; (b) vector store (nếu có) ở section riêng, không lẫn vào ERD; (c) FK naming nhất quán; (d) timestamp fields dùng hậu tố `_at`.

## Cấu trúc output

```
1. Tổng quan             — phạm vi, DBMS được chọn, liên kết SRS/TAD
2. ERD                   — DBML source + link/hình render Crow's Foot
3. Data Dictionary       — bảng 2 chiều: business meaning + technical spec
4. Naming Conventions    — quy ước đặt tên
5. Relationships &
   Referential Integrity — FK, ON DELETE/UPDATE behavior (ý định, không syntax cụ thể)
6. Indexing Strategy     — placeholder generic; chi tiết do skill DBMS-specific
7. Non-Relational /
   Vector Store          — nếu áp dụng
8. Migration & Versioning — chiến lược quản lý thay đổi schema (tool-agnostic)
```

Hai chế độ output:
- **Monolithic:** 1 file `db-design.md` (mặc định)
- **Breakout:** `db-design.md` làm index + `erd/schema.dbml` + `dict/<table>.md` riêng (dự án nhiều domain)

## Ngôn ngữ & quy ước

Viết tiếng Việt theo mặc định. Giữ tiếng Anh cho: tên table/field, kiểu dữ liệu, keyword SQL, tên convention, DBML syntax.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Bắt đầu viết hoặc chuẩn hóa DB design có sẵn | `references/db-design-structure.md` |
| Viết DBML hoặc vẽ ERD | `references/erd-dbml-guide.md` |
| Định nghĩa quan hệ FK và referential integrity | Cả hai — Section 5 trong db-design-structure + DBML relationships trong erd-dbml-guide |
| User hỏi naming convention | `references/db-design-structure.md` Section 4 |
| Hệ thống dùng vector store | `references/db-design-structure.md` Section 7 |
