# PostgreSQL Conventions — Chi tiết kỹ thuật

Dùng file này để thay thế các placeholder generic trong tài liệu db-design-writer bằng kiểu dữ liệu, constraint, và index cụ thể của PostgreSQL.

---

## 1. Kiểu dữ liệu theo use-case

### Mapping từ kiểu generic sang PostgreSQL

| Generic | PostgreSQL | Ghi chú |
|---------|-----------|---------|
| `STRING(n)` | `VARCHAR(n)` | Khi có giới hạn rõ ràng |
| `STRING` (không giới hạn) | `TEXT` | Postgres không có overhead cho TEXT vs VARCHAR dài |
| `INTEGER` (nhỏ) | `INT` hoặc `INTEGER` | Alias nhau, 4 bytes, đến ~2.1 tỷ |
| `INTEGER` (lớn/ID lớn) | `BIGINT` | 8 bytes, đến ~9.2 × 10¹⁸ |
| `DECIMAL(p,s)` | `NUMERIC(p,s)` | Chính xác tuyệt đối; dùng cho tiền tệ |
| `BOOLEAN` | `BOOLEAN` | Giữ nguyên |
| `TIMESTAMP` | `TIMESTAMPTZ` | **Luôn dùng TIMESTAMPTZ** — xem chi tiết bên dưới |
| `DATE` | `DATE` | Giữ nguyên |
| `JSONB` | `JSONB` | Không dùng `JSON` — xem chi tiết bên dưới |

### ID — UUID vs SERIAL vs BIGSERIAL

**Dùng UUID khi:**
- Cần ID không đoán được (không expose quy luật tăng)
- Distributed system, có thể generate phía client
- Merge dữ liệu từ nhiều database

```sql
-- PostgreSQL 13+: gen_random_uuid() built-in, không cần extension
id UUID DEFAULT gen_random_uuid() PRIMARY KEY

-- PostgreSQL < 13: cần extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
```

**Dùng BIGSERIAL khi:**
- Dataset rất lớn, cần index locality tốt (UUID random làm B-tree fragmented)
- Internal tables không bao giờ expose ID ra API
- Cần sort-by-creation có hiệu năng cao

```sql
id BIGSERIAL PRIMARY KEY
```

**Không dùng SERIAL (INT)** — 2.1 tỷ rows là đủ gặp vấn đề với bảng lớn.

> **Rule of thumb:** API-facing resource → UUID. Internal/audit log → BIGSERIAL.

---

### TIMESTAMPTZ vs TIMESTAMP

**Luôn dùng TIMESTAMPTZ** (`TIMESTAMP WITH TIME ZONE`):
- PostgreSQL lưu nội bộ dưới dạng UTC, trả về theo timezone session
- TIMESTAMP (without TZ) không chuyển đổi khi timezone thay đổi → bug khó phát hiện

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
deleted_at  TIMESTAMPTZ           -- NULL nếu chưa xóa (soft delete)
```

> `NOW()` và `CURRENT_TIMESTAMP` trong PostgreSQL đều trả về TIMESTAMPTZ.

---

### VARCHAR vs TEXT

Trong PostgreSQL, **TEXT và VARCHAR không có sự khác biệt hiệu năng** (lưu trữ giống nhau). Quy ước chọn:

| Trường hợp | Dùng | Ví dụ |
|-----------|------|-------|
| Giới hạn nghiệp vụ rõ ràng | `VARCHAR(n)` | email `VARCHAR(255)`, country_code `CHAR(2)` |
| Không có giới hạn thực tế | `TEXT` | description, content, notes |
| Enum-like string cố định | `VARCHAR(50)` + CHECK | status, type với tập giá trị nhỏ |

---

### JSONB — khi nào dùng và khi nào không

**Dùng JSONB khi:**
- Cấu trúc field thực sự biến đổi theo record (vd: metadata của từng loại event)
- Schema thường xuyên thay đổi và thêm field mới theo từng row
- Cần query bên trong JSON với GIN index

```sql
-- Tốt: metadata của webhook event — mỗi loại event có cấu trúc khác nhau
event_payload JSONB NOT NULL

