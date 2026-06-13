# Cấu trúc Test Case Specification

Template đầy đủ, hướng dẫn từng field, ví dụ tốt/xấu, checklist.

---

## Document Header

```markdown
# Test Case Specification

**Document ID:** TCS-[PROJECT]-[MODULE]-v[VERSION]
**Version:** 1.0 | **Date:** YYYY-MM-DD | **Status:** Draft | Approved
**Project:** [Tên dự án] | **Test Level:** System | Integration | Unit
**Prepared by:** [QA Engineer] | **Reviewed by:** [QA Lead]
**Related Test Plan:** TP-[PROJECT]-[NNN]
**Related TDS:** TDS-[PROJECT]-[FEATURE]-[NNN]

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-13 | ... | Initial — N test cases |
```

---

## Template một Test Case

```markdown
### TC-[MODULE]-[NNN]: [Title]

| Field | Giá trị |
|-------|---------|
| **Test Case ID** | TC-AUTH-001 |
| **Version** | 1.0 |
| **Test Condition Ref** | TCOND-020 (Login States) |
| **Coverage Item** | CI-1 (Valid login → LOGGED_IN) |
| **Requirement Ref** | REQ-SEC-001 |
| **Priority** | P1-Critical |
| **Test Type** | Positive |
| **Feature** | Authentication |

**Preconditions:**
1. [Trạng thái user — cụ thể: "User testuser@example.com đã tạo và email verified"]
2. [Trạng thái hệ thống — "Không có active session cho user này"]
3. [Environment — "Staging environment online, smoke test passed"]

**Test Data:**
| Field | Giá trị | Ghi chú |
|-------|---------|---------|
| Email | testuser@example.com | User valid, trong test dataset DS-001 |
| Password | Test@1234! | Password đúng format |

**Test Steps & Expected Results:**
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate đến https://api-staging.example.com/v1/auth/token | — |
| 2 | POST body: `{"email": "testuser@example.com", "password": "Test@1234!"}` | HTTP 200 OK |
| 3 | Verify response body | Body chứa `access_token` (non-empty string), `token_type: "Bearer"`, `expires_in: 900` |
| 4 | Verify response header | Header `Content-Type: application/json` |

**Overall Expected Result:**
API trả về HTTP 200 với access token hợp lệ. Token có thể dùng để authenticate request tiếp theo.

**Pass/Fail Criteria:**
- ✅ Pass: HTTP status = 200; response body có `access_token`; token format là JWT (3 phần ngăn cách bởi `.`)
- ❌ Fail: Status ≠ 200; `access_token` absent hoặc empty; malformed JWT

**Postconditions:**
- User có valid access token để dùng cho các TC tiếp theo (nếu cần)
- Login event được log trong audit_log table

**Execution Result:** *(Điền khi chạy)*
| Actual Result | Status | Executed by | Date | Defect Ref |
|--------------|--------|-------------|------|-----------|
| | Pass / Fail / Blocked / Skipped | | | |
```

---

## Hướng dẫn từng field

### Title
**Công thức:** `[Hành động/Feature] + [Điều kiện] + [Kết quả mong đợi]`

| Tốt | Xấu |
|-----|-----|
| "Login thành công với email và password hợp lệ" | "Test login" |
| "Reject file upload khi vượt 10MB" | "File size test" |
| "Block account sau 3 lần nhập sai password" | "TC_001_auth" |
| "Trả về RFC 7807 error khi upload EXE file" | "Kiểm tra file" |

### Priority
| Level | Ký hiệu | Ý nghĩa | Ví dụ |
|-------|---------|---------|-------|
| Critical | P1 | Blocking — không pass thì không release | Happy path core feature |
| High | P2 | Quan trọng — phải pass trước release | Negative case core feature |
| Medium | P3 | Cần test, không blocking | Alternative flows, edge cases |
| Low | P4 | Nice-to-have | Cosmetic, minor edge case |

### Preconditions
Phải đủ để chạy TC **độc lập**. Mỗi precondition verify được.

| Tốt | Xấu |
|-----|-----|
| "User testuser@example.com tồn tại, email verified, chưa login" | "Hệ thống hoạt động bình thường" |
| "File test.pdf (5MB) có trong thư mục tests/fixtures/" | "Có file test để upload" |
| "API staging online — GET /health trả về 200" | "Server đang chạy" |
| "Không có active session — cookie/localStorage cleared" | "User đã logout" |

**Independence check:** Hỏi: "Nếu không chạy bất kỳ TC nào khác trước đó, TC này có chạy được không?" Nếu không → thiếu precondition.

### Test Data
Giá trị **cụ thể** — không dùng placeholder.

| Tốt | Xấu |
|-----|-----|
| `email: testuser@example.com` | `email: [valid email]` |
| `file: test-contract.pdf (5,242,880 bytes)` | `file: valid PDF file` |
| `password: Test@1234!` | `password: correct password` |

Negative case test data — ghi lý do chọn:
```markdown
| Field | Giá trị | Lý do |
|-------|---------|-------|
| file | malware.exe (1KB) | EP-4: binary/executable — invalid format |
| file | empty.pdf (0 bytes) | EP-A: empty file — boundary case |
| file | big-file.pdf (10,485,761 bytes) | EP-C: 1 byte over 10MB limit |
```

### Test Steps — Granularity đúng

