import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../theme/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

/**
 * Standard text input with 44px min-height and Geist styling.
 * Forwards ref + all native input attrs.
 *
 * @example
 * <Input type="email" placeholder="email@example.com" required />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full px-3 py-2 min-h-[44px] border rounded',
        'bg-[var(--background)] text-[var(--foreground)]',
        'border-[var(--border)]',
        'placeholder:text-[var(--gray-400)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    />
  )
})