-- Tốt: user preferences — mỗi user có thể có preference khác nhau
preferences JSONB NOT NULL DEFAULT '{}'
```

**Không dùng JSONB khi:**
- Các field giống nhau trên mọi row → tách thành column riêng (queryable, indexable riêng)
- Cần GROUP BY, aggregate trên field trong JSON → rất chậm, khó đọc
- FK relationship → không thể đặt FK vào trong JSONB

```sql
-- Xấu: dùng JSONB để lưu thông tin người dùng có cấu trúc cố định
user_info JSONB  -- { "name": "...", "email": "...", "phone": "..." }

-- Tốt: tách ra column riêng
full_name VARCHAR(255) NOT NULL,
email     VARCHAR(255) UNIQUE NOT NULL,
phone     VARCHAR(20)
```

**GIN index cho JSONB:**
```sql
-- Index toàn bộ JSONB (phù hợp cho query ad-hoc)
CREATE INDEX idx_events_payload ON events USING GIN (event_payload);

-- Index một path cụ thể (hiệu quả hơn nếu query pattern rõ)
CREATE INDEX idx_events_type ON events USING GIN ((event_payload -> 'type'));
```

---

### ARRAY — khi nào dùng và khi nào không

**Dùng ARRAY khi:**
- Tập giá trị đơn giản, thuần nhất, không cần FK (vd: danh sách tag string, list email CC)
- Không cần query từng phần tử thường xuyên
- Append-only, không cần update từng phần tử

```sql
tags TEXT[] DEFAULT '{}',                    -- array of strings
notification_emails TEXT[] DEFAULT '{}'
```

**Không dùng ARRAY khi:**
- Các phần tử cần FK (vd: list of user_id → dùng junction table)
- Cần query "tìm tất cả record có phần tử X" thường xuyên
- Cần thêm metadata vào từng phần tử

```sql
-- Xấu: array of user_id không có FK guarantee
collaborator_ids UUID[] -- không thể đặt FK constraint

-- Tốt: junction table
CREATE TABLE project_collaborators (
  project_id UUID REFERENCES projects(id),
  user_id    UUID REFERENCES users(id),
  PRIMARY KEY (project_id, user_id)
);
```

---

### ENUM type vs CHECK constraint vs Lookup table

**Tóm tắt so sánh:**

| Cách | Ưu điểm | Nhược điểm | Dùng khi |
|------|---------|-----------|---------|
| PostgreSQL ENUM | Type-safe, index nhỏ | Khó thêm/xóa giá trị (cần ALTER TYPE), không thể dùng FK | Tập giá trị rất ổn định, không bao giờ thay đổi |
| CHECK constraint | Đơn giản, dễ thay đổi | Không có label/description, khó i18n | Tập giá trị nhỏ (< 10), có thể thêm/xóa |
| Lookup table | Linh hoạt nhất, có thể thêm metadata | Cần JOIN, phức tạp hơn | Cần label, description, thứ tự, hay thay đổi |

**Khuyến nghị cho dự án nhỏ/vừa: dùng VARCHAR + CHECK constraint:**
```sql
-- Đơn giản, dễ thêm giá trị sau (chỉ cần ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT)
status VARCHAR(50) NOT NULL DEFAULT 'pending'
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled'))
```

**Khi dùng PostgreSQL ENUM:**
```sql
-- Chỉ dùng khi tập giá trị THỰC SỰ cố định (vd: ngày trong tuần, giới tính theo ISO)
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

