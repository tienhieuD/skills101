# Cấu trúc TAD — arc42 + ISO/IEC/IEEE 42010

Nguồn: arc42 template (gernot-starke/arc42-template) + ISO/IEC/IEEE 42010:2011.
Ký hiệu: 🔒 = bắt buộc theo 42010 | ✍️ = thường viết trước dù đặt sau trong tài liệu.

---

## Header & Revision History

```markdown
# Technical Architecture Document
## For {{tên hệ thống}}

Version {{N.N}}
Prepared by {{tác giả}}
{{tổ chức}}
{{ngày}}

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | ... | ... | Initial draft |
```

---

## Section 0 — Thông tin chung

- Tên hệ thống (System of Interest)
- Liên kết tới SRS — ghi rõ version SRS đang reference
- Scope: hệ thống này là gì, không là gì (in-scope / out-of-scope)

**Done when:** Người đọc mới biết đây là tài liệu của hệ thống nào, SRS nào, và phạm vi bao gồm gì.

---

## Section 1 — Introduction & Goals 🔒

### 1.1 Requirements Overview
Tóm tắt (KHÔNG copy-paste toàn bộ) các yêu cầu từ SRS ảnh hưởng đến kiến trúc.
Chỉ liệt kê requirements có impact kiến trúc:
- Scale requirements: "100 concurrent users"
- Deployment constraints: "phải chạy on-premise"
- Integration requirements: "phải kết nối với hệ thống X"
- Non-functional constraints driving architectural decisions

**Done when:** Đọc mục này xong, architect mới hiểu tại sao kiến trúc trông như vậy.

### 1.2 Quality Goals
Top 3–5 quality goals, sắp theo độ ưu tiên. **Không dùng buzzword** — mỗi goal phải measurable.

| Priority | Quality Goal | Scenario đo được |
|----------|-------------|-----------------|
| 1 | Performance | "RAG query p95 < 3s dưới tải 50 users" |
| 2 | Maintainability | "Engineer mới onboard được trong < 1 ngày với tài liệu này" |

**Pitfall:** "Hệ thống phải nhanh, bảo mật, dễ dùng" — đây KHÔNG phải quality goals, là marketing text.

**Done when:** Mỗi goal có scenario đo được. Goals link sang Section 10 cho detail.

### 1.3 🔒 Stakeholders & Concerns
**Đây là yêu cầu bắt buộc của 42010 thường bị bỏ quên nhất.**
Mỗi view ở Section 5–7 phải giải quyết concern của ít nhất một stakeholder ở đây.

| Stakeholder | Vai trò | Concern chính |
|-------------|---------|--------------|
| End User | Người dùng cuối | Độ chính xác, tốc độ phản hồi |
| Product Owner | Chủ sản phẩm | Feature completeness, time-to-market |
| Dev Team | Người phát triển | Maintainability, testability, onboarding speed |
| DevOps / SysAdmin | Người vận hành | Deployment complexity, resource usage, monitoring |
| Security Officer | Bảo mật | Data isolation, audit trail, vulnerability surface |

**Done when:** Mọi stakeholder có ít nhất 1 concern được giải quyết bởi ít nhất 1 view (Section 5–7).

---

## Section 2 — Architecture Constraints

Ràng buộc định hình kiến trúc — những gì KHÔNG được thay đổi.

Phân loại:
- **Technical:** ngôn ngữ, framework, OS, DB bắt buộc, browser support, API versioning
- **Organizational:** ngân sách, team size, deadline, nhân sự với kỹ năng cụ thể
- **Conventions:** coding standards, security policies, licensing restrictions

**Format khuyên dùng:**
```
| Constraint | Loại | Nguồn / Lý do | Link ADR |
|-----------|------|--------------|---------|
| Phải dùng Python 3.11+ | Technical | Compatibility với Langchain | AD-02 |
| Ngân sách infra ≤ X$/tháng | Organizational | Budget approval Q3 | AD-05 |
```

