'use client';

import { Badge } from '@greenways/ui';

export const TASK_STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'INTERNAL_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PROJECT_STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const TASK_STATUS_META = {
  SCHEDULED: { variant: 'primary', label: 'To Do' },
  IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
  INTERNAL_REVIEW: { variant: 'purple', label: 'In Review' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  OVERDUE: { variant: 'danger', label: 'Overdue' },
};

const PROJECT_STATUS_META = {
  PLANNING: { variant: 'primary', label: 'Planning' },
  ACTIVE: { variant: 'cyan', label: 'Active' },
  IN_PROGRESS: { variant: 'orange', label: 'In Progress' },
  ON_HOLD: { variant: 'purple', label: 'On Hold' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  OVERDUE: { variant: 'danger', label: 'Overdue' },
};

const PRIORITY_META = {
  high: { variant: 'danger', label: 'High' },
  medium: { variant: 'warning', label: 'Medium' },
  low: { variant: 'success', label: 'Low' },
};

export function getTaskStatusMeta(status) {
  return TASK_STATUS_META[status] || { variant: 'default', label: status || '—' };
}

export function getProjectStatusMeta(status) {
  return PROJECT_STATUS_META[status] || { variant: 'default', label: status || '—' };
}

export function getPriorityMeta(priority) {
  return PRIORITY_META[(priority || '').toLowerCase()] || { variant: 'default', label: priority || '—' };
}

export function PMStatusBadge({ status, type = 'task', className }) {
  const meta = type === 'project' ? getProjectStatusMeta(status) : getTaskStatusMeta(status);
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}

export function PMPriorityBadge({ priority, className }) {
  const meta = getPriorityMeta(priority);
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
