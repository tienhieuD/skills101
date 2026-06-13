# Ví dụ Test Plan — Hệ thống Document Q&A (RAG)

Đây là Test Plan rút gọn (condensed) cho một hệ thống Document Q&A dùng RAG — dự án 1 team nhỏ, sprint 2 tuần. Dùng làm reference pattern khi viết Test Plan thực tế.

**Lưu ý đọc:** Mục đích file này là cung cấp *pattern thực tế*, không phải template copy-paste. Các phần được đánh dấu `[PATTERN]` giải thích lý do lựa chọn để bạn áp dụng đúng cho dự án khác.

---

# Test Plan
## For DocQA System — Release v1.0 (Sprint 3)

**Test Plan ID:** TP-DOCQA-001  
**Version:** 1.0  
**Status:** Approved  
**Prepared by:** Nguyễn QA Lead  
**Date:** 2026-06-13  
**Parent document:** N/A — dự án nhỏ, không có Test Strategy riêng; nguyên tắc chung theo ISO 29119-3

**Revision History:**
| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-06-13 | 1.0 | Nguyễn QA | Initial |

---

## 1. Introduction

Test Plan này cover System Testing cho **DocQA v1.0** — hệ thống cho phép người dùng tải lên tài liệu PDF/DOCX và đặt câu hỏi bằng tiếng Việt, nhận câu trả lời dựa trên nội dung tài liệu.

**Phạm vi:** System test và integration test. Unit test do dev team thực hiện (không trong scope plan này).  
**Đối tượng đọc:** QA Lead, Dev Lead, Product Owner.  
**Liên kết:** SRS: `docs/srs.md` | API Design: `docs/api-design.md`

`[PATTERN: Introduction nên ngắn — 3-5 câu. Nếu ai đó đọc section này, họ phải biết ngay: plan này về cái gì, cho release nào, test level nào.]`

---

## 2. Test Items

