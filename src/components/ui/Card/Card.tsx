import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
} from 'react'
import { cn } from '../theme/cn'

type CardElement = 'div' | 'article' | 'section' | 'li' | 'a'

interface BaseCardProps {
  className?: string
  /** Render as a different element (default `div`). */
  as?: Exclude<CardElement, 'a'>
}

type DivCardProps = BaseCardProps & Omit<HTMLAttributes<HTMLElement>, 'className'>
type AnchorCardProps = {
  as: 'a'
  className?: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>

export type CardProps = DivCardProps | AnchorCardProps

const CARD_BASE = cn(
  'block w-full',
  'border rounded-lg p-6',
  'border-[var(--border)] bg-[var(--background)]'
)

/**
 * Container card. Polymorphic via `as`. Compound: `Card.Header`, `Card.Body`, `Card.Footer`.
 */
const CardRoot = forwardRef<HTMLElement, CardProps>(function Card(props, ref) {
  const { className, ...rest } = props
  const merged = cn(CARD_BASE, className)

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      as: 'a'
    }
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(merged, 'hover:bg-[var(--gray-100)] transition-colors')}
        {...anchorRest}
      />
    )
  }

  const { as = 'div', ...elementRest } = rest as DivCardProps
  const Component = as as ElementType
  return <Component ref={ref} className={merged} {...elementRest} />
})

function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between mb-4 pb-4 border-b border-[var(--border)]', className)}
      {...rest}
    />
  )
}

function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...rest} />
}

function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2', className)}
      {...rest}
    />
  )
}

CardHeader.displayName = 'Card.Header'
CardBody.displayName = 'Card.Body'
CardFooter.displayName = 'Card.Footer'

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})
