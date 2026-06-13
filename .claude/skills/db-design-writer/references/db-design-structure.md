# Cấu trúc Tài liệu Database Design

Chi tiết 8 section của DB Design Document, kèm hướng dẫn viết và ví dụ tốt/xấu.

---

## Header & Revision History

```markdown
# Database Design Document
## For {{tên hệ thống/dự án}}

Version 1.0
Prepared by {{tác giả}}
{{tổ chức}}
{{ngày}}

Liên quan:
- SRS: {{link hoặc "chưa có"}}
- API Design: {{link hoặc "chưa có"}}
- TAD: {{link hoặc "chưa có"}}

## Revision History
| Date       | Version | Author | Changes |
|------------|---------|--------|---------|
| 2026-06-12 | 1.0     | ...    | Initial |
```

---

## Section 1 — Tổng quan

**Mục tiêu:** Đặt bối cảnh cho toàn bộ tài liệu — ai đọc, hệ thống gồm những store nào, liên kết sang tài liệu liên quan.

### Nội dung cần có

- **Phạm vi:** tài liệu này cover những store nào (relational DB, vector store, cache schema?)
- **DBMS được chọn:** tên và version (hoặc "chưa xác định — dùng kiểu generic")
- **Liên kết sang SRS/TAD/API Design** để người đọc hiểu ngữ cảnh

### Ví dụ tốt

```markdown
## Tổng quan

Tài liệu này mô tả schema database cho hệ thống **Orders Management v1**.

**Stores trong scope:**
- Relational DB (PostgreSQL 16) — dữ liệu nghiệp vụ chính
- Vector Store (ChromaDB) — embedding sản phẩm cho tính năng tìm kiếm ngữ nghĩa

**Ngoài scope:** Redis cache schema (tài liệu riêng), S3 object structure.

**Tài liệu liên quan:**
- SRS: docs/srs.md — entity này map sang REQ-FUNC-001 → REQ-FUNC-015
- API Design: docs/api-design.md — resource model đồng bộ với ERD
```

---

## Section 2 — ERD (Entity-Relationship Diagram)

**Mục tiêu:** Hiển thị các entity và quan hệ giữa chúng bằng Crow's Foot notation.

### Nội dung cần có

1. DBML source code (text, version-controllable) — xem `erd-dbml-guide.md`
2. Link đến hình render hoặc hướng dẫn generate: "Import DBML vào dbdiagram.io để xem sơ đồ"
3. Ghi chú REQ-ID traceability ngay trong DBML comments

### Ví dụ tốt

```markdown
## ERD

DBML source: `erd/schema.dbml` (hoặc inline bên dưới)

Render: import vào [dbdiagram.io](https://dbdiagram.io) hoặc chạy `make erd`.

```dbml
// REQ-FUNC-001: User registration and authentication
Table users {
  id          varchar(26) [pk, note: "ULID"]
  email       varchar(255) [unique, not null]
  is_active   boolean [not null, default: true]
  created_at  timestamp [not null]
  updated_at  timestamp [not null]
  deleted_at  timestamp [null, note: "Soft delete"]
}

// REQ-FUNC-010: Order management
Table orders {
  id          varchar(26) [pk]
  user_id     varchar(26) [ref: > users.id, not null]
  status      varchar(50) [not null]
  total_amount integer [not null, note: "Đơn vị: VND cent"]
  created_at  timestamp [not null]
  updated_at  timestamp [not null]
}

Table order_items {
  id          varchar(26) [pk]
  order_id    varchar(26) [ref: > orders.id, not null]
  product_id  varchar(26) [ref: > products.id, not null]
  quantity    integer [not null]
  unit_price  integer [not null]
}
```
```

### Ví dụ xấu

```markdown
## ERD
[Hình ảnh ERD dán vào tài liệu — không có source]
```
> **Sai:** Hình ảnh không version-controllable, không diff được. Phải có DBML source.

