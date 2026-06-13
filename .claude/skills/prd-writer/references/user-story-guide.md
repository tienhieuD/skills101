# Hướng dẫn viết User Story + Acceptance Criteria

Template, ví dụ tốt/xấu, 2 format AC (GWT vs Checklist), traceability placeholder.

---

## User Story — Format chuẩn

```
As a [persona],
I want [capability/action],
So that [benefit/value].
```

**Quy tắc:**
- `[persona]` — dùng đúng tên persona đã định nghĩa (P-01, hoặc tên role ngắn gọn như "nhân viên văn phòng")
- `[capability]` — hành động cụ thể user muốn làm, không phải kết quả kỹ thuật
- `[benefit]` — lý do tại sao user cần, giá trị mang lại cho họ

---

## User Story — Ví dụ tốt / xấu

| Tốt ✅ | Xấu ❌ | Lý do xấu |
|--------|--------|-----------|
| "As a nhân viên văn phòng, I want to upload file hợp đồng PDF, so that I can hỏi đáp nội dung mà không đọc toàn bộ." | "As a user, I want the system to use ChromaDB to store embeddings so that retrieval is fast." | Mô tả "how" kỹ thuật, không phải nhu cầu user |
| "As a admin, I want to xem danh sách tất cả user, so that I can quản lý tài khoản khi cần." | "As a user, I want a good experience." | Quá mơ hồ, không testable |
| "As a khách hàng, I want to nhận email xác nhận sau khi đặt hàng, so that I biết đơn hàng đã được ghi nhận." | "As a user, I want to do everything related to orders." | Quá rộng, cần tách thành nhiều US |

**1 US = 1 atomic capability.** Dấu hiệu cần tách: story dùng từ "và" nối 2 capability khác nhau.

---

## Acceptance Criteria — 2 format

### Format 1: Checklist (Rule-Oriented)

Dùng khi: AC là rule đơn giản, không cần mô tả flow.

```markdown
**Acceptance Criteria:**

| AC ID | Criterion |
|-------|-----------|
| US-001-AC1 | Hệ thống chấp nhận file PDF ≤ 10MB và trả về thông báo "Upload thành công". |
| US-001-AC2 | Hệ thống từ chối file không phải PDF/DOCX và hiển thị: "Định dạng không được hỗ trợ. Vui lòng upload PDF hoặc DOCX." |
| US-001-AC3 | Hệ thống từ chối file > 10MB và hiển thị: "File vượt quá giới hạn 10MB." |
| US-001-AC4 | File được upload thành công xuất hiện trong danh sách "Tài liệu của tôi" trong vòng 30 giây. |
```

### Format 2: Given-When-Then (Scenario-Oriented)

Dùng khi: AC mô tả một scenario phức tạp có context, action, và expected state.

```markdown
**Acceptance Criteria:**

**US-010-AC1 — Câu hỏi có câu trả lời trong tài liệu:**
- **Given:** User đã upload và hệ thống đã xử lý xong tài liệu "hop-dong-abc.pdf"
- **When:** User nhập câu hỏi "Ngày ký kết hợp đồng là ngày bao nhiêu?"
- **Then:** Hệ thống trả lời với ngày ký kết đúng từ tài liệu và hiển thị trích dẫn nguồn (tên file, trang hoặc đoạn liên quan)

**US-010-AC2 — Câu hỏi ngoài phạm vi tài liệu:**
- **Given:** User đã upload tài liệu hợp đồng
- **When:** User hỏi thông tin không có trong tài liệu ("Giá cổ phiếu hôm nay là bao nhiêu?")
- **Then:** Hệ thống thông báo rõ ràng rằng câu hỏi nằm ngoài nội dung tài liệu, KHÔNG đưa ra câu trả lời phỏng đoán
```

### Khi nào dùng format nào?

| Tình huống | Format khuyên dùng |
|-----------|-------------------|
| Rule đơn giản: validation, permission, display | Checklist |
| Workflow có bước tuần tự: login → action → state | Given-When-Then |
| AI/LLM output với nhiều case (in-scope, out-of-scope) | Given-When-Then |
| Có thể dùng cả hai trong cùng 1 US | Được — mix format là OK |

---

## AC — Ví dụ tốt / xấu

