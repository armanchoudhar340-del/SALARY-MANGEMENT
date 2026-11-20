import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const MobileNav: React.FC = () => {
  const mobileNavItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/employees', label: 'Drivers', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/monthly-salary', label: 'Salary', icon: FileSpreadsheet },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2 sm:px-4">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors select-none min-h-[44px]',
                  isActive
                    ? 'text-purple-700 font-bold'
                    : 'text-slate-500 hover:text-purple-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1.5 rounded-xl transition-all',
                      isActive ? 'bg-purple-100 text-purple-700' : 'text-slate-500'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
