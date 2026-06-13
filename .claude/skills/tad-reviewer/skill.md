---
name: tad-reviewer
description: Review tài liệu kiến trúc phần mềm (TAD / SAD / Architecture Document) để đảm bảo chất lượng theo chuẩn ISO/IEC/IEEE 42010:2011 kết hợp arc42 template. Sử dụng skill này khi user yêu cầu review, kiểm tra, audit, validate tài liệu kiến trúc, architecture description, hoặc hỏi "TAD này đã đạt chuẩn 42010 chưa?", "thiếu gì?", "có thể dùng để handoff sang team không?". Cũng dùng khi user muốn review riêng một ADR (Architecture Decision Record) xem có đủ rationale không.
---

# TAD Reviewer — Đảm bảo chất lượng tài liệu kiến trúc

Skill này review TAD theo **6 dimensions** và xuất báo cáo có cấu trúc. Mục tiêu: tìm lỗi thực sự gây hiểu nhầm hoặc thiếu coverage — không rewrite tài liệu.

## Nguyên tắc review

1. **Adversarial by default.** Giả định tài liệu có vấn đề cho đến khi chứng minh ngược lại.
2. **Evidence-based.** Mỗi finding phải trỏ đến section/ADR-ID cụ thể và trích dẫn nguyên văn.
3. **42010-anchored.** Tiêu chí cuối cùng là: "Liệu stakeholder concern có được addressed bởi ít nhất một view không?"
4. **Không rewrite.** Reviewer chỉ chỉ ra vấn đề và hướng sửa — không tự sửa trừ khi được yêu cầu rõ.

## Quy trình review (5 bước)

### Bước 1 — Đọc toàn bộ TAD
Đọc hết trước khi ghi finding. Nắm: hệ thống là gì, stakeholders là ai, decisions quan trọng nào. Đây là pass đọc, không phải pass phán xét.

### Bước 2 — Đọc tiêu chí
Đọc `references/review-criteria.md` — 6 dimensions với checklist và severity. KHÔNG bắt đầu review mà chưa đọc file này.

### Bước 3 — Chạy 6 dimensions theo thứ tự
Thứ tự có chủ ý — Structure trước để phát hiện missing sections sớm, tránh review chi tiết phần không tồn tại.

### Bước 4 — Phân loại severity

| Severity | Định nghĩa | Ví dụ |
|----------|-----------|-------|
| **BLOCKER** | Vi phạm 42010 mandatory — tài liệu không đạt chuẩn | Thiếu Stakeholders & Concerns; ADR không có rationale; thiếu cả 3 mandatory views |
| **MAJOR** | Stakeholder concern không được address; view inconsistency; quality goals là buzzwords | BB View và Deployment View liệt kê component khác nhau; constraint không có ADR |
| **MINOR** | Governance gap, formatting, missing cross-ref — không block sử dụng | ADR thiếu Status field; Glossary thiếu term; Section trống không có N/A |
| **SUGGESTION** | Cải thiện beyond minimum | Thêm Level 2 BB cho component phức tạp; thêm error path trong Runtime View |

### Bước 5 — Xuất review report
Dùng Output Format bên dưới. Ghi Positive Observations — không bao giờ bỏ qua section này.

---

## Output Format

```markdown
## TAD Review Report — [Tên hệ thống]
**Reviewed by:** Claude (tad-reviewer skill)
**Date:** [ngày]
**TAD version:** [version từ header]

---

### Executive Summary

| Metric | Value |
|--------|-------|
| Risk Level | 🔴 RED / 🟡 YELLOW / 🟢 GREEN |
| Blockers | N |
| Major | N |
| Minor | N |
| Suggestions | N |
| Recommendation | REJECT / CONDITIONAL ACCEPT / ACCEPT |

**Risk Level logic:**
- 🔴 RED: ≥1 BLOCKER → REJECT — vi phạm 42010 mandatory, phải sửa trước khi dùng
- 🟡 YELLOW: 0 BLOCKER, ≥1 MAJOR → CONDITIONAL ACCEPT — sửa MAJOR trước handoff
- 🟢 GREEN: 0 BLOCKER, 0 MAJOR → ACCEPT

---

### Dimension Scorecard

| # | Dimension | Status | Findings |
|---|-----------|--------|---------|
| 1 | Structure & Completeness | ✅ PASS / ⚠️ PARTIAL / ❌ FAIL | N |
| 2 | Stakeholder Coverage | ... | ... |
| 3 | Architecture Decision Quality | ... | ... |
| 4 | View Consistency | ... | ... |
| 5 | Quality Traceability | ... | ... |
| 6 | Notation & Communication Clarity | ... | ... |

---

### Findings

| # | Severity | Location | Issue | Recommendation |
|---|----------|----------|-------|----------------|

---

### Positive Observations

---

### Next Steps
1. [Action cụ thể] — Owner: [section/team] — Priority: BLOCKER/MAJOR/MINOR
```

---

## Calibration đặc biệt cho TAD

| Tình huống | Severity đúng | Lý do |
|-----------|--------------|-------|
| Section 1.3 Stakeholders hoàn toàn thiếu | BLOCKER | 42010 mandatory — không có concerns thì không thể verify view coverage |
| Section 9 ADRs có nhưng không có alternatives | BLOCKER | Rationale không thể đánh giá nếu không biết đã xét gì khác |
| Building Block View Level 1 thiếu | BLOCKER | Mandatory entry point của architecture documentation |
| BB View và Deployment View liệt kê component khác nhau | MAJOR | View inconsistency — tài liệu mô tả 2 hệ thống khác nhau |
| Quality Goals là buzzwords ("nhanh", "bảo mật") | MAJOR | Không thể viết test scenario, không thể verify |
| ADR có rationale nhưng không có Status | MINOR | Governance gap, không block review |
| Section trống không có N/A | MINOR | Ambiguous — không rõ bỏ qua hay chưa viết |
| Chỉ có 1 Runtime scenario | SUGGESTION | Minimum là 2; thêm error path quan trọng |
| AI/ML system nhưng Section 8 không có chunking/embedding | MAJOR | Gap về architectural decision quan trọng |

## Lưu ý đọc reference

Đọc `references/review-criteria.md` để có checklist đầy đủ và ví dụ finding cho từng dimension. Đọc `references/finding-guide.md` để biết cách viết finding không gây tranh cãi.
