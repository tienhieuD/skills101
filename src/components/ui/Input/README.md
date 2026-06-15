# Input

Text input with Geist styling and 44px min-height.

## Props

Accepts all native `<input>` HTML attrs. `ref` is forwarded.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `type` | `string` | `'text'` | Any input type (text, email, search, password, ...) |
| `className` | `string` | — | Additional Tailwind classes |

## Examples

```tsx
import { Input } from '@/components/ui'

<Input type="email" placeholder="email@example.com" required />
<Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
```
