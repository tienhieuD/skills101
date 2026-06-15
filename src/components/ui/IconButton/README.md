# IconButton

Icon-only button. `aria-label` is a **required prop** (TypeScript enforced).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string` | — | **Required.** Describes the action for screen readers |
| `variant` | `'outlined' \| 'ghost'` | `'outlined'` | Visual variant |
| `className` | `string` | — | Additional Tailwind classes |
| `children` | `ReactNode` | — | Icon element |

All standard `<button>` HTML attrs are forwarded.

## Accessibility

- Built-in `min-w-[44px] min-h-[44px]` touch target.
- `aria-label` required by TypeScript — cannot ship without it.

## Examples

```tsx
import { IconButton } from '@/components/ui'
import { CloseIcon } from '@/components/ui/primitives/icons'

<IconButton aria-label="Đóng" onClick={close}>
  <CloseIcon />
</IconButton>
```