**Pitfall:** Nhầm lẫn "constraint" (bắt buộc từ ngoài) với "decision" (do team chọn). Nếu team CÓ THỂ chọn khác → đó là ADR, không phải constraint.

**Done when:** Mọi ràng buộc bắt buộc được liệt kê. Constraint nào dẫn đến ADR → có link sang Section 9.

---

## Section 3 — Context & Scope ✍️ (viết trước)

### 3.1 Business Context
Sơ đồ context: hệ thống ở giữa, actors và external systems xung quanh.
Mỗi mũi tên ghi: hướng dữ liệu + giao thức/format đơn giản.

```
[User] --HTTP/HTTPS--> [System] --REST/JSON--> [Claude API]
                                --gRPC------> [Vector DB]
                       [Admin] --Web UI-----> [System]
```

**Pitfall:** Context diagram quá chi tiết (internal components visible) — Level 0 context chỉ nên thấy hệ thống như 1 black box.

### 3.2 Technical Context
Với mỗi external interface: tên hệ thống, protocol, data format, version API, ownership, SLA nếu có.

```
| External System | Protocol | Data Format | Version | Owned by |
|----------------|---------|------------|---------|---------|
| Claude API | HTTPS/REST | JSON | claude-3-5-sonnet | Anthropic |
| ChromaDB | Python client | BSON | 0.4.x | Internal |
```

**Done when:** Developer mới biết đủ thông tin để implement mỗi integration mà không cần hỏi.

---

## Section 4 — Solution Strategy ✍️ (viết sau Section 9, đặt trước)

Executive summary của các quyết định kiến trúc quan trọng. Viết CUỐI CÙNG, đặt ở đây.
Mỗi quyết định: 1–2 câu + link sang ADR tương ứng.

```
- Kiến trúc RAG với ChromaDB làm vector store — cân bằng đơn giản triển khai vs hiệu năng (AD-03)
- Stateless API backend — đơn giản horizontal scaling (AD-01)
- Python monorepo, không microservices ở giai đoạn MVP (AD-07)
```

**Done when:** Người đọc hiểu "big picture" kiến trúc sau 2 phút đọc mục này.

---

## Section 5 — 🔒 Building Block View

**Level 1 là bắt buộc.** Level 2/3 chỉ viết cho block phức tạp hoặc rủi ro cao.

### 5.1 Whitebox Level 1 (bắt buộc)
Sơ đồ hệ thống chia thành 3–6 building blocks. Với mỗi block:

```
| Block | Trách nhiệm (1 câu) | Technology | Interface chính |
|-------|--------------------|-----------|--------------| 
| Ingestion Service | Nhận, validate, chunk, embed tài liệu | Python/FastAPI | REST POST /documents |
| Vector Store | Lưu và tìm kiếm embedding | ChromaDB | Python client |
| QA API | Nhận query, retrieve, gọi LLM, trả kết quả | Python/FastAPI | REST POST /search |
| Frontend | UI cho end user | Streamlit | Web browser |
```

### 5.2 Whitebox Level 2 (chọn lọc)
Chỉ drill down cho block có logic phức tạp. Dùng cùng format bảng như Level 1.

**Pitfall phổ biến:**
- Tạo quá nhiều levels (L1, L2, L3 cho mọi block) → tốn công, nhanh lỗi thời
- Level 1 show internal components của từng block → mất tính black-box

**Done when:** Dev mới biết "có mấy thành phần chính, mỗi cái làm gì" sau khi đọc Level 1.

---

## Section 6 — 🔒 Runtime View

Mô tả behavior của hệ thống qua **2–4 kịch bản quan trọng nhất**.

Với hệ thống RAG, 2 kịch bản bắt buộc:
1. User gửi query → retrieval → LLM → kết quả
2. Upload tài liệu → chunking → embedding → lưu vector DB

Format: Mermaid sequence diagram HOẶC numbered steps — chọn một, dùng nhất quán.

