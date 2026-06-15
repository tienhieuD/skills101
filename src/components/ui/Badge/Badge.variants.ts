import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'h-7 px-2.5 rounded-md text-xs font-medium',
    'transition-colors',
    'border',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-[var(--background)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-[var(--border)] bg-[var(--gray-50)] text-[var(--gray-700)] hover:bg-[var(--gray-100)] hover:text-[var(--foreground)]',
        active:
          'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
