# Badge

Tag chip / pill. Polymorphic via `as`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'active'` | `'default'` | Visual variant |
| `as` | `'span' \| 'a' \| 'button'` | `'span'` | Render element |
| `className` | `string` | — | Additional Tailwind classes |

When `as='a'`: forwards anchor attrs.
When `as='button'`: forwards button attrs.

## Accessibility

- Touch target: 44px min-height (REQ-FUNC-020).
- Focus ring via `focus-visible:ring-2`.

## Examples

```tsx
import { Badge } from '@/components/ui'

<Badge>react</Badge>
<Badge as="a" href="/tags/nextjs">nextjs</Badge>
<Badge as="button" variant="active" onClick={...}>nextjs</Badge>
```
