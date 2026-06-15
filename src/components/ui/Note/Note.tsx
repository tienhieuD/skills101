import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../theme/cn'
import { noteVariants, type NoteVariants } from './Note.variants'

export interface NoteProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, NoteVariants {
  /** Optional heading rendered as a bold prefix. */
  title?: ReactNode
}

/**
 * Inline note / callout block for highlights, archive ribbon, offline message, etc.
 *
 * @example
 * <Note variant="archived" title="Archived">Bài này đã được lưu trữ.</Note>
 */
export function Note({ variant, title, className, children, ...rest }: NoteProps) {
  return (
    <div role="note" className={cn(noteVariants({ variant }), className)} {...rest}>
      {title && <strong className="font-semibold">{title}</strong>}
      {title && ' — '}
      {children}
    </div>
  )
}
