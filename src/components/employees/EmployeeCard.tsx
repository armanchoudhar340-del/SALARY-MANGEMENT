import React from 'react';
import { Employee, MonthlySalaryRecord } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import { calculateCompletedServiceMonths, calculateEmploymentDuration, calculateSalaryBalanceToDate } from '../../lib/calculation';
import {
  Calendar,
  Clock,
  Eye,
  PlusCircle,
  Edit,
  Phone,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface EmployeeCardProps {
  employee: Employee;
  salaryRecord?: MonthlySalaryRecord;
  onViewDetails: (employee: Employee) => void;
  onAddPayment: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  salaryRecord,
  onViewDetails,
  onAddPayment,
  onEdit,
}) => {
  const duration = calculateEmploymentDuration(
    employee.joining_date,
    employee.leaving_date
  );

  const isMonthly = employee.salary_type === 'monthly';
  const dailyRate = salaryRecord?.calculated_daily_rate ?? (
    isMonthly ? Math.round(employee.monthly_salary / 30) : employee.daily_salary
  );

  const earnedSalary = salaryRecord?.earned_salary ?? 0;
  const advances = salaryRecord?.total_advances ?? 0;
  const salaryPaid = salaryRecord?.total_salary_paid ?? 0;
  const completedMonths = salaryRecord
    ? calculateCompletedServiceMonths(employee.joining_date, salaryRecord.salary_month, employee.leaving_date)
    : 0;
  // Completed monthly salary periods accrue even when this month has no attendance yet.
  const remaining = salaryRecord ? calculateSalaryBalanceToDate(employee, salaryRecord) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Profile */}
      <div className="p-3 sm:p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative shrink-0">
              {employee.profile_photo_url ? (
                <img
                  src={employee.profile_photo_url}
                  alt={employee.full_name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-purple-100 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 border-2 border-purple-200/60 flex items-center justify-center text-purple-700 font-bold text-base sm:text-lg shadow-sm">
                  {employee.full_name.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  employee.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={employee.is_active ? 'Active' : 'Inactive'}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  {employee.full_name}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <Badge variant="purple" size="sm">
                  {employee.category}
                </Badge>
                <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 truncate">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {employee.mobile_number}
                </span>
              </div>
            </div>
          </div>

          <Badge variant={employee.is_active ? 'success' : 'default'} size="sm">
            {employee.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Joining & Working Duration */}
        <div className="mt-2.5 sm:mt-4 grid grid-cols-2 gap-2 text-[11px] sm:text-xs bg-slate-50/70 p-2 sm:p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="truncate">Joined: <strong className="text-slate-800">{formatDate(employee.joining_date)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 truncate">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span title={duration} className="truncate">Duration: <strong className="text-slate-800">{duration}</strong></span>
          </div>
        </div>
      </div>

      {/* Salary & Attendance Breakdown */}
      <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-4">
        {/* Salary rates */}
        <div className="grid grid-cols-2 gap-3 pb-2.5 sm:pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isMonthly ? 'Monthly Salary' : 'Daily Rate'}
            </span>
            <span className="text-base font-bold text-slate-800">
              {formatINR(isMonthly ? employee.monthly_salary : employee.daily_salary)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Daily Rate
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {formatINR(dailyRate)}/day
            </span>
          </div>
        </div>

        {/* Attendance Days Pill Counters */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Attendance This Month
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
            <div className="bg-emerald-50 text-emerald-700 py-1.5 px-1 rounded-xl border border-emerald-100">
              <span className="block font-bold text-sm">
                {salaryRecord?.present_days ?? 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Present</span>
            </div>
            <div className="bg-amber-50 text-amber-700 py-1.5 px-1 rounded-xl border border-amber-100">
              <span className="block font-bold text-sm">
                {salaryRecord?.half_days ?? 0}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">Half Day</span>
            </div>
            <div className="bg-rose-50 text-rose-700 py-1.5 px-1 rounded-xl border border-rose-100">
              <span className="block font-bold text-sm">
                {salaryRecord?.absent_days ?? 0}
              </span>
              <span className="text-[10px] text-rose-600 font-medium">Absent</span>
            </div>
            <div className="bg-blue-50 text-blue-700 py-1.5 px-1 rounded-xl border border-blue-100">
              <span className="block font-bold text-sm">
                {salaryRecord?.paid_leave_days ?? 0}
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Leave</span>
            </div>
          </div>
        </div>

        {/* Financial Flow Summary Box */}
        <div className="bg-purple-50/50 rounded-2xl p-2.5 sm:p-3.5 border border-purple-100/80 space-y-1.5 sm:space-y-2 text-xs">
          {isMonthly && completedMonths > 0 && (
            <div className="flex items-center justify-between gap-2 text-indigo-700">
              <span>Base salary for {completedMonths} completed {completedMonths === 1 ? 'month' : 'months'}:</span>
              <span className="font-bold whitespace-nowrap">{formatINR(employee.monthly_salary * completedMonths)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Salary Earned This Month:</span>
            <span className="font-bold text-slate-800">{formatINR(earnedSalary)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-600">
            <span>Money Taken:</span>
            <span className="font-bold">-{formatINR(advances)}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-700">
            <span>Salary Paid:</span>
            <span className="font-bold">-{formatINR(salaryPaid)}</span>
          </div>
          <div className="pt-1.5 sm:pt-2 border-t border-purple-200/60 flex items-center justify-between">
            <span className="font-bold text-purple-900 text-sm">Total Salary Left:</span>
            <span
              className={`font-black text-base ${
                remaining < 0
                  ? 'text-rose-600'
                  : remaining > 0
                  ? 'text-emerald-600'
                  : 'text-slate-500'
              }`}
            >
              {formatINR(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar — 3 buttons (Attendance removed) */}
      <div className="px-2.5 sm:px-5 py-2.5 sm:py-3 bg-slate-50/70 border-t border-slate-100 grid grid-cols-3 gap-1 sm:gap-2">
        <button
          onClick={() => onViewDetails(employee)}
          title="View Complete Profile & History"
          className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs min-h-[38px]"
        >
          <Eye className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Details</span>
        </button>

        <button
          onClick={() => onAddPayment(employee)}
          title="Add Advance or Salary Payment"
          className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors min-h-[38px]"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>Add Money</span>
        </button>

        <button
          onClick={() => onEdit(employee)}
          title="Edit Employee Information"
          className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs min-h-[38px]"
        >
          <Edit className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};
