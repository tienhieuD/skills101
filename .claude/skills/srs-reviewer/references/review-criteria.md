# Review Criteria — 6 Dimensions

Áp dụng theo thứ tự. Ghi PASS / PARTIAL / FAIL cho từng dimension, kèm findings.

---

## DIM-1: Structure (Cấu trúc tài liệu)

Kiểm tra khung bên ngoài trước khi đi vào nội dung.

### Checklist

- [ ] Header có: tên dự án, version, tác giả, tổ chức, ngày
- [ ] Revision History có ít nhất 1 entry (không để trống)
- [ ] Đủ 5 sections: Introduction / Product Overview / Requirements / Verification / Appendixes
- [ ] Section nào không áp dụng → ghi rõ "N/A — [lý do]", không bỏ trống
- [ ] Section 1.3 Glossary có các term domain-specific trong tài liệu
- [ ] Section 1.4 References: mỗi ref có title + version/date; phân biệt normative vs informative
- [ ] **Nếu hệ thống có AI/ML:** Section 3.6 phải có đủ 6 mục con (3.6.1–3.6.6)

### Dấu hiệu lỗi thường gặp

| Lỗi | Severity |
|-----|---------|
| Section 3.6 hoàn toàn thiếu khi hệ thống có ML | MAJOR |
| Section 3.6 có nhưng thiếu 1–2 mục con | MAJOR |
| Section trống hoàn toàn không có N/A | MINOR |
| N/A có nhưng không có lý do | MINOR |
| Revision History trống | MINOR |
| Glossary bỏ qua term xuất hiện trong REQs | MINOR |

---

## DIM-2: Requirement Format (Định dạng từng REQ)

Kiểm tra từng requirement có đủ các field bắt buộc.

### Checklist — áp dụng cho MỖI REQ

- [ ] ID đúng schema `REQ-[AREA]-[NNN]` (AREA từ danh sách chuẩn)
- [ ] **Status** có và thuộc: `draft | active | deprecated | waived`
- [ ] **Priority** có và thuộc: `High | Medium | Low`
- [ ] **Owner** có (tên người hoặc team)
- [ ] **Statement** dùng đúng keyword: `shall` / `should` / `may` (hoặc PHẢI / NÊN / CÓ THỂ)
- [ ] **Rationale** mô tả lý do tồn tại (không phải restate Statement)
- [ ] **Acceptance Criteria** có ít nhất 1 Given/When/Then
- [ ] **Verification Method** có và hợp lệ: `Test | Analysis | Inspection | Demonstration | Other`
- [ ] Nếu dùng `Other`: `More Information` giải thích rõ phương pháp

### AREA hợp lệ

`FUNC | INT | PERF | SEC | REL | AVAIL | OBS | COMP | INST | BUILD | DIST | MAINT | REUSE | PORT | COST | DEAD | POC | CM | ML`

### Dấu hiệu lỗi

| Lỗi | Severity |
|-----|---------|
| Không có AC | BLOCKER |
| Statement không dùng shall/should/may | BLOCKER |
| Thiếu Rationale | MINOR |
| Thiếu Status / Priority / Owner | MINOR |
| AREA không thuộc danh sách chuẩn | MINOR |
| Verification Method = `Other` mà không giải thích | MINOR |

---

## DIM-3: Verifiability (Khả năng kiểm chứng)

Mỗi requirement phải có thể write test case hoặc verification procedure từ nó.

### Forbidden words (từ tự động trigger BLOCKER nếu trong Statement)

```
nhanh, chậm, tốt, tệ, đủ, hợp lý, thích hợp, phù hợp, hiệu quả, nhanh chóng,
thân thiện, dễ dùng, dễ sử dụng, an toàn, bảo mật cao, mạnh mẽ, ổn định,
thường xuyên, thỉnh thoảng, kịp thời, sớm nhất, thông thường, adequate,
good, fast, slow, friendly, appropriate, reasonable, efficient, secure, robust
```

### Kiểm tra theo loại REQ

**Functional REQ:**
- [ ] Statement mô tả hành vi observable (input → processing → output)
- [ ] AC Then chứa kết quả đo được: status code / giá trị field / trạng thái DB
- [ ] Có ít nhất 1 negative AC (điều kiện fail)

**Performance REQ (PERF):**
- [ ] Có percentile cụ thể: p50 / p95 / p99 (không chỉ "average")
- [ ] Có ngưỡng số: "< 1000ms", không phải "dưới 1 giây nếu có thể"
- [ ] Có load condition: "dưới tải X concurrent users"
- [ ] Có measurement point: "đo tại API gateway / client / DB"
- [ ] Có môi trường đo: "staging với spec Y"

**Security REQ (SEC):**
- [ ] Phân biệt rõ mandatory (shall) vs recommended (should)
- [ ] Authn/authz requirements có cả success AND failure behavior

**Availability REQ (AVAIL):**
- [ ] Diễn đạt theo downtime/tháng hoặc downtime/year (user-understandable)
- [ ] Có measurement method (synthetic monitoring từ N regions)

**ML REQ (ML):**
- [ ] Metrics đo được: Precision@K, Recall, MRR, F1 — không phải "chất lượng tốt"
- [ ] Dataset version được pin (không phải "golden dataset")

### Dấu hiệu lỗi

| Lỗi | Severity |
|-----|---------|
| Forbidden word trong Statement | BLOCKER |
| AC Then không đo được ("hoạt động đúng", "thành công") | BLOCKER |
| Performance không có percentile | MAJOR |
| Performance không có load condition | MAJOR |
| Chỉ có happy path AC, không có negative | MAJOR |
| ML metric không pin dataset version | MAJOR |
| Availability chỉ có "99.9%" không có downtime/tháng | MINOR |

---

