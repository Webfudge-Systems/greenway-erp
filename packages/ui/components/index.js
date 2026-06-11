// ============================================
// CORE UI COMPONENTS
// Form, Display, and Navigation Components
// ============================================

// FORM COMPONENTS
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export { Textarea } from './Textarea';

// DISPLAY COMPONENTS
export { Accordion } from './Accordion';
export { Card } from './Card';
export { Badge } from './Badge';
export { Avatar } from './Avatar';
export { Table } from './Table';
export { TableSortPanel } from './TableSortPanel';
export { Pagination } from './Pagination';
export { EmptyState } from './EmptyState';
export { TableResultsCount, TableEmptyBelow } from './TableEmptyBelow';
export { KPICard } from './KPICard';
export { FormSectionCard } from './FormSectionCard';
export { SidebarTrialUpsell } from './SidebarTrialUpsell';
export { PwaInstallPrompt } from './PwaInstallPrompt';
export { WorkspaceHeader } from './WorkspaceHeader';
export { WorkspaceBackButton, workspaceBackButtonClassName } from './WorkspaceBackButton';
export {
  TableCellCreated,
  TableCellDateOnly,
  TableCellOwner,
  TableCellStatusPill,
  TableCellRole,
  TableCellLeadStatus,
  TableCellText,
  TableCellOrangePill,
  TableCellSource,
  TableCellMultiline,
  TableCellPrimaryContact,
  TableCellTitleSubtitle,
  TableCellProbability,
  formatRelativeTime,
  formatTableDate,
  ownerDisplayFromUser,
} from './TableCrmCells';
export { TableRowActionMenuPortal } from './TableRowActionMenuPortal';

// NAVIGATION COMPONENTS
export { Tabs } from './Tabs';
export { TabsWithActions } from './TabsWithActions';
export { ViewToggleGroup, ViewToggleButton } from './ViewToggleGroup';
export { Modal } from './Modal';
export { WorkspaceSearchModal } from './WorkspaceSearchModal';

// AUTOMATION / WORKFLOW COMPONENTS
export { NodeHandle } from './NodeHandle';
export { WorkflowStatusBadge } from './WorkflowStatusBadge';

// CROSS-APP SHARED COMPONENTS
export { AppPageHeader } from './AppPageHeader';
export {
  PageHeaderPrimaryButton,
  PageHeaderSearchField,
  PAGE_HEADER_SEARCH_INPUT_CLASS,
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
} from './PageHeaderToolbar';
export { ProgressBar } from './ProgressBar';
export { MeetingsEmbedList } from './MeetingsEmbedList';
export { TableSortDropdown } from './TableSortDropdown';
export { AccessDeniedPanel } from './AccessDeniedPanel';
export {
  LoginBrandCorner,
  LoginProductCredit,
  LoginBrandingPanel,
  LoginBrandingMobile,
  LoginMobileBrandHeader,
} from './LoginBrandingPanel';
export { WorkspaceLayoutContent } from './WorkspaceLayoutContent';
export {
  entityInfoLabelClass,
  InfoSection,
  DetailColumnHeading,
  InfoRow,
  SidebarCardTitle,
} from './EntityDetailLayout';

// CRM / entity activity (timeline + chats panel)
export { ActivitiesTimeline } from './ActivitiesTimeline';
export { EntityActivityPanel } from './EntityActivityPanel';
export { LinkifiedText } from './LinkifiedText';
export { ChatMessageText } from './ChatMessageText';
export { MentionComposer } from './MentionComposer';

// Workspace calendar (CRM + PM — meetings, tasks, project timelines)
export { UnifiedWorkspaceCalendar } from './UnifiedWorkspaceCalendar';
