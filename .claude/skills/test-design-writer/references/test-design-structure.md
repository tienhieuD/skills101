# Cấu trúc Test Design Specification

Chi tiết từng section của TDS + hướng dẫn chọn kỹ thuật test design.

---

## Header & Revision History

```markdown
# Test Design Specification
## For {{tên feature/feature group}} — {{tên release}}

TDS ID: TDS-{{PROJECT}}-{{NNN}}
Version: 1.0
Status: Draft | Review | Approved
Prepared by: {{tên QA Lead}}
Date: {{ngày}}
Parent Test Plan: TP-{{PROJECT}}-{{NNN}}

## Revision History
| Date | Version | Author | Changes |
|------|---------|--------|---------|
```

---

## Section 1 — TDS Identifier & References

Ghi ID duy nhất + link tới tài liệu nguồn:
- Test Plan cha: `TP-DOCQA-001`
- SRS: `docs/srs.md` (các REQ-ID được cover)
- Phạm vi: "TDS này cover FT-01 (file upload) và FT-05 (error handling) từ Test Plan"

---

## Section 2 — Features to Be Tested

Copy từ Test Plan, thêm cột REQ-ID để rõ nguồn:

```markdown
| Feature ID | Feature | REQ-ID | Technique đã chọn |
|-----------|---------|--------|-------------------|
| FT-01 | File upload (PDF, DOCX ≤ 10MB) | REQ-FUNC-001, REQ-FUNC-002 | EP + BVA |
| FT-03 | Câu trả lời Q&A | REQ-FUNC-010, REQ-FUNC-011 | EP (ngữ nghĩa) |
| FT-07 | Authentication | REQ-SEC-001, REQ-SEC-002 | State Transition + EP |
```

---

## Section 3 — Test Design Approach

Giải thích lý do chọn technique cho từng feature — không chỉ liệt kê tên.

```markdown
### FT-01 — File Upload
**Technique: EP + BVA**
- EP: để phân chia file format thành valid/invalid classes — test 1 đại diện mỗi class thay vì mọi format
- BVA: để test ranh giới file size (0B, 1B, 9.99MB, 10MB, 10.01MB) — đây là nơi bug hay xuất hiện

### FT-07 — Authentication
**Technique: State Transition**
- Hệ thống login có trạng thái rõ ràng (logged-out, logged-in, locked) và chuyển đổi giữa states
- State Transition đảm bảo cover cả valid và invalid transitions (vd: thử access resource khi logged-out)
```

---

## Section 4–5 — Test Conditions + Coverage Items (Inline format)

Phần quan trọng nhất của TDS. Dùng inline format cho dự án nhỏ/vừa:

```markdown
### TCOND-001 — File Format Validation
**Feature:** FT-01 | **REQ-ID:** REQ-FUNC-001 | **Technique:** Equivalence Partitioning

**Mô tả điều kiện:** Hệ thống cần xử lý đúng các file format khác nhau khi upload.

**Coverage Items:**
| CI | Class | Đại diện | Hành vi mong đợi |
|----|-------|---------|-----------------|
| CI-1 | Valid: PDF | file.pdf | Accepted, processing starts |
| CI-2 | Valid: DOCX | file.docx | Accepted, processing starts |
| CI-3 | Invalid: unsupported format | file.xlsx | Rejected, error RFC 7807 |
| CI-4 | Invalid: executable | file.exe | Rejected, error RFC 7807 |
| CI-5 | Invalid: no extension | file | Rejected, error RFC 7807 |

---

### TCOND-002 — File Size Validation
**Feature:** FT-01 | **REQ-ID:** REQ-FUNC-002 | **Technique:** BVA (3-value)

**Mô tả điều kiện:** Hệ thống phải reject file vượt 10MB và accept file trong giới hạn.

**Equivalence Partitions trước BVA:**
- EP-A (Invalid): size < 0 không thể xảy ra (OS constraint)
- EP-B (Invalid: empty): size = 0 bytes
- EP-C (Valid): 1 byte → 10,485,760 bytes (10MB chính xác)
- EP-D (Invalid: too large): > 10,485,760 bytes

**Coverage Items (BVA trên ranh giới EP-B/C và EP-C/D):**
| CI | Value | Thuộc EP | Hành vi mong đợi |
|----|-------|---------|-----------------|
| CI-1 | 0 bytes (empty) | EP-B | Rejected: "File is empty" |
| CI-2 | 1 byte (min valid) | EP-C, boundary | Accepted |
| CI-3 | 5 MB (mid valid) | EP-C, typical | Accepted |
| CI-4 | 10,485,760 bytes (10MB exact) | EP-C, max boundary | Accepted |
| CI-5 | 10,485,761 bytes (10MB + 1) | EP-D, boundary | Rejected: "File too large" |
| CI-6 | 50 MB | EP-D, typical | Rejected: "File too large" |
```