```
Kịch bản: User Query Flow
1. User → Frontend: gửi câu hỏi (HTTP POST /search)
2. Frontend → QA API: forward request + session token
3. QA API → Vector Store: query top-K chunks (cosine similarity)
4. QA API → Claude API: prompt = system_prompt + chunks + question
5. Claude API → QA API: trả lời
6. QA API → Frontend: response với answer + source references
7. Frontend → User: render answer
```

**Pitfall:** Mô tả mọi luồng → tài liệu khổng lồ và không ai đọc. Chọn kịch bản **critical path** và **error path** quan trọng nhất.

**Done when:** QA biết phải test gì; Dev biết component nào gọi component nào trong từng flow.

---

## Section 7 — 🔒 Deployment View

### 7.1 Infrastructure Diagram
Sơ đồ: servers/VMs/containers, network, ports, storage.

```
[Cloudflare / Nginx] --> [App Container: FastAPI + Streamlit] --> [ChromaDB Container]
                                                              --> [External: Claude API via HTTPS]
[Admin] --> [Monitoring: Prometheus + Grafana]
```

### 7.2 Component–Node Mapping
```
| Building Block | Deployed on | Resource requirements |
|---------------|------------|----------------------|
| QA API | Docker container, app-server | 2 vCPU, 4GB RAM |
| ChromaDB | Docker container, db-server | 4 vCPU, 16GB RAM, 100GB SSD |
| Frontend | Same container as QA API | - |
```

### 7.3 Environment Requirements
OS, Docker version, network ports, storage I/O, TLS requirements.

**Done when:** DevOps có đủ thông tin để provision environment mà không cần hỏi.

---

## Section 8 — Crosscutting Concepts

Patterns và giải pháp áp dụng xuyên suốt nhiều building blocks. Mỗi concept chỉ cần 1 đoạn + link tài liệu chi tiết nếu có.

Các concept thường gặp:
- **Security:** authn/authz model, secret management, data encryption
- **Error Handling:** error codes, retry strategy, circuit breaker
- **Logging & Monitoring:** log format, log levels, metrics, alerting
- **Transaction Handling:** consistency model, rollback behavior

**Với hệ thống AI/ML — bắt buộc thêm:**
- **Chunking Strategy:** chunk size, overlap, document type handling
- **Embedding Model:** model name + version, update policy
- **Prompt Engineering:** template structure, guardrails, injection prevention
- **LLM Fallback:** behavior khi API timeout / rate limit / trả sai format
- **Cost Monitoring:** token tracking, cost alerts, budget limits

**Done when:** Developer không cần hỏi "logging ở đâu?", "nếu Claude API timeout thì sao?" — đọc mục này là đủ.

---

## Section 9 — 🔒 Architecture Decisions (ADRs)

**Đây là phần quan trọng nhất theo 42010 (clause 5.8.2).** Không có rationale = không đạt chuẩn.

Chi tiết template và ví dụ ADR → xem `adr-patterns.md`.

### Danh sách ADR (index)
```
| ADR ID | Tiêu đề | Status | Ngày |
|--------|---------|--------|------|
| AD-01  | Stateless REST API architecture | Accepted | 2024-01-15 |
| AD-02  | ChromaDB as vector store | Accepted | 2024-01-15 |
| AD-03  | Chunking strategy: fixed-size with overlap | Accepted | 2024-01-20 |
```

Số lượng ADR hợp lý cho dự án vừa: **5–10 quyết định lớn**.

Các quyết định thường cần ADR:
- Chọn vector store / database
- Chọn LLM provider và model
- Backend framework
- Chunking + embedding strategy
- Deployment architecture (containers vs serverless vs on-premise)
- Authentication approach
- Data retention và privacy model

**Done when:** Đọc ADR index xong, architect mới có thể trả lời "tại sao chọn X mà không chọn Y?" mà không cần hỏi team.

---

