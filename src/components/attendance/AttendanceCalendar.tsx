import React, { useState } from 'react';
import { Employee, AttendanceRecord } from '../../types';
import { formatMonthName, getDaysInMonth, ATTENDANCE_STATUS_MAP } from '../../lib/utils';
import { Badge } from '../common/Badge';

interface AttendanceCalendarProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  monthStr: string; // YYYY-MM
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  employees,
  attendanceRecords,
  monthStr,
}) => {
  const [yearStr, monthStrPart] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStrPart, 10);
  const totalDays = getDaysInMonth(year, month);

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Map of `employeeId_YYYY-MM-DD` -> record
  const recordMap = new Map<string, AttendanceRecord>();
  attendanceRecords.forEach((r) => {
    recordMap.set(`${r.employee_id}_${r.date}`, r);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">
          Monthly Attendance Calendar Matrix - {formatMonthName(monthStr)}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> P = Present
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> H = Half Day
          </span>
          <span className="inline-flex items-center gap-1 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> A = Absent
          </span>
          <span className="inline-flex items-center gap-1 text-purple-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> W = Off
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="py-2 px-3 text-left sticky left-0 bg-slate-50 z-10 min-w-[160px]">
                Driver
              </th>
              {daysArray.map((day) => {
                const dateObj = new Date(year, month - 1, day);
                const isSunday = dateObj.getDay() === 0;
                return (
                  <th
                    key={day}
                    className={`p-1.5 text-center min-w-[28px] font-semibold ${
                      isSunday ? 'bg-purple-50 text-purple-700' : ''
                    }`}
                  >
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100">
                  <div className="truncate max-w-[150px]">{emp.full_name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{emp.category}</div>
                </td>

                {daysArray.map((day) => {
                  const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
                  const rec = recordMap.get(`${emp.id}_${dateStr}`);

                  let code = '-';
                  let cellBg = 'text-slate-300';

                  if (rec) {
                    if (rec.status === 'present') {
                      code = 'P';
                      cellBg = 'bg-emerald-100 text-emerald-800 font-bold';
                    } else if (rec.status === 'half_day') {
                      code = 'H';
                      cellBg = 'bg-amber-100 text-amber-800 font-bold';
                    } else if (rec.status === 'absent') {
                      code = 'A';
                      cellBg = 'bg-rose-100 text-rose-800 font-bold';
                    } else if (rec.status === 'paid_leave') {
                      code = 'L';
                      cellBg = 'bg-blue-100 text-blue-800 font-bold';
                    } else if (rec.status === 'weekly_off') {
                      code = 'W';
                      cellBg = 'bg-purple-100 text-purple-800 font-bold';
                    }
                  }

                  return (
                    <td
                      key={day}
                      title={`${emp.full_name} on ${dateStr}: ${rec?.status || 'Pending'}`}
                      className={`p-1 text-center border-r border-slate-50 text-[11px] ${cellBg}`}
                    >
                      {code}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
