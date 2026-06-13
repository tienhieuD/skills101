---
name: prd-writer
description: Hướng dẫn viết PRD (Product Requirements Document) — tài liệu business/user-language đầu chuỗi SDLC, dùng để confirm scope với khách hàng trước khi viết SRS (ISO 29148). Sử dụng skill này khi user cần viết PRD, product brief, feature brief, scope document; khi cần chuẩn hóa user story với acceptance criteria testable; khi cần cơ chế approval/sign-off và version control cho tài liệu yêu cầu; hoặc khi cần traceability từ user story sang SRS REQ-ID.
---

# PRD Writer — Tài liệu Yêu cầu Sản phẩm

Skill này hướng dẫn viết **PRD** — tài liệu đầu chuỗi SDLC, viết bằng ngôn ngữ business/user, dùng để **confirm scope với khách hàng** trước khi viết SRS.

Flow: **PRD** (confirm business intent) → **SRS** (formalize) → TAD → API/DB Design → Test Plan

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **"What & why" only — không có "how"**: PRD không chứa chi tiết kỹ thuật (DBMS, framework, endpoint, schema). Nếu thấy mình viết "dùng ChromaDB", "REST API /v1/upload", "bảng PostgreSQL" → đó là SRS/TAD, không phải PRD.

2. **US-XXX ID bất biến**: mỗi User Story có ID riêng `US-[NNN]`. ID không tái sử dụng, không đổi khi story thay đổi — tăng VER trong Document History.

3. **Mỗi User Story PHẢI có AC testable**: format `US-[NNN]-AC[N]`, binary pass/fail. Không chấp nhận "hệ thống hoạt động tốt", "người dùng hài lòng". AC là tiền đề cho Test Condition (tài liệu #11).

4. **Traceability placeholder bắt buộc**: mỗi US-XXX có field `Derived REQ-ID(s): TBD` — để trống khi viết PRD, srs-writer điền sau. Đây là cầu nối PRD → SRS.

5. **Version + Approval rõ ràng**: Document History (version/date/changes) + Approval table (approver/date/status). Baseline = version Approved. Sửa sau baseline → thêm vào Change Log, không edit nội dung đã approve.

6. **Scope In/Out explicit**: mỗi feature thuộc "In Scope" hoặc "Out of Scope (phase N)" — không có vùng xám.

7. **Persona đủ dùng, không hàn lâm**: vai trò + nhu cầu chính + pain point — 1 đoạn ngắn. Không cần demographics/journey map trừ khi client yêu cầu.

## Quy trình viết

### Bước 1 — Thu thập input
Hỏi: tên sản phẩm/feature, mục tiêu business, user roles/personas, phase hiện tại (MVP? v1.1?), constraint từ client, deadline, ai cần approve. Đọc notes yêu cầu nếu có.

### Bước 2 — Xác định personas + scope
Viết personas trước → xác định ai làm gì → từ đó scope in/out rõ ràng. Scope out phải ghi "sẽ xử lý ở phase nào" hoặc "ngoài phạm vi dự án".

### Bước 3 — Viết User Stories + AC
Đọc `references/user-story-guide.md`. 1 US per atomic capability. AC phải cover happy path lẫn error case. Điền `Derived REQ-ID(s): TBD`.

### Bước 4 — Điền Document History + Approval
Status mặc định = "Draft". Approval table điền tên approver, để ngày/chữ ký trống.

### Bước 5 — Self-review
Checklist trong `references/prd-structure.md` (cuối file): kiểm tra "how" leak, AC testability, scope coverage, traceability placeholder.

## Cấu trúc output

```
PRD Header (title, version, date, status)
├── Document History
├── Approval
│
├── 1. Overview (product summary, business goals, success metrics)
├── 2. Personas
├── 3. Scope (In Scope / Out of Scope table)
├── 4. User Stories
│   └── US-NNN: [title]
│       ├── Story: "As a... I want... So that..."
│       ├── Acceptance Criteria (US-NNN-AC1, AC2...)
│       ├── Priority & Status
│       └── Derived REQ-ID(s): TBD
├── 5. Non-Functional Constraints (business-level only)
├── 6. Assumptions & Risks
├── 7. Open Questions
├── Appendix
└── Change Log (Post-Baseline) — điền sau khi Approved
```

Hai chế độ output:
- **Single PRD**: 1 file `prd.md` (mặc định, dự án nhỏ/vừa)
- **Feature PRD**: `prd-[feature].md` per feature (dự án lớn, nhiều team)

## Ngôn ngữ & quy ước

Viết bằng ngôn ngữ client/user sử dụng — PRD là tài liệu giao tiếp với khách hàng, không phải tài liệu kỹ thuật. Giữ tiếng Anh cho: US-XXX ID, AC ID, bảng Approval/History.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Bắt đầu viết PRD mới, cần template đầy đủ | `references/prd-structure.md` |
| Viết/review User Story + Acceptance Criteria | `references/user-story-guide.md` |
| Nghi ngờ có "how" leak vào PRD | `references/prd-structure.md` phần "What vs How" |
| Cần ví dụ AC tốt/xấu | `references/user-story-guide.md` phần "AC Examples" |
| Xử lý thay đổi sau approval | `references/prd-structure.md` phần "Change Log" |
