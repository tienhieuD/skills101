# Hướng dẫn DBML và Crow's Foot Notation

DBML (Database Markup Language) là ngôn ngữ text-based để mô tả schema database, dùng để version-control ERD và render hình ảnh qua dbdiagram.io.

Tài liệu gốc: https://dbml.dbdiagram.io/docs/

---

## Cú pháp DBML cơ bản

### Định nghĩa table

```dbml
Table users {
  id          varchar(26) [pk, note: "ULID — opaque string ID"]
  email       varchar(255) [unique, not null]
  full_name   varchar(255) [not null]
  is_active   boolean      [not null, default: true]
  created_at  timestamp    [not null, note: "UTC"]
  updated_at  timestamp    [not null, note: "UTC"]
  deleted_at  timestamp    [null, note: "Soft delete — NULL nếu chưa xóa"]

  Note: "Tài khoản người dùng. REQ-FUNC-001"
}
```

**Các column constraint:**

| Constraint | Viết trong DBML | Ý nghĩa |
|-----------|----------------|---------|
| Primary key | `[pk]` | Khóa chính |
| Not null | `[not null]` | Bắt buộc có giá trị |
| Unique | `[unique]` | Không trùng lặp trong bảng |
| Default | `[default: value]` | Giá trị mặc định |
| Note | `[note: "..."]` | Ghi chú kèm theo field |
| Increment | `[increment]` | Auto-increment (integer ID — hạn chế dùng) |

### Quan hệ (Relationships)

DBML dùng ký hiệu `ref` để mô tả quan hệ. Có thể viết inline hoặc tách riêng.

**Các loại quan hệ:**

| Ký hiệu | Crow's Foot | Ý nghĩa |
|---------|-------------|---------|
| `>` | Many-to-One | FK trỏ từ nhiều về 1 (phổ biến nhất) |
| `<` | One-to-Many | Ngược lại |
| `-` | One-to-One | |
| `<>` | Many-to-Many | Thường dùng junction table |

**Viết inline trong column:**
```dbml
Table orders {
  id      varchar(26) [pk]
  user_id varchar(26) [ref: > users.id, not null]
  // user_id "nhiều" orders trỏ về "1" users.id
}
```

**Viết tách riêng (rõ ràng hơn cho tài liệu):**
```dbml
Table orders {
  id      varchar(26) [pk]
  user_id varchar(26) [not null]
}

Ref: orders.user_id > users.id  // Many orders → One user
```

**Với ON DELETE / ON UPDATE:**
```dbml
Ref: order_items.order_id > orders.id [delete: cascade, update: cascade]
Ref: order_items.product_id > products.id [delete: restrict, update: cascade]
```

Giá trị hợp lệ: `cascade`, `restrict`, `set null`, `set default`, `no action`

### Enum

```dbml
Enum order_status {
  pending   [note: "Đơn mới tạo, chờ xác nhận"]
  paid      [note: "Đã thanh toán"]
  shipped   [note: "Đang giao hàng"]
  delivered [note: "Đã giao thành công"]
  cancelled [note: "Đã hủy"]
}

Table orders {
  id     varchar(26) [pk]
  status order_status [not null, default: 'pending']
}
```

### TableGroup (gom nhóm trực quan)

```dbml
TableGroup "Order Management" {
  orders
  order_items
}

TableGroup "Product Catalog" {
  products
  categories
  product_tags
}
```

---

## Ví dụ schema hoàn chỉnh

