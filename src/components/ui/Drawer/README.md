# Drawer

Side-sliding panel built on `@headlessui/react` `Dialog`. Provides focus trap, ESC dismiss, backdrop click dismiss, and `aria-modal` semantics out of the box.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Required. Controls visibility |
| `onClose` | `() => void` | — | Required. Called when drawer requests close |
| `side` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Slide direction |
| `title` | `string` | — | Required for `aria-labelledby` |
| `showTitle` | `boolean` | `false` | Visually show the title (otherwise sr-only) |
| `className` | `string` | — | Additional Tailwind classes |
| `children` | `ReactNode` | — | Panel content |

## Accessibility

- `aria-modal="true"` set by Dialog.
- Focus trapped inside panel.
- ESC closes.
- Clicking backdrop closes.
- Title rendered as `Dialog.Title` for screen readers.

## Example

```tsx
'use client'
import { useState } from 'react'
import { Drawer, IconButton } from '@/components/ui'
import { MenuIcon } from '@/components/ui/primitives/icons'

function NavDrawer() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton aria-label="Mở menu" onClick={() => setOpen(true)}><MenuIcon /></IconButton>
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu" side="right">
        <nav>...</nav>
      </Drawer>
    </>
  )
}
```
