# Responsive + Touch Target Audit — T-073

**Date:** 2026-06-15
**Refs:** REQ-FUNC-018, REQ-FUNC-019, REQ-FUNC-020

## Touch targets (≥ 44×44px)

Grep audit confirms `min-h-[44px]` hoặc `min-h-[44px] min-w-[44px]` trên các interactive elements:

| Element | File | Compliant |
|--------|------|-----------|
| Pagination Previous/Next | `src/components/Pagination.tsx` | ✅ `min-h-[44px]` |
| TagFilter chips | `src/components/TagFilter.tsx` | ✅ `min-h-[44px] min-w-[44px]` |
| MobileNav hamburger | `src/components/MobileNav.tsx` | ✅ `min-w-[44px] min-h-[44px]` |
| ThemeToggle button | `src/components/ThemeToggle.tsx` | ✅ `min-w-[44px] min-h-[44px]` |
| NewsletterForm submit | `src/components/NewsletterForm.tsx` | ✅ `min-h-[44px]` |
| error.tsx retry button | `src/app/error.tsx` | ✅ `min-h-[44px]` |
| Sort toggle (home) | `src/app/page.tsx` | ✅ `min-h-[44px]` |
| Post card tag chips | `src/components/PostCard.tsx` | ✅ `min-h-[44px]` |
| Header nav links | `src/app/layout.tsx` | ✅ fixed in T-073 (added `min-h-[44px]`) |

PostCard title `<Link>` wraps the H2 — card click region is large; không cần fixed 44px riêng.

## Responsive (REQ-FUNC-018 / REQ-FUNC-019)

- Viewport meta tự động qua Next.js `<html>` root.
- Container chính `max-w-3xl mx-auto px-4` — fits viewport 320px+ không tràn ngang.
- MobileNav `md:hidden`, desktop nav `hidden md:flex` — breakpoint 768px theo REQ-FUNC-019.
- `<Image>` luôn có `width`/`height` rõ ràng → không CLS từ ảnh.
- Prose styles cho code block (`pre`) có `overflow-x-auto` (xem `globals.css`) → tránh tràn ngang khi code dài.

## Cần verify thủ công khi deploy

- [ ] Lighthouse Accessibility audit (mobile preset) ≥ 95 — pass "Tap targets are not sized appropriately"
- [ ] iPhone SE viewport (375px) — no horizontal scroll trên `/`, `/posts/<slug>`, `/tags/<tag>`
- [ ] Hamburger menu mở/đóng đúng trên < 768px
- [ ] Touch target audit thủ công với Chrome DevTools touch emulation

## Đã thay đổi trong T-073

- `src/app/layout.tsx`: Header nav `<Link>` "Trang chủ", "Giới thiệu" và logo "Blog" được wrap với `inline-flex items-center min-h-[44px]` + padding ngang.
