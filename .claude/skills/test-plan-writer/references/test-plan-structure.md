# Cấu trúc Test Plan theo ISO/IEC/IEEE 29119-3:2021

Chi tiết 13 section, hướng dẫn viết từng mục, ví dụ tốt/xấu cho criteria.

---

## Header & Revision History

```markdown
# Test Plan
## For {{tên dự án}} — {{tên release/sprint}}

Test Plan ID: TP-{{PROJECT}}-{{NNN}}
Version: 1.0
Status: Draft | Review | Approved
Prepared by: {{tên QA Lead}}
Date: {{ngày}}
Parent document: {{Test Strategy hoặc "N/A — không có Test Strategy riêng"}}

## Revision History
| Date       | Version | Author | Changes |
|------------|---------|--------|---------|
| 2026-06-13 | 1.0     | ...    | Initial |
```

---

## Section 1 — Test Plan Identifier

Đặt ID duy nhất, ổn định cho tài liệu này. Format: `TP-[PROJECT]-[NNN]`

- `TP-DOCQA-001` — Test Plan đầu tiên cho project DocQA
- Ghi rõ version và trạng thái (Draft/Review/Approved)
- Liên kết tới Test Strategy cha nếu có

---

## Section 2 — Introduction

**Mục tiêu:** Người đọc mới hiểu tài liệu này cover gì, cho ai, trong phạm vi nào.

Nội dung cần có:
- Mục đích của Test Plan này (release/sprint cụ thể)
- Phạm vi: test level (system test? integration test?), environment, timeline
- Đối tượng đọc: QA team, dev lead, PM, stakeholders
- Liên kết tới SRS, TAD, API Design nếu có

---

## Section 3 — Test Items

**Mục tiêu:** Liệt kê cụ thể *artifacts nào* được test — không phải features, mà là build/component/version cụ thể.

```markdown
## Test Items

| Item ID | Component | Version/Build | Source |
|---------|-----------|--------------|--------|
| TI-01 | Backend API | v1.2.0 (build #47) | CI: github.com/org/repo/actions/runs/47 |
| TI-02 | Frontend Web App | v1.2.0 | CI: build #47 |
| TI-03 | Database schema | Migration 0012 | migrations/ |
| TI-04 | RAG Pipeline | Commit a3f8b12 | src/rag/ |
```

**Lưu ý:** Nếu build chưa có khi viết Test Plan, ghi "TBD — expected {{ngày}}" và cập nhật trước khi bắt đầu test.

---

## Section 4 — Features to Be Tested

**Mục tiêu:** Liệt kê rõ ràng những gì sẽ được test, có trace về REQ-ID.

```markdown
## Features to Be Tested

| Feature ID | Feature | REQ-ID(s) | Priority | Test Level |
|-----------|---------|-----------|----------|------------|
| FT-01 | Tải lên tài liệu (PDF, DOCX) | REQ-FUNC-001, REQ-FUNC-002 | High | System |
| FT-02 | Đặt câu hỏi và nhận câu trả lời | REQ-FUNC-010, REQ-FUNC-011 | High | System |
| FT-03 | Trích dẫn nguồn trong câu trả lời | REQ-FUNC-012 | Medium | System |
| FT-04 | Thời gian phản hồi < 5s (p95) | REQ-PERF-001 | High | Performance |
| FT-05 | Xử lý tài liệu không hỗ trợ | REQ-FUNC-003 | Medium | System |
```

**Nếu chưa có SRS:** Feature list vẫn phải rõ ràng, nhưng ghi chú "SRS chưa có — feature được derive từ PRD/spec {{link}}".

---

## Section 5 — Features Not to Be Tested

**Mục tiêu:** Làm rõ out-of-scope để tránh kỳ vọng không khớp. Mỗi item phải có lý do.

```markdown
## Features Not to Be Tested

| Feature | Lý do | Kế hoạch |
|---------|-------|---------|
| Stress test (> 1000 concurrent users) | Ngoài scope MVP — hệ thống dự kiến < 50 users | Sprint 3 nếu cần |
| Penetration test | Cần team security chuyên biệt, không có trong sprint này | Q3 2026 |
| Mobile responsive | UI web chưa có thiết kế mobile | Phase 2 |
| Multi-language support | Chỉ hỗ trợ tiếng Việt trong v1 | REQ-FUNC-099 defer |
```

---

## Section 6 — Test Approach

**Mục tiêu:** Mô tả *cách* test — test levels, test types, techniques, automation strategy.

### 6.1 Test Levels

Ghi rõ test level nào được thực hiện trong plan này, cái nào do team khác hoặc phase khác:

| Level | Ai thực hiện | Scope |
|-------|-------------|-------|
| Unit Test | Dev team | Functions/classes — không covered trong plan này |
| Integration Test | QA + Dev | API endpoints, database interaction |
| System Test | QA Lead | End-to-end user flows |
| UAT | Product Owner | Business acceptance — separate plan |

### 6.2 Test Types

