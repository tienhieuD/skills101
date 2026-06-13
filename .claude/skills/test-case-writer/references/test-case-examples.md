# Ví dụ Test Case — Hệ thống Document Q&A (RAG)

5 ví dụ đầy đủ: upload file (EP/BVA), Q&A chatbot (AI output pattern), authentication (State Transition), và ví dụ Independence violation để nhận diện.

---

## TCS Header (ví dụ)

```markdown
# Test Case Specification
**Document ID:** TCS-DOCQA-UPLOAD-v1.0
**Version:** 1.0 | **Date:** 2026-06-13 | **Status:** Approved
**Project:** DocQA System v1.0
**Test Level:** System Test
**Prepared by:** QA Engineer
**Related TDS:** TDS-DOCQA-001
**Related Test Plan:** TP-DOCQA-001
```

---

## Ví dụ 1 — Positive case: Upload PDF hợp lệ (EP CI-1)

```markdown
### TC-UPL-001: Upload file PDF hợp lệ — nhận processing_id

| Field | Giá trị |
|-------|---------|
| Test Case ID | TC-UPL-001 |
| TCOND Ref | TCOND-001 (File Format Validation) |
| Coverage Item | CI-1: PDF valid |
| Requirement Ref | REQ-FUNC-001 |
| Priority | P1-Critical |
| Test Type | Positive |

**Preconditions:**
1. User testuser@example.com đã login — có valid access token (Bearer JWT)
2. Staging API online: GET /v1/health trả về 200
3. File `tests/fixtures/valid-contract.pdf` tồn tại (513KB, valid PDF structure)

**Test Data:**
| Field | Giá trị | Ghi chú |
|-------|---------|---------|
| Authorization header | Bearer [valid JWT from precondition] | |
| File | tests/fixtures/valid-contract.pdf | 513KB, PDF/1.4 |
| Content-Type | multipart/form-data | |

**Test Steps & Expected Results:**
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST /v1/documents với file `valid-contract.pdf`, Authorization header | HTTP 202 Accepted |
| 2 | Verify response body | Body có `document_id` (non-empty string, ≥ 20 chars), `status: "processing"` |
| 3 | Verify response header | `Content-Type: application/json` |

**Overall Expected Result:**
API accept file và trả về document_id để track processing status.

**Pass/Fail:**
- ✅ Pass: HTTP 202; `document_id` non-empty; `status = "processing"`
- ❌ Fail: HTTP ≠ 202; `document_id` absent; error body returned

**Postconditions:**
- Record tạo trong bảng `documents` với status = "processing"
- `document_id` có thể dùng để poll GET /v1/documents/{id} status
```

---

## Ví dụ 2 — Boundary case: File đúng 10MB (BVA CI-4)

```markdown
### TC-UPL-010: Reject upload file vượt giới hạn 10MB — BVA boundary+1

| Field | Giá trị |
|-------|---------|
| Test Case ID | TC-UPL-010 |
| TCOND Ref | TCOND-002 (File Size Validation) |
| Coverage Item | CI-5: 10,485,761 bytes (max+1) |
| Requirement Ref | REQ-FUNC-002 |
| Priority | P1-Critical |
| Test Type | Negative / Boundary |

**Preconditions:**
1. User testuser@example.com có valid JWT (lấy từ POST /v1/auth/token — setup độc lập)
2. File `tests/fixtures/oversized.pdf` tồn tại với kích thước chính xác 10,485,761 bytes
3. Staging API online

**Test Data:**
| Field | Giá trị | Ghi chú |
|-------|---------|---------|
| file | tests/fixtures/oversized.pdf | 10,485,761 bytes — 1 byte over 10MB |
| Authorization | Bearer [JWT] | |

**Test Steps & Expected Results:**
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST /v1/documents với oversized.pdf | HTTP 422 Unprocessable Entity |
| 2 | Verify response body | Body match RFC 7807: `type` chứa "file-too-large", `status: 422`, `detail` đề cập kích thước giới hạn |
| 3 | Verify database | Không có record mới trong bảng `documents` cho request này |

**Overall Expected Result:**
API từ chối file với error message rõ ràng. Không có side effect (không tạo record).

**Pass/Fail:**
- ✅ Pass: HTTP 422; body có `type` chứa "file-too-large"; DB không tạo record
- ❌ Fail: HTTP ≠ 422; file được accept; DB có record

**Postconditions:** Không có thay đổi data.
```

---

## Ví dụ 3 — AI output: Câu hỏi trong phạm vi tài liệu (EP CI-1)

