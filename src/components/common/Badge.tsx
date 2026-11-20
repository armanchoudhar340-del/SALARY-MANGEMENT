import React from 'react';
import { cn, ATTENDANCE_STATUS_MAP } from '../../lib/utils';
import { AttendanceStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  status?: AttendanceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  size = 'md',
  className,
}) => {
  if (status && ATTENDANCE_STATUS_MAP[status]) {
    const config = ATTENDANCE_STATUS_MAP[status];
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          config.bg,
          config.text,
          config.border,
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
          className
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
        {children || config.label}
      </span>
    );
  }

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-purple-50 text-purple-700 border-purple-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        className
      )}
    >
      {children}
    </span>
  );
};
