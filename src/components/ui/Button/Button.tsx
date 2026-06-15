import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { cn } from '../theme/cn'
import { buttonVariants, type ButtonVariants } from './Button.variants'

interface BaseProps extends ButtonVariants {
  className?: string
}

export type ButtonProps =
  | (BaseProps & { as?: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)
  | (BaseProps & { as: 'a' } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>)

/**
 * Standard action button with variants and full polymorphic `as` support
 * for rendering as `<button>` (default) or `<a>` link.
 *
 * @example
 * <Button variant="primary" onClick={handle}>Save</Button>
 * <Button as="a" href="/" variant="ghost">Cancel</Button>
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { variant, size, className, ...rest } = props

    const merged = cn(buttonVariants({ variant, size }), className)

    if (props.as === 'a') {
      const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
        as: 'a'
      }
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={merged} {...anchorRest} />
      )
    }

    const {
      as: _as,
      type = 'button',
      ...buttonRest
    } = rest as ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={merged}
        {...buttonRest}
      />
    )
  }
)
