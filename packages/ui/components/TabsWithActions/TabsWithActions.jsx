'use client'

import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import {
  Search,
  Plus,
  List,
  LayoutGrid,
  CalendarDays,
  Eye,
  Filter,
  ListChecks,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'

/** Short, single-line labels for the mobile overflow menu (desktop tooltips stay verbose). */
function mobileMenuLabel(actionKey, title) {
  const raw = String(title || '').trim()
  switch (actionKey) {
    case 'add':
      if (/^create/i.test(raw)) return 'Create'
      if (/^add/i.test(raw)) return 'Add'
      return raw.split(/\s+/)[0] || 'Add'
    case 'filter':
      return /active/i.test(raw) ? 'Filters' : 'Filter'
    case 'columns':
      return 'Columns'
    case 'sort':
      return 'Sort'
    case 'bulk':
      return 'Bulk edit'
    case 'view-list':
      return 'List'
    case 'view-board':
      return 'Board'
    case 'view-calendar':
      return 'Calendar'
    default:
      return raw.replace(/\s*\([^)]*\)/g, '').trim() || 'Action'
  }
}

/**
 * Advanced Tabs component with integrated actions, search, and view toggles
 * Perfect for CRM-style list/board views with filtering and actions
 *
 * Mobile (< md): status tabs and toolbar actions collapse into dropdowns.
 *
 * Variants:
 * - glass | modern | default — toolbar + tabs (list pages)
 * - pill — white pill-shaped track, evenly spaced tabs; active = solid orange pill, inactive = text only (detail pages)
 */
