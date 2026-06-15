import { cva, type VariantProps } from 'class-variance-authority'

export const noteVariants = cva(
  'p-4 rounded border text-sm',
  {
    variants: {
      variant: {
        info: 'border-[var(--border)] bg-[var(--gray-100)] text-[var(--foreground)]',
        warning:
          'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
        archived: 'border-[var(--border)] bg-[var(--gray-100)] text-[var(--gray-800)]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export type NoteVariants = VariantProps<typeof noteVariants>
