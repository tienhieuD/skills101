# Review Criteria — 6 Dimensions cho TAD

Áp dụng theo thứ tự. Ghi PASS / PARTIAL / FAIL + findings cho từng dimension.

---

## DIM-1: Structure & Completeness

Kiểm tra khung tài liệu trước khi đi vào nội dung.

### Checklist

- [ ] Header có: tên hệ thống, version, tác giả, ngày
- [ ] Revision History có ít nhất 1 entry
- [ ] 12 sections (0–12) hiện diện hoặc có N/A với lý do
- [ ] **Section 1.3 Stakeholders & Concerns tồn tại** (mandatory 42010)
- [ ] **Section 5 Building Block View tồn tại với Level 1** (mandatory 42010)
- [ ] **Section 6 Runtime View có ít nhất 1 kịch bản** (mandatory 42010)
- [ ] **Section 7 Deployment View tồn tại** (mandatory 42010)
- [ ] **Section 9 Architecture Decisions có ít nhất 1 ADR** (mandatory 42010)
- [ ] Hệ thống có AI/ML: Section 8 cover chunking, embedding, prompt, fallback
- [ ] Section trống ghi rõ "N/A — [lý do]" thay vì để trống

### Severity table

| Lỗi | Severity |
|-----|---------|
| Thiếu Section 1.3 (Stakeholders) | BLOCKER |
| Thiếu Section 5 BB View Level 1 | BLOCKER |
| Thiếu Section 6 Runtime View | BLOCKER |
| Thiếu Section 7 Deployment View | BLOCKER |
| Thiếu Section 9 hoàn toàn | BLOCKER |
| AI/ML system nhưng Section 8 không có AI/ML concepts | MAJOR |
| Section trống không có N/A | MINOR |
| Revision History trống | MINOR |

---

## DIM-2: Stakeholder Coverage

Mọi concern của stakeholder phải được address bởi ít nhất một view. Đây là yêu cầu cốt lõi của 42010.

### Checklist

**Bước 1 — Lập danh sách concerns từ Section 1.3:**
Đọc mọi concern đã liệt kê. Ví dụ: "End User quan tâm tốc độ phản hồi", "DevOps quan tâm resource usage".

**Bước 2 — Map concern → view:**
| Concern | View có thể address |
|---------|-------------------|
| "Tốc độ phản hồi" | Runtime View (Section 6) — thấy latency trong flow |
| "Resource usage" | Deployment View (Section 7) — thấy hardware specs |
| "Component interactions" | BB View (Section 5) + Runtime View (Section 6) |
| "Security attack surface" | BB View + Deployment View |
| "Maintainability" | BB View Level 2 + Section 8 conventions |

**Bước 3 — Kiểm tra mỗi concern:**
- [ ] Mỗi concern trong 1.3 được address bởi ≥1 view
- [ ] Mỗi view trong 5–7 giải quyết concern của ≥1 stakeholder
- [ ] Không có view "mồ côi" — view tồn tại nhưng không giải quyết concern nào đã liệt kê

### Severity table

| Lỗi | Severity |
|-----|---------|
| Concern trong 1.3 không được address bởi bất kỳ view nào | MAJOR |
| View tồn tại nhưng không trace về concern nào | MAJOR |
| Section 1.3 có stakeholder nhưng không có concern | MINOR |
| Stakeholder rõ ràng quan trọng nhưng thiếu trong 1.3 (vd: DevOps cho hệ thống deployed) | MINOR |

---

## DIM-3: Architecture Decision Quality

ADRs là phần quan trọng nhất của TAD (42010 clause 5.8.2). Mỗi ADR phải có alternatives + rationale đủ để justify quyết định.

### Checklist — áp dụng cho MỖI ADR

- [ ] **Title** mô tả quyết định rõ ràng, dạng "Chọn X cho Y"
- [ ] **Status** thuộc: `Proposed | Accepted | Deprecated | Superseded by AD-NNN`
- [ ] **Context** giải thích bối cảnh buộc phải quyết định (không phải lý do chọn)
- [ ] **Options Considered** có ≥2 options (bao gồm option đã chọn)
- [ ] **Decision** rõ ràng, present tense: "We will use X" / "Chúng tôi chọn X"
- [ ] **Rationale** dựa trên tiêu chí cụ thể — không phải "vì nó phổ biến"
- [ ] **Consequences** có cả positive **và** negative/trade-off (không chỉ positive)
- [ ] Superseded ADR → ghi rõ "Superseded by AD-NNN"

### Dấu hiệu ADR kém chất lượng

❌ Rationale mơ hồ:
```
"Chúng tôi chọn ChromaDB vì nó phổ biến và dễ dùng."
```
✅ Rationale tốt:
```
"Tiêu chí ưu tiên: (1) on-premise, (2) Python-native, (3) zero managed overhead.
ChromaDB là lựa chọn duy nhất đáp ứng cả 3. Pinecone vi phạm (1).
FAISS thiếu persistence. Qdrant tốt hơn về perf nhưng phức tạp hơn nhu cầu MVP."
```

### Severity table

| Lỗi | Severity |
|-----|---------|
| ADR không có alternatives (chỉ ghi option đã chọn) | BLOCKER |
| ADR không có rationale hoặc rationale là "vì nó tốt" | BLOCKER |
| Quyết định kiến trúc quan trọng không có ADR (vd: chọn DB, chọn deployment model) | MAJOR |
| Consequences chỉ có positive, không có trade-off | MAJOR |
| ADR thiếu Status | MINOR |
| Superseded ADR không ghi "Superseded by" | MINOR |
| ADR không có Date | MINOR |

### Quyết định nào cần ADR (checklist nhanh)

