---
name: srs-reviewer
description: Review tài liệu Software Requirements Specification (SRS) để đảm bảo chất lượng theo chuẩn IEEE 830 / ISO/IEC/IEEE 29148. Sử dụng skill này khi user yêu cầu review, kiểm tra, audit, validate, hoặc đánh giá chất lượng một tài liệu SRS, requirements specification, đặc tả yêu cầu — dù là file mới viết hay đang cần approve. Cũng dùng khi user hỏi "SRS này đã đủ chưa?", "có lỗi gì không?", "có thể ship chưa?", hoặc cần feedback trước khi handoff sang QA/engineering.
---

# SRS Reviewer — Đảm bảo chất lượng tài liệu SRS

Skill này review SRS theo **6 dimensions** và xuất báo cáo có cấu trúc với severity levels. Mục tiêu: tìm lỗi thực sự, không rewrite lại tài liệu.

## Nguyên tắc review

1. **Adversarial by default.** Reviewer giả định tài liệu có vấn đề cho đến khi chứng minh ngược lại — không pass vì "trông có vẻ ổn".
2. **Evidence-based.** Mỗi finding phải trỏ đến vị trí cụ thể (REQ-ID hoặc section số) và trích dẫn nguyên văn nếu cần.
3. **Actionable.** Mỗi finding phải có recommendation cụ thể — không chỉ nói "thiếu" mà nói "cần thêm gì".
4. **Không rewrite.** Reviewer chỉ chỉ ra vấn đề và hướng sửa, không tự sửa tài liệu trừ khi được yêu cầu rõ.

## Quy trình review (5 bước)

### Bước 1 — Đọc toàn bộ SRS
Đọc hết tài liệu trước khi ghi bất kỳ finding nào. Mục tiêu: nắm context hệ thống, scope, user roles. Đây là pass đọc, không phải pass phán xét.

### Bước 2 — Đọc tiêu chí
Đọc `references/review-criteria.md` để nắm 6 dimensions và dấu hiệu lỗi cụ thể cho từng dimension.

### Bước 3 — Chạy 6 dimensions
Áp dụng từng dimension theo thứ tự trong `references/review-criteria.md`. Với mỗi dimension: ghi PASS / FAIL / PARTIAL + danh sách findings.

### Bước 4 — Phân loại severity
Mỗi finding thuộc đúng một severity:

| Severity | Định nghĩa | Ví dụ |
|----------|-----------|-------|
| **BLOCKER** | Vi phạm khiến SRS không dùng được — không thể design hoặc test từ REQ này | REQ không có AC; Statement không verifiable; compound REQ |
| **MAJOR** | Gap về completeness hoặc quality ảnh hưởng đến testing/design | AI/ML system thiếu Section 3.6; constraint không có REQ tương ứng |
| **MINOR** | Formatting, style, missing cross-refs — không block nhưng giảm usability | Thiếu Priority field; cross-ref sai số; N/A không có lý do |
| **SUGGESTION** | Cải thiện beyond minimum — có thể bỏ qua với lý do | Thêm boundary AC; ghi rõ test environment |

### Bước 5 — Xuất review report
Dùng format trong phần **Output Format** bên dưới. Không bỏ section nào dù trống.

---

## Output Format

```markdown
## SRS Review Report — [Tên dự án]
**Reviewed by:** Claude (srs-reviewer skill)
**Date:** [ngày]
**SRS version:** [version từ header tài liệu]

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
- 🔴 RED: ≥1 BLOCKER → REJECT — phải sửa trước khi dùng
- 🟡 YELLOW: 0 BLOCKER, ≥1 MAJOR → CONDITIONAL ACCEPT — chấp nhận nếu MAJOR được giải quyết trước handoff sang QA
- 🟢 GREEN: 0 BLOCKER, 0 MAJOR → ACCEPT (MINOR/SUGGESTION không block)

---

### Dimension Scorecard

| # | Dimension | Status | Findings |
|---|-----------|--------|---------|
| 1 | Structure | ✅ PASS / ⚠️ PARTIAL / ❌ FAIL | N findings |
| 2 | Requirement Format | ... | ... |
| 3 | Verifiability | ... | ... |
| 4 | Atomicity | ... | ... |
| 5 | Completeness | ... | ... |
| 6 | Internal Consistency | ... | ... |

---

### Findings

| # | Severity | Location | Issue | Recommendation |
|---|----------|----------|-------|----------------|
| F-001 | 🔴 BLOCKER | REQ-FUNC-003 | Statement không verifiable: "hệ thống phải nhanh" | Thay bằng metric đo được, vd: "p95 < 500ms tại API gateway dưới tải 50 concurrent users" |
| F-002 | 🟠 MAJOR | Section 3.6 | Hệ thống có RAG chatbot nhưng thiếu toàn bộ Section 3.6 AI/ML | Bổ sung 3.6.1–3.6.6 theo template MSRS |
| F-003 | 🟡 MINOR | REQ-SEC-001 | Thiếu Priority field | Thêm Priority: High/Medium/Low |

---

### Positive Observations
*(Những điểm tốt — reviewer phải ghi nhận để tạo cân bằng và chỉ ra đâu là standard tốt trong tài liệu)*

---

### Next Steps
1. [Action cụ thể] — Owner: [section/team] — Deadline: trước [milestone]
2. ...
```

---

## Calibration: khi nào là BLOCKER vs MAJOR

Ranh giới hay bị nhầm:

| Tình huống | Severity đúng | Lý do |
|-----------|--------------|-------|
| Statement dùng từ mơ hồ ("tốt", "nhanh") | BLOCKER | Không thể write test case từ REQ này |
| Thiếu AC hoàn toàn | BLOCKER | Không có pass/fail condition → không thể verify |
| AC chỉ có happy path, thiếu negative | MAJOR | Partial coverage — có thể test nhưng không đủ |
| Thiếu Status/Priority/Owner field | MINOR | Governance gap, không block testing |
| AI/ML system thiếu Section 3.6 | MAJOR | Gap về ML quality/safety requirements — serious nhưng SRS vẫn dùng được cho non-ML parts |
| Compound REQ ("validate AND extract AND embed") | BLOCKER | Không thể assign single verification — có thể pass một phần và không biết |
| Verification matrix thiếu một số REQ-ID | MAJOR | Traceability gap |
| Verification matrix hoàn toàn không có | BLOCKER | Không có bất kỳ link nào sang test artifacts |