export function TabsWithActions({
  tabs,
  activeTab,
  onTabChange,

  // Search props
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',

  // Actions props
  showAdd = false,
  onAddClick,
  addTitle = 'Add New',
  /** When true, desktop add control is a labeled primary button (tasks); default is icon-only */
  addShowLabel = false,
  /** Visible label when addShowLabel is true; defaults to addTitle */
  addLabel,

  showFilter = false,
  onFilterClick,
  filterTitle = 'Filter',

  showBulkEdit = false,
  onBulkEditClick,
  bulkEditActive = false,
  bulkEditTitle = 'Bulk edit',

  showColumnVisibility = false,
  onColumnVisibilityClick,
  columnVisibilityTitle = 'Column Visibility',

  showSort = false,
  onSortClick,
  sortTitle = 'Sort',
  hasActiveSort = false,

  // View toggle props
  showViewToggle = false,
  activeView = 'list',
  onViewChange,
  viewOptions = ['list', 'board'],
  listViewTitle = 'List view',
  boardViewTitle = 'Board view',
  calendarViewTitle = 'Calendar view',

  /** Rendered immediately after the tab buttons (e.g. list/table/kanban icons), still left of search/actions */
  afterTabs = null,

  // Styling
  className,
  variant = 'glass',
  ...props
}) {
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null)
  const mobileActionsRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)
  const mobileMenuPanelRef = useRef(null)

  const MOBILE_MENU_WIDTH_PX = 144

  const updateMobileMenuAnchor = useCallback(() => {
    const btn = mobileMenuButtonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const pad = 8
    const gap = 6
    setMobileMenuAnchor({
      top: rect.bottom + gap,
      left: Math.max(pad, Math.min(rect.right - MOBILE_MENU_WIDTH_PX, window.innerWidth - MOBILE_MENU_WIDTH_PX - pad)),
    })
  }, [])

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  useEffect(() => {
    if (!mobileActionsOpen) {
      setMobileMenuAnchor(null)
      return undefined
    }
    updateMobileMenuAnchor()
    const onScroll = () => setMobileActionsOpen(false)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', updateMobileMenuAnchor)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', updateMobileMenuAnchor)
    }
  }, [mobileActionsOpen, updateMobileMenuAnchor])

  useEffect(() => {
    if (!mobileActionsOpen) return undefined
    const onDocMouseDown = (event) => {
      const target = event.target
      if (mobileActionsRef.current?.contains(target)) return
      if (mobileMenuPanelRef.current?.contains(target)) return
      setMobileActionsOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [mobileActionsOpen])

  useEffect(() => {
    if (!mobileActionsOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileActionsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileActionsOpen])

  const hasRightPanel =
    showSearch ||
    (showAdd && onAddClick) ||
    (showFilter && onFilterClick) ||
    (showBulkEdit && onBulkEditClick) ||
    (showColumnVisibility && onColumnVisibilityClick) ||
    (showSort && onSortClick) ||
    showViewToggle

  const hasAfterTabs = Boolean(afterTabs)

  const isPill = variant === 'pill'

  const containerClasses = {
    glass:
      'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white/70 backdrop-blur-xl border border-white/40 rounded-lg shadow-xl p-3',
    modern:
      'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white border border-gray-200 rounded-lg shadow-lg p-3',
    default:
      'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white border-b border-gray-200 pb-3',
  }

  const tabButtonClass = (tabId) => {
    const active = activeTab === tabId
    if (isPill) {
      return clsx(
        'flex min-w-[5rem] flex-1 basis-0 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm transition-all duration-200',
        active
          ? 'bg-[#FF7A20] font-semibold text-white shadow-sm'
          : 'bg-transparent font-normal text-gray-800 hover:bg-gray-100/90'
      )
    }
    return clsx(
      'flex items-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300',
      active
        ? 'bg-orange-500 text-white shadow-lg'
        : 'border border-white/40 bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-white/90 hover:shadow-md'
    )
  }

  const badgeClass = (tabId) => {
    const active = activeTab === tabId
    if (isPill) {
      return clsx(
        'rounded-full px-2 py-0.5 text-xs font-bold transition-all duration-200',
        active ? 'bg-white/25 text-white' : 'bg-gray-200/90 text-gray-700'
      )
    }
    return clsx(
      'ml-2 rounded-full px-2 py-0.5 text-xs font-bold transition-all duration-300',
      active ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-700'
    )
  }

  const tabButtons = tabs.map((tab) => {
    const tabId = tab.id || tab.key
    return (
      <button
        key={tabId}
        type="button"
        onClick={() => handleTabClick(tabId)}
        className={tabButtonClass(tabId)}
      >
        <span>{tab.label}</span>
        {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
          <span className={badgeClass(tabId)}>{tab.badge}</span>
        )}
      </button>
    )
  })

  const mobileActionItems = useMemo(() => {
    const items = []
    if (showAdd && onAddClick) {
      items.push({
        key: 'add',
        label: mobileMenuLabel('add', addTitle),
        hint: addTitle,
        icon: Plus,
        onClick: onAddClick,
      })
    }
    if (showFilter && onFilterClick) {
      items.push({
        key: 'filter',
        label: mobileMenuLabel('filter', filterTitle),
        hint: filterTitle,
        icon: Filter,
        onClick: onFilterClick,
      })
    }
    if (showColumnVisibility && onColumnVisibilityClick) {
      items.push({
        key: 'columns',
        label: mobileMenuLabel('columns', columnVisibilityTitle),
        hint: columnVisibilityTitle,
        icon: Eye,
        onClick: onColumnVisibilityClick,
      })
    }
    if (showSort && onSortClick) {
      items.push({
        key: 'sort',
        label: mobileMenuLabel('sort', sortTitle),
        hint: sortTitle,
        icon: ArrowUpDown,
        onClick: onSortClick,
        active: hasActiveSort,
      })
    }
    if (showBulkEdit && onBulkEditClick) {
      items.push({
        key: 'bulk',
        label: mobileMenuLabel('bulk', bulkEditTitle),
        hint: bulkEditTitle,
        icon: ListChecks,
        onClick: onBulkEditClick,
        active: bulkEditActive,
      })
    }
    if (showViewToggle) {
      if (viewOptions.includes('list')) {
        items.push({
          key: 'view-list',
          label: mobileMenuLabel('view-list', listViewTitle),
          hint: listViewTitle,
          icon: List,
          onClick: () => onViewChange?.('list'),
          active: activeView === 'list',
        })
      }
      if (viewOptions.includes('board')) {
        items.push({
          key: 'view-board',
          label: mobileMenuLabel('view-board', boardViewTitle),
          hint: boardViewTitle,
          icon: LayoutGrid,
          onClick: () => onViewChange?.('board'),
          active: activeView === 'board',
        })
      }
      if (viewOptions.includes('calendar')) {
        items.push({
          key: 'view-calendar',
          label: mobileMenuLabel('view-calendar', calendarViewTitle),
          hint: calendarViewTitle,
          icon: CalendarDays,
          onClick: () => onViewChange?.('calendar'),
          active: activeView === 'calendar',
        })
      }
    }
    return items
  }, [
    showAdd,
    onAddClick,
    addTitle,
    showFilter,
    onFilterClick,
    filterTitle,
    showColumnVisibility,
    onColumnVisibilityClick,
    columnVisibilityTitle,
    showSort,
    onSortClick,
    sortTitle,
    hasActiveSort,
    showBulkEdit,
    onBulkEditClick,
    bulkEditTitle,
    bulkEditActive,
    showViewToggle,
    viewOptions,
    listViewTitle,
    boardViewTitle,
    calendarViewTitle,
    activeView,
    onViewChange,
  ])

  const hasMobileActions = mobileActionItems.length > 0

  const mobileTabSelect = (
    <div className="relative min-w-0 flex-1">
      <select
        value={activeTab}
        onChange={(event) => handleTabClick(event.target.value)}
        aria-label="Filter by status"
        className={clsx(
          'w-full appearance-none py-2.5 pl-3 pr-10 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2',
          isPill
            ? 'rounded-full border border-[#FF7A20] bg-[#FF7A20] font-semibold text-white focus:border-[#FF7A20] focus:ring-[#FF7A20]/30'
            : 'rounded-xl border border-gray-300 bg-white font-semibold text-gray-900 focus:border-orange-500/60 focus:ring-orange-500/20'
        )}
      >
        {tabs.map((tab) => {
          const tabId = tab.id || tab.key
          const badge =
            tab.badge !== undefined && tab.badge !== null && tab.badge !== '' ? ` (${tab.badge})` : ''
          return (
            <option key={tabId} value={tabId}>
              {tab.label}
              {badge}
            </option>
          )
        })}
      </select>
      <ChevronDown
        className={clsx(
          'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2',
          isPill ? 'text-white/90' : 'text-gray-500'
        )}
        aria-hidden
      />
    </div>
  )

  const mobileActionsMenuPanel =
    mobileActionsOpen && mobileMenuAnchor && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div className="fixed inset-0 z-[199]" aria-hidden />
            <div
              ref={mobileMenuPanelRef}
              role="menu"
              className="fixed z-[200] w-36 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              style={{ top: mobileMenuAnchor.top, left: mobileMenuAnchor.left }}
            >
              {mobileActionItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    title={item.hint || item.label}
                    onClick={() => {
                      setMobileActionsOpen(false)
                      item.onClick?.()
                    }}
                    className={clsx(
                      'flex w-full items-start gap-3 px-3.5 py-2.5 text-left text-sm transition-colors',
                      item.active
                        ? 'bg-orange-50 font-semibold text-orange-700'
                        : 'font-medium text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="min-w-0 whitespace-nowrap leading-none">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </>,
          document.body
        )
      : null

  const mobileActionsMenu = hasMobileActions ? (
    <>
      <div className="relative shrink-0 md:hidden" ref={mobileActionsRef}>
        <button
          ref={mobileMenuButtonRef}
          type="button"
          onClick={() => setMobileActionsOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md transition-colors hover:border-gray-400 hover:bg-gray-50"
          aria-label="Toolbar actions"
          aria-expanded={mobileActionsOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      {mobileActionsMenuPanel}
    </>
  ) : null

  const desktopTabScrollArea = (
    <div
      className={clsx(
        isPill
          ? 'flex min-h-[48px] w-full min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full border border-gray-200 bg-white p-1.5 shadow-[0_2px_12px_rgba(15,23,42,0.09),0_1px_3px_rgba(15,23,42,0.05)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex min-w-0 flex-1 items-center gap-2 overflow-x-auto'
      )}
    >
      {tabButtons}
    </div>
  )

  const mobileToolbarRow = (
    <div className="flex w-full min-w-0 items-center gap-2 md:hidden">
      {mobileTabSelect}
      {hasAfterTabs ? <div className="shrink-0">{afterTabs}</div> : null}
      {mobileActionsMenu}
    </div>
  )

  const desktopTabRow = hasAfterTabs ? (
    <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex md:gap-3">
      {desktopTabScrollArea}
      <div className="flex shrink-0 items-center border-l border-gray-200/60 pl-2.5 md:pl-3.5">
        {afterTabs}
      </div>
    </div>
  ) : (
    <div className="hidden min-w-0 flex-1 md:block">{desktopTabScrollArea}</div>
  )

  const desktopAddLabel = String(addLabel || addTitle || 'Add').trim() || 'Add'

  const desktopActionButtons = (
    <>
      {showAdd && onAddClick && (
        addShowLabel ? (
          <button
            type="button"
            onClick={onAddClick}
            className="hidden items-center gap-2 whitespace-nowrap rounded-xl border border-orange-400 bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:border-orange-500 hover:bg-orange-600 md:flex"
            title={addTitle}
          >
            <Plus className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span>{desktopAddLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddClick}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-orange-600 shadow-md transition-colors duration-200 hover:border-gray-400 hover:bg-orange-50 md:flex"
            title={addTitle}
          >
            <Plus className="h-5 w-5" />
          </button>
        )
      )}

      {showViewToggle && (
        <>
          {viewOptions.includes('list') && (
            <button
              type="button"
              onClick={() => onViewChange?.('list')}
              className={clsx(
                'hidden h-10 w-10 items-center justify-center rounded-full border shadow-md transition-colors duration-200 md:flex',
                activeView === 'list'
                  ? 'border-orange-300 bg-orange-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              )}
              title={listViewTitle}
            >
              <List className="h-5 w-5" />
            </button>
          )}
          {viewOptions.includes('board') && (
            <button
              type="button"
              onClick={() => onViewChange?.('board')}
              className={clsx(
                'hidden h-10 w-10 items-center justify-center rounded-full border shadow-md transition-colors duration-200 md:flex',
                activeView === 'board'
                  ? 'border-orange-300 bg-orange-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              )}
              title={boardViewTitle}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          )}
          {viewOptions.includes('calendar') && (
            <button
              type="button"
              onClick={() => onViewChange?.('calendar')}
              className={clsx(
                'hidden h-10 w-10 items-center justify-center rounded-full border shadow-md transition-colors duration-200 md:flex',
                activeView === 'calendar'
                  ? 'border-orange-300 bg-orange-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              )}
              title={calendarViewTitle}
            >
              <CalendarDays className="h-5 w-5" />
            </button>
          )}
        </>
      )}

      {showFilter && onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50 md:flex"
          title={filterTitle}
        >
          <Filter className="h-5 w-5" />
        </button>
      )}

      {showBulkEdit && onBulkEditClick && (
        <button
          type="button"
          onClick={onBulkEditClick}
          className={clsx(
            'hidden items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold shadow-md transition-colors duration-200 md:flex',
            bulkEditActive
              ? 'border-orange-300 bg-orange-500 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          )}
          title={bulkEditTitle}
        >
          <ListChecks className="h-4 w-4 flex-shrink-0" />
          <span className="hidden lg:inline">{bulkEditTitle}</span>
        </button>
      )}

      {showColumnVisibility && onColumnVisibilityClick && (
        <button
          type="button"
          onClick={onColumnVisibilityClick}
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50 md:flex"
          title={columnVisibilityTitle}
        >
          <Eye className="h-5 w-5" />
        </button>
      )}

      {showSort && onSortClick && (
        <button
          type="button"
          onClick={onSortClick}
          className={clsx(
            'hidden h-10 w-10 items-center justify-center rounded-full border shadow-md transition-colors duration-200 md:flex',
            hasActiveSort
              ? 'border-orange-300 bg-orange-500 text-white hover:bg-orange-600'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
          )}
          title={sortTitle}
          aria-pressed={hasActiveSort}
        >
          <ArrowUpDown className="h-5 w-5" />
        </button>
      )}
    </>
  )

  const searchField = showSearch ? (
    <>
      <div className="relative flex w-full items-center md:hidden">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-sm transition-colors duration-200 placeholder:text-gray-400 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>
      <div className="relative hidden items-center md:flex">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-64 rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-md transition-colors duration-200 placeholder:text-gray-400 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>
    </>
  ) : null

  const rightPanel = hasRightPanel ? (
    <div className="flex w-full flex-shrink-0 flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-2">
      {searchField}
      <div className="hidden items-center gap-2 md:flex">{desktopActionButtons}</div>
    </div>
  ) : null

  const toolbarBody = (
    <>
      {mobileToolbarRow}
      {desktopTabRow}
      {rightPanel}
    </>
  )

  if (isPill) {
    return (
      <div
        className={clsx(
          'flex w-full flex-col gap-3 lg:flex-row lg:items-center',
          hasRightPanel && 'lg:justify-between',
          className
        )}
        {...props}
      >
        {toolbarBody}
      </div>
    )
  }

  return (
    <div
      className={clsx(containerClasses[variant] || containerClasses.glass, className)}
      {...props}
    >
      {toolbarBody}
    </div>
  )
}

export default TabsWithActions
