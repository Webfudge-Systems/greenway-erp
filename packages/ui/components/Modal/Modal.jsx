'use client'

import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className,
  contentClassName,
  showCloseButton = true,
  closeOnBackdrop = true,
  ...props
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
          onClick={closeOnBackdrop ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          className={clsx(
            'relative w-full overflow-hidden bg-[#F1F1F1] rounded-3xl',
            'shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.06)]',
            'transform transition-all',
            sizes[size],
            className
          )}
          {...props}
        >
          {(title || showCloseButton) && (
            <div
              className={clsx(
                'flex items-start gap-4 px-8 pt-8 pb-5 border-b border-gray-300',
                title ? 'justify-between' : 'justify-end'
              )}
            >
              {title && (
                <h3
                  id="modal-title"
                  className="text-3xl font-bold tracking-tight text-slate-900 pr-2 leading-tight"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={clsx(
                    'shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                    title ? '-mr-1 -mt-0.5' : '-mr-1'
                  )}
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} aria-hidden />
                </button>
              )}
            </div>
          )}

          <div className={clsx('px-8 pb-8 pt-6', contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