- **Functional testing:** kiểm tra behavior theo SRS
- **Regression testing:** sau mỗi bug fix, chạy lại affected test cases
- **Smoke testing:** trước khi bắt đầu test cycle, verify build deployable
- **Performance testing:** đo p95 latency và throughput cho FT-04
- **Exploratory testing:** 20% thời gian test không có script — QA tự do khám phá edge cases

### 6.3 Test Techniques

- Black-box: equivalence partitioning, boundary value analysis cho input validation
- Experience-based: error guessing cho edge cases RAG (câu hỏi ngoài scope tài liệu, file corrupt)

### 6.4 Automation Strategy

```markdown
- Công cụ: Pytest + httpx cho API tests; Playwright cho E2E UI flows
- Automated: smoke tests, regression tests cho FT-01 đến FT-03 (sau sprint 1)
- Manual: exploratory tests, performance profiling, UAT scenarios
- Target automation ratio: ≥ 70% test cases được automated sau sprint 2
```

---

## Section 7 — Item Pass/Fail Criteria

**Mục tiêu:** Định nghĩa quality gate rõ ràng — khi nào một feature/build được coi là PASS.

### 7.1 Per-Feature Criteria

Mỗi Feature ID trong Section 4 có criteria riêng:

```markdown
| Feature | Pass Criteria |
|---------|--------------|
| FT-01 | ≥ 95% test case pass; 0 defect Critical/High còn mở |
| FT-02 | ≥ 95% test case pass; 0 defect Critical còn mở; câu trả lời relevant theo human evaluation ≥ 80% |
| FT-03 | ≥ 90% test case pass; citation link đúng trong ≥ 90% trường hợp |
| FT-04 | p95 latency ≤ 5s trong điều kiện 10 concurrent users, environment staging |
```

### 7.2 Overall Release Criteria (Exit Criteria)

**Ví dụ tốt — đo được:**
```markdown
Release được phép đi production khi:
- Tất cả FT-* feature đều PASS theo criteria trên
- ≥ 95% test case đã chạy (run rate)
- 0 defect Critical còn mở
- ≤ 2 defect High còn mở (với approved workaround)
- Performance test FT-04 PASS
- Smoke test trên production environment PASS
- QA Lead sign-off
```

**Ví dụ xấu — không đo được:**
```markdown
- Code ổn định ✗
- Hầu hết lỗi đã sửa ✗
- Team thấy tự tin release ✗
- Không còn lỗi quan trọng ✗  (→ "quan trọng" là gì?)
```

---

## Section 8 — Suspension & Resumption Criteria

**Mục tiêu:** Xác định trước khi nào dừng test cycle và điều kiện để tiếp tục.

### 8.1 Suspension Criteria

Dừng toàn bộ test cycle nếu bất kỳ điều kiện nào sau đây xảy ra:

**Ví dụ tốt:**
```markdown
Suspend testing if ANY of the following:
1. Smoke test fail sau 2 lần deploy liên tiếp → build không deployable
2. ≥ 40% test case fail trong 1 ngày → build có vấn đề hệ thống
3. Defect Critical mở và block ≥ 3 feature (FT-*) không test được
4. Test environment down > 4 giờ liên tục trong business hours
5. Thiếu tài nguyên: QA Lead không available do sick leave và không có backup
```

**Ví dụ xấu:**
```markdown
- Có quá nhiều lỗi ✗  (→ bao nhiêu là "quá nhiều"?)
- Môi trường không ổn định ✗  (→ không ổn định đến mức nào?)
```

### 8.2 Resumption Criteria

Test chỉ được tiếp tục khi:

```markdown
1. (Nếu dừng do smoke fail) Dev confirm root cause + build mới pass smoke test
2. (Nếu dừng do >40% fail) Dev fix và deploy lại, QA verify smoke pass
3. (Nếu dừng do Critical defect) Dev fix verified, QA regression pass trên defect đó
4. (Nếu dừng do environment) Infrastructure team confirm environment stable ≥ 1 giờ
5. QA Lead (hoặc backup được chỉ định) available để tiếp tục
```

---

## Section 9 — Test Deliverables

Liệt kê artifacts được produce, chia theo thời điểm:

```markdown
## Test Deliverables

### Trước khi test bắt đầu
- Test Plan này (tài liệu hiện tại)
- Test Case Specification (link: TCS-DOCQA-001)
- Test Data (test documents, test questions, expected answers)
- Test environment checklist

### Trong quá trình test
- Daily defect report (gửi qua Slack #qa-daily)
- Test execution log (cập nhật mỗi ngày trong Test Management Tool)
- Defect report trên GitHub Issues với tag `test-sprint-N`

### Sau khi test kết thúc
- Test Summary Report (TSR-DOCQA-001)
- Final defect list với status
- Test coverage matrix (Feature → Test Case → Pass/Fail)
- Lessons learned (nếu là sprint cuối release)
```

---

## Section 10 — Testing Tasks & Schedule

**Mục tiêu:** Ai làm gì, khi nào — đủ để track tiến độ.

