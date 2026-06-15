# Button

Action button with variant + size config. Polymorphic via `as` prop.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding/font size; min-height always 44px |
| `as` | `'button' \| 'a'` | `'button'` | Render as native `<button>` or `<a>` |
| `className` | `string` | — | Additional Tailwind classes |

When `as='button'`: forwards all `<button>` HTML attrs (`onClick`, `disabled`, etc.).
When `as='a'`: forwards all `<a>` HTML attrs (`href`, `target`, etc.).

## Accessibility

- Built-in `min-h-[44px]` (REQ-FUNC-020 / WCAG 2.5.5).
- Focus visible ring via `focus-visible:ring-2`.
- Default `type="button"` to avoid accidental form submits.

## Examples

```tsx
import { Button } from '@/components/ui'

<Button onClick={save}>Lưu</Button>
<Button variant="secondary" size="sm" disabled>Hủy</Button>
<Button as="a" href="/" variant="ghost">Về trang chủ</Button>
```