---

## Section 6 — Traceability Table

```markdown
## Traceability

| REQ-ID | Test Condition | Coverage Items | Test Cases (điền ở TCS) |
|--------|---------------|----------------|------------------------|
| REQ-FUNC-001 | TCOND-001 (Format validation) | CI-1 đến CI-5 | TC-001 → TC-005 |
| REQ-FUNC-002 | TCOND-002 (Size validation) | CI-1 đến CI-6 | TC-006 → TC-011 |
| REQ-FUNC-010 | TCOND-010 (Question scope) | CI-1 đến CI-4 | TBD |
| REQ-SEC-001 | TCOND-020 (Login states) | CI-1 đến CI-6 | TBD |
```

---

## Hướng dẫn chọn Test Design Technique

### Bảng quyết định nhanh

| Đặc điểm input/behavior | Technique | Lý do |
|--------------------------|-----------|-------|
| Input là số/range có ranh giới (age, size, price) | **BVA + EP** | BVA bắt bug ở biên; EP giảm số test case cần thiết |
| Input là string với tập giá trị rời rạc (format, status, type) | **EP** | Nhóm các giá trị equivalent, test 1 đại diện mỗi nhóm |
| Logic nhiều điều kiện kết hợp (if A AND B AND C then X) | **Decision Table** | Đảm bảo cover mọi combination quan trọng |
| Hệ thống có trạng thái rõ ràng (login, order status) | **State Transition** | Map và test mọi valid + invalid transition |
| Input ngôn ngữ tự nhiên (chatbot, search) | **EP theo ngữ nghĩa** | Phân loại theo intent/scope, không theo giá trị |
| Chưa rõ dùng gì / complex feature | **Error Guessing + EP** | Bắt đầu với EP để structure, bổ sung error guessing |

### Equivalence Partitioning — hướng dẫn chi tiết

**Mục tiêu:** Chia input space thành các nhóm (partitions) mà hệ thống xử lý theo cùng một cách. Test 1 đại diện mỗi nhóm là đủ.

**Cách chia partition:**
1. Luôn có ít nhất: valid partition + invalid partition(s)
2. Mỗi partition là homogeneous — mọi giá trị trong partition cho cùng kết quả
3. Partitions không overlap nhau, cover toàn bộ input space

**Ví dụ — Age field (18–65):**
```
EP-1: age < 18        → invalid (underage)
EP-2: 18 ≤ age ≤ 65  → valid
EP-3: age > 65        → invalid (overage)

Test 1 giá trị mỗi partition: 15, 30, 70
```

**Dấu hiệu partition tốt:** nếu test 1 giá trị fail, tất cả giá trị trong partition đó cũng fail.

### Boundary Value Analysis — hướng dẫn chi tiết

**Mục tiêu:** Test tại và ngay xung quanh ranh giới giữa các partition, vì developers hay mắc lỗi off-by-one tại đây.

**2-value BVA** (đủ cho hầu hết trường hợp):
- Test tại min và max của valid partition
- Ví dụ age 18–65: test {18, 65}

**3-value BVA** (khi muốn coverage cao hơn):
- Test tại min, min+1, max-1, max
- Ví dụ age 18–65: test {17, 18, 65, 66} — gồm cả boundary của partition invalid