## DIM-4: Atomicity (Tính nguyên tử)

Mỗi REQ mô tả đúng 1 hành vi, có thể pass/fail độc lập.

### Dấu hiệu compound REQ

Tìm trong Statement:
- Hai động từ chính nối bằng "và", "or", "đồng thời", "cũng như", "ngoài ra"
- Mệnh đề điều kiện phức tạp che giấu 2 REQ khác nhau
- Acceptance Criteria test 2 feature hoàn toàn không liên quan

### Ví dụ compound → cần tách

❌ Compound:
```
REQ-FUNC-005: Hệ thống PHẢI validate file upload, extract text
và tạo embedding sau khi upload thành công.
```
→ Cần tách thành 3 REQ: validate / extract / embed

✅ Atomic:
```
REQ-FUNC-005: Hệ thống PHẢI từ chối file upload không phải PDF.
REQ-FUNC-006: Hệ thống PHẢI extract text từ PDF đã validate.
REQ-FUNC-007: Hệ thống PHẢI tạo embedding từ text đã extract.
```

### Dấu hiệu lỗi

| Lỗi | Severity |
|-----|---------|
| Statement chứa "và" nối 2 hành vi không liên quan | BLOCKER |
| AC test 2 feature không cùng REQ | BLOCKER |
| Statement dài hơn 3 dòng (thường là dấu hiệu compound) | MAJOR |

---

## DIM-5: Completeness (Tính đầy đủ)

SRS phải cover tất cả behavior cần thiết — không phải cover mọi thứ, mà cover đúng những gì scope đã khai báo.

### Cross-check bắt buộc

**2.1 Product Perspective → 3.1 External Interfaces:**
- [ ] Mỗi hệ thống external được mention trong 2.1 phải có ít nhất 1 REQ-INT hoặc được spec trong 3.1.3

**2.3 Constraints → Section 3:**
- [ ] Mỗi constraint bắt buộc trong 2.3 phải có REQ tương ứng trong Section 3 enforce nó
- [ ] REQ đó phải reference ngược về 2.3 trong Rationale hoặc More Information

**2.4 User Characteristics → 3.2 Functional:**
- [ ] Mỗi user role được define trong 2.4 phải có ít nhất 1 REQ-FUNC cover use case chính của role đó

**2.6 Apportioning → Section 3:**
- [ ] Requirements bị defer phải được đánh dấu rõ (Status: draft hoặc note trong 2.6)
- [ ] Không có REQ-ID xuất hiện trong Section 3 nhưng vắng mặt trong 2.6

**Section 3 → Section 4 Verification Matrix:**
- [ ] Mọi REQ-ID trong Section 3 phải có dòng tương ứng trong Verification Matrix
- [ ] Matrix phải có đủ 5 cột: Requirement ID | Verification Method | Test/Artifact Link | Status | Evidence

### Completeness theo loại hệ thống

| Loại hệ thống | REQ AREA bắt buộc |
|--------------|------------------|
| Bất kỳ hệ thống nào | FUNC, PERF, SEC |
| Có external API | INT |
| Có SLA / uptime cam kết | AVAIL, REL |
| Regulated (GDPR, HIPAA...) | COMP |
| Có AI/ML component | ML (3.6 đầy đủ 6 subsection) |
| Có audit/compliance requirement | OBS |

### Dấu hiệu lỗi

| Lỗi | Severity |
|-----|---------|
| Constraint trong 2.3 không có REQ enforce | MAJOR |
| User role trong 2.4 không có REQ cover | MAJOR |
| AI/ML system nhưng thiếu REQ-ML | MAJOR |
| Verification Matrix thiếu một số REQ-ID | MAJOR |
| Verification Matrix hoàn toàn không có | BLOCKER |
| REQ-ID trong Section 3 không có trong Apportioning 2.6 | MINOR |
| External system mention nhưng không có REQ-INT | MINOR |

---

## DIM-6: Internal Consistency (Nhất quán nội bộ)

Tài liệu không mâu thuẫn với chính nó.

### Kiểm tra

**ID:**
- [ ] Không có ID trùng lặp
- [ ] ID format nhất quán (không lẫn REQ-FUNC-001 với FR-001 hay FUNC_01)
- [ ] REQ-ID bị revise → có hậu tố `-[VER]` và có entry trong Revision History

**Cross-references:**
- [ ] Mọi REQ-ID được cross-ref (trong `More Information`) đều thực sự tồn tại
- [ ] Mọi section reference (vd "xem 3.3.2") trỏ đúng section
- [ ] Test artifact paths trong Verification Matrix tồn tại hoặc ghi rõ "pending"

**Semantic contradictions:**
- [ ] Không có 2 REQ cùng topic nhưng đặt requirements mâu thuẫn (vd: một REQ nói timeout 30s, REQ khác nói 60s cho cùng operation)
- [ ] shall/should/may dùng nhất quán — không có REQ dùng "should" cho behavior thực ra là mandatory trong business context

**Keyword consistency:**
- [ ] Cùng một khái niệm dùng cùng một tên xuyên suốt (không khi gọi "user" khi gọi "customer" cho cùng entity)
- [ ] Tên entity trong REQs phải match tên trong Glossary 1.3

### Dấu hiệu lỗi

| Lỗi | Severity |
|-----|---------|
| Hai REQ mâu thuẫn nhau (timeout/limit/behavior khác nhau cho cùng case) | BLOCKER |
| ID trùng lặp | BLOCKER |
| Cross-ref trỏ đến REQ-ID không tồn tại | MAJOR |
| should dùng cho behavior thực sự mandatory | MAJOR |
| Cùng entity dùng 2 tên khác nhau | MINOR |
| ID format không nhất quán | MINOR |
| Revision History không ghi khi REQ được revise | MINOR |
