import { cn } from '../theme/cn'

export interface SpinnerProps {
  /** Size of the spinner. Default: 'md' (20px). */
  size?: 'sm' | 'md' | 'lg'
  /** Accessible label. Default: 'Đang tải'. */
  label?: string
  className?: string
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
}

/**
 * Loading indicator. Renders a spinning SVG circle.
 *
 * @example
 * <Spinner size="md" label="Đang gửi" />
 */
export function Spinner({ size = 'md', label = 'Đang tải', className }: SpinnerProps) {
  const px = sizeMap[size]
  return (
    <svg
      role="status"
      aria-label={label}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={cn('animate-spin', className)}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
        fill="none"
      />
      <path
        d="M 12 2 A 10 10 0 0 1 22 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
