import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  FileBarChart,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/employees',
    label: 'Employees',
    icon: Users,
  },
  {
    to: '/attendance',
    label: 'Daily Attendance',
    icon: CalendarCheck,
  },
  {
    to: '/payments',
    label: 'Money Taken / Payments',
    icon: CreditCard,
  },
  {
    to: '/monthly-salary',
    label: 'Monthly Salary Cards',
    icon: FileSpreadsheet,
  },
  {
    to: '/reports',
    label: 'Reports & Export',
    icon: FileBarChart,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    to: '/help',
    label: 'Help & Guide',
    icon: HelpCircle,
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 p-4 shrink-0 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-5rem)]">
      <nav className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-semibold shadow-sm border border-purple-200/70'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-slate-50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info card */}
      <div className="p-3.5 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 rounded-2xl border border-purple-100 text-xs">
        <p className="font-semibold text-purple-900">DriverPay Pro</p>
        <p className="text-slate-500 mt-0.5 text-[11px]">Calendar-based salary engine with real-time balance tracking.</p>
      </div>
    </aside>
  );
};