Reviewer kiểm tra: các quyết định sau có ADR không?
- Chọn database / vector store
- Chọn LLM provider hoặc embedding model
- Deployment architecture (containers vs serverless vs on-premise)
- Authentication / authorization approach
- Chunking + embedding strategy (nếu có AI/ML)
- Backend framework chính
- Monorepo vs microservices

---

## DIM-4: View Consistency

Ba views (BB, Runtime, Deployment) phải mô tả cùng một hệ thống — không mâu thuẫn nhau.

### Checklist

**Building Block ↔ Runtime:**
- [ ] Mọi component xuất hiện trong Runtime View (Section 6) phải tồn tại trong BB View (Section 5)
- [ ] Không có component trong BB View nhưng không bao giờ xuất hiện trong bất kỳ Runtime scenario nào (orphan component)

**Building Block ↔ Deployment:**
- [ ] Mọi building block trong BB View Level 1 được map vào ít nhất 1 infrastructure node trong Deployment View
- [ ] Không có infrastructure node không có building block nào chạy trên đó

**Context ↔ BB View:**
- [ ] External systems trong Section 3 Context được spec là external interface trong BB View Level 1
- [ ] Không có external system trong BB View mà không xuất hiện trong Section 3

**Section 4 ↔ Section 9:**
- [ ] Mỗi quyết định tóm tắt trong Solution Strategy (Section 4) phải có ADR tương ứng trong Section 9
- [ ] Nội dung Section 4 không mâu thuẫn với nội dung ADR tương ứng

### Severity table

| Lỗi | Severity |
|-----|---------|
| Component trong Runtime không tồn tại trong BB View | MAJOR |
| BB Level 1 component không có node trong Deployment View | MAJOR |
| External system trong Section 3 không có interface spec trong BB View | MAJOR |
| Solution Strategy (4) mâu thuẫn với ADR tương ứng (9) | MAJOR |
| Orphan component (BB View nhưng không có runtime scenario) | MINOR |
| Infrastructure node không có component | MINOR |

---

## DIM-5: Quality Traceability

Quality Goals phải trace thành Quality Scenarios đo được, và scenarios phải có thể test được.

### Checklist

**Section 1.2 Quality Goals:**
- [ ] Mỗi goal có scenario đo được — không dùng buzzwords
- [ ] Mỗi goal có priority (1, 2, 3...)
- [ ] 3–5 goals, không nhiều hơn (quá nhiều = không có priority thực sự)

**Section 10 Quality Requirements:**
- [ ] Mỗi Quality Goal trong 1.2 có ≥1 scenario trong Section 10
- [ ] Mỗi scenario có: Stimulus + Response + Measure (đo được)
- [ ] Scenarios có thể trace về test cases (QA có thể viết test từ đây)

**Section 11 Risks & Technical Debt:**
- [ ] Rủi ro liên quan đến quality goals được link về quality goals
- [ ] Mỗi risk có: mức độ ảnh hưởng + kế hoạch xử lý (kể cả "Accept")

### Ví dụ quality goal đúng vs sai

❌ Buzzword:
```
Priority 1: Hệ thống phải nhanh và bảo mật.
```
✅ Đúng:
```
Priority 1: Performance — "RAG query p95 < 3000ms dưới tải 50 concurrent users"
Priority 2: Security — "Không có PII của user A visible trong response của user B"
```

### Severity table

| Lỗi | Severity |
|-----|---------|
| Quality Goal là buzzword không có scenario đo được | MAJOR |
| Quality Goal trong 1.2 không có scenario tương ứng trong Section 10 | MAJOR |
| Scenario không có Measure cụ thể | MAJOR |
| Section 10 hoàn toàn không có hoặc chỉ copy-paste từ 1.2 | MAJOR |
| Risk trong Section 11 không có kế hoạch xử lý | MINOR |
| Section 11 trống (dự án thực tế không có risk nào) | MINOR |

---

## DIM-6: Notation & Communication Clarity

Tài liệu phải rõ ràng với người đọc mục tiêu — không yêu cầu notation chuẩn nhưng phải nhất quán.

### Checklist

**Diagrams:**
- [ ] Mọi sơ đồ có chú thích (legend) hoặc dùng notation đủ phổ biến để không cần chú thích (C4, UML chuẩn)
- [ ] Notation nhất quán trong toàn tài liệu (không trộn C4 với informal boxes tùy hứng)
- [ ] Mũi tên có label: chiều dữ liệu + protocol/format (không chỉ là mũi tên trống)
- [ ] Nếu dùng notation tùy chỉnh → có Phụ lục A giải thích viewpoint

**Language:**
- [ ] Thuật ngữ domain-specific có trong Glossary (Section 12)
- [ ] Cùng một concept dùng cùng một tên xuyên suốt (không khi gọi "service" khi gọi "component" cho cùng thứ)
- [ ] Section 3 Context diagram đủ high-level (hệ thống là 1 black box, không thấy internal)

**Completeness of descriptions:**
- [ ] Mỗi building block có: tên, trách nhiệm (1 câu), technology stack
- [ ] Mỗi runtime scenario có: step-by-step sequence với actor rõ ràng
- [ ] Deployment View có resource requirements (vCPU, RAM, storage) cho mỗi node

### Severity table

| Lỗi | Severity |
|-----|---------|
| Sơ đồ không có legend và dùng notation không chuẩn | MAJOR |
| Context diagram show internal components (không high-level) | MINOR |
| Mũi tên trong diagram không có label protocol/direction | MINOR |
| Thuật ngữ RAG/embedding/chunk không có trong Glossary (nếu dùng) | MINOR |
| Notation không nhất quán (C4 trộn với informal) | MINOR |
| Building block thiếu technology stack | MINOR |
| Deployment node thiếu resource requirements | MINOR |
