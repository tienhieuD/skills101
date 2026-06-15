# ThemeSwitcher

Light/dark theme toggle using `next-themes`. Renders a placeholder before mount to avoid hydration mismatch.

## Requirements

- `next-themes` `<ThemeProvider attribute="class">` must wrap the tree.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional Tailwind classes |

## Example

```tsx
import { ThemeSwitcher } from '@/components/ui'

<ThemeSwitcher />
```
