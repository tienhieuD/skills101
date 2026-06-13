---
name: srs-writer
description: Hướng dẫn viết tài liệu Software Requirements Specification (SRS) theo chuẩn IEEE 830 và ISO/IEC/IEEE 29148, dựa trên template MSRS (jam01/SRS-Template). Sử dụng skill này khi user yêu cầu viết, tạo, review, hoặc cải thiện tài liệu SRS, tài liệu yêu cầu phần mềm, requirements specification, đặc tả yêu cầu, hoặc khi user muốn chuẩn hóa file requirement hiện có theo chuẩn IEEE/ISO. Cũng dùng khi user nhắc đến REQ-ID, acceptance criteria, traceability matrix cho requirements, hoặc cần viết yêu cầu cho hệ thống có thành phần AI/ML (model specs, guardrails, data management).
---

# SRS Writer — Viết tài liệu SRS theo chuẩn IEEE 830 / ISO 29148

Skill này hướng dẫn viết SRS theo template **MSRS (Markdown SRS)** của jam01/SRS-Template — template được align với IEEE 830 và ISO/IEC/IEEE 29148:2011/2017, có bổ sung section AI/ML hiện đại.

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **SRS định nghĩa WHAT, không phải HOW.** Mô tả hệ thống phải làm gì, không mô tả thiết kế/implementation. Nếu thấy mình đang viết "dùng PostgreSQL", "gọi API qua REST" → đó là design constraint (3.5) hoặc thuộc tài liệu kiến trúc, không phải functional requirement.

2. **Mọi requirement phải verifiable.** Tránh từ mơ hồ: "nhanh", "thân thiện", "dễ dùng", "an toàn". Thay bằng metric đo được: "p95 < 1s", "WCAG 2.1 AA", "TLS 1.3+".

3. **Mỗi requirement có ID duy nhất, bất biến.** Format: `REQ-[AREA]-[NNN]` (tùy chọn `-[VER]`). ID không bao giờ tái sử dụng; thay đổi thì tăng VER và ghi vào Revision History.

4. **Dùng keyword nhất quán:** `shall` (bắt buộc) / `should` (khuyến nghị) / `may` (tùy chọn). Tiếng Việt: PHẢI / NÊN / CÓ THỂ.

5. **Mỗi requirement phải có Acceptance Criteria** — ưu tiên dạng Given/When/Then.

## Quy trình viết SRS

### Bước 1 — Thu thập input
Hỏi user (hoặc đọc từ tài liệu có sẵn): tên dự án, mục tiêu business, phạm vi MVP, user roles, ràng buộc kỹ thuật, có thành phần AI/ML không. Nếu user đã có file requirement tự do → đọc kỹ trước, nhiệm vụ là chuẩn hóa chứ không viết lại từ đầu.

### Bước 2 — Đọc cấu trúc template
Đọc `references/srs-structure.md` để nắm đầy đủ 5 sections và hướng dẫn từng mục. KHÔNG viết SRS mà chưa đọc file này.

### Bước 3 — Viết requirements
Đọc `references/requirement-patterns.md` để viết từng REQ đúng format: ID schema, statement pattern, acceptance criteria, verification method. File này có ví dụ tốt/xấu cụ thể.

### Bước 4 — Verification matrix
Section 4 của SRS phải có bảng traceability: mỗi REQ-ID → verification method → test artifact link → status. Đây là cầu nối sang tài liệu test (29119-3).

### Bước 5 — Self-review
Chạy checklist trong `references/srs-structure.md` (cuối file) trước khi giao.

## Cấu trúc output

SRS hoàn chỉnh gồm 5 phần:

```
1. Introduction        — purpose, scope, glossary, references, overview
2. Product Overview    — perspective, functions, constraints, users,
                         assumptions, apportioning
3. Requirements        — external interfaces, functional, QoS,
                         compliance, design & implementation, AI/ML
4. Verification        — methods + traceability matrix
5. Appendixes          — tài liệu hỗ trợ, không normative
```

Ba chế độ output:
- **Monolithic:** 1 file `srs.md` chứa tất cả (dự án nhỏ/vừa — mặc định)
- **Breakout:** `srs.md` mỏng làm index + mỗi REQ một file trong `requirements/REQ-AREA-NNN.md` (dự án lớn, user yêu cầu rõ)
- **Requirements-only:** Chỉ các file REQ riêng lẻ, không có SRS bao quanh (dùng khi team đã có architecture doc và chỉ cần quản lý requirements trong VCS)

## Ngôn ngữ & quy ước

- Viết bằng ngôn ngữ user yêu cầu (mặc định theo ngôn ngữ conversation). Giữ nguyên tiếng Anh cho: REQ-ID, keyword shall/should/may nếu user dùng tiếng Anh, tên section chuẩn có thể song ngữ.
- Mỗi section của template có ý nghĩa riêng — KHÔNG bỏ section nào mà không ghi rõ "N/A — lý do". Section trống không lý do = SRS chưa hoàn chỉnh.
- Với hệ thống có AI/ML (RAG, chatbot, ML model): Section 3.6 là BẮT BUỘC, không được bỏ qua. Đây là điểm khác biệt chính của template này so với IEEE 830 truyền thống.

## Lưu ý quan trọng

- **Functional vs. non-functional không phân biệt rõ ràng** — đây là expected, không phải lỗi. Ví dụ: audit log là vừa FUNC vừa OBS. Xử lý: chọn AREA primary theo tính năng chính, cross-ref sang section kia.
- **Verification matrix luôn có 5 cột:** Requirement ID | Verification Method | Test/Artifact Link | Status | Evidence.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Bắt đầu viết SRS mới hoặc chuẩn hóa requirement có sẵn | `references/srs-structure.md` |
| Viết/review từng requirement cụ thể | `references/requirement-patterns.md` |
| User hỏi về AI/ML requirements | Cả hai — phần 3.6 trong srs-structure + ví dụ ML trong requirement-patterns |
| Không biết REQ thuộc AREA nào | `references/requirement-patterns.md` phần ID Schema |