---

## Section 3 — Data Dictionary

**Mục tiêu:** Mô tả rõ ràng ý nghĩa của từng field theo **2 chiều**:
- *Business meaning* — câu mô tả nghiệp vụ, không phụ thuộc kỹ thuật
- *Technical spec* — kiểu dữ liệu, constraint, nullable, default

### Format bảng

```markdown
### Table: orders

**Mô tả:** Đơn hàng do user tạo. Một user có thể có nhiều đơn.
**Trace:** REQ-FUNC-010, REQ-FUNC-011

| Field        | Business Meaning                                | Type        | Nullable | Default | Constraint          |
|-------------|------------------------------------------------|-------------|----------|---------|---------------------|
| id          | Định danh duy nhất của đơn hàng               | STRING(26)  | No       | —       | PK                  |
| user_id     | User đã tạo đơn hàng này                       | STRING(26)  | No       | —       | FK → users.id       |
| status      | Trạng thái hiện tại: pending/paid/shipped/cancelled | STRING(50) | No    | pending | CHECK (enum)        |
| total_amount| Tổng tiền đơn hàng, tính bằng đơn vị nhỏ nhất | INTEGER     | No       | —       | > 0                 |
| created_at  | Thời điểm đơn hàng được tạo                    | TIMESTAMP   | No       | NOW()   | UTC                 |
| updated_at  | Thời điểm record cuối cùng được cập nhật       | TIMESTAMP   | No       | NOW()   | UTC, auto-update    |
```

**Kiểu dữ liệu generic** (dùng khi không có skill DBMS-specific):

| Generic Type | Ý nghĩa |
|-------------|---------|
| `STRING(n)` | Chuỗi ký tự, độ dài tối đa n |
| `TEXT` | Chuỗi dài, không giới hạn độ dài |
| `INTEGER` | Số nguyên |
| `DECIMAL(p,s)` | Số thực, p digits tổng, s digits thập phân |
| `BOOLEAN` | true/false |
| `TIMESTAMP` | Ngày giờ có timezone (UTC) |
| `DATE` | Ngày (không có giờ) |
| `JSONB` | Dữ liệu JSON (chú thích: cần DBMS-specific skill cho kiểu này) |

> Ghi chú `<!-- DBMS-specific: điền kiểu cụ thể khi chọn DBMS -->` tại các trường dùng `JSONB` hay kiểu đặc thù.

### Ví dụ xấu — thiếu business meaning

| Field | Type | Notes |
|-------|------|-------|
| status | VARCHAR(50) | order status |

> **Sai:** "order status" không giải thích gì thêm. Business meaning phải nói rõ: các giá trị là gì, ý nghĩa từng giá trị, ai/khi nào thay đổi.

---

## Section 4 — Naming Conventions

**Mục tiêu:** Quy ước đặt tên nhất quán toàn schema. Copy và điền cho dự án cụ thể.

```markdown
## Naming Conventions

### Table
- Số nhiều, snake_case: `users`, `order_items`, `payment_methods`
- Không dùng prefix: không `tbl_users`, không `t_users`
- Junction table: ghép tên 2 bảng: `user_roles`, `product_tags`

### Column
- snake_case: `first_name`, `is_active`, `total_amount`
- Primary key: luôn là `id`
- Foreign key: `<singular_table>_id` — `user_id`, `product_id`, `order_id`
- Timestamp: hậu tố `_at` — `created_at`, `updated_at`, `deleted_at`
- Boolean: prefix `is_` hoặc `has_` — `is_active`, `is_verified`, `has_invoice`
- Enum/status field: dùng string, không integer code — `status = 'pending'` thay vì `status = 1`

### Tránh
- Tên trùng keyword SQL: `name`, `order`, `status` (dùng `full_name`, `order_status`)
- Viết tắt không rõ ràng: `usr_id`, `amt`, `qty` → dùng `user_id`, `amount`, `quantity`
- CamelCase: `userId`, `OrderItem` → không dùng cho table/column
```