```markdown
## Schedule

| Task | Owner | Start | End | Dependency |
|------|-------|-------|-----|-----------|
| Viết test cases | QA Lead | 2026-06-16 | 2026-06-18 | SRS approved |
| Setup test environment | DevOps | 2026-06-15 | 2026-06-16 | Build #47 ready |
| Smoke test | QA Lead | 2026-06-19 | 2026-06-19 | Environment ready |
| System test FT-01, FT-02 | QA Lead | 2026-06-20 | 2026-06-24 | Smoke PASS |
| System test FT-03, FT-04, FT-05 | QA Engineer | 2026-06-20 | 2026-06-24 | Smoke PASS |
| Regression test | QA Lead | 2026-06-25 | 2026-06-26 | All defects fixed |
| Test Summary Report | QA Lead | 2026-06-27 | 2026-06-27 | Test complete |
| Sign-off meeting | QA Lead + PM | 2026-06-28 | — | TSR done |
```

---

## Section 11 — Environmental Needs

```markdown
## Environmental Needs

### Test Environment
- Server: Staging environment (api-staging.example.com)
- Database: PostgreSQL 16 (staging instance, không dùng production data)
- Vector DB: ChromaDB instance riêng cho test
- LLM: GPT-4o API (dùng test API key, budget capped $50/sprint)

### Test Data
- 20 tài liệu PDF mẫu (mix: hợp đồng, báo cáo, kỹ thuật) — không chứa dữ liệu cá nhân thực
- 50 câu hỏi test với expected answer (golden dataset) — trong `tests/fixtures/`
- 5 file không hỗ trợ (BMP, EXE, CSV) cho negative tests

### Tools
- Test management: GitHub Issues + Labels
- API testing: Pytest + httpx
- Performance: Locust (script tại `tests/performance/`)
- Bug tracking: GitHub Issues (tag convention: `bug-critical`, `bug-high`, v.v.)

### Access
- QA cần: staging environment credentials, GitHub repo write access, LLM API test key
- Người cấp: DevOps Lead ({{tên}})
```

---

## Section 12 — Roles & Responsibilities

```markdown
## Roles & Responsibilities

| Role | Người | Trách nhiệm |
|------|-------|------------|
| QA Lead | {{tên}} | Viết Test Plan, Test Cases; điều phối test cycle; sign-off |
| QA Engineer | {{tên}} | Thực hiện test cases; report defects; regression |
| Dev Lead | {{tên}} | Fix defects theo priority; verify fix trước khi handoff |
| DevOps | {{tên}} | Duy trì test environment; deploy builds |
| Product Owner | {{tên}} | UAT sign-off; approve waiver cho deferred defects |

**Escalation path:** QA Lead → Dev Lead → PM → Stakeholder
**Defect triage:** hằng ngày 9:30 AM, QA Lead + Dev Lead
```

---

## Section 13 — Risks & Contingencies

Đây là *project risks* (ảnh hưởng kế hoạch test), không phải product risks.

```markdown
## Risks & Contingencies

| Risk ID | Risk | Probability | Impact | Contingency | Owner |
|---------|------|-------------|--------|-------------|-------|
| R-01 | Test environment không ổn định (LLM API timeout) | Medium | High | Cache expected responses cho smoke test; mock LLM cho unit/integration | DevOps |
| R-02 | Dev trễ deadline → build muộn | Medium | High | Buffer 2 ngày trong schedule; nếu trễ > 2 ngày, cut scope FT-05 | PM |
| R-03 | QA Lead sick leave | Low | High | QA Engineer backup đã đọc Test Plan; daily handoff note | QA Lead |
| R-04 | LLM API cost vượt budget | Low | Medium | Cap $50; nếu gần limit, switch sang smaller model cho smoke | QA Lead |
| R-05 | Golden dataset chất lượng thấp | Medium | Medium | Peer review 10 câu hỏi/1 người trước sprint | QA Lead |
```

---

## Checklist self-review

```
CẤU TRÚC
□ Đủ 13 section; section không áp dụng ghi "N/A — lý do"
□ Test Plan ID duy nhất, có version và status
□ Revision history khởi tạo

TEST ITEMS & SCOPE
□ Test Items có version/build cụ thể (không chỉ tên feature)
□ Features to Be Tested có REQ-ID trace (nếu có SRS)
□ Features Not to Be Tested có lý do rõ ràng cho mỗi item

CRITERIA — PHẢI ĐO ĐƯỢC
□ Entry criteria: không có tiêu chí mơ hồ (không "code ổn định")
□ Exit criteria: có metric cụ thể (run rate %, pass rate %, defect count)
□ Suspension criteria: có ngưỡng số cụ thể (không "quá nhiều lỗi")
□ Resumption criteria: có điều kiện xác minh được

TEST APPROACH
□ Test levels được ghi rõ (và level nào không covered, ai cover)
□ Automation strategy: tool, target ratio, timeline
□ Test types listed: functional, regression, smoke, performance (nếu có)

SCHEDULE & RESOURCES
□ Schedule có owner và dependency rõ ràng
□ Environmental needs: environment URL/name, tool versions, test data location
□ Roles có người cụ thể (không "QA team")
□ Escalation path được định nghĩa

RISKS
□ Mỗi risk có Probability + Impact + Contingency + Owner
□ Ít nhất cover: environment risk, timeline risk, resource risk
```
