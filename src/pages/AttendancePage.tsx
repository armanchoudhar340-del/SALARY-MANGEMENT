import React, { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useAttendance } from '../hooks/useAttendance';
import { useSettings } from '../context/SettingsContext';
import { DailyAttendanceSheet } from '../components/attendance/DailyAttendanceSheet';
import { AttendanceCalendar } from '../components/attendance/AttendanceCalendar';
import { formatMonthName, getTodayDateString } from '../lib/utils';
import { exportAttendanceToExcel, exportAttendanceToPDF } from '../lib/export';
import { CalendarCheck, CalendarDays, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AttendancePage: React.FC = () => {
  const { selectedMonth } = useSettings();
  const { employees } = useEmployees();
  const [dailyDate, setDailyDate] = useState(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar'>('daily');
  const monthAttendance = useAttendance(selectedMonth);
  const dailyAttendance = useAttendance(dailyDate.slice(0, 7));
  const attendance = activeTab === 'daily' ? dailyAttendance.attendance : monthAttendance.attendance;
  const error = dailyAttendance.error;

  const handleDownloadExcel = () => {
    exportAttendanceToExcel(employees, attendance, selectedMonth);
  };

  const handleDownloadPDF = () => {
    exportAttendanceToPDF(employees, attendance, selectedMonth);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & View Switcher */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900">
            Attendance Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark daily attendance, view monthly calendar, and download attendance sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Download Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial justify-center"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={handleDownloadExcel}
            title={`Download attendance sheet for ${formatMonthName(selectedMonth)}`}
          >
            Download Sheet
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial justify-center"
            leftIcon={<FileText className="w-4 h-4 text-indigo-600" />}
            onClick={handleDownloadPDF}
            title="Download PDF report"
          >
            PDF Report
          </Button>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'daily'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Daily Marking</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Monthly Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance download info banner */}
      <div className="bg-emerald-50 border border-emerald-200/70 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3 text-xs text-emerald-800">
        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Download Attendance Sheet</strong> — Excel file includes all drivers with daily
          attendance for <strong>{formatMonthName(selectedMonth)}</strong>.{' '}
          Codes: <strong>P</strong> = Present · <strong>A</strong> = Absent ·{' '}
          <strong>H</strong> = Half Day · <strong>PL</strong> = Paid Leave ·{' '}
          <strong>UL</strong> = Unpaid Leave · <strong>WO</strong> = Weekly Off ·{' '}
          <strong>–</strong> = Not Marked
        </span>
      </div>

      {/* Tab Content */}
      {activeTab === 'daily' ? (
        <DailyAttendanceSheet
          employees={employees}
          attendanceRecords={attendance}
          onMarkAttendance={dailyAttendance.markAttendance}
          onBulkMark={dailyAttendance.bulkMarkAttendance}
          isMarking={dailyAttendance.isMarking || dailyAttendance.isBulkMarking}
          selectedDate={dailyDate}
          onSelectedDateChange={setDailyDate}
          saveError={error instanceof Error ? error.message : ''}
        />
      ) : (
        <AttendanceCalendar
          employees={employees}
          attendanceRecords={attendance}
          monthStr={selectedMonth}
        />
      )}
    </div>
  );
};
