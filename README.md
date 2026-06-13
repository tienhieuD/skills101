# skills101

Thư viện **Claude Code skills** cho SDLC documentation — bộ lệnh tuỳ chỉnh giúp Claude tạo tài liệu kỹ thuật theo chuẩn quốc tế, từ yêu cầu sản phẩm đến test case.

---

## Ý tưởng

Một dự án phần mềm cần nhiều loại tài liệu khác nhau, viết đúng thứ tự, theo đúng chuẩn. Thực tế: phần lớn team bỏ qua hoặc viết tuỳ tiện vì tốn thời gian.

Repo này đóng gói kiến thức đó thành các **skills** — khi gọi trong Claude Code, skill sẽ hướng dẫn chi tiết cách viết đúng từng loại tài liệu: cấu trúc, nguyên tắc, ví dụ tốt/xấu, checklist tự kiểm tra.

---

## Chuỗi tài liệu SDLC

```
PRD  →  SRS  →  TAD  →  API Design  →  DB Design  →  Test Plan  →  Test Design  →  Test Case
 │       │       │           │               │              │              │              │
confirm  req   arch      contract         schema         scope         TCOND         TC-XXX
client  formal design    Layer 1         DBML/ERD     entry/exit    EP/BVA/ST    steps+AC
```

---

## Skills

| Skill | Mục đích | Chuẩn tham chiếu |
|-------|---------|-----------------|
| `prd-writer` | PRD — confirm scope với client, User Story + AC testable | Industry standard (Atlassian, ProductPlan) |
| `srs-writer` | SRS — đặc tả yêu cầu phần mềm chính thức | IEEE 830 / ISO/IEC/IEEE 29148 |
| `srs-reviewer` | Review SRS theo 6 chiều: verifiability, atomicity, completeness... | IEEE 830 |
| `tad-writer` | TAD — kiến trúc hệ thống: BB view, deployment, ADR | ISO/IEC/IEEE 42010 + arc42 |
| `tad-reviewer` | Review TAD: view consistency, decision quality... | ISO/IEC/IEEE 42010 |
| `api-design-writer` | API Design Layer 1 — conventions, error format, endpoint overview | Zalando Guidelines + RFC 7807 |
| `db-design-writer` | Database Design — ERD Crow's Foot, Data Dictionary, vector store | DBML / ISO/IEC 11179 |
| `db-design-postgres-writer` | Extension PostgreSQL — types, indexes, pgvector, migration | PostgreSQL docs |
| `test-plan-writer` | Test Plan — scope, approach, entry/exit/suspension criteria, risks | ISO/IEC/IEEE 29119-3:2021 |
| `test-design-writer` | Test Design Spec — test conditions (TCOND) dùng EP/BVA/Decision Table/State Transition | ISO/IEC/IEEE 29119-3:2021 |
| `test-case-writer` | Test Case Spec — từng TC với preconditions, steps, expected result, AI output pattern | ISO/IEC/IEEE 29119-3:2021 |

---

## Cách dùng

Trong Claude Code, gõ tên skill:

```
/prd-writer
/srs-writer
/test-plan-writer
```

Claude sẽ hỏi thông tin cần thiết và hướng dẫn từng bước.

---

## Cấu trúc

```
.claude/skills/<skill-name>/
├── skill.md          # Nguyên tắc + quy trình (~80 dòng)
└── references/       # Template, ví dụ, checklist (đọc khi cần)
```