-- Thêm giá trị mới (không xóa được dễ dàng):
ALTER TYPE order_status ADD VALUE 'processing' AFTER 'paid';
```

---

## 2. Indexing PostgreSQL-specific

### Loại index và khi nào dùng

| Loại | Dùng cho | Ví dụ |
|------|---------|-------|
| **B-tree** (mặc định) | Equality, range, ORDER BY trên scalar | `=`, `<`, `>`, `BETWEEN`, `LIKE 'prefix%'` |
| **GIN** | JSONB, full-text search, array containment | `@>`, `?`, `@@`, `&&` |
| **GiST** | Geometric types, range types, full-text search | PostGIS, TSRANGE, tsvector |
| **BRIN** | Bảng rất lớn, dữ liệu có tương quan vật lý với vị trí lưu trữ | Timeseries, log tables sort by time |
| **Hash** | Chỉ equality (`=`), không hỗ trợ range | Hiếm dùng — B-tree gần như luôn tốt hơn |

### B-tree — phổ biến nhất

```sql
-- Single column
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Composite (thứ tự quan trọng: put column có selectivity cao nhất đầu)
CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);

-- Covering index (INCLUDE columns không dùng để filter nhưng tránh heap fetch)
CREATE INDEX idx_orders_user_covering ON orders (user_id) INCLUDE (status, total_amount);
```

### GIN — cho JSONB và full-text search

```sql
-- Index toàn bộ JSONB
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);

-- Full-text search
ALTER TABLE products ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))) STORED;
CREATE INDEX idx_products_search ON products USING GIN (search_vector);
```

### Partial index — index chỉ một tập hàng

```sql
-- Chỉ index các order chưa hoàn thành — nhỏ hơn nhiều, query nhanh hơn
CREATE INDEX idx_orders_pending ON orders (created_at)
  WHERE status IN ('pending', 'paid');

-- Chỉ index user active (phổ biến với soft delete)
CREATE INDEX idx_users_email_active ON users (email)
  WHERE deleted_at IS NULL;
```

### Expression index — index trên biểu thức

```sql
-- Case-insensitive email lookup
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
-- Query phải dùng LOWER(): WHERE LOWER(email) = 'user@example.com'

-- Index ngày (bỏ phần giờ) cho query theo ngày
CREATE INDEX idx_orders_date ON orders (DATE(created_at));
```

### Quy tắc index chung

- **Luôn index FK column** — PostgreSQL không tự tạo index cho FK (khác MySQL)
- Index dùng cho ORDER BY: thêm `DESC` vào column nếu hay sort descending
- Composite index `(a, b)` cũng dùng được cho query chỉ dùng `a`, nhưng không dùng được cho query chỉ dùng `b`
- Mỗi index làm chậm INSERT/UPDATE/DELETE — không over-index

---

## 3. Naming Conventions (PostgreSQL-specific)

### Quy tắc identifier

- **Luôn lowercase, snake_case** — tránh phải quote identifier (`"MyTable"` → không bao giờ)
- Tên tối đa 63 bytes (PostgreSQL sẽ truncate im lặng — cẩn thận với tên dài)

### Đặt tên constraint

Format: `<table>_<column(s)>_<type>`

| Loại | Pattern | Ví dụ |
|------|---------|-------|
| Primary key | `<table>_pkey` | `users_pkey` |
| Foreign key | `<table>_<column>_fkey` | `orders_user_id_fkey` |
| Unique | `<table>_<column>_key` | `users_email_key` |
| CHECK | `<table>_<column>_check` | `orders_status_check` |
| Not null | (không đặt tên riêng) | — |

```sql
CREATE TABLE orders (
  id         UUID        PRIMARY KEY,  -- PostgreSQL tự đặt tên orders_pkey
  user_id    UUID        NOT NULL,
  status     VARCHAR(50) NOT NULL,

  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled'))
);
```

### Đặt tên index

Format: `idx_<table>_<column(s)>[_<suffix>]`

| Trường hợp | Pattern | Ví dụ |
|-----------|---------|-------|
| Single column | `idx_<table>_<col>` | `idx_orders_user_id` |
| Composite | `idx_<table>_<col1>_<col2>` | `idx_orders_status_created_at` |
| Partial | `idx_<table>_<col>_<điều kiện ngắn>` | `idx_orders_created_at_pending` |
| Unique index | `uq_<table>_<col>` | `uq_users_email` |

---

## 4. Referential Integrity — Syntax PostgreSQL

### Khai báo FK đầy đủ

```sql
-- Inline (dùng cho FK đơn giản)
user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE

-- Constraint riêng (rõ ràng hơn, dễ đặt tên)
CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE
```

### ON DELETE behavior — khuyến nghị theo tình huống

| Tình huống | ON DELETE | Lý do |
|-----------|-----------|-------|
| Order → User | `RESTRICT` | Không xóa user nếu còn order — cần giữ lịch sử |
| OrderItem → Order | `CASCADE` | Item không có nghĩa khi order bị xóa |
| Comment → User | `SET NULL` | Comment vẫn tồn tại, hiển thị "[deleted user]" |
| AuditLog → User | `SET NULL` | Log cần giữ lại ngay cả khi user xóa |
| ProfilePhoto → User | `CASCADE` | Photo không tồn tại độc lập |
| UserRole → Role | `RESTRICT` | Không xóa role đang được gán |

> **Mặc định khuyến nghị:** `ON DELETE RESTRICT ON UPDATE CASCADE` — an toàn nhất, tránh mất dữ liệu không chủ ý.

### Deferred constraint (hiếm dùng)

```sql
-- Dùng khi có circular FK hoặc cần import bulk data
CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id)
  DEFERRABLE INITIALLY DEFERRED
```

---

## 5. Migration Tooling

### Chọn tool theo tech stack

| Tech stack | Tool khuyến nghị | Lý do |
|-----------|-----------------|-------|
| Python + SQLAlchemy | **Alembic** | Tích hợp native, autogenerate migration từ model |
| Python + Django | **Django migrations** | Built-in, không cần tool ngoài |
| Python + FastAPI (không ORM) | **Alembic** (standalone) hoặc **golang-migrate** | Alembic nếu muốn Python; golang-migrate nếu muốn SQL thuần |
| Go | **golang-migrate** hoặc **goose** | Lightweight, SQL-based |
| Node.js | **Knex.js migrations** hoặc **Prisma Migrate** | Tùy ORM đang dùng |
| DBMS-agnostic, SQL thuần | **Flyway** hoặc **Liquibase** | Java-based nhưng chạy độc lập |

### Alembic — cấu trúc migration cơ bản

```
alembic/
├── env.py              # Database URL + model metadata
├── script.py.mako      # Template migration file
└── versions/
    ├── 20260612_001_create_users.py
    ├── 20260612_002_create_orders.py
    └── ...
```

```bash
# Tạo migration mới
alembic revision --autogenerate -m "add payment_methods table"

# Apply lên latest
alembic upgrade head

# Rollback 1 bước
alembic downgrade -1
```

### golang-migrate — SQL thuần

```
migrations/
├── 000001_create_users.up.sql
├── 000001_create_users.down.sql
├── 000002_create_orders.up.sql
└── 000002_create_orders.down.sql
```

```bash
migrate -path migrations -database "postgres://..." up
migrate -path migrations -database "postgres://..." down 1
```

### Nguyên tắc migration an toàn

```sql
-- Breaking change: thêm NOT NULL column vào bảng có dữ liệu
-- Sai (lock bảng, fail nếu có NULL):
ALTER TABLE orders ADD COLUMN notes TEXT NOT NULL;

