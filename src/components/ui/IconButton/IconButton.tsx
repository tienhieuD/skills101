import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../theme/cn'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon element (SVG/component). */
  children: ReactNode
  /** Required for accessibility — describes the action. */
  'aria-label': string
  /** Visual variant. Default: `'outlined'`. */
  variant?: 'outlined' | 'ghost'
}

/**
 * Icon-only button with 44×44 touch target and required `aria-label`.
 *
 * @example
 * <IconButton aria-label="Đóng" onClick={close}><CloseIcon /></IconButton>
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, variant = 'outlined', type = 'button', children, ...rest },
  ref
) {
  const base = [
    'inline-flex items-center justify-center',
    'min-w-[44px] min-h-[44px] rounded',
    'transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-[var(--background)]',
  ].join(' ')

  const variantClass =
    variant === 'outlined'
      ? 'border border-[var(--border)] bg-transparent hover:bg-[var(--gray-100)]'
      : 'bg-transparent hover:bg-[var(--gray-100)]'

  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variantClass, className)}
      {...rest}
    >
      {children}
    </button>
  )
})
