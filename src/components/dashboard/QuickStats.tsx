import React from 'react';
import { DashboardStats } from '../../types';
import { StatCard } from '../common/StatCard';
import { formatINR } from '../../lib/utils';
import {
  Users,
  Wallet,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Coffee,
} from 'lucide-react';

interface QuickStatsProps {
  stats: DashboardStats;
  onNavigate?: (tab: string) => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-4">
      {/* Financial & Employee Overview (Top 5 Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Total Employees */}
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle={`${stats.activeEmployees} Active on duty`}
          icon={<Users className="w-5 h-5" />}
          accentColor="purple"
          onClick={() => onNavigate?.('employees')}
        />

        {/* 2. Total Monthly Salary Budget */}
        <StatCard
          title="Monthly Salary"
          value={formatINR(stats.totalMonthlySalaryBudget)}
          subtitle="Total salary commitment"
          icon={<Wallet className="w-5 h-5" />}
          accentColor="indigo"
          onClick={() => onNavigate?.('salary')}
        />

        {/* 3. Total Money Taken / Advances */}
        <StatCard
          title="Money Taken / Advances"
          value={formatINR(stats.totalAdvancesTaken)}
          subtitle="Money given to drivers this month"
          icon={<ArrowDownRight className="w-5 h-5" />}
          accentColor="amber"
          onClick={() => onNavigate?.('payments')}
        />

        {/* 4. Total Salary Paid */}
        <StatCard
          title="Total Salary Paid"
          value={formatINR(stats.totalSalaryPaid)}
          subtitle={`${stats.paidEmployeeCount} drivers paid this month`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
          onClick={() => onNavigate?.('payments')}
        />

        {/* 5. Total Remaining Salary */}
        <StatCard
          title="Total Salary Left to Pay"
          value={formatINR(stats.totalRemainingSalary)}
          subtitle="Completed monthly salary + this month's attendance, minus payments"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="rose"
          onClick={() => onNavigate?.('salary')}
        />
      </div>

      {/* Today's Live Attendance Overview (Next 4 Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 6. Today's Present */}
        <StatCard
          title="Today's Present"
          value={stats.todayPresentCount}
          subtitle="Drivers who came to work"
          icon={<UserCheck className="w-5 h-5" />}
          accentColor="emerald"
          onClick={() => onNavigate?.('attendance')}
        />

        {/* 7. Today's Absent */}
        <StatCard
          title="Today's Absent"
          value={stats.todayAbsentCount}
          subtitle="Drivers who did not come"
          icon={<UserX className="w-5 h-5" />}
          accentColor="rose"
          onClick={() => onNavigate?.('attendance')}
        />

        {/* 8. Today's Half-Day */}
        <StatCard
          title="Today's Half-Day"
          value={stats.todayHalfDayCount}
          subtitle="Came for half the day"
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
          onClick={() => onNavigate?.('attendance')}
        />

        {/* 9. Employees on Leave */}
        <StatCard
          title="Employees on Leave"
          value={stats.todayLeaveCount}
          subtitle="On approved leave today"
          icon={<Coffee className="w-5 h-5" />}
          accentColor="blue"
          onClick={() => onNavigate?.('attendance')}
        />
      </div>
    </div>
  );
};
