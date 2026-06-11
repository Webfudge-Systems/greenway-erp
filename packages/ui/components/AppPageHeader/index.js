'use client';

/**
 * AppPageHeader — shared WorkspaceHeader wrapper used by every workspace app
 * (PM, CRM, Accounts, Books …).
 *
 * Each app passes its own `notificationService` and `renderGlobalSearchModal`
 * so the header stays generic while the data layer stays in the app.
 *
 * Props (all optional unless noted):
 *   title                  – page title string
 *   subtitle               – sub-heading string
 *   breadcrumb             – array of { label, href } items
 *   showSearch             – show search icon/input (default false)
 *   showActions            – show action buttons (default false)
 *   showProfile            – show profile avatar (default true)
 *   searchPlaceholder      – placeholder for the search input
 *   onSearchChange         – (value: string) => void
 *   onAddClick             – () => void
 *   onFilterClick          – () => void
 *   onImportClick          – () => void
 *   onExportClick          – () => void
 *   onShareImageClick      – () => void
 *   hasActiveFilters       – boolean
 *   actions                – ReactNode — extra action buttons
 *   children               – ReactNode — extra content below header
 *   notificationService    – (REQUIRED) app-specific notification service instance
 *   renderGlobalSearchModal – ({ isOpen, onClose, initialQuery }) => ReactNode
 *   searchInputClassName   – Tailwind class override for the search input
 */

import { WorkspaceHeader } from '../WorkspaceHeader';
import { PAGE_HEADER_SEARCH_INPUT_CLASS } from '../../utils/pageHeaderToolbar';

const DEFAULT_SEARCH_INPUT_CLASS = PAGE_HEADER_SEARCH_INPUT_CLASS;

export function AppPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  showSearch = false,
  showActions = false,
  showProfile = true,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onAddClick,
  onFilterClick,
  onImportClick,
  onExportClick,
  onShareImageClick,
  hasActiveFilters = false,
  actions,
  children,
  notificationService,
  renderGlobalSearchModal,
  searchInputClassName = DEFAULT_SEARCH_INPUT_CLASS,
  showBack = false,
  onBack,
  backLabel = 'Back',
}) {
  return (
    <WorkspaceHeader
      title={title}
      subtitle={subtitle}
      breadcrumb={breadcrumb}
      showSearch={showSearch}
      showActions={showActions}
      showProfile={showProfile}
      searchPlaceholder={searchPlaceholder}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onAddClick={onAddClick}
      onFilterClick={onFilterClick}
      onImportClick={onImportClick}
      onExportClick={onExportClick}
      onShareImageClick={onShareImageClick}
      hasActiveFilters={hasActiveFilters}
      actions={actions}
      notificationService={notificationService}
      renderGlobalSearchModal={renderGlobalSearchModal}
      searchInputClassName={searchInputClassName}
      showBack={showBack}
      onBack={onBack}
      backLabel={backLabel}
    >
      {children}
    </WorkspaceHeader>
  );
}

export default AppPageHeader;
