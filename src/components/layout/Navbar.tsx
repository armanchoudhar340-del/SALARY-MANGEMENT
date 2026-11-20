import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useSync } from '../../context/SyncContext';
import { MonthPicker } from '../common/MonthPicker';
import {
  Truck,
  LogOut,
  RefreshCw,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddEmployee?: () => void;
  onOpenAddPayment?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, logout, isDemoMode } = useAuth();
  const { settings, selectedMonth, setSelectedMonth } = useSettings();
  const { isLiveConnected, isSyncing, triggerManualSync } = useSync();

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white shadow-lg shadow-purple-950/10">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner shrink-0">
              {settings.company_logo_url ? (
                <img
                  src={settings.company_logo_url}
                  alt={settings.company_name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl object-contain"
                />
              ) : (
                <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-purple-200" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base md:text-lg font-bold tracking-tight text-white leading-tight truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
                  {settings.company_name}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              </div>
              <p className="text-xs text-purple-200/80 hidden sm:block">
                Driver Salary &amp; Attendance Management System
              </p>
            </div>
          </div>

          {/* Month Selector & Sync Status */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />

            {/* Sync Badge */}
            <button
              onClick={triggerManualSync}
              title="Click to refresh/sync database"
              className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-purple-100 transition-colors backdrop-blur-md"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-300' : ''}`}
              />
              <span className="hidden md:inline">
                {isDemoMode ? (
                  <span className="text-amber-300 font-semibold">Demo DB</span>
                ) : isLiveConnected ? (
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Live Sync
                  </span>
                ) : (
                  'Sync'
                )}
              </span>
            </button>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-white/10">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrator'}
                </span>
                <span className="text-[10px] text-purple-200/80">Authorized Master</span>
              </div>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-purple-200">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <button
                onClick={logout}
                title="Secure Logout"
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
