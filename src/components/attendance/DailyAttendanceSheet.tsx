import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../../types';
import { formatDate, getTodayDateString, ATTENDANCE_STATUS_MAP } from '../../lib/utils';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  CheckCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface DailyAttendanceSheetProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  onMarkAttendance: (rec: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onBulkMark: (recs: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]) => Promise<any>;
  isMarking?: boolean;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  saveError?: string;
}

const STATUS_BUTTONS: { status: AttendanceStatus; label: string; icon: any; colorClass: string; activeClass: string }[] = [
  {
    status: 'present',
    label: 'Present',
    icon: CheckCircle2,
    colorClass: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
  },
  {
    status: 'half_day',
    label: 'Half Day',
    icon: Clock,
    colorClass: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200',
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-sm',
  },
  {
    status: 'absent',
    label: 'Absent',
    icon: XCircle,
    colorClass: 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
  },
  {
    status: 'paid_leave',
    label: 'Leave',
    icon: Coffee,
    colorClass: 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-sm',
  },
  {
    status: 'weekly_off',
    label: 'Off',
    icon: Coffee,
    colorClass: 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200',
    activeClass: 'bg-purple-600 text-white border-purple-600 shadow-sm',
  },
];

export const DailyAttendanceSheet: React.FC<DailyAttendanceSheetProps> = ({
  employees,
  attendanceRecords,
  onMarkAttendance,
  onBulkMark,
  isMarking,
  selectedDate,
  onSelectedDateChange,
  saveError,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter active employees
  const activeEmployees = useMemo(() => {
    return employees.filter((e) => e.is_active);
  }, [employees]);

  // Map of employeeId -> attendance record for selectedDate
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((rec) => {
      if (rec.date === selectedDate) {
        map.set(rec.employee_id, rec);
      }
    });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Daily summary counters
  const dailySummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let off = 0;

    dateAttendanceMap.forEach((rec) => {
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'half_day') halfDay++;
      else if (rec.status === 'paid_leave' || rec.status === 'unpaid_leave') leave++;
      else if (rec.status === 'weekly_off') off++;
    });

    const pending = Math.max(0, activeEmployees.length - dateAttendanceMap.size);

    return { present, absent, halfDay, leave, off, pending };
  }, [dateAttendanceMap, activeEmployees]);

  // Filtered list for display
  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.mobile_number.includes(searchTerm);
      const matchesCategory =
        selectedCategory === 'all' || emp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeEmployees, searchTerm, selectedCategory]);

  // One-tap attendance handler
  const handleTapStatus = (employeeId: string, status: AttendanceStatus) => {
    onMarkAttendance({
      employee_id: employeeId,
      date: selectedDate,
      status,
      overtime_hours: 0,
      remarks: null,
    });
  };

  // Bulk mark all pending / visible employees as Present
  const handleMarkAllPresent = async () => {
    const toMark = filteredEmployees.map((emp) => ({
      employee_id: emp.id,
      date: selectedDate,
      status: 'present' as AttendanceStatus,
      overtime_hours: 0,
      remarks: 'Bulk marked present',
    }));
    await onBulkMark(toMark);
  };

  return (
    <div className="space-y-6">
      {/* Date Bar & Bulk Action Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-700">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Mark Attendance For Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectedDateChange(e.target.value)}
              className="text-base font-bold text-slate-900 border-0 p-0 focus:ring-0 cursor-pointer bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectedDateChange(getTodayDateString())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const date = new Date(`${selectedDate}T12:00:00`);
              date.setDate(date.getDate() - 1);
              onSelectedDateChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
            }}
          >
            Yesterday
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllPresent}
            isLoading={isMarking}
          >
            Mark All Present
          </Button>
        </div>
      </div>

      {saveError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Attendance could not be saved: {saveError}</p>}

      {/* Daily Summary Statistics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 block">Present</span>
            <span className="text-xl font-bold text-emerald-800">{dailySummary.present}</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 block">Half Day</span>
            <span className="text-xl font-bold text-amber-800">{dailySummary.halfDay}</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-600 block">Absent</span>
            <span className="text-xl font-bold text-rose-800">{dailySummary.absent}</span>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 block">On Leave</span>
            <span className="text-xl font-bold text-blue-800">{dailySummary.leave}</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Coffee className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-purple-600 block">Weekly Off</span>
            <span className="text-xl font-bold text-purple-800">{dailySummary.off}</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Coffee className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Pending</span>
            <span className="text-xl font-bold text-slate-700">{dailySummary.pending}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search driver name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by vehicle category"
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="all">All Categories</option>
          <option value="Driver">Driver</option>
          <option value="Taxi">Taxi</option>
          <option value="Tempo">Tempo</option>
          <option value="TRP">TRP</option>
          <option value="Delivery">Delivery</option>
        </select>
      </div>

      {/* Employee List with One-Tap Attendance Buttons */}
      <div className="space-y-3">
        {filteredEmployees.map((emp) => {
          const currentRec = dateAttendanceMap.get(emp.id);
          const currentStatus = currentRec?.status;

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-purple-200"
            >
              {/* Driver info */}
              <div className="flex items-center gap-3.5">
                {emp.profile_photo_url ? (
                  <img
                    src={emp.profile_photo_url}
                    alt={emp.full_name}
                    className="w-12 h-12 rounded-xl object-cover border border-purple-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-base">
                    {emp.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{emp.full_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <Badge variant="purple" size="sm">
                      {emp.category}
                    </Badge>
                    <span>{emp.mobile_number}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge + Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {currentStatus && (
                  <div className="mr-2">
                    <Badge status={currentStatus} size="sm" />
                  </div>
                )}

                <div className="grid grid-cols-5 gap-1.5 w-full sm:w-auto">
                  {STATUS_BUTTONS.map((btn) => {
                    const isSelected = currentStatus === btn.status;
                    const Icon = btn.icon;

                    return (
                      <button
                        key={btn.status}
                        type="button"
                        disabled={isMarking}
                        aria-pressed={isSelected}
                        onClick={() => handleTapStatus(emp.id, btn.status)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                          isSelected ? btn.activeClass : btn.colorClass
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">{btn.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
            No employees found matching filter.
          </div>
        )}
      </div>
    </div>
  );
};
