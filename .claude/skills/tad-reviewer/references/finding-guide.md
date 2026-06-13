# Finding Guide — Cách viết TAD findings chính xác

---

## Template finding

```
| F-NNN | 🔴/🟠/🟡/💡 SEVERITY | Location | Issue (trích dẫn nguyên văn nếu cần) | Recommendation cụ thể |
```

- **Location:** Section số + tên, hoặc "AD-NNN". Không ghi "nhiều chỗ" — liệt kê.
- **Issue:** Mô tả lỗi + trích dẫn backtick nếu cần.
- **Recommendation:** Hành động cụ thể. Không ghi "cần cải thiện".

---

## Ví dụ findings đúng vs sai

### BLOCKER

✅ Đúng:
```
| F-001 | 🔴 BLOCKER | Section 1.3 | Section 1.3 Stakeholders & Concerns hoàn toàn vắng mặt | Bổ sung bảng Stakeholders với ít nhất: End User, Dev Team, DevOps — mỗi row có Concern cụ thể |
```

✅ Đúng:
```
| F-002 | 🔴 BLOCKER | AD-03 | Rationale ghi: "Chọn ChromaDB vì phổ biến" — không có tiêu chí, không có alternatives | Bổ sung Options Considered (≥2 options) và Rationale dựa trên tiêu chí: cost, on-premise constraint, Python compatibility |
```

❌ Sai (quá chung):
```
| F-002 | 🔴 BLOCKER | Section 9 | Các ADR không có rationale tốt | Cần viết rationale tốt hơn |
```

### MAJOR

✅ Đúng:
```
| F-005 | 🟠 MAJOR | Section 5 & Section 7 | BB View Level 1 liệt kê 4 components (Ingestion, VectorStore, QA API, Frontend) nhưng Deployment View chỉ map 2 nodes — VectorStore và QA API không có node | Thêm deployment mapping cho Ingestion Service và Frontend vào Section 7.2 |
```

### MINOR

✅ Đúng:
```
| F-008 | 🟡 MINOR | AD-01, AD-03, AD-05 | 3 ADRs thiếu Status field | Thêm `Status: Accepted` vào mỗi ADR (nếu đã implement) |
```

### SUGGESTION

✅ Đúng:
```
| F-011 | 💡 SUGGESTION | Section 6 | Chỉ có 1 runtime scenario (happy path query) — thiếu error path | Thêm kịch bản: "Claude API timeout → fallback behavior" |
```

---

## Khi nhiều sections cùng lỗi

Liệt kê cụ thể thay vì gộp mơ hồ:

```
| F-007 | 🟡 MINOR | Section 5.1, Section 6, Section 7 | Mũi tên trong 3 diagrams không có label protocol/direction | Thêm label vào mỗi mũi tên: chiều + protocol (HTTP/REST, gRPC, etc.) |
```

---

## Positive Observations — cách viết

Không được bỏ section này. Phải cụ thể:

✅ Cụ thể:
```
- AD-02 (ChromaDB) là ví dụ ADR tốt: có 4 alternatives, rationale dựa trên tiêu chí rõ ràng (on-premise, Python-native, scale limit), consequences honest về trade-offs.
- Section 6 Runtime View dùng Mermaid sequence diagram nhất quán cho tất cả kịch bản — dễ đọc và maintainable.
```

❌ Quá chung:
```
- Tài liệu được viết tốt và có cấu trúc rõ ràng.
```

---

## Edge cases calibration

### "TAD mô tả hệ thống nhỏ — Section trống có được không?"
→ Section trống với "N/A — lý do" là VALID. Ví dụ: Section 7.2 Hardware Interfaces có thể "N/A — pure cloud SaaS, không có hardware interface."
→ MINOR nếu trống không có N/A
→ Không phải lỗi nếu có N/A với lý do

### "Không có tất cả 3 views nhưng đây là Architecture Brief (lightweight)"
→ Architecture Brief mode (Skills 1, 3, 5, 9) là valid — không BLOCKER nếu user đã khai báo đây là Architecture Brief
→ BLOCKER nếu tài liệu tự xưng là Full TAD nhưng thiếu views

### "ADR có alternatives nhưng rất sơ sài (1 từ/option)"
→ MAJOR nếu alternatives không đủ để justify quyết định
→ MINOR nếu alternatives đủ nhận diện nhưng thiếu pros/cons detail

### "Quality Goal có số nhưng không rõ đo ở đâu"
→ MAJOR — "p95 < 3s" không đủ nếu thiếu: dưới tải bao nhiêu, đo ở đâu (client/server/API gateway)
→ Cần: metric + threshold + load condition + measurement point

### "AI/ML system nhưng chunking/embedding ở Section 9 thay vì Section 8"
→ Acceptable — ADR cho chunking strategy ở Section 9 là ĐÚNG (là một decision)
→ Section 8 nên có crosscutting convention (e.g., "chunk size = 512 tokens, overlap = 50") reference về ADR
→ Lỗi nếu cả hai đều trống

### "Section 4 Solution Strategy trùng với Section 9 ADRs"
→ Không phải lỗi — Section 4 là intentional summary/executive view của Section 9
→ Lỗi nếu Section 4 và Section 9 MÂU THUẪN với nhau (đó là MAJOR)

### "Glossary thiếu một số term kỹ thuật phổ biến"
→ MINOR chỉ nếu term xuất hiện trong TAD nhưng không có trong Glossary
→ Không lỗi nếu term đủ phổ biến (API, REST, JSON) hoặc không xuất hiện trong tài liệu
