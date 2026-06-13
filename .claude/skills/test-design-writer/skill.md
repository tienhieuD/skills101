---
name: test-design-writer
description: Hướng dẫn viết Test Design Specification (TDS) theo ISO/IEC/IEEE 29119-3:2021 — tài liệu #11 trong SDLC, cầu nối giữa Test Plan (chiến lược) và Test Case Specification (thực thi chi tiết). Sử dụng skill này khi user cần viết, tạo, hoặc cải thiện tài liệu Test Design Spec, cần derive "test conditions" từ requirements, chọn test design technique phù hợp (Equivalence Partitioning, BVA, Decision Table, State Transition), hoặc cần xây dựng traceability từ REQ-ID xuống test condition.
---

# Test Design Writer — Theo ISO/IEC/IEEE 29119-3:2021

Skill này hướng dẫn viết **Test Design Specification (TDS)** — tài liệu trả lời câu hỏi: *"Cần test ĐIỀU KIỆN GÌ, bằng kỹ thuật nào, để đạt coverage đủ?"* TDS là "đốt giữa" trong chuỗi traceability của toàn bộ test documentation.

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **Ba khái niệm theo thứ tự cụ thể hóa — đây là điểm dễ nhầm nhất:**

   ```
   Feature (từ Test Plan)
     ↓  [chọn kỹ thuật, phân tích]
   Test Condition — TCOND-XXX
     (điều kiện cần được verify: "gì cần test")
     ↓  [áp dụng kỹ thuật → sinh coverage items]
   Coverage Item — CI trong mỗi TCOND
     (mỗi class/boundary/transition = 1 coverage item)
     ↓  [tài liệu #12 — Test Case Spec]
   Test Case — TC-XXX
     (step-by-step cụ thể: input + expected result)
   ```

   - *Test Condition:* "File format validation cho upload" — mức trừu tượng, KHÔNG có input cụ thể
   - *Coverage Item:* "PDF hợp lệ", "EXE không hợp lệ" — mỗi class/giá trị
   - *Test Case:* "Upload file test.pdf 5MB → expect 200 OK, file_id returned" — step cụ thể

   **Dấu hiệu viết sai tầng:** nếu thấy mình viết "click button X", "enter password Y", "expect status 200" → đang viết Test Case, không phải Test Condition.

2. **Mỗi test condition dùng MỘT kỹ thuật cụ thể.** Ghi rõ technique đã chọn và lý do:
   - Input là số/range có ranh giới → **BVA + EP**
   - Logic nghiệp vụ phức tạp, nhiều điều kiện kết hợp → **Decision Table**
   - Hệ thống có trạng thái và chuyển đổi → **State Transition**
   - Input ngôn ngữ tự nhiên (chatbot, RAG) → **EP theo ngữ nghĩa** (không theo giá trị số)

3. **Mọi TCOND-ID phải trace về REQ-ID.** TDS là "đốt giữa": nhận từ SRS qua Test Plan, sẽ được tiếp tục trong TCS. Nếu không có SRS, ghi nguồn derive (vd: feature description, PRD).

4. **Coverage item ≠ test case.** Một test condition có nhiều coverage items; mỗi coverage item thường sinh 1 test case ở TCS. TDS liệt kê *cái gì* cần cover, TCS mới viết *làm thế nào*.

5. **AI/RAG — EP theo ngữ nghĩa.** Input tự nhiên không có ranh giới số, phân chia theo ý nghĩa: câu hỏi trong phạm vi tài liệu / ngoài phạm vi / mơ hồ / rỗng / quá dài / prompt injection. Chi tiết trong `references/test-design-examples.md`.

## Quy trình viết

### Bước 1 — Thu thập input
Từ Test Plan: danh sách features (FT-*) và REQ-ID; từ SRS: chi tiết từng requirement. Xác định test level (unit? integration? system?).

### Bước 2 — Đọc cấu trúc và technique guide
Đọc `references/test-design-structure.md` để nắm cấu trúc TDS và bảng chọn technique. KHÔNG viết TDS mà chưa đọc.

### Bước 3 — Derive test conditions
Với mỗi feature/REQ-ID: chọn technique → áp dụng → liệt kê test conditions + coverage items. Đối chiếu ví dụ trong `references/test-design-examples.md` cho pattern thực tế.

### Bước 4 — Gán ID và build traceability
Gán TCOND-XXX cho mỗi test condition, liệt kê coverage items có ký hiệu (CI-1, CI-2...). Điền bảng traceability: REQ-ID → TCOND-ID → [TC-ID sẽ điền ở TCS].

### Bước 5 — Self-review
Chạy checklist cuối `references/test-design-structure.md`. Đặc biệt kiểm tra: không có TCOND nào "leak" chi tiết thực thi sang tầng Test Case.

## Cấu trúc output (TDS theo 29119-3)

```
1. TDS Identifier          — ID duy nhất, version, link tới Test Plan
2. Features to Be Tested   — list FT-* từ Test Plan, với REQ-ID trace
3. Test Design Approach    — technique được chọn per feature + lý do
4. Test Conditions         — TCOND-ID, mô tả điều kiện, technique, REQ trace
5. Coverage Items          — list CI cho mỗi TCOND
6. Traceability Table      — REQ-ID → TCOND-ID → CI → [TC-ID placeholder]
```

Hai chế độ output:
- **Inline** — Sections 4–5 gộp chung trong 1 bảng (dự án nhỏ/vừa — mặc định)
- **Separated** — Section 4 riêng (conditions table) + Section 5 riêng (coverage items detail), dùng khi feature phức tạp với nhiều techniques

## Ngôn ngữ & quy ước

Tiếng Việt mặc định. Giữ tiếng Anh cho: tên technique (Equivalence Partitioning, BVA...), ID (TCOND-XXX, CI-N), tên field/input trong ví dụ.

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Cần nắm cấu trúc TDS + chọn technique | `references/test-design-structure.md` |
| Không biết dùng EP hay BVA | `references/test-design-structure.md` — bảng chọn technique |
| Cần ví dụ cụ thể cho 1 feature | `references/test-design-examples.md` |
| Viết test condition cho chatbot/RAG | `references/test-design-examples.md` — phần RAG |
| Bị nhầm test condition và test case | Nguyên tắc #1 trong skill.md này + ví dụ trong test-design-examples.md |
