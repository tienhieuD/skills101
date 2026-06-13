# Cấu trúc SRS theo MSRS Template (IEEE 830 / ISO 29148)

Nguồn: jam01/SRS-Template (srs-template.md). File này tóm tắt cấu trúc đầy đủ và hướng dẫn viết từng section.

## Mục lục

- [Header & Revision History](#header--revision-history)
- [1. Introduction](#1-introduction)
- [2. Product Overview](#2-product-overview)
- [3. Requirements](#3-requirements)
- [4. Verification](#4-verification)
- [5. Appendixes](#5-appendixes)
- [Checklist self-review](#checklist-self-review)

---

## Header & Revision History

```markdown
# Software Requirements Specification
## For {{tên dự án}}

Version 0.1
Prepared by {{tác giả}}
{{tổ chức}}
{{ngày}}

## Revision History
| Name | Date | Reason For Changes | Version |
|------|------|--------------------|---------|
```

---

## 1. Introduction

Mục tiêu: định hướng người đọc về hệ thống được đặc tả. Tóm tắt ngắn — chi tiết để các section sau.

### 1.1 Document Purpose
Viết 2–4 câu: SRS này tồn tại để làm gì, chứa gì, ai dùng (product, engineering, QA, security, compliance, operations). Nhấn mạnh: SRS định nghĩa hệ thống PHẢI LÀM GÌ, không phải LÀM NHƯ THẾ NÀO. Nhắc các tài liệu liên quan (vision/scope, architecture) nếu có.

### 1.2 Product Scope
Tên sản phẩm + version/release. 3–5 câu về mục đích chính, năng lực chủ chốt, kết quả mong đợi. Nếu SRS chỉ cover một phần hệ thống lớn → liệt kê rõ inclusions/exclusions. Kết nối capabilities với business objectives.

### 1.3 Definitions, Acronyms, and Abbreviations
Bảng glossary, sắp theo alphabet. Bao gồm các term ảnh hưởng đến cách hiểu requirements (vd: "user", "tenant", "near real-time", "chunk", "embedding").

```markdown
| Term | Definition |
|------|-----------|
| API  | Application Programming Interface — ... |
```

### 1.4 References
Mỗi reference: title, author/owner, version, date, location/URL. Đánh dấu **normative** (ràng buộc) hay **informative** (tham khảo). Ưu tiên link ổn định / đường dẫn repo thay vì URL dễ thay đổi.

### 1.5 Document Overview
3–5 câu tóm tắt từng section chính cover gì, quy ước tài liệu, và cách quản lý update/revision.

---

## 2. Product Overview

Mục tiêu: bối cảnh và background ảnh hưởng đến requirements.

### 2.1 Product Perspective
Sản phẩm mới, thay thế, hay thuộc một family? Nếu thuộc hệ thống lớn hơn → mô tả quan hệ, external interfaces, dependencies chính. Bao gồm ownership, SLA, support model. Context diagram cấp cao nếu hữu ích.

### 2.2 Product Functions
Tóm tắt cấp cao các nhóm chức năng chính — 5–10 bullets, nhóm theo logic. KHÔNG đi vào chi tiết behavior/data/edge case (để Section 3). Data flow hoặc use case diagram top-level nếu cần.

### 2.3 Product Constraints
Các ràng buộc định hình design: mandated interfaces, tech stack bắt buộc, nghĩa vụ pháp lý, QoS baseline, giới hạn phần cứng, họ model AI/ML, chính sách tổ chức.
- Viết dạng "must" verifiable: "must use FIPS 140-3 validated crypto modules"
- Phân biệt external/internal, mandatory/preferred
- Tránh design decisions trừ khi thực sự binding
- LƯU Ý: Section 3 sẽ định nghĩa các nghĩa vụ verifiable cụ thể để thỏa mãn constraints ở đây — requirements trong Section 3 nên reference ngược về 2.3.

### 2.4 User Characteristics
User classes, roles, personas — định nghĩa theo HÀNH VI, không chỉ theo chức danh. Ghi expertise, access levels, tần suất dùng, accessibility needs, goals. Lưu ý localization/accessibility ảnh hưởng UI/UX requirements.

### 2.5 Assumptions and Dependencies
Giả định (KHÁC với fact đã biết) về môi trường, phần cứng, usage patterns, third-party, tổ chức. Dependencies vào hệ thống/thư viện/team ngoài. **Với mỗi item: ghi impact nếu giả định sai.** Link tới risk register nếu có.

### 2.6 Apportioning of Requirements
Map requirements chính vào subsystems/services/releases. Dùng bảng cross-reference. Đánh dấu rõ requirement bị defer sang phase sau. Allocation chưa rõ → ghi explicit là follow-up.

---

## 3. Requirements

Phần quan trọng nhất. Mọi requirement ở đây phải VERIFIABLE — đủ chi tiết cho design và testing.

**Template áp dụng cho MỌI requirement** (chi tiết trong requirement-patterns.md):

```
- ID: REQ-[AREA]-[NNN]          ← thêm -[VER] khi revise (REQ-FUNC-001-2)
- Title: Tiêu đề ngắn
- Status: draft | active | deprecated | waived
- Priority: High | Medium | Low
- Owner: @người-duy-trì
- Statement: The system shall... / Hệ thống PHẢI...
- Rationale: Lý do tồn tại
- Acceptance Criteria: Given/When/Then
- Verification Method: Test | Analysis | Inspection | Demonstration | Other
- More Information: Context bổ sung, link artifacts liên quan
```

**Ghi chú:** Functional vs. non-functional không phân biệt rõ ràng trong thực tế — đây là expected. Khi một requirement thuộc hai AREA, chọn AREA primary, cross-ref AREA kia trong `More Information`.

**ID schema:** `REQ-[AREA]-[NNN]` (optional `-[VER]` khi revise) với AREA ∈ {FUNC, INT, PERF, SEC, REL, AVAIL, OBS, COMP, INST, BUILD, DIST, MAINT, REUSE, PORT, COST, DEAD, POC, CM, ML}

### 3.1 External Interfaces
Đặc tả mọi input/output bên ngoài — đủ chi tiết để implement và test.

- **3.1.1 User Interfaces** — UI elements, flows, standards (style guides, WCAG). Layout constraints, common controls, error/empty-state, localization. Visual design chi tiết → tài liệu UI riêng, chỉ reference.
- **3.1.2 Hardware Interfaces** — thiết bị hỗ trợ/không hỗ trợ, signals, protocols, timing/throughput. (Ghi "N/A" nếu pure software.)
- **3.1.3 Software Interfaces** — hệ thống kết nối (tên + version), services/APIs required/provided, data items/messages, protocols, limit/error/timeout semantics, shared data + ownership. Capture versioning + backward compatibility policy. Định nghĩa authn/authz cho từng integration. **Lưu ý:** IEEE 830 có thêm 3.1.4 Communications Interfaces (network protocols, handshaking, etc.) nhưng ISO 29148 gộp vào 3.1.3 — đặc tả communications protocol trong mục này.

### 3.2 Functional
Hành vi externally observable. Tổ chức theo feature/use case/service. Mỗi requirement mô tả: triggers/inputs → processing (black-box level) → outputs → error conditions.
- Bao gồm edge cases và negative scenarios
- **Với AI behaviors:** định nghĩa determinism bounds (temperature), refusal criteria, safety rules, human review points, fallback behaviors, ngưỡng abstention

### 3.3 Quality of Service
Quality attributes — dùng metric, range, condition CỤ THỂ. Khi quality chỉ áp dụng cho một nhóm functions → reference REQ-ID liên quan.

- **3.3.1 Performance** — timing, peak/steady-state loads, targets + cách đo + môi trường đo + ngưỡng chấp nhận. Chia subcategory: Time (latency, throughput) và Space (memory, storage, bandwidth). Scalability targets.
- **3.3.2 Security** — authn, authz, data protection (transit/rest), auditing, privacy. Abuse/misuse, external attacks (injection, exfiltration), secure defaults, incident response. Subcategories: Safety / Confidentiality / Privacy / Integrity / Availability. Phân biệt mandatory vs recommended.
- **3.3.3 Reliability** — MTBF, error budgets, retry/backoff, idempotency, redundancy. Failover behaviors, graceful degradation (fallback, cached results, deterministic heuristics cho AI/ML), timeout/abstain policies, rollback.
- **3.3.4 Availability** — uptime targets (diễn đạt theo cách user hiểu: downtime/tháng), maintenance windows, checkpointing/recovery/restart, redundancy theo zone. Tie vào SLA/SLO.
- **3.3.5 Observability** — logs/metrics/traces/profiling: events, fields, cardinality, sampling, retention, PII handling trong telemetry. Standard labels (service, version, tenant), trace ID propagation, redaction. Alert rules theo SLO, dashboards, ownership. (Runbook/on-call → 3.5.4.)

### 3.4 Compliance
Requirements từ chuẩn/luật/hợp đồng bên ngoài: format bắt buộc, naming, quyền provider/user, licensing, audit tracing, records retention, reporting. Mỗi item reference về 2.3 hoặc cite nguồn trực tiếp.

### 3.5 Design and Implementation
Ràng buộc về cách thiết kế, triển khai, bảo trì:
- **3.5.1 Installation** — platforms hỗ trợ, prerequisites, phương thức cài, env config (env vars, secrets), rollback/uninstall
- **3.5.2 Build and Delivery** — build reproducibility, dependency management, licensing, artifact verification, release promotion
- **3.5.3 Distribution** — deployment topologies, data replication, scale-out runbooks
- **3.5.4 Maintainability** — modularity, code complexity, coding standards, docs, tech debt management
- **3.5.5 Reusability** — components dự kiến reuse, API stability, packaging
- **3.5.6 Portability** — OS/arch/cloud/container hỗ trợ, abstraction layers, externalized config
- **3.5.7 Cost** — budget limits, cost-per-transaction, licensing, cloud spend envelope
- **3.5.8 Deadline** — milestones, delivery dates, dependencies giữa milestones
- **3.5.9 Proof of Concept** — objectives, scope, success criteria, timebox của POC
- **3.5.10 Change Management** — change categories (breaking/additive/bugfix), approval workflow, changelog/migration guides, compatibility guarantees, deprecation timelines, rollout/rollback

Section nhỏ nào không áp dụng → ghi "N/A — lý do" thay vì xóa.

### 3.6 AI/ML
**BẮT BUỘC với hệ thống có thành phần ML/AI** (RAG, chatbot, model inference). Đây là điểm khác biệt của MSRS so với IEEE 830 truyền thống.

- **3.6.1 Model Specification** — mục đích model, scope, expected behavior, inputs/outputs chính, performance objectives ĐO ĐƯỢC (vd: Precision@5 ≥ 80%). Validation datasets, benchmarks, versioning. Phân biệt baseline targets vs aspirational; định nghĩa tolerance cho drift.
- **3.6.2 Data Management** — nguồn gốc dataset, ownership, consent; labeling + quality controls; data lineage, versioning, reproducibility (training → validation → inference); storage, access controls, anonymization; xử lý missing/synthetic/augmented data.
- **3.6.3 Guardrails** — validate inputs, filter/constrain outputs, giới hạn actions để ngăn harm/misuse. Cơ chế phát hiện malicious inputs. Xét guardrails ở 3 layer: input, output, action. Escalation, logging, rollback khi safety constraint bị trigger. Cross-ref 3.3.2 và 3.6.4.
- **3.6.4 Ethics** — fairness objectives, explainability expectations, review requirements. Subcategories: Fairness / Interpretability / Explainability. Metric phù hợp context (demographic parity, equal opportunity).
- **3.6.5 Human-in-the-Loop** — đâu cần human review/approval/intervention. Review latency/throughput, escalation paths, feedback mechanisms, auditability của hành động con người. Link tới roles trong 2.4.
- **3.6.6 Model Lifecycle and Operations** — model từ dev → production thế nào, monitor performance + data quality ra sao, trigger retraining/rollback, versioning + archival.

---

## 4. Verification

Cách verify TỪNG requirement — bằng chứng khách quan của compliance. Bảng matrix **5 cột** song song với Section 3:

```markdown
| Requirement ID | Verification Method | Test/Artifact Link | Status | Evidence |
|---------------|--------------------|--------------------|--------|----------|
| REQ-FUNC-001  | Test               | tests/UC01.md      | Passed | reports/tuc01.html |
| REQ-SEC-003   | Analysis           | threat-model.md    | WIP    |          |
| REQ-AVAIL-001 | Analysis + Test    | monitoring/sla.md  | Planned|          |
```

Status hợp lệ trong matrix: `Planned` / `WIP` / `Passed` / `Failed` / `Waived`.

- Methods: test, canary metrics, analysis, inspection, demonstration
- Bao gồm cả positive + negative tests, cả non-functional (perf, security, reliability)
- Với AI: reference Model Cards, track version của eval datasets, đảm bảo reproducibility
- Đây là cầu nối sang tài liệu test theo 29119-3 (Test Plan → TDS → Test Cases)

---

## 5. Appendixes

Tài liệu hỗ trợ, KHÔNG normative: glossary mở rộng, data dictionary, diagrams, sample datasets, change-impact analyses. Reference thay vì duplicate nội dung.

---

## Checklist self-review

Trước khi giao SRS, kiểm tra:

```
CẤU TRÚC
□ Đủ 5 sections; section không áp dụng có ghi "N/A — lý do"
□ Revision history được khởi tạo
□ Glossary cover các term chuyên ngành trong tài liệu
□ Hệ thống có AI/ML → Section 3.6 đầy đủ 6 mục con

REQUIREMENTS
□ Mỗi REQ có ID duy nhất đúng schema REQ-[AREA]-[NNN]
□ Mỗi REQ có Status (draft | active | deprecated | waived)
□ Mỗi REQ có Priority (High | Medium | Low)
□ Mỗi REQ có Owner
□ Mỗi REQ có Statement dùng shall/should/may (PHẢI/NÊN/CÓ THỂ)
□ Mỗi REQ có Acceptance Criteria (ưu tiên Given/When/Then)
□ Mỗi REQ có Verification Method
□ Không có từ mơ hồ: "nhanh", "thân thiện", "an toàn", "dễ dùng"
□ Không có design decision lẫn trong functional requirements
□ Functional requirements có cả edge cases + negative scenarios
□ REQ span nhiều AREA → đã chọn AREA primary và cross-ref trong More Information

QoS
□ Performance có metric + điều kiện đo cụ thể (p95, môi trường, tải)
□ Security phân biệt mandatory vs recommended
□ Availability diễn đạt theo cách user hiểu được (downtime/tháng)

TRACEABILITY
□ Section 4 có matrix 5 cột đầy đủ mọi REQ-ID
□ Requirements reference ngược về constraints (2.3) khi liên quan
□ Apportioning (2.6) đánh dấu rõ requirement bị defer
```