-- Đúng — 3 bước:
-- Migration 1: thêm nullable
ALTER TABLE orders ADD COLUMN notes TEXT;
-- Deploy code mới (không còn dùng column cũ)
-- Migration 2: backfill
UPDATE orders SET notes = '' WHERE notes IS NULL;
-- Migration 3: thêm constraint (sau khi verify backfill xong)
ALTER TABLE orders ALTER COLUMN notes SET NOT NULL;
```

```sql
-- Đổi tên column — không làm trực tiếp, dùng alias period
-- Migration 1: thêm column mới
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
-- Migration 2: copy dữ liệu
UPDATE users SET full_name = name;
-- Deploy code mới (dùng full_name thay name)
-- Migration 3: xóa cột cũ
ALTER TABLE users DROP COLUMN name;
```

---

## 6. pgvector — PostgreSQL làm Vector Store

Nếu user dùng pgvector extension thay vì vector DB riêng (ChromaDB, FAISS, Pinecone):

**Tác động đến Section 7 của db-design-writer:** vector table là PostgreSQL table bình thường → có thể gộp vào ERD chính (Section 2) và Data Dictionary (Section 3) thay vì section riêng. Ghi chú rõ trong Section 7: "Vector store implemented via pgvector — xem ERD Section 2 và Data Dictionary Section 3."

### Setup

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Khai báo vector column

```sql
-- REQ-ML-001: Product semantic search
CREATE TABLE product_embeddings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  embedding   vector(1536) NOT NULL,       -- dimension phải khớp với model
  chunk_index INT         NOT NULL DEFAULT 0,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT product_embeddings_product_chunk_key UNIQUE (product_id, chunk_index)
);
```

### Index cho vector similarity search

**HNSW** (Hierarchical Navigable Small World) — khuyến nghị cho production:
```sql
-- Cosine distance (phù hợp text embedding)
CREATE INDEX idx_product_embeddings_hnsw
  ON product_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- L2 distance
CREATE INDEX idx_product_embeddings_hnsw_l2
  ON product_embeddings
  USING hnsw (embedding vector_l2_ops);
```

**IVFFlat** — đơn giản hơn, phù hợp dataset nhỏ hoặc khi cần build nhanh:
```sql
-- Phải có dữ liệu trước khi tạo index
CREATE INDEX idx_product_embeddings_ivf
  ON product_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- thường = sqrt(số rows)
```

| | HNSW | IVFFlat |
|---|------|---------|
| Tốc độ query | Nhanh hơn | Chậm hơn |
| Build time | Chậm hơn | Nhanh hơn |
| Recall (accuracy) | Cao hơn | Thấp hơn |
| Dataset mới (chưa đủ rows) | OK | Cần rows trước |
| Recommendation | Production | Prototype / dataset nhỏ |

### Query similarity search

```sql
-- Top 10 sản phẩm tương tự, có filter metadata
SELECT p.id, p.name, 1 - (pe.embedding <=> $1::vector) AS similarity
FROM product_embeddings pe
JOIN products p ON pe.product_id = p.id
WHERE p.is_active = true
  AND p.category = 'electronics'    -- filter trước khi search (hiệu quả hơn)
ORDER BY pe.embedding <=> $1::vector  -- cosine distance (nhỏ hơn = gần hơn)
LIMIT 10;
```

**Operator:**
- `<=>` — cosine distance (dùng với text embedding)
- `<->` — L2 (Euclidean) distance
- `<#>` — negative inner product (dùng với dot product similarity)

### Data Dictionary cho pgvector table

```markdown
### Table: product_embeddings

**Mô tả:** Vector embedding của product để tìm kiếm ngữ nghĩa. 1 product có thể có nhiều chunks.
**Trace:** REQ-ML-001
**pgvector:** HNSW index, cosine distance, model: text-embedding-3-small (1536 dims)

| Field       | Business Meaning                              | Type            | Nullable | Default |
|------------|----------------------------------------------|-----------------|----------|---------|
| id          | Định danh embedding record                   | UUID            | No       | gen_random_uuid() |
| product_id  | Product được embedding                       | UUID            | No       | — (FK → products.id) |
| embedding   | Vector 1536 chiều từ OpenAI text-embedding-3-small | vector(1536) | No  | — |
| chunk_index | Thứ tự chunk nếu product text dài hơn 512 token | INT           | No       | 0 |
| indexed_at  | Thời điểm embedding được tạo/cập nhật        | TIMESTAMPTZ     | No       | NOW() |
```
