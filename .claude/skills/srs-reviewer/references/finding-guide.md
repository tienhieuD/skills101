# Finding Guide — Cách viết findings chính xác

File này hướng dẫn viết từng finding trong review report để actionable và không gây tranh cãi.

---

## Template finding

```
| F-NNN | 🔴/🟠/🟡/💡 SEVERITY | Location | Issue (ngắn gọn) | Recommendation (cụ thể) |
```

- **Location:** REQ-ID cụ thể, hoặc "Section 3.6", hoặc "Toàn tài liệu". Không ghi "nhiều chỗ" mà liệt kê.
- **Issue:** Mô tả lỗi, trích dẫn nguyên văn nếu cần (dùng backtick).
- **Recommendation:** Hành động cụ thể, không phải "cần cải thiện".

---

## Ví dụ findings đúng vs sai

### BLOCKER

✅ Đúng:
```
| F-001 | 🔴 BLOCKER | REQ-PERF-002 | Statement: "hệ thống phải phản hồi nhanh" — không có metric | Thay bằng: "p95 latency < Xms tại API gateway dưới tải Y users" |
```

❌ Sai (quá chung):
```
| F-001 | 🔴 BLOCKER | Section 3 | Nhiều REQ không verifiable | Cần thêm metrics |
```

### MAJOR

✅ Đúng:
```
| F-004 | 🟠 MAJOR | Section 3.6 | Hệ thống có embedding model (REQ-FUNC-007) nhưng Section 3.6 AI/ML hoàn toàn vắng mặt | Bổ sung 3.6.1 Model Spec (performance thresholds cho embedding), 3.6.3 Guardrails (input validation), 3.6.6 Lifecycle (retraining trigger) tối thiểu |
```

### MINOR

✅ Đúng:
```
| F-007 | 🟡 MINOR | REQ-SEC-001, REQ-SEC-004, REQ-SEC-009 | Thiếu Priority field (3 REQs) | Thêm Priority: High/Medium/Low vào mỗi REQ |
```

### SUGGESTION

✅ Đúng:
```
| F-010 | 💡 SUGGESTION | REQ-FUNC-015 | Chỉ có 1 happy path AC — không có boundary test cho limit 200 trang | Thêm AC2 (boundary): "Given PDF 200 trang → accepted" |
```

---

## Khi nhiều REQ cùng lỗi

Liệt kê IDs thay vì tạo finding riêng cho từng REQ:

```
| F-003 | 🟡 MINOR | REQ-FUNC-001, REQ-FUNC-003, REQ-FUNC-007, REQ-SEC-002 | 4 REQs thiếu Status field | Thêm `Status: active` vào mỗi REQ |
```

Nếu > 5 REQs cùng lỗi, dùng:
```
| F-003 | 🟡 MINOR | 8/12 REQs trong Section 3.2 | Thiếu Status field | ... |
```

---

## Positive Observations — cách viết

Không được bỏ section này ngay cả khi tài liệu kém. Mục tiêu: chỉ ra cái gì đang là standard tốt để maintainer biết giữ lại.

✅ Cụ thể:
```
- REQ-PERF-001 là ví dụ tốt về performance REQ: có p95, load condition (100 concurrent users),
  môi trường đo (staging), và 2 scenarios (cached/uncached).
- Verification Matrix đầy đủ 5 cột với đúng 100% REQ-ID coverage.
```

❌ Quá chung:
```
- Tài liệu được viết tốt.
- Cấu trúc rõ ràng.
```

---

## Calibration thực tế — edge cases hay gặp

### "REQ có AC nhưng Then không đo được"
→ BLOCKER nếu Then là "hệ thống hoạt động đúng" / "thành công" / "không có lỗi"
→ MAJOR nếu Then có một phần đo được nhưng thiếu (vd có HTTP status nhưng thiếu body check)

### "REQ dùng 'should' cho behavior critical"
→ MAJOR, không phải MINOR — vì engineer có thể bỏ qua "should" một cách hợp lệ

### "Section 3.5.X không áp dụng nhưng không có N/A"
→ MINOR chỉ nếu reviewer chắc section đó thực sự N/A
→ MAJOR nếu reviewer không chắc (vd: section 3.5.2 Build trống nhưng đây là SaaS — cần xác nhận)

### "Verification Matrix có nhưng thiếu 1-2 REQ-ID"
→ MAJOR, không phải MINOR — mỗi untraced REQ là một potential unverified requirement

### "Compound REQ nhưng 2 behaviors liên quan chặt"
→ Vẫn là BLOCKER nếu chúng có thể pass/fail độc lập
→ Chỉ OK nếu behavior 2 là điều kiện của behavior 1 (không thể tách)
   Ví dụ OK: "PHẢI validate TRƯỚC KHI extract" — đây là sequence, không phải compound

### "AI/ML system nhưng chỉ dùng model qua API (không train)"
→ Section 3.6 vẫn bắt buộc nhưng scope hẹp hơn:
   - 3.6.1: API behavior spec, version pinning, fallback
   - 3.6.3: Guardrails (input/output filtering)
   - 3.6.6: Model version lifecycle
   - 3.6.2 (Data Management): có thể N/A nếu không lưu training data
   - 3.6.4 (Ethics) + 3.6.5 (HITL): document lý do N/A nếu bỏ
