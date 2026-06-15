# Card

Container with border, padding, rounded corners. Compound API.

## Components

- `Card` — root container
- `Card.Header` — optional header with bottom border
- `Card.Body` — main content area
- `Card.Footer` — optional footer with top border

## Props (root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `'div' \| 'article' \| 'section' \| 'li' \| 'a'` | `'div'` | Render element |
| `className` | `string` | — | Additional Tailwind classes |

When `as='a'`: gets hover background, forwards anchor attrs.

## Examples

```tsx
import { Card } from '@/components/ui'

<Card as="article">
  <Card.Header>
    <h2>Post title</h2>
    <time>2026-06-15</time>
  </Card.Header>
  <Card.Body>
    <p>Body content...</p>
  </Card.Body>
  <Card.Footer>
    <span>5 lượt xem</span>
  </Card.Footer>
</Card>

<Card as="a" href="/posts/x">
  Clickable card
</Card>
```