**Kết hợp EP + BVA (khuyến nghị):**
- EP xác định partitions → BVA xác định boundary values cần test
- Không cần test mid-range nếu EP đã cover (vd: test age=30 là redundant sau khi đã có EP-2 representative)

### Decision Table Testing — hướng dẫn chi tiết

**Mục tiêu:** Đảm bảo cover mọi combination quan trọng của multiple conditions.

**Cách xây dựng:**
1. Xác định conditions (input factors, mỗi condition có giá trị T/F hoặc giá trị cụ thể)
2. Xác định actions (expected outcomes)
3. Mỗi column = 1 rule = 1 test case

**Ví dụ — Loan approval (điều kiện: salary ≥ 50M AND credit_score ≥ 700):**

| | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|---|--------|--------|--------|--------|
| salary ≥ 50M | T | T | F | F |
| credit_score ≥ 700 | T | F | T | F |
| **Result** | **Approved** | **Denied** | **Denied** | **Denied** |

4 rules = 4 coverage items = 4 test cases.

**Tối giản hóa bảng:** nếu action không phụ thuộc 1 condition → gộp rules (vd: Rules 2, 3, 4 đều là "Denied" → có thể tóm thành "nếu bất kỳ điều kiện nào false → Denied").

### State Transition Testing — hướng dẫn chi tiết

**Mục tiêu:** Test mọi valid transition (và các invalid transition quan trọng) trong state machine.

**Cách xây dựng:**
1. Xác định states (trạng thái của hệ thống)
2. Xác định events (gì trigger chuyển state)
3. Xác định transitions (từ state nào → đến state nào, qua event nào)
4. Coverage: 0-switch (mỗi state ≥ 1 lần) hoặc 1-switch (mỗi transition ≥ 1 lần — khuyến nghị)

**Ví dụ — Authentication states:**

```
States: [LOGGED_OUT] → [LOGGED_IN] → [LOCKED] → [LOGGED_OUT]

Transitions (valid):
T1: LOGGED_OUT --[login valid]--> LOGGED_IN
T2: LOGGED_IN --[logout]--> LOGGED_OUT
T3: LOGGED_OUT --[login invalid x3]--> LOCKED
T4: LOCKED --[unlock/wait]--> LOGGED_OUT

Invalid transitions (cũng cần test):
T5: LOCKED --[login attempt]--> LOCKED (không thay đổi state)
T6: LOGGED_OUT --[access protected resource]--> [403 Forbidden, state không đổi]
```

Coverage items: T1 → T6 (6 coverage items, mỗi item = 1 test case ở TCS).

---

## Checklist self-review

```
CẤU TRÚC
□ TDS có ID duy nhất và link tới Test Plan cha
□ Đủ 6 section; section không áp dụng ghi "N/A — lý do"

TEST CONDITIONS
□ Mỗi TCOND-XXX có mô tả rõ điều kiện cần test (không phải step thực thi)
□ Mỗi TCOND ghi rõ technique đã dùng + lý do chọn technique đó
□ Mỗi TCOND trace về ≥ 1 REQ-ID (hoặc ghi rõ nguồn nếu không có SRS)
□ Không có TCOND nào viết như test case (có "click", "enter", "expect status 200")

COVERAGE ITEMS
□ Mỗi coverage item là 1 class/boundary/rule/transition — không phải input cụ thể
□ EP: partitions không overlap, cover toàn bộ space, có cả valid và invalid
□ BVA: đã test tại boundary values, không chỉ mid-range
□ Decision Table: số rules đúng (2^n nếu n binary conditions, có thể tối giản)
□ State Transition: cover cả valid transitions và invalid transitions quan trọng

TRACEABILITY
□ Bảng traceability có cột REQ-ID → TCOND-ID → CI → TC-ID (placeholder)
□ Mọi FT-* trong Test Plan đều có ≥ 1 TCOND-ID trong TDS này
□ Không có TCOND "mồ côi" không có REQ trace
```
