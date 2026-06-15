import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react'
import { cn } from '../theme/cn'
import { badgeVariants, type BadgeVariants } from './Badge.variants'

interface BaseProps extends BadgeVariants {
  className?: string
}

export type BadgeProps =
  | (BaseProps & { as?: 'span' } & Omit<HTMLAttributes<HTMLSpanElement>, 'className'>)
  | (BaseProps & { as: 'a' } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>)
  | (BaseProps & { as: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)

/**
 * Tag chip / pill. Renders as `<span>` (default), `<a>`, or `<button>`.
 *
 * @example
 * <Badge>react</Badge>
 * <Badge as="a" href="/tags/nextjs">nextjs</Badge>
 * <Badge as="button" variant="active" onClick={...}>nextjs</Badge>
 */
export const Badge = forwardRef<
  HTMLSpanElement | HTMLAnchorElement | HTMLButtonElement,
  BadgeProps
>(function Badge(props, ref) {
  const { variant, className, ...rest } = props
  const merged = cn(badgeVariants({ variant }), className)

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      as: 'a'
    }
    return <a ref={ref as React.Ref<HTMLAnchorElement>} className={merged} {...anchorRest} />
  }

  if (props.as === 'button') {
    const {
      as: _as,
      type = 'button',
      ...buttonRest
    } = rest as ButtonHTMLAttributes<HTMLButtonElement> & { as: 'button' }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={merged}
        {...buttonRest}
      />
    )
  }

  const { as: _as, ...spanRest } = rest as HTMLAttributes<HTMLSpanElement> & { as?: 'span' }
  return <span ref={ref as React.Ref<HTMLSpanElement>} className={merged} {...spanRest} />
})
