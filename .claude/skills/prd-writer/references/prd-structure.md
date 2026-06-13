# Cấu trúc PRD — Template đầy đủ và hướng dẫn từng section

Template hoàn chỉnh, hướng dẫn từng section, ví dụ What vs How, Change Log pattern, checklist.

---

## Document Header

```markdown
# Product Requirements Document
**Product:** [Tên sản phẩm hoặc feature]
**Version:** 1.0 | **Date:** YYYY-MM-DD | **Status:** Draft
**Prepared by:** [Tên] | **Phase:** MVP / v1.1 / ...
**Related SRS:** TBD — sẽ tạo sau khi PRD được Approved
```

---

## Document History

```markdown
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-13 | ... | Initial draft — N user stories |
| 1.1 | 2026-06-20 | ... | Thêm US-005, sửa AC US-002-AC2 theo feedback client |
```

---

## Approval

```markdown
## Approval

| Role | Tên | Email/Chữ ký | Date | Status |
|------|-----|-------------|------|--------|
| Product Owner | | | | ⬜ Draft |
| Client Representative | | | | ⬜ Draft |
| Tech Lead | | | | ⬜ Draft |

> **Baseline Rule:** Khi tất cả approvers ký "Approved", version này trở thành baseline.
> Mọi thay đổi sau đó phải đi qua Change Request và được ghi vào Change Log — KHÔNG
> edit trực tiếp vào nội dung đã approve.
```

**Status values:** `Draft` → `Pending Review` → `Approved` → `Superseded`

---

## Section 1 — Overview

```markdown
## 1. Overview

### 1.1 Product Summary
[1–3 đoạn: mô tả sản phẩm là gì, phục vụ ai, giải quyết vấn đề gì]

### 1.2 Business Goals
| Goal | Success Metric | Target |
|------|----------------|--------|
| Tăng tỷ lệ chuyển đổi | Conversion rate từ trial → paid | ≥ 5% |
| Giảm thời gian onboarding | Thời gian hoàn thành setup lần đầu | ≤ 10 phút |

### 1.3 Out of Scope của document này
Tài liệu này mô tả phạm vi **[Phase N]**. Các tính năng nằm ngoài phase này được liệt kê ở Section 3.2.
```

---

## Section 2 — Personas

```markdown
## 2. Personas

### P-01: [Tên persona]
**Vai trò:** [e.g. Nhân viên văn phòng / Admin hệ thống / Khách hàng cuối]
**Nhu cầu chính:** [Muốn làm gì với sản phẩm — 1–2 câu]
**Pain point:** [Vấn đề hiện tại mà sản phẩm giải quyết]

### P-02: [Tên persona]
...
```

**Lưu ý:** Persona trong PRD chỉ cần đủ để viết User Story. Không cần demographics, empathy map, journey map — trừ khi client yêu cầu.

---

## Section 3 — Scope

```markdown
## 3. Scope

### 3.1 In Scope — Phase [N]
| Feature | Mô tả ngắn | Priority | User Stories |
|---------|-----------|----------|-------------|
| Upload tài liệu | User upload PDF/DOCX để indexing | Must-have | US-001, US-002 |
| Hỏi đáp Q&A | Chat với tài liệu đã upload | Must-have | US-010 → US-013 |
| Quản lý tài liệu | Xem danh sách, xóa tài liệu | Should-have | US-020, US-021 |

### 3.2 Out of Scope — Phase [N]
| Feature | Lý do / Kế hoạch |
|---------|-----------------|
| Chia sẻ tài liệu với người dùng khác | Planned Phase 2 |
| Export kết quả Q&A ra PDF | Không trong yêu cầu ban đầu của client |
| Mobile app | Ngoài phạm vi project này |
```

**Rule:** Mọi feature phải nằm ở 1 trong 2 bảng. Không có feature "pending decision" — nếu chưa quyết định, cho vào Out of Scope + ghi "Cần xác nhận với client".

---

## Section 4 — User Stories

Đọc `user-story-guide.md` để viết từng US. Template mỗi US:

```markdown
## 4. User Stories

### US-001: Upload file PDF hợp lệ

| Field | Giá trị |
|-------|---------|
| **User Story ID** | US-001 |
| **Priority** | Must-have |
| **Status** | Draft |
| **Persona** | P-01 (Nhân viên văn phòng) |
| **Derived REQ-ID(s)** | TBD |

**Story:**
As a nhân viên văn phòng,
I want to upload file PDF của hợp đồng lên hệ thống,
So that I can hỏi đáp nội dung hợp đồng mà không cần đọc toàn bộ.

**Acceptance Criteria:**

| AC ID | Criterion |
|-------|-----------|
| US-001-AC1 | Hệ thống chấp nhận file PDF có kích thước ≤ 10MB và trả về xác nhận upload thành công. |
| US-001-AC2 | Hệ thống từ chối file có định dạng khác PDF/DOCX và hiển thị thông báo lỗi rõ ràng. |
| US-001-AC3 | Hệ thống từ chối file có kích thước > 10MB và hiển thị thông báo giới hạn kích thước. |
| US-001-AC4 | Sau khi upload thành công, file xuất hiện trong danh sách "Tài liệu của tôi" trong vòng 30 giây. |

---

### US-002: [Tiêu đề ngắn]
...
```

