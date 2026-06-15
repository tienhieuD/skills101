# Pagination

Previous/Next pagination using Next.js `<Link>` styled with Button variant. Disabled edges when on first/last page. Returns `null` when `totalPages ≤ 1`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | — | Required. 1-indexed current page |
| `totalPages` | `number` | — | Required. Total pages |
| `basePath` | `string` | `'/'` | Base URL prefix |
| `searchParams` | `Record<string, string \| undefined>` | `{}` | Additional query params preserved across pages |

## Example

```tsx
import { Pagination } from '@/components/ui'

<Pagination
  currentPage={2}
  totalPages={5}
  basePath="/"
  searchParams={{ tag: 'nextjs', sort: 'popular' }}
/>
```
