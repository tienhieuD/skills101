import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'min-h-[44px] px-3 py-2 rounded-full text-sm',
    'transition-colors',
    'border',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-[var(--background)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-[var(--border)] bg-transparent text-[var(--gray-600)] hover:text-[var(--foreground)] hover:bg-[var(--gray-100)]',
        active:
          'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