---

## Section 5 — Relationships & Referential Integrity

**Mục tiêu:** Mô tả ý định của từng quan hệ FK — xử lý thế nào khi parent bị xóa/update. Chi tiết syntax (CASCADE, RESTRICT...) do skill DBMS-specific bổ sung hoặc được ghi trong migration.

### Bảng quan hệ

```markdown
## Relationships

| FK (child.field) | References | On Delete | On Update | Lý do |
|-----------------|------------|-----------|-----------|-------|
| orders.user_id → users.id | users | RESTRICT | CASCADE | Không xóa order khi user bị xóa — cần giữ lịch sử |
| order_items.order_id → orders.id | orders | CASCADE | CASCADE | Item không tồn tại độc lập ngoài order |
| order_items.product_id → products.id | products | RESTRICT | CASCADE | Không xóa product nếu còn order item tham chiếu |
```

### Các behavior cần xác định rõ

| Behavior | Ý nghĩa | Khi nào dùng |
|----------|---------|-------------|
| RESTRICT | Từ chối xóa/update parent nếu còn child | Muốn giữ toàn vẹn dữ liệu, cần xử lý thủ công |
| CASCADE | Tự xóa/update child khi parent thay đổi | Child không có giá trị độc lập (vd: order_items khi order bị xóa) |
| SET NULL | Set FK = NULL khi parent bị xóa | Child có thể tồn tại "mồ côi" (vd: comment khi user bị xóa) |
| NO ACTION | Tương tự RESTRICT nhưng defer check | Dùng khi cần circular FK hoặc deferred constraint |

### Soft delete và FK

Nếu dùng soft delete (`deleted_at`), cần quyết định rõ: query mặc định có lọc `deleted_at IS NULL` không? FK có point đến soft-deleted record không? Ghi rõ quyết định này.

---

## Section 6 — Indexing Strategy

**Mục tiêu:** Xác định index nào cần có, tại sao — không phụ thuộc kiểu index cụ thể của DBMS.

```markdown
## Indexing Strategy

### Index mặc định (tự động)
- Primary key → index tự động
- Unique constraint → unique index tự động

### Index cần tạo thêm

| Table | Field(s) | Lý do | Loại (generic) |
|-------|---------|-------|----------------|
| orders | user_id | Query "đơn hàng của user X" là hot path | Index thường |
| orders | status, created_at | Filter + sort trong danh sách đơn hàng | Composite index |
| users | email | Login lookup, unique | Unique index (đã có qua UNIQUE constraint) |
| order_items | order_id | JOIN với orders | Index thường |

<!-- DBMS-specific: điền loại index cụ thể (B-tree, GIN, BRIN...) khi dùng skill mở rộng -->
```

**Nguyên tắc chung:**
- Index mọi FK column (không phải tất cả DBMS tự làm)
- Index các field thường xuất hiện trong WHERE, ORDER BY của hot queries
- Composite index: put cột có selectivity cao nhất lên đầu
- Tránh over-index — mỗi index làm chậm INSERT/UPDATE

---

## Section 7 — Non-Relational / Vector Store

**Bắt buộc nếu hệ thống dùng vector DB.** Không ép vào ERD relational.

### Format mô tả Vector Store