| Level | Ví dụ |
|-------|-------|
| Quá chi tiết | "1. Mở Chrome 2. Gõ URL vào address bar 3. Nhấn Enter 4. Chờ page load" |
| Đúng (API test) | "1. POST /api/upload với file test.pdf, header Authorization: Bearer {token}" |
| Đúng (UI test) | "1. Navigate đến /upload 2. Click 'Choose File', select test.pdf 3. Click 'Upload'" |
| Quá tổng quát | "1. Upload file 2. Verify kết quả" |

**Rule:** Detail đủ để người mới reproduce mà không cần hỏi thêm.  
**Limit:** ~10–12 steps. Nhiều hơn → xem xét tách TC hoặc dùng Test Procedure.

### Expected Result — SMART

| Tiêu chí | Tốt | Xấu |
|---------|-----|-----|
| Specific | "HTTP 422, body có `type: unsupported-format`" | "Lỗi xuất hiện" |
| Measurable | "Response time < 2s (đo bằng Postman)" | "Phản hồi nhanh" |
| Accurate | Copy từ API Design doc: RFC 7807 format | "Thông báo lỗi phù hợp" |
| Relevant | Chỉ verify điều TC này kiểm tra | Verify cả những thứ khác |

### Atomicity check
Nếu Expected Result là: *"Upload thành công VÀ email thông báo được gửi VÀ inventory được cập nhật"* → đang test 3 thứ khác nhau → tách 3 TC:
- TC-A: Upload thành công (HTTP 200 + processing_id returned)
- TC-B: Email notification được gửi sau upload
- TC-C: Document indexed trong vector store sau processing

Exception: Các assertions trong cùng 1 atomic behavior có thể gộp: `HTTP 200 + access_token + token_type` đều là properties của 1 response object.

### Expected Result cho AI/RAG Output

LLM không trả về exact same text mỗi lần. Dùng 3 pattern thay vì exact match:

**Pattern 1 — CONTAINS (thông tin phải có):**
```
CONTAINS: câu trả lời đề cập đến "[tên điều khoản]" và "[ngày ký kết]" 
         (lấy từ golden_dataset.json, expected_facts)
```

**Pattern 2 — NOT CONTAINS (thông tin không được có):**
```
NOT CONTAINS: câu trả lời không được đề cập thông tin từ document khác
              không được hallucinate ngày, tên, số liệu không có trong tài liệu
```

**Pattern 3 — STRUCTURE (cấu trúc response):**
```
STRUCTURE: response body có field `answer` (non-empty), field `citations` (array ≥ 1 item),
           mỗi citation có `document_id` trỏ đúng file đã upload
```

**Evaluation method** — ghi rõ vào TC:
- `Evaluation: Manual` — QA đọc và judge (dùng cho golden dataset nhỏ)
- `Evaluation: Automated — keyword check` — script kiểm tra keyword presence
- `Evaluation: Automated — LLM judge` — dùng model phụ để evaluate (deepeval, custom)

### Postconditions
Ghi khi TC thay đổi data hoặc tạo side effect:

```markdown
Postconditions:
- Document "test-contract.pdf" đã được lưu trong storage và indexed
- Record trong bảng documents với status="indexed"
- Vector embeddings được tạo trong product_embeddings collection
- Cleanup: [test runner sẽ xóa document này sau session hoặc không — ghi rõ]
```

---

## Traceability Table (trong TCS)

```markdown
## Traceability

| REQ-ID | TCOND-ID | Coverage Item | TC-ID(s) | Status |
|--------|---------|---------------|---------|--------|
| REQ-FUNC-001 | TCOND-001 | CI-1: PDF valid | TC-UPL-001 | Planned |
| REQ-FUNC-001 | TCOND-001 | CI-2: DOCX valid | TC-UPL-002 | Planned |
| REQ-FUNC-001 | TCOND-001 | CI-3: XLSX invalid | TC-UPL-003 | Planned |
| REQ-FUNC-002 | TCOND-002 | CI-4: 10MB exact | TC-UPL-010 | Planned |
| REQ-FUNC-010 | TCOND-010 | CI-1: In-scope Q | TC-QNA-001 | Planned |
| REQ-FUNC-011 | TCOND-010 | CI-3: Out-of-scope Q | TC-QNA-010 | Planned |
```

---

## Checklist self-review

```
COMPLETENESS
□ Tất cả Coverage Items từ TDS đều có TC tương ứng
□ Mỗi TC có đủ fields bắt buộc (ID, Title, Preconditions, Test Data, Steps, Expected Result)
□ Traceability table hoàn chỉnh

QUALITY — TỪNG TC
□ Title nói rõ: gì + điều kiện + kỳ vọng
□ Preconditions cụ thể, verify được, đủ để chạy độc lập
□ Test data cụ thể (không placeholder)
□ Steps: mỗi step là 1 hành động, đủ granularity cho người mới
□ Expected Result SMART — không có "hoạt động đúng", "lỗi được hiển thị"
□ Pass/Fail Criteria binary rõ ràng
□ AI output TC: dùng CONTAINS/NOT CONTAINS/STRUCTURE, ghi Evaluation method

INDEPENDENCE
□ Không có TC nào yêu cầu TC khác chạy trước mà không ghi trong Preconditions
□ Test data được setup trong Preconditions, không "kế thừa" từ TC trước

ATOMICITY
□ Mỗi Expected Result là 1 assertion (không "A và B và C" cho 3 thứ khác nhau)
□ Nếu cần test nhiều thứ → tách thành nhiều TC

COVERAGE
□ Positive cases được cover
□ Negative cases được cover (ít nhất 1 per invalid partition)
□ Boundary values được cover cho field có range
□ AI output: in-scope, out-of-scope, adversarial đều có TC
```
