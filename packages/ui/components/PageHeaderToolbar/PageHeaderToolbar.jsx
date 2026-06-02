'use client'

import { clsx } from 'clsx'
import { Search } from 'lucide-react'
import { Button } from '../Button'
import {
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PAGE_HEADER_SEARCH_INPUT_CLASS,
} from '../../utils/pageHeaderToolbar'

export function PageHeaderPrimaryButton({ className, children, ...props }) {
  return (
    <Button
      variant="primary"
      rounded="pill"
      className={clsx(PAGE_HEADER_PRIMARY_BUTTON_CLASS, className)}
      {...props}
    >
      {children}
    </Button>
  )
}

export function PageHeaderSearchField({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  containerClassName,
  'aria-label': ariaLabel,
  ...props
}) {
  return (
    <div className={clsx('relative', containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className={clsx(PAGE_HEADER_SEARCH_INPUT_CLASS, className)}
        {...props}
      />
    </div>
  )
}

export {
  PAGE_HEADER_SEARCH_INPUT_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
} from '../../utils/pageHeaderToolbar'