---

## Section 5 — Non-Functional Constraints

```markdown
## 5. Non-Functional Constraints

**Lưu ý:** Section này chỉ ghi ràng buộc ở tầng business. Chi tiết kỹ thuật (latency target, throughput) thuộc SRS Section 3.3 (Quality of Service).

| Constraint | Mô tả |
|-----------|-------|
| Ngôn ngữ | Giao diện và nội dung bằng tiếng Việt; dữ liệu có thể chứa tiếng Anh |
| Tuân thủ | Dữ liệu người dùng lưu trữ trong lãnh thổ Việt Nam (data residency) |
| Trình duyệt | Hỗ trợ Chrome, Firefox, Safari phiên bản mới nhất |
| Khả năng tiếp cận | Giao diện web, không cần mobile app trong phase này |
```

---

## Section 6 — Assumptions & Risks

```markdown
## 6. Assumptions & Risks

### Assumptions
- Client sẽ cung cấp danh sách người dùng test trước ngày UAT
- Dữ liệu test (tài liệu mẫu) do client cung cấp, không cần tạo dummy data

### Risks
| Risk | Khả năng | Tác động | Biện pháp |
|------|---------|---------|-----------|
| Client thay đổi yêu cầu sau approval | Trung bình | Cao | Change Request process; tăng timeline |
| LLM API không ổn định | Thấp | Cao | Cần SLA từ provider, có fallback message |
```

---

## Section 7 — Open Questions

```markdown
## 7. Open Questions

| # | Câu hỏi | Owner | Due | Trạng thái |
|---|---------|-------|-----|-----------|
| OQ-1 | Giới hạn số lượng tài liệu per user là bao nhiêu? | Client | 2026-06-20 | ⬜ Open |
| OQ-2 | Chat history cần lưu bao lâu? | Product Owner | 2026-06-20 | ⬜ Open |
```

---

## Change Log (Post-Baseline)

Chỉ điền sau khi PRD được **Approved**. Mỗi row = 1 Change Request.

```markdown
## Change Log (Post-Baseline)

| CR-ID | Date | Requestor | Mô tả thay đổi | Affected US | Status |
|-------|------|-----------|----------------|-------------|--------|
| CR-001 | 2026-07-01 | Client | Thêm yêu cầu export chat ra PDF | US-013 (mới) | ⬜ Pending |
```

**Nguyên tắc Change Log:**
- Mọi thay đổi scope sau baseline phải có CR-ID
- CR có thể được Approved (thêm vào scope) hoặc Rejected (ghi lý do)
- Không xóa CR cũ khỏi log — chỉ cập nhật Status
- CR Approved → tăng version PRD (vd: v1.0 → v1.1) + ghi vào Document History

---

## "What vs How" — Bảng tham chiếu nhanh

| PRD — Được viết ✅ | SRS/TAD — Không được viết ❌ |
|-------------------|---------------------------|
| "Hệ thống chấp nhận PDF và DOCX" | "Dùng python-magic để detect MIME type" |
| "Câu trả lời kèm trích dẫn nguồn" | "Dùng ChromaDB vector store với cosine similarity" |
| "Tài liệu được xử lý trong vòng 30 giây" | "Chunk size 512 tokens, overlap 64" |
| "Người dùng có thể xóa tài liệu của mình" | "Soft delete với cột `deleted_at` trong bảng documents" |
| "Hệ thống hỗ trợ tối đa 1,000 người dùng đồng thời" | "Dùng Redis cache với TTL 300s" |

**Rule of thumb:** Nếu câu bắt đầu bằng tên công nghệ → đó là "how". Nếu client không cần biết → đó là "how".

---

## Checklist self-review

```
DOCUMENT
□ Document History có ít nhất 1 row (initial version)
□ Approval table có tên các bên cần ký
□ Status = Draft (chưa review) hoặc Pending Review (đã gửi)

SCOPE
□ Tất cả features đều nằm trong In Scope hoặc Out of Scope — không có vùng xám
□ Out of Scope items ghi rõ lý do hoặc phase kế hoạch

USER STORIES
□ Mỗi US có ID duy nhất format US-NNN
□ Story statement đúng format "As a... I want... So that..."
□ Mỗi US có ít nhất 1 AC (US-NNN-AC1)
□ Mỗi AC là testable — có thể verify Pass/Fail
□ Không có AC kiểu "hệ thống hoạt động đúng", "user hài lòng"
□ Mỗi US có field "Derived REQ-ID(s): TBD"

"HOW" CHECK
□ Không có tên DBMS, framework, library cụ thể trong PRD body
□ Không có endpoint URL, HTTP method, status code
□ Không có data model, schema, column name
□ Non-functional constraints là business-level, không phải technical spec

COMPLETENESS
□ Mỗi feature trong In Scope có ít nhất 1 US tương ứng
□ AC cover cả happy path (positive) và ít nhất 1 error case (negative)
□ Open Questions có owner và deadline
```