```markdown
### TC-QNA-001: Trả lời câu hỏi in-scope với citation — CONTAINS pattern

| Field | Giá trị |
|-------|---------|
| Test Case ID | TC-QNA-001 |
| TCOND Ref | TCOND-010 (Q&A Question Scope) |
| Coverage Item | CI-1: In-scope, direct question |
| Requirement Ref | REQ-FUNC-010, REQ-FUNC-012 |
| Priority | P1-Critical |
| Test Type | Positive |
| Evaluation | Manual — QA judge with golden dataset |

**Preconditions:**
1. User testuser@example.com có valid JWT
2. Document `test-contract.pdf` đã được upload và indexed (status = "indexed")
   - Document ID: lấy từ test fixture `tests/fixtures/indexed_doc_id.txt`
   - Document chứa: "Ngày ký kết hợp đồng: 15/03/2026", "Bên A: Công ty ABC"
3. Staging API online

**Test Data:**
| Field | Giá trị |
|-------|---------|
| document_id | [Lấy từ indexed_doc_id.txt — setup trong Precondition] |
| question | "Ngày ký kết hợp đồng là ngày bao nhiêu?" |
| Golden expected facts | `tests/fixtures/golden_dataset.json` — entry question_id: Q001 |

**Test Steps & Expected Results:**
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST /v1/chat với body: `{"document_id": "[id]", "question": "Ngày ký kết hợp đồng là ngày bao nhiêu?"}` | HTTP 200 OK |
| 2 | Verify response structure | Body có `answer` (string, non-empty), `citations` (array, ≥ 1 item) |
| 3 | Verify answer CONTAINS | `answer` chứa "15/03/2026" hoặc "15 tháng 3 năm 2026" |
| 4 | Verify answer NOT CONTAINS | `answer` không chứa thông tin từ tài liệu khác, không chứa ngày/tên/số liệu không có trong test-contract.pdf |
| 5 | Verify citations STRUCTURE | Mỗi citation có `document_id` = [indexed doc ID], `page` hoặc `chunk_id` non-null |

**Overall Expected Result:**
API trả về câu trả lời có ngày ký kết đúng ("15/03/2026") và ít nhất 1 citation trỏ về test-contract.pdf.

**Pass/Fail:**
- ✅ Pass: HTTP 200; answer chứa ngày đúng; citations ≥ 1, trỏ đúng doc
- ❌ Fail: HTTP ≠ 200; answer thiếu ngày; citations rỗng hoặc trỏ sai doc; answer chứa thông tin sai

**Postconditions:** Không có thay đổi data (read-only operation).

**[PATTERN NOTE]** Tại sao không exact match? `answer` có thể là "Hợp đồng được ký kết vào ngày 15/03/2026" hoặc "Theo tài liệu, ngày ký là 15 tháng 3 năm 2026" — cả hai đều đúng. Chỉ cần ngày xuất hiện đúng, không cần từng từ giống nhau.
```

---

## Ví dụ 4 — AI output: Câu hỏi ngoài phạm vi (EP CI-3)

```markdown
### TC-QNA-010: Thông báo out-of-scope khi câu hỏi ngoài tài liệu — NOT CONTAINS

| Field | Giá trị |
|-------|---------|
| Test Case ID | TC-QNA-010 |
| TCOND Ref | TCOND-010 |
| Coverage Item | CI-3: Out-of-scope question |
| Requirement Ref | REQ-FUNC-011 |
| Priority | P2-High |
| Test Type | Negative |
| Evaluation | Manual + keyword check |

**Preconditions:**
1. Document `test-contract.pdf` đã indexed (như TC-QNA-001)
2. User có valid JWT
3. Xác nhận tài liệu KHÔNG chứa thông tin về "giá cổ phiếu" hay "thị trường chứng khoán"

**Test Data:**
| question | "Giá cổ phiếu công ty ABC hôm nay là bao nhiêu?" |
|----------|--------------------------------------------------|
| document_id | [indexed contract ID] |

**Test Steps & Expected Results:**
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST /v1/chat với câu hỏi về giá cổ phiếu | HTTP 200 (không phải error — đây là valid request) |
| 2 | Verify answer — NOT CONTAINS hallucination | `answer` KHÔNG chứa bất kỳ con số giá cổ phiếu nào (vd: "123,000 VND", "tăng 2%") |
| 3 | Verify answer CONTAINS out-of-scope signal | `answer` có signal "không có trong tài liệu", "tài liệu không đề cập", hoặc tương đương |
| 4 | Verify citations | `citations` rỗng [] HOẶC chứa note "no relevant content found" |

**Pass/Fail:**
- ✅ Pass: HTTP 200; answer không hallucinate giá; answer có out-of-scope signal
- ❌ Fail (Critical): answer chứa giá cổ phiếu cụ thể (hallucination); HTTP error

**Postconditions:** Không có thay đổi data.
```

