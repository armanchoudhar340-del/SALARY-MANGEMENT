import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { getDaysInMonth } from './calculation';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with Indian Rupee symbol (₹) and Indian number grouping (lakhs/crores)
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const numericVal = Number(amount);
  const isNegative = numericVal < 0;
  const absVal = Math.abs(numericVal);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats date into DD/MM/YYYY
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Returns month string like "November 2026" from "2026-11"
 */
export function formatMonthName(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthStrPart] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStrPart, 10) - 1;

  const date = new Date(year, monthIndex, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns current month string in YYYY-MM format
 */
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Attendance status visual helpers
 */
export const ATTENDANCE_STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  present: {
    label: 'Present',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  absent: {
    label: 'Absent',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  half_day: {
    label: 'Half Day',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  paid_leave: {
    label: 'Paid Leave',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  unpaid_leave: {
    label: 'Unpaid Leave',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  weekly_off: {
    label: 'Weekly Off',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
};