## Section 10 — Quality Requirements

Chuyển Quality Goals (Section 1.2) thành scenarios có thể test được.

```
| ID | Quality Goal | Stimulus | Response | Measure |
|----|-------------|---------|---------|---------|
| QS-01 | Performance | 50 concurrent users query RAG | System responds | p95 < 3000ms |
| QS-02 | Availability | Server restart during business hours | System recovers | Downtime < 5 min |
| QS-03 | Maintainability | New engineer joins | Understands architecture | < 1 day with this doc |
```

**Pitfall:** Quality scenarios là buzzwords ("hệ thống phải nhanh") — phải có measure cụ thể.

**Done when:** QA có thể viết test case từ mỗi scenario. Mỗi scenario trace về Quality Goal trong 1.2.

---

## Section 11 — Risks & Technical Debt

Honest inventory — không cần đẹp. "Biết rồi nhưng chưa làm" cũng là valid entry.

```
| ID | Rủi ro / Nợ kỹ thuật | Mức độ | Kế hoạch xử lý |
|----|----------------------|--------|---------------|
| R-01 | ChromaDB chưa có backup tự động | Cao | Cần setup cron backup trước production |
| R-02 | No retry khi Claude API rate limit | Trung | Implement exponential backoff — Sprint 5 |
| R-03 | Dùng fixed chunking — không optimal cho mọi doc type | Thấp | Accept ở MVP, revisit nếu accuracy < 0.8 |
```

"Accept — chấp nhận rủi ro ở giai đoạn MVP" là kế hoạch xử lý hợp lệ.

**Done when:** Không có rủi ro "ẩn" — mọi người đều biết hệ thống đang thiếu gì.

---

## Section 12 — Glossary

Chỉ ghi thuật ngữ đặc thù dự án hoặc dễ gây nhầm. Không định nghĩa từ phổ biến.

```
| Term | Definition |
|------|-----------|
| Chunk | Đoạn văn bản được tách từ tài liệu gốc, đơn vị lưu trữ trong vector DB |
| Embedding | Vector representation của chunk, dùng để tính cosine similarity |
| RAG | Retrieval-Augmented Generation — pattern kết hợp retrieval + LLM generation |
| Top-K | K chunks có similarity score cao nhất được trả về khi query |
```

---

## Phụ lục A — Viewpoints (chỉ khi dùng notation tùy chỉnh)

Bắt buộc nếu có sơ đồ dùng notation không chuẩn (không phải UML, C4, Mermaid).
Nếu mọi sơ đồ dùng C4/UML chuẩn, viết 1 câu: "Tất cả views dùng C4 model — xem [link]" và bỏ qua phụ lục này.

---

## Checklist 42010 (tự kiểm tra trước khi giao)

```
MANDATORY (42010)
□ Section 1.3 có Stakeholders & Concerns đầy đủ
□ Section 5 Building Block View Level 1 tồn tại
□ Section 6 Runtime View có ít nhất 2 kịch bản
□ Section 7 Deployment View tồn tại
□ Section 9 có ADRs với alternatives + rationale cho mỗi quyết định lớn
□ Mọi view trace về ít nhất 1 concern của 1 stakeholder

QUALITY
□ Quality Goals (1.2) dùng scenarios đo được, không dùng buzzwords
□ Mỗi constraint (Section 2) link sang ADR nếu dẫn đến quyết định kiến trúc
□ Section 4 là summary của Section 9 — nhất quán, không mâu thuẫn
□ Nếu AI/ML: Section 8 cover chunking, embedding, prompt, fallback, cost

CONSISTENCY
□ Building blocks trong Section 5 xuất hiện trong Section 6 (runtime) và Section 7 (deployment)
□ External systems trong Section 3 được spec trong Section 5.1 interfaces
□ Rủi ro trong Section 11 trace về quality goals hoặc constraints đã biết
□ Mọi thuật ngữ domain-specific có entry trong Section 12 Glossary
```
