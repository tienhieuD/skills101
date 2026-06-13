---
name: test-plan-writer
description: Hướng dẫn viết Test Plan theo ISO/IEC/IEEE 29119-3:2021 — tài liệu #10 trong SDLC, viết bởi QA Lead, mô tả chiến lược test tổng thể cho một dự án/release cụ thể. Sử dụng skill này khi user yêu cầu viết, tạo, hoặc cải thiện Test Plan, Master Test Plan, Level Test Plan, hoặc hỏi về entry/exit criteria, suspension criteria, test approach, test scope, test strategy cho một project cụ thể. KHÔNG dùng cho test case chi tiết (skill riêng).
---

# Test Plan Writer — Theo ISO/IEC/IEEE 29119-3:2021

Skill này hướng dẫn viết Test Plan **project-specific** — tài liệu mô tả *ai test gì, bằng cách nào, khi nào, với tài nguyên nào, dừng khi nào*. Đây là tài liệu #10 trong SDLC, đứng sau SRS và TAD.

## Nguyên tắc cốt lõi (đọc trước khi viết)

1. **Phân biệt Test Plan / Test Strategy / Test Approach:**
   - *Test Strategy* — cấp tổ chức/sản phẩm, áp dụng nhiều dự án, ít thay đổi. Mô tả nguyên tắc chung (test levels, tools, risk methodology).
   - *Test Plan* — cấp project/release, cụ thể, có ngày tháng và tên người. Translate strategy thành kế hoạch thực thi.
   - *Test Approach* — nằm bên trong Test Plan, mô tả *cách thực hiện* cho release này: test levels, test types, techniques, automation ratio.

2. **Mọi criteria PHẢI đo được.** Không chấp nhận tiêu chí mơ hồ:
   - Sai: "code ổn định", "hầu hết test case pass", "không còn lỗi nghiêm trọng"
   - Đúng: "100% unit test pass, coverage ≥ 80%, 0 defect Critical/High còn mở, ≥ 95% test case đã chạy"

3. **Features to be tested PHẢI trace về REQ-ID** (nếu project đã có SRS). Mỗi feature hoặc nhóm feature ghi rõ REQ-ID tương ứng — đây là cầu nối từ Test Plan về SRS.

4. **Risk-based approach cho project risks.** Liệt kê rủi ro ảnh hưởng đến *kế hoạch test* (không phải rủi ro sản phẩm) — timeline trễ, thiếu tài nguyên, môi trường không ổn định — và contingency tương ứng.

5. **Scale theo quy mô dự án.** Dự án nhỏ (1 team, < 3 tháng): Test Plan có thể gộp ngắn 3–5 trang, ghi "N/A — lý do" cho mục không áp dụng. Dự án lớn: tách Master Test Plan + Level Test Plan riêng. Không bao giờ bỏ trống mục mà không giải thích.

## Quy trình viết

### Bước 1 — Thu thập input
Hỏi user: scope dự án và release version, REQ-ID liên quan (nếu có SRS), môi trường test có sẵn, timeline, ai là QA Lead và devs liên quan, project có SRS/TAD chưa.

### Bước 2 — Đọc cấu trúc
Đọc `references/test-plan-structure.md` trước khi viết. File này mô tả chi tiết 13 section và có ví dụ tốt/xấu cho criteria. KHÔNG viết Test Plan mà chưa đọc.

### Bước 3 — Viết từng section
Đối chiếu ví dụ trong `references/test-plan-example.md` để nắm pattern thực tế — đặc biệt cho Test Approach, Entry/Exit Criteria, và Features to be Tested.

### Bước 4 — Kiểm tra traceability và measurability
Mọi feature → có REQ-ID; mọi criteria → có metric cụ thể; mọi risk → có owner và contingency.

### Bước 5 — Self-review
Chạy checklist cuối `references/test-plan-structure.md` trước khi giao.

## Cấu trúc output (13 section theo 29119-3)

```
1.  Test Plan Identifier     — ID, version, trạng thái, tài liệu cha
2.  Introduction             — mục đích, phạm vi, đối tượng đọc
3.  Test Items               — artifacts được test (build, version, component)
4.  Features to Be Tested    — feature list + REQ-ID trace
5.  Features Not to Be Tested— out-of-scope rõ ràng + lý do
6.  Test Approach            — test levels, types, techniques, automation
7.  Item Pass/Fail Criteria  — per-feature + overall release quality gate
8.  Suspension & Resumption  — khi nào dừng, khi nào tiếp tục
9.  Test Deliverables        — artifacts sản xuất trước/trong/sau test
10. Testing Tasks & Schedule — milestones, timeline, dependencies
11. Environmental Needs      — hardware, software, test data, tools
12. Roles & Responsibilities — ai làm gì, escalation path
13. Risks & Contingencies    — project risks + owner + mitigation
```

Hai chế độ output:
- **Single Plan** — 1 file `test-plan.md` (mặc định, dự án nhỏ/vừa)
- **Master + Level** — `test-plan-master.md` (scope toàn dự án) + `test-plan-system.md` / `test-plan-integration.md` riêng (dự án nhiều level/team)

## Ngôn ngữ & quy ước

Tiếng Việt mặc định. Giữ tiếng Anh cho: tên section chuẩn, thuật ngữ (entry criteria, exit criteria, test item...), tên defect severity (Critical/High/Medium/Low), tên test types (smoke test, regression test...).

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Bắt đầu viết hoặc cần hiểu 13 section | `references/test-plan-structure.md` |
| Cần ví dụ criteria tốt/xấu cụ thể | `references/test-plan-structure.md` phần Section 7–8 |
| Cần xem pattern Test Plan thực tế | `references/test-plan-example.md` |
| Không biết Test Approach nên viết gì | Cả hai — Section 6 trong structure + Section 6 trong example |
