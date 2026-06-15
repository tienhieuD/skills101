# Coding Bugs Registry

Danh sách bug / technical debt / convention inconsistency. Mỗi entry: ID, severity, status, description, resolution.

---

## BUG-001: Convention reference đến package không tồn tại

- **Severity:** Medium (misleading, không break runtime)
- **Status:** ✅ Resolved (2026-06-15, branch `example`)
- **Resolved commits:** d4562b2 (register), 49090d8 (convention), 9994432 (deps), 7ec1fd0 / edd044f / 09e6451 / 28071ea / 23558cf / 8594c50 (ui library build), ee53fe4 (refactor)

---

## BUG-002: Serwist breaks `/_not-found` prerender

- **Severity:** High (blocks production build)
- **Status:** 🟡 Mitigated (Serwist temporarily disabled via `disable: true` trong `next.config.ts`); root cause unresolved
- **File:** `next.config.ts`, `src/app/sw.ts`
- **Description:** `npm run build` fail tại bước "Generating static pages" cho route `/_not-found` với:
  ```
  TypeError: Cannot read properties of undefined (reading 'call')
    at Object.c [as require] (.next/server/webpack-runtime.js:1:128)
  Error occurred prerendering page "/_not-found"
  ```
  Sau khi disable Serwist (`withSerwistInit({ disable: true, ... })`) build pass clean. Issue reproducible kể cả với layout đơn giản — không phải do imports.
- **Impact:** PWA (service worker, offline cache, REQ-FUNC-022/023/024/025) tạm thời ngừng hoạt động. Site vẫn deploy được nhưng mất tính năng offline.
- **Hypothesis:** Conflict giữa Serwist webpack instrumentation và Next.js 15 static prerender cho `_not-found`. Có thể liên quan đến cách Serwist xử lý `__SW_MANIFEST` global khi build worker.
- **Investigation TODO:**
  1. Test với `swSrc` rỗng (empty SW) — xác định có phải SW logic gây lỗi không
  2. Test với Next.js 15.2.x (downgrade) — kiểm tra regression
  3. Test với `@serwist/next` 9.0.x (downgrade major)
  4. Báo issue lên https://github.com/serwist/serwist với repro
  5. Nếu không khắc phục được — migrate sang `next-pwa` (deprecated cho App Router nhưng vẫn maintained) hoặc viết SW thủ công + register via inline `<Script>`
- **Workaround:** Serwist disabled với `disable: true` trong `next.config.ts`.
- **File:** `docs/070_coding_convention.md` §5 "Geist Components"
- **Description:** Convention yêu cầu `import { ... } from '@vercel/geist/components'`. Package này KHÔNG tồn tại public trên npm (verify `npm view @vercel/geist` → 404). `@vercel/geistcn`, `geistcn` cũng 404. Chỉ `geist` (fonts) tồn tại.
- **Impact:** Subagent / developer mới sẽ tin có Geist component package, không tìm thấy primitive hoặc thử install gây confusion. 9 components hiện đã custom (đúng vì không có lựa chọn) nhưng pattern lặp + tốn dòng.
- **Resolution:**
  1. Sửa convention §5 → xoá reference `@vercel/geist`, document internal UI library tại `src/components/ui/*` mimic Geist API.
  2. Build internal UI library public-grade kết hợp Headless UI cho components tương tác.
  3. Refactor components hiện tại dùng primitives mới.
