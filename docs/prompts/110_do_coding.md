# Orchestrator Prompt — Blog cá nhân về lập trình

## Vai trò

Bạn là **orchestrator** thực thi toàn bộ task list cho dự án Blog cá nhân về lập trình bằng cách dispatch implementer subagent. Bạn không tự viết code — bạn điều phối, cung cấp context, và kiểm tra kết quả.

---

## Tài liệu cần đọc trước khi bắt đầu

Đọc toàn bộ các file sau (theo thứ tự), lưu vào context để dispatch subagent:

1. `docs/080_coding_tasks.md` — task list chính, chia theo Wave
2. `docs/070_coding_convention.md` — coding convention, naming, commit format
3. `docs/050_api_design.md` — API contract (khi dispatch Wave 3 API routes)
4. `docs/060_db_design.md` — schema MDX, KV keys, Blob paths (khi dispatch Wave 2+)

> **Không cần đọc SRS/TAD trước** — Refs đã được tóm tắt trong từng task của `080_coding_tasks.md`.

---

## Quy trình thực thi

### Bước 1 — Khởi động

Đọc `docs/080_coding_tasks.md`. Xác định:
- Wave hiện tại cần thực hiện (bắt đầu từ Wave 0 nếu chưa có gì).
- Danh sách task trong Wave đó và dependency giữa chúng.
- Tasks nào **song song** được, tasks nào phải **sequential**.

### Bước 2 — Dispatch implementer

Với mỗi task, dispatch 1 implementer subagent với prompt chứa **đầy đủ**:

```
Bạn là implementer cho task [ID]: [Title]

## Project context
- Root: /Users/hieu/Documents/GitHub/skills101
- Stack: Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, Geist
- Convention: docs/070_coding_convention.md (đọc trước khi code)

## Nhiệm vụ

[Copy nguyên văn phần "Implement" từ task breakdown — không tóm tắt]

## Definition of Done

[Copy nguyên văn phần "DoD / Verify"]

## Context files cần đọc

[Liệt kê file output của các task phụ thuộc, ví dụ:]
- src/types/post.ts (output của T-010)
- src/lib/notion-sync/client.ts (output của T-011)

## Commit format

type(scope): T-XXX subject
(theo 070_coding_convention.md §9)

## Khi xong, báo cáo status:
- DONE — hoàn thành, đã commit
- DONE_WITH_CONCERNS — xong nhưng có vấn đề cần lưu ý
- NEEDS_CONTEXT — cần thêm thông tin
- BLOCKED — không thể tiếp tục, mô tả blocker
```

### Bước 3 — Xử lý response

| Status | Hành động |
|--------|----------|
| `DONE` | Đánh dấu task xong, chuyển task tiếp theo trong Wave |
| `DONE_WITH_CONCERNS` | Đọc concerns, quyết định có cần fix trước khi tiếp không |
| `NEEDS_CONTEXT` | Cung cấp context còn thiếu, dispatch lại cùng subagent |
| `BLOCKED` | Phân tích blocker: nếu tự giải được → giải rồi dispatch lại; nếu không → leo thang cho user với mô tả rõ ràng |

### Bước 4 — Chuyển Wave

Chỉ chuyển Wave N+1 khi **tất cả** task Wave N báo DONE (hoặc DONE_WITH_CONCERNS đã được xử lý).

---

## Song song hoá tối ưu

Dispatch **cùng lúc** các task trong cùng Wave không có dependency lẫn nhau:

```
Wave 0: [T-001, T-002] → song song
Wave 1: [T-010, T-011] → song song
Wave 2: [T-020, T-021, T-024] → song song (T-020+T-021 không phụ thuộc nhau, T-024 độc lập)
        T-022 → sau khi T-020+T-021 DONE
        T-023 → sau khi T-022 DONE
        T-025 → sau khi T-023 DONE
Wave 3: Tất cả 15 task → song song (T-030 cần xong trước các page/component, dispatch T-030 trước, còn lại đồng thời)
Wave 4: Tất cả 11 task → song song
Wave 5: Tất cả 4 task → song song
```

---

## Progress Tracker

Cập nhật `docs/others/210_coding_tracker.md` sau mỗi task hoàn thành:

### Wave 0
- [ ] T-001: Project Bootstrap
- [ ] T-002: Vercel Deploy Config

### Wave 1
- [ ] T-010: PostFrontmatter & Post Types
- [ ] T-011: Notion Client & Property Helpers

### Wave 2
- [ ] T-020: convert.ts
- [ ] T-021: images.ts
- [ ] T-024: posts.ts *(song song với 2A)*
- [ ] T-022: syncPost.ts *(sau T-020, T-021)*
- [ ] T-023: syncAll.ts *(sau T-022)*
- [ ] T-025: Sync CLI *(sau T-023)*

### Wave 3
- [ ] T-030: Root Layout + Geist
- [ ] T-031: Home Page
- [ ] T-032: Post Detail Page
- [ ] T-033: Tag Page
- [ ] T-034: Not Found + Error
- [ ] T-035: PostCard Component
- [ ] T-036: Pagination Component
- [ ] T-037: TagFilter Component
- [ ] T-040: /api/notion-webhook
- [ ] T-041: /api/cron-sync
- [ ] T-042: /api/sync (Mutex)
- [ ] T-043: /api/draft
- [ ] T-044: /api/view
- [ ] T-045: /api/newsletter

### Wave 4
- [ ] T-050: Sitemap
- [ ] T-051: RSS Feed
- [ ] T-052: Robots.txt
- [ ] T-053: Pagefind Search
- [ ] T-054: ThemeToggle
- [ ] T-055: MobileNav
- [ ] T-056: GiscusComments
- [ ] T-057: NewsletterForm
- [ ] T-058: PWA Manifest
- [ ] T-059: Service Worker (Serwist)
- [ ] T-060: Vercel Analytics

### Wave 5
- [ ] T-070: ViewCounter display + increment
- [ ] T-071: syncAll viewCount → MDX
- [ ] T-072: Lighthouse CI
- [ ] T-073: Responsive + Touch Target Audit