| Tốt ✅ | Xấu ❌ | Vấn đề |
|--------|--------|--------|
| "File > 10MB bị từ chối và hiển thị thông báo lỗi rõ ràng." | "File upload hoạt động đúng." | Không testable — "đúng" là gì? |
| "Email xác nhận được gửi trong vòng 5 phút sau khi đặt hàng." | "Email được gửi nhanh chóng." | "Nhanh chóng" không đo được |
| "Sau 3 lần nhập sai mật khẩu, tài khoản bị khóa 15 phút." | "Hệ thống bảo mật tài khoản người dùng." | Quá mơ hồ |
| "Câu trả lời AI không chứa thông tin không có trong tài liệu." | "AI trả lời chính xác." | "Chính xác" không có tiêu chí rõ ràng |

**Testability check:** Đọc AC, hỏi: "Tôi có thể kiểm tra cái này là Pass hay Fail được không, mà không cần hỏi thêm?" → Nếu không → AC chưa đủ cụ thể.

---

## Traceability — US-XXX → REQ-ID

Mỗi US phải có field `Derived REQ-ID(s)` để trống khi viết PRD:

```markdown
| **Derived REQ-ID(s)** | TBD |
```

Khi srs-writer chạy sau, field này được điền:

```markdown
| **Derived REQ-ID(s)** | REQ-FUNC-001, REQ-FUNC-002 |
```

**Quy tắc mapping:**
- 1 US thường sinh ra 1–3 REQ-FUNC trong SRS
- AC của US → Test Condition (TCOND) trong TDS (tài liệu #11)
- Traceability chain hoàn chỉnh: `US-XXX` → `REQ-ID` → `TCOND-ID` → `TC-ID`

---

## US Priority

| Priority | Ý nghĩa | Ví dụ |
|----------|---------|-------|
| Must-have | Bắt buộc trong phase này — không có thì không release | Core feature, login |
| Should-have | Quan trọng nhưng có thể defer nếu hết time | Notification email |
| Nice-to-have | Tốt nếu có, không blocking | Dark mode, export |
| Out of scope | Không trong phase này — xem Section 3.2 | — |

---

## US Status

| Status | Ý nghĩa |
|--------|---------|
| Draft | Mới viết, chưa review |
| Pending Review | Đã gửi cho client/stakeholder |
| Confirmed | Client đã xác nhận scope |
| Revised | Đã sửa theo feedback, chờ re-confirm |
| Rejected | Client loại khỏi scope (ghi lý do) |

---

## Template hoàn chỉnh — 1 User Story

```markdown
### US-001: Upload file tài liệu

| Field | Giá trị |
|-------|---------|
| **User Story ID** | US-001 |
| **Priority** | Must-have |
| **Status** | Draft |
| **Persona** | P-01 (Nhân viên văn phòng) |
| **Derived REQ-ID(s)** | TBD |

**Story:**
As a nhân viên văn phòng,
I want to upload file hợp đồng PDF hoặc DOCX lên hệ thống,
So that I can hỏi đáp nội dung hợp đồng mà không cần đọc toàn bộ.

**Acceptance Criteria:**

| AC ID | Criterion |
|-------|-----------|
| US-001-AC1 | Hệ thống chấp nhận file PDF và DOCX có kích thước ≤ 10MB; hiển thị thông báo "Upload thành công". |
| US-001-AC2 | Hệ thống từ chối file có định dạng khác (EXE, XLSX, TXT...); hiển thị thông báo nêu rõ định dạng được hỗ trợ. |
| US-001-AC3 | Hệ thống từ chối file có kích thước > 10MB; hiển thị giới hạn kích thước cụ thể. |
| US-001-AC4 | File upload thành công xuất hiện trong danh sách "Tài liệu của tôi" trong vòng 30 giây. |
```

---

## Ví dụ AC cho AI/LLM output

AI output không xác định tuyệt đối → AC phải mô tả **điều kiện cần thỏa mãn**, không phải **text cụ thể phải trả về**.

```markdown
### US-010: Hỏi đáp nội dung tài liệu

**Acceptance Criteria:**

| AC ID | Criterion |
|-------|-----------|
| US-010-AC1 | Với câu hỏi có câu trả lời trong tài liệu: hệ thống trả lời có chứa thông tin đúng và kèm trích dẫn nguồn (tên file, vị trí). |
| US-010-AC2 | Với câu hỏi ngoài phạm vi tài liệu: hệ thống thông báo rõ ràng câu hỏi nằm ngoài nội dung — KHÔNG đưa ra câu trả lời phỏng đoán. |
| US-010-AC3 | Thời gian phản hồi ≤ 10 giây trong điều kiện bình thường. |
```

**Pattern:** Dùng `PHẢI chứa`, `KHÔNG được chứa`, `PHẢI kèm theo` thay vì chỉ định text cụ thể.
