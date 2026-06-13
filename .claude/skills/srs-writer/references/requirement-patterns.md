# Patterns viết Requirement — ví dụ tốt/xấu

File này hướng dẫn viết TỪNG requirement đúng chuẩn, kèm ví dụ cụ thể. Ví dụ dùng bối cảnh hệ thống Document Q&A (RAG chatbot) nhưng pattern áp dụng cho mọi hệ thống.

## Mục lục

- [Template chuẩn](#template-chuẩn)
- [ID Schema](#id-schema)
- [Viết Statement](#viết-statement)
- [Viết Acceptance Criteria](#viết-acceptance-criteria)
- [Verification Method](#verification-method)
- [Ví dụ theo từng AREA](#ví-dụ-theo-từng-area)
- [Lỗi thường gặp](#lỗi-thường-gặp)

---

## Template chuẩn

Mọi requirement dùng đúng format này:

```markdown
#### REQ-FUNC-001: Giới hạn số trang PDF khi upload

- **Status:** active          ← draft | active | deprecated | waived
- **Priority:** High          ← High | Medium | Low
- **Owner:** @product-owner   ← người chịu trách nhiệm duy trì REQ này
- **Statement:** Hệ thống PHẢI từ chối tệp PDF có hơn 200 trang.
- **Rationale:** Giới hạn chi phí embedding và thời gian ingest;
  ràng buộc từ 2.3 Product Constraints.
- **Acceptance Criteria:**
  - Given: user upload PDF 201 trang
  - When: hệ thống validate tệp
  - Then: trả về HTTP 413 với error code PAGE_LIMIT_EXCEEDED,
    tệp không được lưu, không có record nào được tạo
- **Verification Method:** Test
- **More Information:** Liên quan REQ-FUNC-002 (giới hạn kích thước).
  Trace tới TC-DOC-003.
```

**Về Status:**
- `draft` — đang viết, chưa review
- `active` — đã approve, đang implement
- `deprecated` — bị thay thế bởi REQ khác (ghi rõ REQ nào)
- `waived` — chủ động bỏ qua với lý do (ghi lý do)

**Về AREA khi requirement span nhiều loại:** Chọn AREA theo tính năng *chính* của requirement, cross-ref sang section kia trong `More Information`. Ví dụ: audit log là OBS primary, nhưng `More Information: cross-ref REQ-SEC-003`.

---

## ID Schema

```
REQ-[AREA]-[NNN]      hoặc    REQ-[AREA]-[NNN]-[VER]

AREA hợp lệ:
  FUNC   Functional               INT    External Interfaces
  PERF   Performance              SEC    Security
  REL    Reliability              AVAIL  Availability
  OBS    Observability            COMP   Compliance
  INST   Installation             BUILD  Build & Delivery
  DIST   Distribution             MAINT  Maintainability
  REUSE  Reusability              PORT   Portability
  COST   Cost                     DEAD   Deadline
  POC    Proof of Concept         CM     Change Management
  ML     AI/ML
```

Quy tắc:
- ID **duy nhất và bất biến** — không bao giờ tái sử dụng ID đã xóa
- Sửa requirement → tăng `-[VER]` (REQ-FUNC-001-2) và ghi Revision History
- Đánh số NNN theo thứ tự tạo, không cần liên tục sau khi xóa

---

## Viết Statement

Công thức: `[Chủ thể] + [shall/should/may] + [hành vi đo được] + [điều kiện]`

| Keyword | Tiếng Việt | Ý nghĩa |
|---------|-----------|---------|
| shall | PHẢI | Bắt buộc — vi phạm = fail |
| should | NÊN | Khuyến nghị mạnh — bỏ qua cần lý do |
| may | CÓ THỂ | Tùy chọn |

✅ Tốt:
```
Hệ thống PHẢI trả về kết quả tìm kiếm trong vòng 1 giây (p95)
đối với truy vấn đã được cache, đo tại API gateway dưới tải
100 concurrent users.
```

❌ Xấu (và tại sao):
```
"Hệ thống phải tìm kiếm nhanh"
   → "nhanh" không đo được

"Hệ thống nên dùng Redis để cache kết quả"
   → Design decision, không phải requirement.
     Requirement đúng: "kết quả truy vấn lặp lại PHẢI được
     trả về trong X ms" — Redis là HOW, thuộc tài liệu kiến trúc

"Hệ thống phải xử lý lỗi tốt"
   → Mơ hồ. Đúng: "Khi embedding service không phản hồi trong
     30s, hệ thống PHẢI đặt document status = FAILED kèm
     statusReason mô tả lỗi"
```

---

## Viết Acceptance Criteria

Ưu tiên Given/When/Then. Một REQ có thể có nhiều AC (happy path + negative + boundary).

```markdown
- **Acceptance Criteria:**
  - AC1 (happy path):
    - Given: PDF hợp lệ 50 trang, user đã xác thực
    - When: upload qua POST /documents/upload
    - Then: HTTP 202, documentId trả về, status = PROCESSING
  - AC2 (boundary):
    - Given: PDF đúng 200 trang
    - When: upload
    - Then: được chấp nhận (HTTP 202)
  - AC3 (negative):
    - Given: PDF 201 trang
    - When: upload
    - Then: HTTP 413, code = PAGE_LIMIT_EXCEEDED, không lưu
```

Quy tắc:
- Then phải chứa kết quả ĐO ĐƯỢC (status code, giá trị field, trạng thái data)
- Cover tối thiểu: 1 happy path + 1 negative cho mỗi functional REQ
- Boundary nếu có giới hạn số (min/max)

---

## Verification Method

| Method | Khi nào dùng | Ví dụ |
|--------|-------------|-------|
| **Test** | Hành vi chạy được, assert được | Functional, performance, hầu hết REQ |
| **Analysis** | Không test trực tiếp được, cần phân tích/mô hình | Threat model, capacity planning |
| **Inspection** | Xem xét tĩnh code/config/docs | Coding standards, license compliance |
| **Demonstration** | Cho stakeholder xem hoạt động, không cần đo | UI flows, usability |
| **Other** | Phương pháp đặc thù không fit 4 loại trên | Formal proof, simulation, survey |

Mặc định chọn **Test** trừ khi có lý do khác. Dùng **Other** thì phải mô tả cụ thể phương pháp trong `More Information`.

---

## Ví dụ theo từng AREA

### REQ-FUNC (Functional)

```markdown
#### REQ-FUNC-010: Tìm kiếm ngữ nghĩa top-K

- **Statement:** Hệ thống PHẢI trả về tối đa K chunk có độ tương
  đồng cosine cao nhất với truy vấn, sắp xếp theo score giảm dần,
  kèm tham chiếu nguồn (documentId, documentName, page, snippet,
  score, chunkId).
- **Rationale:** Năng lực cốt lõi của sản phẩm (2.2).
- **Acceptance Criteria:**
  - Given: tài liệu READY chứa nội dung về refund, query liên quan
  - When: POST /search với topK=5
  - Then: HTTP 200; results.length ≤ 5; mỗi item đủ 6 fields;
    score ∈ [0,1]; sắp xếp giảm dần theo score
- **Verification Method:** Test
```

### REQ-PERF (Performance)

```markdown
#### REQ-PERF-001: Độ trễ tìm kiếm

- **Statement:** Tìm kiếm PHẢI đạt p95 latency < 1s cho truy vấn
  cached và < 3s cho truy vấn uncached, đo tại API gateway dưới
  tải 100 concurrent users trên môi trường staging chuẩn.
- **Rationale:** Trải nghiệm tra cứu tương tác; NFR từ TAD.
- **Acceptance Criteria:**
  - Given: 100 concurrent users, dataset 50 documents đã index
  - When: chạy load test 10 phút với mix 70% cached/30% uncached
  - Then: p95 cached < 1000ms; p95 uncached < 3000ms;
    error rate < 1%
- **Verification Method:** Test (k6 load test)
```

### REQ-SEC (Security)

```markdown
#### REQ-SEC-002: Cô lập dữ liệu theo người dùng

- **Statement:** Hệ thống PHẢI từ chối (HTTP 403) mọi truy cập
  đọc/ghi/xóa vào tài liệu không thuộc sở hữu của người dùng
  đã xác thực, trừ vai trò admin.
- **Rationale:** Confidentiality (3.3.2); dữ liệu tài liệu có thể
  chứa thông tin nhạy cảm của tổ chức.
- **Acceptance Criteria:**
  - Given: user A đã xác thực, tài liệu D thuộc user B
  - When: A gọi GET/DELETE /documents/{D}
  - Then: HTTP 403, code = FORBIDDEN, không có dữ liệu D nào
    trong response body, hành động được ghi audit log
- **Verification Method:** Test
```

### REQ-ML (AI/ML)

```markdown
#### REQ-ML-001: Chất lượng truy hồi tối thiểu

- **Statement:** Pipeline truy hồi PHẢI đạt Precision@5 ≥ 0.80 và
  MRR ≥ 0.75 trên golden dataset chuẩn (phiên bản được ghi trong
  Model Card) trước mỗi release.
- **Rationale:** Quality gate cho thành phần semantic search;
  functional test không đo được chất lượng nội dung kết quả.
- **Acceptance Criteria:**
  - Given: golden dataset v1.0 gồm ≥ 30 cặp query–expected chunk
  - When: chạy evaluation pipeline trên build ứng viên release
  - Then: Precision@5 ≥ 0.80; MRR ≥ 0.75; report được lưu làm
    evidence trong Verification matrix
- **Verification Method:** Test (automated evaluation)
- **More Information:** Thay đổi embedding model hoặc chunking
  strategy bắt buộc chạy lại evaluation này (3.6.6).
```

```markdown
#### REQ-ML-002: Guardrail đầu vào truy vấn

- **Statement:** Hệ thống PHẢI từ chối truy vấn rỗng, truy vấn
  vượt 2000 ký tự, và PHẢI xử lý an toàn (không thực thi) mọi
  nội dung dạng injection trong truy vấn.
- **Rationale:** Guardrails lớp input (3.6.3); cross-ref REQ-SEC-005.
- **Acceptance Criteria:**
  - Given: query = "" hoặc query 2001 ký tự
  - When: POST /search
  - Then: HTTP 400, VALIDATION_ERROR
  - Given: query chứa "'; DROP TABLE documents; --"
  - When: POST /search
  - Then: xử lý như văn bản thường; không lỗi 500; dữ liệu nguyên vẹn
- **Verification Method:** Test
```

### REQ-INT (External Interface)

```markdown
#### REQ-INT-001: Tích hợp SSO qua OIDC

- **Status:** active
- **Priority:** High
- **Owner:** @platform-team
- **Statement:** Hệ thống PHẢI xác thực người dùng qua OIDC provider
  (Google Workspace) bằng Authorization Code Flow với PKCE.
- **Rationale:** Không quản lý credential nội bộ; ràng buộc tổ chức (2.3).
- **Acceptance Criteria:**
  - Given: user chưa đăng nhập
  - When: truy cập URL bất kỳ của ứng dụng
  - Then: redirect sang Google login; sau khi xác thực thành công,
    redirect về app với JWT hợp lệ; session tồn tại 8 giờ
  - Given: Google OIDC endpoint không phản hồi trong 10s
  - When: user cố đăng nhập
  - Then: hiển thị lỗi SSO_UNAVAILABLE; không fallback sang local auth
- **Verification Method:** Test
- **More Information:** Google OIDC discovery endpoint phải được
  config qua env var, không hardcode.
```

### REQ-REL (Reliability)

```markdown
#### REQ-REL-001: Xử lý lỗi embedding service

- **Status:** active
- **Priority:** Medium
- **Owner:** @backend-team
- **Statement:** Khi embedding service không phản hồi trong 30 giây,
  hệ thống PHẢI đặt document status = FAILED, ghi statusReason,
  và KHÔNG ĐƯỢC để request treo hoặc dữ liệu ở trạng thái không nhất quán.
- **Rationale:** Graceful degradation (3.3.3); tránh zombie jobs.
- **Acceptance Criteria:**
  - Given: embedding service bị kill trong khi đang xử lý document
  - When: timeout 30s hết
  - Then: document.status = FAILED; document.statusReason mô tả lỗi;
    HTTP 200 trả về cho caller ngay khi status cập nhật; không còn
    job nào đang pending cho document đó
  - Given: embedding service phục hồi sau 5 phút
  - When: user trigger reindex
  - Then: document được xử lý lại bình thường từ đầu
- **Verification Method:** Test (chaos testing — kill embedding container)
```

### REQ-AVAIL (Availability)

```markdown
#### REQ-AVAIL-001: Uptime tối thiểu

- **Status:** active
- **Priority:** High
- **Owner:** @infra-team
- **Statement:** API PHẢI đạt availability ≥ 99.5% đo theo tháng dương lịch,
  không tính maintenance windows đã thông báo ≥ 24h trước.
- **Rationale:** SLA với khách hàng enterprise (hợp đồng dịch vụ).
- **Acceptance Criteria:**
  - Given: tháng 30 ngày
  - When: tính tổng downtime ngoài maintenance window
  - Then: downtime ≤ 3.6 giờ/tháng; measured bằng synthetic monitoring
    từ ≥ 2 region
  - Given: deploy mới
  - When: health check thất bại
  - Then: tự động rollback trong ≤ 5 phút; không impact user traffic
- **Verification Method:** Analysis (synthetic monitoring report) + Test (rollback drill)
```

### REQ-COMP (Compliance)

```markdown
#### REQ-COMP-001: Lưu trữ dữ liệu theo GDPR

- **Status:** active
- **Priority:** High
- **Owner:** @legal-team
- **Statement:** Hệ thống PHẢI xóa hoàn toàn dữ liệu cá nhân của người dùng
  trong vòng 30 ngày kể từ khi nhận được yêu cầu xóa hợp lệ (Right to
  Erasure theo GDPR Article 17).
- **Rationale:** Nghĩa vụ pháp lý GDPR; vi phạm có thể phạt đến 4% global
  annual turnover (2.3 Legal Constraints).
- **Acceptance Criteria:**
  - Given: user gửi yêu cầu erasure qua API hoặc support channel
  - When: request được xác nhận hợp lệ
  - Then: trong 30 ngày — không còn PII nào trong primary DB, backup,
    search index, logs; confirmation email gửi cho user; record
    erasure request được giữ lại (không PII) để audit
  - Given: user là party trong hợp đồng đang active
  - When: erasure request
  - Then: hệ thống thông báo không thể xử lý ngay; cung cấp timeline
    sau khi hợp đồng kết thúc
- **Verification Method:** Test + Inspection (legal review)
- **More Information:** Cross-ref REQ-SEC-010 (data deletion API).
  Backup retention policy phải ≤ 30 ngày để đảm bảo REQ này.
```

### REQ-OBS (Observability)

```markdown
#### REQ-OBS-001: Audit log cho hành động nhạy cảm

- **Statement:** Hệ thống PHẢI ghi audit log cho các hành động
  LOGIN, UPLOAD, DELETE, SEARCH, REINDEX gồm: actor, action,
  resource, timestamp, IP — và KHÔNG ĐƯỢC ghi nội dung tài liệu
  vào log.
- **Rationale:** Truy vết bảo mật (3.3.2) + bảo vệ dữ liệu nhạy cảm.
- **Acceptance Criteria:**
  - Given: user thực hiện upload và delete
  - When: kiểm tra audit_logs
  - Then: có 2 records đủ 5 fields; không field nào chứa nội dung
    văn bản của tài liệu
- **Verification Method:** Test + Inspection (log schema review)
```

---

## Lỗi thường gặp

| Lỗi | Ví dụ | Sửa |
|-----|-------|-----|
| Từ mơ hồ | "tìm kiếm nhanh", "bảo mật tốt" | Metric cụ thể: "p95 < 1s", "TLS 1.3+" |
| Design lẫn vào REQ | "dùng Qdrant để lưu vector" | "PHẢI trả kết quả tương đồng ngữ nghĩa trong X ms" — công nghệ ghi ở 2.3 Constraints nếu thật sự bắt buộc |
| Gộp nhiều REQ vào một | "Hệ thống phải validate file, extract text và tạo embedding" | Tách thành 3 REQ riêng, mỗi cái verify độc lập |
| Không có AC | Chỉ có Statement | Luôn có ít nhất 1 Given/When/Then |
| AC không đo được | "Then: hệ thống hoạt động đúng" | "Then: HTTP 202, status=PROCESSING, record tồn tại trong DB" |
| Thiếu negative case | Chỉ có happy path | Mỗi functional REQ ≥ 1 negative AC |
| ID không nhất quán | REQ-1, REQ_AUTH_2, FR-003 | Một schema duy nhất: REQ-[AREA]-[NNN] |
| Bỏ quên AI/ML section | Hệ thống RAG nhưng không có REQ-ML | Hệ thống có ML → 3.6 bắt buộc, tối thiểu Model Spec + Guardrails + Lifecycle |
| Thiếu Status field | REQ không có vòng đời | Mọi REQ phải có `Status: draft\|active\|deprecated\|waived` |
| Thiếu Priority | Không biết cái nào làm trước | Thêm `Priority: High\|Medium\|Low`; ít nhất P1 items phải rõ |
| REQ span nhiều AREA | Audit log: FUNC hay OBS? | Chọn AREA primary theo tính năng chính, cross-ref AREA kia trong More Information |
