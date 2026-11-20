import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'purple' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'purple',
  onClick,
}) => {
  const accentStyles = {
    purple: {
      bg: 'bg-purple-50/70 text-purple-600',
      border: 'hover:border-purple-300',
      glow: 'group-hover:shadow-purple-500/10',
    },
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-600',
      border: 'hover:border-indigo-300',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    emerald: {
      bg: 'bg-emerald-50/70 text-emerald-600',
      border: 'hover:border-emerald-300',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-600',
      border: 'hover:border-amber-300',
      glow: 'group-hover:shadow-amber-500/10',
    },
    rose: {
      bg: 'bg-rose-50/70 text-rose-600',
      border: 'hover:border-rose-300',
      glow: 'group-hover:shadow-rose-500/10',
    },
    blue: {
      bg: 'bg-blue-50/70 text-blue-600',
      border: 'hover:border-blue-300',
      glow: 'group-hover:shadow-blue-500/10',
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium flex flex-col justify-between',
        accentStyles.border,
        onClick && 'cursor-pointer'
      )}
    >
      <div>
        {/* Top row: Title and Icon */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
            {title}
          </p>
          <div
            className={cn(
              'shrink-0 p-2 rounded-xl transition-transform duration-300 group-hover:scale-110',
              accentStyles.bg
            )}
          >
            {icon}
          </div>
        </div>

        {/* Amount: Full Width, completely visible without truncation */}
        <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
          {value}
        </h4>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-slate-500 leading-snug mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-xs">
          <span
            className={cn(
              'font-semibold mr-1.5',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
