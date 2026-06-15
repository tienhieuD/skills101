# Coding Bugs Registry

Danh sách bug / technical debt / convention inconsistency. Mỗi entry: ID, severity, status, description, resolution.

---

## BUG-001: Convention reference đến package không tồn tại

- **Severity:** Medium (misleading, không break runtime)
- **Status:** Open → Resolved sau khi PR merge
- **File:** `docs/070_coding_convention.md` §5 "Geist Components"
- **Description:** Convention yêu cầu `import { ... } from '@vercel/geist/components'`. Package này KHÔNG tồn tại public trên npm (verify `npm view @vercel/geist` → 404). `@vercel/geistcn`, `geistcn` cũng 404. Chỉ `geist` (fonts) tồn tại.
- **Impact:** Subagent / developer mới sẽ tin có Geist component package, không tìm thấy primitive hoặc thử install gây confusion. 9 components hiện đã custom (đúng vì không có lựa chọn) nhưng pattern lặp + tốn dòng.
- **Resolution:**
  1. Sửa convention §5 → xoá reference `@vercel/geist`, document internal UI library tại `src/components/ui/*` mimic Geist API.
  2. Build internal UI library public-grade kết hợp Headless UI cho components tương tác.
  3. Refactor components hiện tại dùng primitives mới.
