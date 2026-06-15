import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium text-sm',
    'transition-all duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-[var(--background)]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--foreground)] text-[var(--background)] hover:opacity-85 active:opacity-95',
        secondary:
          'border border-[var(--border-strong)] bg-transparent hover:bg-[var(--gray-100)] text-[var(--foreground)]',
        ghost: 'bg-transparent hover:bg-[var(--gray-100)] text-[var(--foreground)]',
      },
      size: {
        sm: 'h-9 px-3 min-h-[36px]',
        md: 'h-11 px-4 min-h-[44px]',
        lg: 'h-12 px-6 min-h-[48px] text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