```dbml
// ============================================================
// Orders Management System — Database Schema
// Version: 1.0
// Date: 2026-06-12
// ============================================================

// --- Enums ---

Enum order_status {
  pending
  paid
  shipped
  delivered
  cancelled
}

// --- Tables ---

// REQ-FUNC-001: User registration
Table users {
  id         varchar(26) [pk, note: "ULID"]
  email      varchar(255) [unique, not null]
  full_name  varchar(255) [not null]
  is_active  boolean [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]
  deleted_at timestamp [null]

  Note: "Tài khoản người dùng."
}

// REQ-FUNC-010: Order management
Table orders {
  id           varchar(26) [pk]
  user_id      varchar(26) [not null]
  status       order_status [not null, default: 'pending']
  total_amount integer [not null, note: "Đơn vị: VND cent, > 0"]
  created_at   timestamp [not null]
  updated_at   timestamp [not null]

  Note: "Đơn hàng của user. REQ-FUNC-010"
}

// REQ-FUNC-011: Order items
Table order_items {
  id         varchar(26) [pk]
  order_id   varchar(26) [not null]
  product_id varchar(26) [not null]
  quantity   integer [not null, note: "> 0"]
  unit_price integer [not null, note: "Giá tại thời điểm đặt hàng"]

  Note: "Sản phẩm trong đơn hàng. REQ-FUNC-011"
}

// REQ-FUNC-020: Product catalog
Table products {
  id          varchar(26) [pk]
  name        varchar(255) [not null]
  description text [null]
  price       integer [not null, note: "VND cent"]
  is_active   boolean [not null, default: true]
  created_at  timestamp [not null]
  updated_at  timestamp [not null]
}

// --- Relationships ---

Ref: orders.user_id > users.id [delete: restrict, update: cascade]
Ref: order_items.order_id > orders.id [delete: cascade, update: cascade]
Ref: order_items.product_id > products.id [delete: restrict, update: cascade]

// --- Table Groups ---

TableGroup "Users" { users }
TableGroup "Orders" { orders, order_items }
TableGroup "Products" { products }
```

---

## Crow's Foot Notation — ký hiệu đọc ERD

Crow's Foot dùng ký hiệu ở **hai đầu** của đường nối để diễn đạt cardinality.

### Ký hiệu cardinality

| Ký hiệu đầu cuối | Nghĩa |
|------------------|-------|
| `||` (double bar) | Exactly one (bắt buộc 1) |
| `|o` (bar + circle) | Zero or one (optional 1) |
| `}|` (crow foot + bar) | One or more (bắt buộc ít nhất 1) |
| `}o` (crow foot + circle) | Zero or more (optional nhiều) |

### Đọc quan hệ từ ERD

Đọc từ **bảng A → bảng B** (theo chiều mũi tên):

```
users ||--o{ orders : "places"
```
- Đọc: "Một user đặt 0 hoặc nhiều orders"
- Ngược lại: "Mỗi order thuộc về đúng 1 user"

```
orders ||--|{ order_items : "contains"
```
- Đọc: "Một order chứa 1 hoặc nhiều order_items"
- Ngược lại: "Mỗi order_item thuộc về đúng 1 order"

### Mapping DBML sang Crow's Foot

| DBML ref | Crow's Foot tương ứng | Đọc |
|----------|----------------------|-----|
| `A.fk > B.id` | `B ||--o{ A` | Một B có nhiều A (A optional) |
| `A.fk - B.id` | `B ||--|| A` | Một B có đúng 1 A |
| `A.fk <> B.id` | (dùng junction table) | Nhiều-nhiều |

---

## Cách dùng dbdiagram.io

1. Truy cập https://dbdiagram.io
2. Paste DBML vào panel bên trái
3. ERD tự render bên phải theo Crow's Foot
4. Export: PNG / PDF / SQL (PostgreSQL, MySQL, MSSQL)
5. Share: tạo link public để team review (không cần tài khoản)

**Lưu ý:** DBML file trong repo là nguồn sự thật. Hình PNG export là artifact phụ, để vào `docs/images/` và tái generate khi schema thay đổi.

---

## Các lỗi DBML phổ biến

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|---------|
| `Unknown table` | Ref dùng tên table chưa định nghĩa | Định nghĩa table trước khi dùng trong Ref |
| `Duplicate column name` | Tên column trùng trong cùng table | Kiểm tra lại tên column |
| `Invalid ref syntax` | Quên khoảng trắng quanh `>` | `orders.user_id > users.id` (có spaces) |
| Enum không nhận | Dùng enum chưa khai báo | Khai báo Enum block trước Table block |
| `[default: 'value']` lỗi | String default cần single quotes | `[default: 'pending']` không phải `[default: pending]` |

---

## Khi nào KHÔNG dùng DBML

- Schema rất đơn giản (< 5 tables), chỉ cần bảng text trong Data Dictionary
- Team đã dùng tool migration tự sinh ERD (vd: pgAdmin, DBeaver) và export định kỳ — dùng export đó, không viết DBML tay song song (tránh 2 nguồn sự thật)
- Khi chọn phương án không dùng DBML, ghi rõ trong Section 2: "ERD được generate từ tool X, xem tại link Y"