```markdown
## Vector Store

**Engine:** ChromaDB (embedded) / Pinecone / FAISS — {{điền}}

### Collection: product_embeddings

**Mục đích:** Lưu embedding sản phẩm cho tính năng tìm kiếm ngữ nghĩa.
**Trace:** REQ-ML-001

| Thuộc tính | Giá trị | Ghi chú |
|-----------|---------|---------|
| Embedding model | text-embedding-3-small | OpenAI, 1536 dims |
| Dimension | 1536 | Phải khớp model |
| Distance metric | cosine | Phù hợp text similarity |
| Chunk strategy | 512 tokens, overlap 50 | Tham chiếu SRS REQ-ML-002 |

**Metadata fields** (đi kèm mỗi vector):

| Field | Type | Mô tả |
|-------|------|-------|
| product_id | string | FK reference sang products.id trong relational DB |
| product_name | string | Denormalized để hiển thị kết quả không cần JOIN |
| category | string | Filter by category trước khi semantic search |
| chunk_index | integer | Thứ tự chunk nếu 1 product có nhiều chunks |
| indexed_at | timestamp | Thời điểm embedding được tạo/cập nhật |
```

**Lưu ý:**
- Luôn lưu `product_id` trong metadata để JOIN ngược về relational DB khi cần full data
- Denormalize chỉ những field dùng trong filter hoặc display — không denormalize toàn bộ
- Ghi rõ embedding model và version — thay đổi model = phải re-index toàn bộ

---

## Section 8 — Migration & Versioning

**Mục tiêu:** Quy ước quản lý thay đổi schema — tool-agnostic ở tài liệu gốc này.

```markdown
## Migration & Versioning

### Nguyên tắc
- Không sửa schema trực tiếp trên production — mọi thay đổi qua migration file
- Mỗi migration: 1 thay đổi logic, có thể rollback
- Migration file đặt tên: `YYYYMMDDHHMMSS_describe_change.sql` hoặc theo tool convention
- Không xóa column ngay — deprecate trước (đổi tên thành `_deprecated_<field>`), xóa sau N sprint

### Breaking change vs Non-breaking

| Thay đổi | Loại | Xử lý |
|---------|------|-------|
| Thêm column nullable | Non-breaking | Deploy trực tiếp |
| Thêm column NOT NULL không có default | Breaking | Cần migration 2 bước: thêm nullable → backfill → thêm constraint |
| Xóa column | Breaking | Deprecate trước, xóa sau khi code không còn dùng |
| Đổi kiểu dữ liệu | Breaking | Thêm column mới → migrate data → xóa cũ |
| Đổi tên table/column | Breaking | Alias/view bridge trong transition period |

### Tool recommendation
<!-- DBMS-specific skill sẽ đề xuất tool cụ thể (Alembic cho SQLAlchemy/Python,
     Flyway/Liquibase cho Java, Rails migrations...) -->
```

---

## Checklist self-review

```
CẤU TRÚC
□ Đủ 8 section; section không áp dụng ghi "N/A — lý do"
□ Revision history được khởi tạo
□ Liên kết tới SRS/TAD/API Design (hoặc ghi "chưa có")
□ Hệ thống có vector store → Section 7 đầy đủ

ERD
□ DBML source có trong tài liệu (không chỉ hình ảnh)
□ REQ-ID comment trong DBML cho mỗi table chính (nếu có SRS)
□ Mọi FK trong DBML có ký hiệu ref đúng syntax

DATA DICTIONARY
□ Mỗi table có mô tả 1 câu + REQ-ID trace
□ Mỗi field có cả business meaning lẫn technical spec
□ Kiểu generic được dùng khi không có DBMS-specific skill; có chú thích placeholder
□ Không có field mô tả mơ hồ như "user info", "order data"

NAMING
□ Table name: plural, snake_case, không prefix
□ PK: `id` (không phải `user_id`, `order_id` trong bảng của chính nó)
□ FK: `<singular_table>_id`
□ Timestamp: hậu tố `_at`
□ Boolean: prefix `is_` hoặc `has_`

RELATIONSHIPS
□ Bảng FK có cột On Delete và On Update với lý do
□ Soft delete: quyết định rõ về query default và FK behavior

VECTOR STORE (nếu có)
□ Collection riêng, không lẫn vào ERD
□ Có đủ: embedding model + dimension + distance metric
□ Metadata fields có `<entity>_id` để join về relational DB
```
