# Internal UI Library

Component primitives với API inspired by [Vercel Geist Design System](https://vercel.com/geist). Kết hợp [Headless UI](https://headlessui.com) cho components có hành vi tương tác phức tạp (Dialog focus trap, etc.).

Library này được thiết kế để **public open-source** sau này — primitives không hard-code project-specific logic.

## Quick start

```tsx
import { Button, Card, Badge, Input, Spinner, Note, Drawer, Pagination, ThemeSwitcher } from '@/components/ui'

<Button variant="primary" size="md">Save</Button>
<Card as="article">
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

## Components (Phase 1)

| Category | Components |
|---------|-----------|
| Action | [Button](./Button/README.md), [IconButton](./IconButton/README.md), [ThemeSwitcher](./ThemeSwitcher/README.md) |
| Form | [Input](./Input/README.md) |
| Display | [Badge](./Badge/README.md), [Card](./Card/README.md), [Note](./Note/README.md) |
| Feedback | [Spinner](./Spinner/README.md) |
| Overlay | [Drawer](./Drawer/README.md) (Headless UI) |
| Navigation | [Pagination](./Pagination/README.md) |

## Design tokens

CSS custom properties defined trong `src/app/globals.css`:

- Colors: `--background`, `--foreground`, `--gray-100..800`, `--border`
- Fonts: `--font-sans` (Geist Sans), `--font-mono` (Geist Mono)

JS access qua `tokens` map (xem `theme/tokens.ts`).

## Folder structure

```
src/components/ui/
├── index.ts                   # Barrel: import { Component } from '@/components/ui'
├── theme/
│   ├── tokens.ts              # Design tokens (JS map of CSS vars)
│   └── cn.ts                  # clsx + tailwind-merge utility
├── primitives/
│   ├── VisuallyHidden.tsx
│   └── icons/                 # SVG icons (Sun, Moon, Menu, Close, Search)
└── <ComponentName>/
    ├── ComponentName.tsx
    ├── ComponentName.variants.ts  # CVA config (nếu có variant)
    ├── ComponentName.test.tsx     # Vitest test (nếu có behavior)
    ├── index.ts                   # Re-export
    └── README.md                  # Props table + examples
```

## Conventions

- **Server Components** mặc định, `'use client'` chỉ khi cần (Drawer, ThemeSwitcher).
- **Named exports** — không default.
- **`forwardRef`** mọi primitive để consumer attach ref.
- **Touch target 44px** built-in cho mọi interactive primitive (REQ-FUNC-020 / WCAG 2.5.5).
- **`aria-label` required** cho icon-only buttons (TypeScript enforce).
- **Polymorphic `as`** prop limited tới `'button' | 'a' | 'span' | 'div' | 'article' | 'section' | 'li'` (không full polymorphic để tránh TS gymnastics).
- **CVA** (`class-variance-authority`) cho variant config.

## Roadmap

**Phase 2 (chưa build):** Tooltip, Modal, Combobox (Search/Autocomplete), Menu (Dropdown), Tabs, Toast, Skeleton, Breadcrumbs, Avatar, Code Block primitive, Switch, RadioGroup, Select, Textarea, Checkbox.

**Phase 3 (open-source prep):** Tách thành package npm riêng, `package.json` exports map, Storybook docs site, visual regression tests.
