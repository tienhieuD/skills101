---
name: tad-writer
description: Hướng dẫn viết tài liệu kiến trúc phần mềm (Technical Architecture Document / TAD) theo chuẩn ISO/IEC/IEEE 42010:2011 kết hợp arc42 template. Sử dụng skill này khi user yêu cầu viết, tạo, hoặc cải thiện tài liệu kiến trúc, architecture document, architecture description, SAD (Software Architecture Document), hoặc cần mô tả kiến trúc hệ thống. Cũng dùng khi user cần viết ADR (Architecture Decision Record), mô tả building blocks, deployment view, runtime scenarios, hoặc documenting architecture decisions với rationale.
---

# TAD Writer — Viết tài liệu kiến trúc theo ISO/IEC/IEEE 42010 + arc42

Skill này hướng dẫn viết TAD theo **arc42 template** (12 sections) kết hợp với **ISO/IEC/IEEE 42010:2011** — chuẩn quốc tế cho architecture description.

## Nguyên tắc cốt lõi

1. **Viết tài liệu nhỏ nhất ngăn được hiểu lầm tốn kém.** Không viết để "cho đủ trang" — viết để dev mới, QA, và future-you hiểu đúng kiến trúc trong thời gian ngắn nhất. (Nguồn: arc42)
2. **Mọi view phải trace về concern của ít nhất một stakeholder.** Nếu không ai cần một view, đừng tạo nó. (Yêu cầu 42010)
3. **Section trống vẫn cần có nội dung.** Ghi "N/A — [lý do]" thay vì bỏ trống. Section trống không lý do = tài liệu chưa hoàn chỉnh.
4. **ADR là phần quan trọng nhất theo 42010 (clause 5.8.2).** Không có rationale = không có architecture document — chỉ là mô tả hiện trạng.
5. **Solution Strategy (Section 4) viết sau ADRs (Section 9), đặt trước trong tài liệu.** Thứ tự này là cố ý: Strategy là executive summary của quyết định đã có.

## Quy trình viết TAD (5 bước)

### Bước 1 — Thu thập input
Hỏi user hoặc đọc từ tài liệu có sẵn: tên hệ thống, scope, SRS/requirements liên quan, stakeholders chính, ràng buộc công nghệ, có thành phần AI/ML không. Nếu có SRS → đọc kỹ phần 2.1 (Product Perspective) và 2.3 (Constraints) trước.

### Bước 2 — Đọc cấu trúc template
Đọc `references/tad-structure.md` để nắm đầy đủ 12 sections, hướng dẫn từng mục, và criteria "done when". KHÔNG viết TAD mà chưa đọc file này.

### Bước 3 — Đọc ADR patterns
Đọc `references/adr-patterns.md` trước khi viết bất kỳ quyết định kiến trúc nào. Section 9 (Architecture Decisions) là phần quan trọng nhất và cũng dễ viết sai nhất.

### Bước 4 — Viết theo thứ tự thực tế (khác thứ tự tài liệu)
Thứ tự viết hiệu quả nhất:
```
3 (Context) → 1.3 (Stakeholders) → 1.2 (Quality Goals) →
7 (Deployment) → 5 (Building Block) → 6 (Runtime) →
9 (ADRs) → 4 (Solution Strategy) → còn lại
```
Section 4 viết cuối nhưng đặt đầu trong tài liệu — đây là intentional, không phải lỗi.

### Bước 5 — Self-review
Chạy checklist 42010 (cuối `references/tad-structure.md`) trước khi giao. Tối thiểu: 5 mục 42010 mandatory phải pass.

## Cấu trúc output

TAD hoàn chỉnh gồm 12 sections (chi tiết trong `references/tad-structure.md`):
```
0.  Thông tin chung
1.  Introduction & Goals      — stakeholders 🔒, quality goals, requirements overview
2.  Constraints               — kỹ thuật + tổ chức
3.  Context & Scope           — business context + technical context
4.  Solution Strategy         — tóm tắt quyết định (executive summary)
5.  Building Block View 🔒    — static structure, Level 1 là bắt buộc
6.  Runtime View 🔒           — behavior, sequence scenarios
7.  Deployment View 🔒        — infrastructure mapping
8.  Crosscutting Concepts     — patterns xuyên suốt (security, logging, AI/ML)
9.  Architecture Decisions 🔒 — ADRs với alternatives + rationale
10. Quality Requirements      — quality scenarios đo được
11. Risks & Technical Debt    — honest inventory
12. Glossary                  — domain terms
```
`🔒` = bắt buộc theo ISO/IEC/IEEE 42010:2011

Ba chế độ output:
- **Full TAD:** 12 sections đầy đủ (dự án từ medium trở lên — mặc định)
- **Architecture Brief:** Sections 1, 3, 5, 9 (dự án nhỏ, prototype, hoặc update nhanh)
- **ADR-only:** Chỉ Section 9 — khi user chỉ cần document một quyết định cụ thể

## Khi nào đọc reference nào

| Tình huống | Đọc file |
|-----------|---------|
| Bắt đầu viết TAD mới | `references/tad-structure.md` |
| Viết/review ADR cụ thể | `references/adr-patterns.md` |
| Hệ thống có AI/ML | `references/tad-structure.md` phần Section 8 |
| Không biết thứ tự viết | Quy trình Bước 4 ở trên |

## Lưu ý đặc biệt cho hệ thống AI/ML

Nếu hệ thống có RAG, chatbot, hoặc ML inference, Section 8 (Crosscutting Concepts) **bắt buộc** phải cover:
- Chiến lược chunking (kích thước, overlap, strategy)
- Embedding model selection và versioning
- Prompt template và guardrails
- Fallback behavior khi LLM unavailable hoặc trả sai format
- Cost/token monitoring strategy
