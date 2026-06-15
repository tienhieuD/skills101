'use client'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, type ReactNode } from 'react'
import { cn } from '../theme/cn'

export interface DrawerProps {
  /** Controls whether the drawer is open. */
  open: boolean
  /** Called when the drawer requests to close (backdrop click, ESC, or `Drawer.Close`). */
  onClose: () => void
  /** Side the drawer slides in from. Default: `'right'`. */
  side?: 'left' | 'right' | 'top' | 'bottom'
  /** Accessible title for the drawer. Required for `aria-labelledby`. */
  title: string
  /** Whether to visually show the title; default `false` (sr-only). */
  showTitle?: boolean
  className?: string
  children: ReactNode
}

const sideClass: Record<NonNullable<DrawerProps['side']>, string> = {
  right: 'right-0 top-0 h-full w-80 max-w-[90vw] translate-x-full data-[open]:translate-x-0',
  left: 'left-0 top-0 h-full w-80 max-w-[90vw] -translate-x-full data-[open]:translate-x-0',
  top: 'left-0 right-0 top-0 max-h-[80vh] -translate-y-full data-[open]:translate-y-0',
  bottom: 'left-0 right-0 bottom-0 max-h-[80vh] translate-y-full data-[open]:translate-y-0',
}

/**
 * Side-sliding drawer panel. Wraps `@headlessui/react` Dialog for focus trap,
 * ESC handling, and backdrop dismissal.
 *
 * @example
 * <Drawer open={open} onClose={close} title="Menu" side="right">
 *   <nav>...</nav>
 * </Drawer>
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  showTitle = false,
  className,
  children,
}: DrawerProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <TransitionChild
            as={Fragment}
            enter="transition-transform duration-200"
            enterFrom={getEnterFrom(side)}
            enterTo="translate-x-0 translate-y-0"
            leave="transition-transform duration-150"
            leaveFrom="translate-x-0 translate-y-0"
            leaveTo={getEnterFrom(side)}
          >
            <DialogPanel
              className={cn(
                'fixed bg-[var(--background)] text-[var(--foreground)] shadow-xl',
                'border border-[var(--border)]',
                'p-4 overflow-y-auto',
                sideClass[side],
                className
              )}
            >
              <Dialog.Title className={showTitle ? 'font-semibold text-lg mb-4' : 'sr-only'}>
                {title}
              </Dialog.Title>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

function getEnterFrom(side: NonNullable<DrawerProps['side']>): string {
  switch (side) {
    case 'right':
      return 'translate-x-full'
    case 'left':
      return '-translate-x-full'
    case 'top':
      return '-translate-y-full'
    case 'bottom':
      return 'translate-y-full'
  }
}
