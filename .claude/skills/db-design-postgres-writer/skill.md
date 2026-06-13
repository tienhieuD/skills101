---
name: db-design-postgres-writer
description: Mở rộng db-design-writer với convention và kiểu dữ liệu cụ thể của PostgreSQL. Kích hoạt khi user yêu cầu viết Database Design VÀ xác định dùng PostgreSQL, Supabase, hoặc dịch vụ Postgres-compatible (RDS PostgreSQL, AlloyDB, Neon, Railway Postgres). Khi kích hoạt, LUÔN đọc db-design-writer trước để lấy cấu trúc tổng, sau đó áp dụng nội dung skill này cho phần chi tiết kỹ thuật PostgreSQL.
---

# DB Design PostgreSQL Writer — Extension của db-design-writer

**Đây là skill extension, không phải skill độc lập.** Trước khi làm bất cứ điều gì, đọc skill gốc:
- `db-design-writer/skill.md` — cấu trúc 8 section, quy trình, nguyên tắc chung
- `db-design-writer/references/db-design-structure.md` — hướng dẫn viết từng section
- `db-design-writer/references/erd-dbml-guide.md` — DBML syntax và Crow's Foot

Skill này bổ sung nội dung **PostgreSQL-specific** cho 4 section trong tài liệu gốc:

| Section gốc | Nội dung extension (skill này) |
|------------|-------------------------------|
| Section 3 — Data Dictionary | Thay kiểu generic bằng kiểu PostgreSQL cụ thể |
| Section 4 — Naming Conventions | Bổ sung quy tắc đặt tên constraint và index |
| Section 5 — Referential Integrity | Cú pháp FK + hành vi ON DELETE/UPDATE cụ thể |
| Section 6 — Indexing Strategy | Chọn đúng loại index PostgreSQL (B-tree/GIN/GiST/partial) |
| Section 7 — Vector Store | Nếu dùng pgvector: gộp vào ERD relational thay vì section riêng |
| Section 8 — Migration | Khuyến nghị Alembic (Python) hoặc golang-migrate |

## Quy trình (áp dụng sau khi đã đọc db-design-writer)

### Bước 1 — Thu thập input bổ sung
Ngoài input của skill gốc, hỏi thêm: PostgreSQL version (ảnh hưởng đến tính năng sẵn có), có dùng pgvector không, ORM/migration tool đang dùng (SQLAlchemy/Alembic? Django ORM? GORM?).

### Bước 2 — Đọc postgres-conventions.md
Đọc `references/postgres-conventions.md` để nắm convention kiểu dữ liệu, naming, indexing, referential integrity, pgvector. Dùng làm nguồn sự thật cho mọi quyết định PostgreSQL-specific.

### Bước 3 — Điền Data Dictionary với kiểu PostgreSQL
Thay thế tất cả kiểu generic (STRING → VARCHAR/TEXT, INTEGER → INT/BIGINT, TIMESTAMP → TIMESTAMPTZ) theo bảng mapping trong `postgres-conventions.md`.

### Bước 4 — Viết Section 5 và 6 với SQL cụ thể
Section 5: viết FK constraint đầy đủ với ON DELETE/ON UPDATE. Section 6: chọn loại index phù hợp (B-tree/GIN/GiST/partial/expression) và viết DDL gợi ý.

### Bước 5 — Xử lý pgvector (nếu áp dụng)
Nếu user dùng pgvector: đọc phần pgvector trong `postgres-conventions.md`, gộp vector table vào ERD chính thay vì Section 7 riêng.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Cần chọn kiểu dữ liệu PostgreSQL | `references/postgres-conventions.md` phần 1 |
| Viết tên constraint hoặc index | `references/postgres-conventions.md` phần 3 |
| Viết ON DELETE/UPDATE behavior | `references/postgres-conventions.md` phần 4 |
| Chọn loại index | `references/postgres-conventions.md` phần 2 |
| Dùng pgvector | `references/postgres-conventions.md` phần 6 |
| Chọn migration tool | `references/postgres-conventions.md` phần 5 |