| Item ID | Component | Version | Source |
|---------|-----------|---------|--------|
| TI-01 | FastAPI Backend | v1.0.0 (build #52) | GitHub Actions run #52 |
| TI-02 | React Frontend | v1.0.0 (build #52) | GitHub Actions run #52 |
| TI-03 | RAG Pipeline | Commit d4e9f21 | src/rag/ |
| TI-04 | Database schema | Migration 0008 | alembic/versions/ |

`[PATTERN: Ghi build number cụ thể — không ghi "latest". Nếu build chưa có, ghi "TBD — expected 2026-06-19".]`

---

## 3. Features to Be Tested

| Feature ID | Feature | REQ-ID | Priority | Test Level |
|-----------|---------|--------|----------|------------|
| FT-01 | Tải lên tài liệu (PDF, DOCX ≤ 10MB) | REQ-FUNC-001, REQ-FUNC-002 | High | System |
| FT-02 | Xử lý tài liệu — chunking + embedding | REQ-ML-001, REQ-ML-002 | High | Integration |
| FT-03 | Đặt câu hỏi và nhận câu trả lời | REQ-FUNC-010, REQ-FUNC-011 | High | System |
| FT-04 | Citation — trích dẫn đoạn nguồn | REQ-FUNC-012 | Medium | System |
| FT-05 | Xử lý lỗi: file không hỗ trợ, file rỗng | REQ-FUNC-003, REQ-FUNC-004 | Medium | System |
| FT-06 | Thời gian phản hồi (latency) | REQ-PERF-001 | High | Performance |
| FT-07 | Authentication (login, logout, token) | REQ-SEC-001, REQ-SEC-002 | High | System |

---

## 4. Features Not to Be Tested

| Feature | Lý do | Kế hoạch |
|---------|-------|---------|
| Stress test (> 100 concurrent users) | MVP cho ≤ 20 users — ngoài scope v1.0 | Q3 2026 nếu scale |
| Penetration testing | Cần team security, không có trong sprint | v1.1 |
| Multi-language support | Chỉ tiếng Việt trong v1.0 | REQ-FUNC-099 (defer) |
| Offline mode | Không có trong requirements | Không có kế hoạch |

---

## 5. Test Approach

### Test Levels trong Plan này

| Level | Scope | Ai thực hiện |
|-------|-------|-------------|
| Integration Test | API endpoints ↔ database ↔ vector store | QA + Dev |
| System Test | End-to-end user flows (upload → ask → answer) | QA Lead |
| Performance Test | FT-06 latency dưới tải | QA Lead + Locust |

Unit test: Dev team đã chạy, coverage report gắn vào build CI — không test lại trong plan này.

### Test Types

- **Smoke test:** Deploy xong → chạy 5 test case core (upload, ask, get answer) → xác nhận build deployable
- **Functional test:** Test case theo từng FT-*
- **Regression test:** Sau mỗi defect fix → chạy lại test case liên quan + smoke
- **Performance test:** Locust script, 10 concurrent users, 5 phút → đo p95 latency

### Test Techniques

- Equivalence partitioning cho file upload (hỗ trợ / không hỗ trợ / quá size)
- Boundary value: file 0 bytes, file 10MB, file 10.1MB
- Error guessing: câu hỏi ngoài scope tài liệu, tài liệu bị corrupt, câu hỏi rất dài (> 500 chars)

### Automation

- Tool: Pytest + httpx cho API; Playwright cho smoke test UI flow
- Automated sau sprint này: smoke test + FT-01, FT-07 (auth)
- Manual: FT-02 (quality evaluation), FT-03 (relevance judgment), FT-04 (citation accuracy)
- Target: ≥ 60% test cases automated sau v1.0

`[PATTERN: Ghi rõ cái nào automated, cái nào manual — và lý do. FT-02/03/04 cần human judgment vì đánh giá chất lượng AI output, không thể automated hoàn toàn.]`

---

## 6. Item Pass/Fail Criteria

### Per-Feature

| Feature | Pass Criteria |
|---------|--------------|
| FT-01 | ≥ 95% test case pass; 0 defect Critical/High; file upload và lưu đúng trong storage |
| FT-02 | Chunk count ≥ 1 cho mọi document; embedding stored trong vector DB; 0 defect Critical |
| FT-03 | ≥ 90% câu trả lời được đánh giá "relevant" bởi QA theo golden dataset; 0 defect Critical |
| FT-04 | Citation link đúng document trong ≥ 85% trường hợp theo golden dataset |
| FT-05 | 100% negative test case trả về error message đúng format (RFC 7807); 0 crash/500 |
| FT-06 | p95 latency ≤ 5s trong 10 concurrent users liên tục 5 phút trên staging |
| FT-07 | 100% auth test case pass; 0 defect Critical/High |

### Overall Exit Criteria (Release v1.0)

Release được phép deploy lên production khi TẤT CẢ điều kiện sau:

```
✓ Tất cả FT-* PASS theo criteria trên
✓ Run rate ≥ 95% (≥ 95% test case đã chạy)
✓ 0 defect Critical còn mở
✓ ≤ 3 defect High còn mở, mỗi defect có approved workaround từ Product Owner
✓ Performance test FT-06 PASS
✓ Smoke test trên staging PASS ngay trước release
✓ QA Lead sign-off
✓ Product Owner UAT sign-off (FT-03 demo 5 câu hỏi thực tế)
```

`[PATTERN: Exit criteria phải là checklist binary — mỗi dòng trả lời YES/NO, không có "khoảng xám". "≤ 3 defect High" rõ hơn "ít lỗi High". Thêm "với approved workaround" để tránh chặn release vì lỗi minor đã có cách xử lý tạm.]`

---

## 7. Suspension & Resumption Criteria

### Suspension — Dừng test cycle nếu:

```
1. Smoke test fail sau 2 lần deploy liên tiếp
   → Build không deployable, không thể test tiếp
2. ≥ 40% test case fail trong 1 ngày test
   → Hệ thống có vấn đề hệ thống, không hiệu quả tiếp tục
3. ≥ 2 defect Critical mở cùng lúc và block ≥ 3 feature
4. Staging environment down > 4 giờ trong business hours (9am–6pm)
5. LLM API key hết quota hoặc down > 2 giờ
```

### Resumption — Test tiếp khi:

```
1. (Do smoke fail) Dev confirm root cause, build mới pass smoke test
2. (Do ≥ 40% fail) Dev deploy fix, QA verify smoke pass trên build mới
3. (Do Critical defect) Fix đã được deploy và verified bởi QA trên defect đó
4. (Do environment down) DevOps confirm stable ≥ 1 giờ liên tục
5. (Do LLM API) Key được reset hoặc API khôi phục; QA verify FT-03 basic flow
```

`[PATTERN: Mỗi suspension condition có 1 resumption condition tương ứng. Đừng để resumption chung chung "khi vấn đề được giải quyết" — phải chỉ rõ ai verify gì.]`

---

## 8. Test Deliverables

**Trước test:**
- Test Plan này (`docs/test-plan.md`)
- Test Case Specification (`docs/test-cases.md`) — viết xong trước 2026-06-18
- Golden dataset: 50 Q&A pairs (`tests/fixtures/golden_dataset.json`)

**Trong test:**
- Daily defect update trên GitHub Issues (tag `sprint-3-defect`)
- Test execution log — cập nhật hàng ngày trong Google Sheet (link: {{link}})

**Sau test:**
- Test Summary Report (`docs/test-summary-v1.md`)
- Final defect list với resolution
- Test coverage matrix (Feature → Test Case → Result)

---

## 9. Testing Tasks & Schedule

| Task | Owner | Start | End | Depends on |
|------|-------|-------|-----|-----------|
| Viết test cases (FT-01 → FT-07) | QA Lead | 16/06 | 18/06 | SRS approved |
| Setup staging environment | DevOps | 16/06 | 17/06 | Build #52 ready |
| Prepare golden dataset | QA Lead | 16/06 | 18/06 | — |
| Smoke test | QA Lead | 19/06 | 19/06 | Environment ready |
| System test FT-01, FT-05, FT-07 | QA Lead | 20/06 | 23/06 | Smoke PASS |
| Integration test FT-02 | QA Engineer | 20/06 | 21/06 | Smoke PASS |
| System test FT-03, FT-04 | QA Lead | 22/06 | 24/06 | FT-02 PASS |
| Performance test FT-06 | QA Lead | 24/06 | 24/06 | FT-03 PASS |
| Regression test | QA Engineer | 25/06 | 26/06 | All defects fixed |
| Test Summary Report | QA Lead | 27/06 | 27/06 | Test complete |
| Sign-off meeting | QA Lead + PO | 28/06 | — | TSR done |

---

## 10. Environmental Needs

**Test Environment:**
- Staging: `https://api-staging.docqa.example.com`
- Database: PostgreSQL 16 (staging, seed data từ `tests/fixtures/db_seed.sql`)
- Vector DB: ChromaDB staging instance (port 8001)
- LLM: GPT-4o via OpenAI API (test key, budget cap $50)

**Test Data:**
- 20 PDF mẫu: hợp đồng (5), báo cáo tài chính (5), tài liệu kỹ thuật (10) — không chứa PII thực
- 5 file negative: file rỗng, file > 10MB, BMP, EXE, CSV
- Golden dataset: 50 Q&A pairs — reviewed bởi 2 người trước sprint

**Tools:**
- API testing: Pytest 7.x + httpx
- Performance: Locust 2.x (`tests/performance/locustfile.py`)
- Bug tracking: GitHub Issues, label convention: `severity:critical`, `severity:high`, v.v.

**Access requests:** Gửi DevOps Lead ({{tên}}) trước 2026-06-15.

---

## 11. Roles & Responsibilities

| Role | Người | Trách nhiệm chính |
|------|-------|------------------|
| QA Lead | {{tên}} | Plan, test cases, execution, sign-off |
| QA Engineer | {{tên}} | Integration tests, regression, defect retest |
| Dev Lead | {{tên}} | Fix defects theo priority, verify fix |
| DevOps | {{tên}} | Staging environment, deployment |
| Product Owner | {{tên}} | UAT (FT-03 demo), sign-off, waiver approval |

**Escalation:** QA Lead → Dev Lead → PM (nếu unresolved > 1 ngày)  
**Defect triage:** 9:30 AM hàng ngày, QA Lead + Dev Lead (15 phút)

---

## 12. Risks & Contingencies

| Risk ID | Risk | Prob | Impact | Contingency | Owner |
|---------|------|------|--------|-------------|-------|
| R-01 | LLM API latency cao / timeout trong test | Medium | High | Cache response cho smoke; mock LLM cho integration tests | QA Lead |
| R-02 | Build trễ hơn 2026-06-19 | Medium | High | Buffer 2 ngày; nếu trễ > 2 ngày: cut FT-04 (citation), defer v1.1 | PM |
| R-03 | QA Lead sick leave | Low | High | QA Engineer có Test Plan + Test Cases; daily handoff note | QA Lead |
| R-04 | Golden dataset chất lượng thấp → FT-03 criteria không reliable | Medium | Medium | Peer review 10 Q&A trước sprint; có thể relax criterion xuống 80% | QA Lead |
| R-05 | Staging environment không giống production (config drift) | Low | Medium | Env parity checklist trước mỗi sprint; DevOps review | DevOps |

---

## 13. Approvals

| Role | Tên | Sign-off | Date |
|------|-----|---------|------|
| QA Lead | {{tên}} | ☐ | |
| Dev Lead | {{tên}} | ☐ | |
| Product Owner | {{tên}} | ☐ | |

---

`[PATTERN SUMMARY cho toàn bộ example này:]`
- `Test Plan ngắn (5-6 trang) là đủ cho dự án 1 team nhỏ.`
- `Mọi criteria có số cụ thể — run rate %, pass rate %, defect count.`
- `Features có REQ-ID; Test Items có build number — traceability theo cả 2 chiều.`
- `Risks include LLM-specific (API cost, latency, output quality) — phù hợp dự án RAG.`
- `Manual test được giữ cho FT-03/04 vì cần human judgment về AI output quality.`
