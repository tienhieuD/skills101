# ADR Patterns — Architecture Decision Records

Architecture Decision Records (ADRs) là cốt lõi của 42010. File này hướng dẫn viết từng ADR đúng chuẩn.

---

## Template ADR (Hybrid Nygard + MADR)

```markdown
### AD-NNN: [Tiêu đề ngắn — "Chọn X cho Y"]

- **Status:** Proposed | Accepted | Deprecated | Superseded by AD-NNN
- **Date:** YYYY-MM-DD
- **Deciders:** [@người quyết định]

#### Context
[Tình huống buộc phải đưa ra quyết định này. Bao gồm:
- Technical, organizational, hoặc business constraints liên quan
- Vấn đề cần giải quyết
- Không ghi lý do chọn — chỉ ghi bối cảnh]

#### Options Considered
| Option | Pros | Cons |
|--------|------|------|
| Option A (chosen) | ... | ... |
| Option B | ... | ... |
| Option C | ... | ... |

#### Decision
[Quyết định đã chọn, viết present tense: "We will use X" hoặc "Chúng tôi chọn X"]

#### Rationale
[TẠI SAO chọn option này, dựa trên tiêu chí cụ thể. Đây là phần 42010 yêu cầu — không ghi "vì nó tốt"]

#### Consequences
- **Positive:** [kết quả tích cực]
- **Negative:** [đánh đổi, trade-off — phải honest]
- **Neutral:** [thay đổi trong cách làm việc, không tốt cũng không xấu]
```

---

## Ví dụ ADR đầy đủ

### AD-02: Chọn ChromaDB làm vector store

- **Status:** Accepted
- **Date:** 2024-01-15
- **Deciders:** [@lead-architect, @backend-dev]

#### Context
Hệ thống RAG cần lưu trữ và truy vấn vector embeddings của tài liệu. Dự án ở giai đoạn MVP, team 2 người, infra on-premise, không có budget cloud managed service.

#### Options Considered
| Option | Pros | Cons |
|--------|------|------|
| ChromaDB | Open source, Python-native, zero config, dễ local dev | Chưa production-hardened, scaling limit ~10M vectors |
| Qdrant | High performance, REST API, production-ready | Cần Rust setup, phức tạp hơn cho team nhỏ |
| Pinecone | Fully managed, scalable | Tốn kém, data rời khỏi on-premise (vi phạm ràng buộc) |
| FAISS | Cực nhanh, open source | Không có built-in persistence, không có HTTP API |

#### Decision
Chúng tôi sẽ dùng ChromaDB làm vector store cho giai đoạn MVP.

#### Rationale
Tiêu chí ưu tiên: (1) on-premise, (2) zero operational cost, (3) Python-native cho team Python, (4) đủ dùng cho scale MVP (<500K vectors). ChromaDB là lựa chọn duy nhất đáp ứng cả 4 tiêu chí. Pinecone vi phạm tiêu chí on-premise. FAISS thiếu persistence và API. Qdrant tốt hơn về performance nhưng operational complexity vượt quá nhu cầu MVP.

#### Consequences
- **Positive:** Setup in < 1 giờ; developer productivity cao; local dev dễ
- **Negative:** Cần migration nếu scale vượt 10M vectors; chưa có built-in backup
- **Neutral:** Team cần học ChromaDB Python client API (documented, < 1 ngày)

---

## Ví dụ ADR ngắn (Y-Statement format — dùng khi quyết định đơn giản)

```markdown
### AD-07: Monorepo thay vì microservices ở MVP

- **Status:** Accepted
- **Date:** 2024-01-15

**Decision (Y-Statement):**
Trong bối cảnh MVP với team 2 người và timeline 6 tuần, đối mặt với trade-off giữa
deployment simplicity và service isolation, chúng tôi chọn Python monorepo để đạt
được development speed, chấp nhận rằng refactor sang microservices sẽ cần thiết
nếu team scale lên > 5 người.

**Consequences:**
- Positive: single codebase, no inter-service network overhead, simple local dev
- Negative: không có service isolation; sẽ cần refactor khi team lớn
```

---

## Khi nào cần viết ADR

Viết ADR khi quyết định ảnh hưởng đến bất kỳ điều nào sau đây (theo Michael Nygard):
- **Structure:** thay đổi cách các components kết nối với nhau
- **Non-functional characteristics:** security, performance, availability model
- **Dependencies:** thêm/bỏ external library hoặc service
- **Interfaces:** thay đổi API contract, data format giữa components
- **Construction techniques:** build system, deployment method, testing strategy

**Không cần ADR cho:**
- Quyết định implementation chi tiết trong 1 component (chọn thuật toán sort)
- Quyết định có thể dễ dàng đảo ngược trong < 1 ngày
- Naming conventions, code style (thuộc coding standards, không phải architecture)

---

## Lỗi thường gặp khi viết ADR

| Lỗi | Ví dụ | Sửa |
|-----|-------|-----|
| Không có alternatives | Chỉ ghi option đã chọn | Luôn liệt kê ≥ 2 options đã xét, kể cả "không làm gì" |
| Rationale mơ hồ | "Chọn vì nó phổ biến" / "Team quen rồi" | Ghi tiêu chí cụ thể: cost, performance, skill fit, constraints |
| Decision và Rationale nhầm nhau | Rationale ghi "Chúng tôi chọn X vì chúng tôi chọn X" | Decision = WHAT; Rationale = WHY với criteria |
| Status không cập nhật | ADR "Proposed" nhưng đã implement 6 tháng | Update status sau khi quyết định được thực thi |
| Consequences chỉ positive | Không có negative hoặc trade-off | Honest về downside — đây là nơi để ghi "biết nhưng chấp nhận" |
| Superseded ADR không được link | AD-02 bị thay bởi AD-08 nhưng không ghi | Cập nhật Status: "Superseded by AD-08" + ngày |
| ADR quá nhiều context | ADR dài 2 trang mô tả lịch sử dự án | Context nên < 5 câu — chỉ những gì cần thiết để hiểu quyết định |

---

## ADR Status lifecycle

```
Proposed → Accepted → [Deprecated | Superseded by AD-NNN]
```

- **Proposed:** Đề xuất, chưa được approve
- **Accepted:** Đã approve, đang/sẽ implement
- **Deprecated:** Quyết định không còn áp dụng (do context thay đổi) nhưng không bị thay thế bởi ADR khác
- **Superseded:** Bị thay thế bởi ADR mới hơn (ghi rõ AD-NNN)

**Không bao giờ xóa ADR** — ngay cả khi deprecated/superseded. Lý do: audit trail và hiểu tại sao hệ thống hiện tại trông như vậy.
