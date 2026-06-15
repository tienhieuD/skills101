import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'min-h-[44px] rounded font-medium',
    'transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-[var(--background)]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90',
        secondary:
          'border border-[var(--border)] bg-transparent hover:bg-[var(--gray-100)] text-[var(--foreground)]',
        ghost: 'bg-transparent hover:bg-[var(--gray-100)] text-[var(--foreground)]',
      },
      size: {
        sm: 'px-3 text-sm',
        md: 'px-4',
        lg: 'px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
