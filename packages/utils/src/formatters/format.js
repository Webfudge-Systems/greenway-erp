/**
 * Centralized formatting utilities
 */

/** Parse API / display values to a local calendar date, or null if invalid. */
export function parseDisplayDate(dateString) {
  if (!dateString) return null;
  if (dateString instanceof Date) {
    if (Number.isNaN(dateString.getTime())) return null;
    return new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate());
  }
  const raw = String(dateString).trim();
  if (!raw) return null;
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (isoDate) {
    const parsed = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/** Whole-day difference from today in local time (positive = future). */
export function calendarDayDiff(date) {
  const target = date instanceof Date ? date : parseDisplayDate(date);
  if (!target) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function formatCurrency(amount, options = {}, locale = 'en-IN') {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  let formatOptions = {};
  if (typeof options === 'string') {
    formatOptions = { style: 'currency', currency: options, minimumFractionDigits: 0, maximumFractionDigits: 0 };
  } else {
    formatOptions = {
      style: 'currency',
      currency: options.currency || 'INR',
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
      ...options,
    };
  }
  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

export function formatNumber(number, locale = 'en-IN') {
  if (typeof number !== 'number' || isNaN(number)) return '0';
  return new Intl.NumberFormat(locale).format(number);
}

export function formatPercentage(value, locale = 'en-IN') {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(value / 100);
}

export function formatDate(date, locale = 'en-IN', options = {}) {
  if (!date) return '';
  const defaultOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
}

export function formatDateTime(date, locale = 'en-IN') {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(date));
}

export function formatRelativeTime(date, locale = 'en-IN') {
  if (!date) return '';
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

export function formatFileSize(bytes, locale = 'en-IN') {
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) { size /= 1024; unitIndex++; }
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: unitIndex === 0 ? 0 : 1 }).format(size)} ${units[unitIndex]}`;
}

export function formatDuration(hours, locale = 'en-IN') {
  if (typeof hours !== 'number' || isNaN(hours)) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(remainingHours)}h`;
}

export function formatCurrencyCompact(amount, options = {}) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  const decimals = options.decimals ?? 2;
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 10000000) return `${sign}₹${(absAmount / 10000000).toFixed(decimals)} Cr`;
  if (absAmount >= 100000) return `${sign}₹${(absAmount / 100000).toFixed(decimals)} Lakh`;
  if (absAmount >= 1000) return `${sign}₹${(absAmount / 1000).toFixed(decimals)} Thousand`;
  return `${sign}₹${absAmount.toFixed(0)}`;
}
