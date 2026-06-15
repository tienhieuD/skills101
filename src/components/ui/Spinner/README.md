# Spinner

Loading indicator.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size (16/20/28px) |
| `label` | `string` | `'Đang tải'` | Accessible label for screen readers |
| `className` | `string` | — | Additional Tailwind classes |

## Example

```tsx
import { Spinner } from '@/components/ui'

<Spinner size="lg" label="Đang sync" />
```
