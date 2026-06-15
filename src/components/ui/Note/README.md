# Note

Inline note / callout block.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'warning' \| 'archived'` | `'info'` | Visual variant |
| `title` | `ReactNode` | — | Optional bold heading rendered before the content |
| `className` | `string` | — | Additional Tailwind classes |

All standard `<div>` HTML attributes are forwarded.

## Examples

```tsx
import { Note } from '@/components/ui'

<Note variant="archived" title="Archived">
  Bài này đã được lưu trữ.
</Note>

<Note variant="warning">
  Kết nối mạng không ổn định.
</Note>
```