---

## Ví dụ 5 — State Transition: Authentication lockout (CI-3)

```markdown
### TC-AUTH-030: Account bị lock sau 3 lần nhập sai password liên tiếp

| Field | Giá trị |
|-------|---------|
| Test Case ID | TC-AUTH-030 |
| TCOND Ref | TCOND-020 (Login States) |
| Coverage Item | CI-3: LOGGED_OUT → LOCKED via 3 failed logins |
| Requirement Ref | REQ-SEC-002 |
| Priority | P1-Critical |
| Test Type | Negative |

**Preconditions:**
1. User `locktest@example.com` tồn tại, email verified, chưa bị locked
2. Password đúng của user là `Correct@Pass1` (không dùng trong TC này)
3. API staging online
4. Lock counter reset: kiểm tra `failed_login_count = 0` cho user này — nếu cần, call test helper endpoint để reset

**Test Data:**
| Lần thử | Email | Password | Loại |
|---------|-------|---------|------|
| 1 | locktest@example.com | WrongPass@1 | Wrong (EP: invalid) |
| 2 | locktest@example.com | WrongPass@2 | Wrong (different to avoid caching) |
| 3 | locktest@example.com | WrongPass@3 | Wrong — trigger lockout |

**Test Steps & Expected Results:**
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST /v1/auth/token với WrongPass@1 | HTTP 401; body: `{"type": "...", "title": "Invalid Credentials", "status": 401}` |
| 2 | POST /v1/auth/token với WrongPass@2 | HTTP 401; cùng format |
| 3 | POST /v1/auth/token với WrongPass@3 | HTTP 429 Too Many Requests; body: `{"type": "...", "title": "Account Locked", "status": 429, "detail": "Account locked for 15 minutes"}` |
| 4 | POST /v1/auth/token với đúng password `Correct@Pass1` | HTTP 429 (vẫn locked mặc dù password đúng) |

**Overall Expected Result:**
Sau 3 lần sai liên tiếp, mọi login attempt (kể cả đúng password) đều bị reject trong 15 phút.

**Pass/Fail:**
- ✅ Pass: Step 3 trả về 429 với "Account Locked"; Step 4 vẫn 429
- ❌ Fail: Step 3 trả về 401 (không lock); Step 4 trả về 200 (accept sau lockout)

**Postconditions:**
- Account `locktest@example.com` bị locked
- **Cleanup cần thiết:** Test runner phải unlock account sau TC này (hoặc dùng dedicated test account được reset trước mỗi run)

**[PATTERN NOTE — Independence]** TC này tự reset lock counter trong Precondition #4 thay vì giả định TC khác đã cleanup. Đây là Independence đúng cách.
```

---

## Ví dụ Independence Violation — Nhận biết và sửa

**Lỗi phổ biến:**

```markdown
### TC-QNA-002: Hỏi câu hỏi thứ 2 về document đã upload ← WRONG

Preconditions:
1. Đã chạy TC-QNA-001 thành công (document đã indexed)  ← VI PHẠM INDEPENDENCE
```

**Vấn đề:** Nếu TC-QNA-001 bị skip hoặc fail → TC-QNA-002 bị block vì phụ thuộc. Khi chạy riêng lẻ hoặc out-of-order → fail không phải do bug.

**Sửa đúng:**

```markdown
### TC-QNA-002: Hỏi câu hỏi thứ 2 — câu hỏi tổng hợp ← CORRECT

Preconditions:
1. Document `test-contract.pdf` đã được upload và indexed
   Setup: Nếu chưa có, chạy helper script `scripts/setup_test_document.sh`
   hoặc verify: GET /v1/documents/{fixture_doc_id} trả về status="indexed"
2. User testuser@example.com có valid JWT  ← Setup độc lập
```

**Nguyên tắc:** Precondition mô tả **trạng thái** cần có, không mô tả **hành động** phụ thuộc.

---

## Ví dụ Atomicity Violation — Nhận biết và sửa

**Sai:**
```markdown
### TC-UPL-BAD: Upload file và verify mọi thứ

Expected Result:
- HTTP 202 returned
- Email notification gửi đến user@test.com trong 2 phút  ← đây là separate feature
- Document indexed sau 30 giây  ← đây là async processing feature  
- File lưu trong S3 storage  ← đây là storage feature
```

**Đúng — tách 3 TC:**
```markdown
TC-UPL-001: Upload file PDF — HTTP 202 và processing_id returned
TC-UPL-020: Upload file — email notification được gửi sau khi indexing xong
TC-UPL-030: Upload file — document có status="indexed" sau ≤ 30s processing
```

Mỗi TC fail riêng biệt → biết đúng cái gì bị break.
