---
name: test-case-writer
description: Hướng dẫn viết Test Case Specification theo ISO/IEC/IEEE 29119-3:2021 — tài liệu #12 trong SDLC, chi tiết nhất trong chuỗi test docs: từng bước thực thi cụ thể, dữ liệu cụ thể, kết quả mong đợi cụ thể. Sử dụng skill này khi user cần viết, tạo, hoặc cải thiện test case, cần biết cấu trúc đúng của test case theo chuẩn (preconditions, test data, steps, expected result, postconditions), hoặc cần xử lý expected result cho output AI/LLM không xác định tuyệt đối.
---

# Test Case Writer — Theo ISO/IEC/IEEE 29119-3:2021

Skill này hướng dẫn viết **Test Case Specification (TCS)** — tài liệu cụ thể nhất, thực thi được, trong chuỗi: Test Plan → Test Design Spec → **[TCS]** → Execution.

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **Mỗi TC trace về Coverage Item / TCOND-ID** (từ TDS) và xa hơn về REQ-ID (từ SRS).  
   Format ID: `TC-[MODULE]-[NNN]`. ID bất biến — không đổi, không tái sử dụng.

2. **Cấu trúc bắt buộc mỗi test case:**
   ```
   ID | Title | Priority | Test Condition Ref | Requirement Ref
   Preconditions → Test Data → Steps (numbered) → Expected Result → Postconditions
   ```
   Execution tracking (Actual Result, Status, Defect Ref) điền khi chạy, không viết sẵn.

3. **Independence — lỗi phổ biến nhất:**  
   Test case KHÔNG giả định test case khác đã chạy trước, trừ khi ghi rõ trong Preconditions. Setup data ngay trong Preconditions — không viết "Đã chạy TC-001 trước đó".

4. **Atomicity:** 1 TC = 1 mục tiêu kiểm tra. Dấu hiệu vi phạm: Expected Result có chữ "và" nối hai điều kiện không liên quan đến cùng 1 feature → tách thành 2 TC.

5. **Expected Result SMART:** Specific (element nào, nội dung gì), Measurable (có thể verify binary Pass/Fail), Accurate (đúng với spec), Relevant (liên quan TC này), Traceable. Không chấp nhận: "login thành công", "lỗi được hiển thị", "hệ thống hoạt động đúng".

6. **AI/RAG output — expected result linh hoạt:**  
   LLM output không xác định tuyệt đối → KHÔNG so khớp exact string. Dùng 3 pattern:
   - `CONTAINS:` câu trả lời phải chứa thông tin X (tên điều khoản, ngày ký...)
   - `NOT CONTAINS:` câu trả lời không được chứa thông tin sai Y
   - `STRUCTURE:` câu trả lời phải có citation link trỏ đúng document
   
   Với test case có AI output: ghi rõ `Evaluation: Manual — QA judge` hoặc `Evaluation: Automated — deepeval/custom metric`.

## Quy trình viết

### Bước 1 — Thu thập input
Danh sách TCOND-ID và Coverage Items cần viết TC (từ TDS), format ID đang dùng trong project, test level (API test? UI test?), ai sẽ execute (ảnh hưởng granularity của steps).

### Bước 2 — Đọc structure guide
Đọc `references/test-case-structure.md` để nắm template đầy đủ + ví dụ tốt/xấu. KHÔNG viết TC mà chưa đọc.

### Bước 3 — Viết test case, 1 case per coverage item
Mỗi coverage item từ TDS → 1 TC. Với AI output, áp dụng pattern trong `references/test-case-examples.md`.

### Bước 4 — Kiểm tra Independence + Atomicity
Với mỗi TC: (a) preconditions có đủ để chạy độc lập không? (b) expected result có phải là 1 assertion không?

### Bước 5 — Self-review
Chạy checklist cuối `references/test-case-structure.md`.

## Cấu trúc output

```
TCS Header (document ID, version, links tới TDS + Test Plan)
│
├── Traceability Table (REQ-ID → TCOND-ID → TC-IDs)
│
├── TC-MODULE-001: [title]
│   ├── Classification (TCOND ref, REQ ref, Priority, Type)
│   ├── Preconditions
│   ├── Test Data
│   ├── Steps + Expected Results
│   ├── Overall Expected Result
│   ├── Pass/Fail Criteria
│   └── Postconditions
│
├── TC-MODULE-002: ...
└── ...
```

Hai chế độ output:
- **Single file** — `test-cases.md` (mặc định, dự án nhỏ/vừa)
- **Per-module** — `test-cases-auth.md`, `test-cases-upload.md`... (dự án lớn)

## Ngôn ngữ & quy ước

Tiếng Việt mặc định. Giữ tiếng Anh cho: field names (Preconditions, Postconditions, Expected Result), TC ID, tên kỹ thuật, HTTP status codes, JSON.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Cần template đầy đủ + từng field hướng dẫn | `references/test-case-structure.md` |
| Thấy expected result "mơ hồ", cần ví dụ tốt/xấu | `references/test-case-structure.md` phần Expected Result |
| Viết TC cho feature AI/RAG chatbot | `references/test-case-examples.md` phần AI output |
| Cần ví dụ TC theo EP/BVA/Decision Table | `references/test-case-examples.md` |
| Nghi ngờ TC vi phạm Independence | `references/test-case-structure.md` phần Independence |
