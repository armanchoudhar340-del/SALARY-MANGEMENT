import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Employee, MonthlySalaryRecord, SalaryTransaction, AttendanceRecord } from '../../types';
import { formatINR, formatDate, formatMonthName } from '../../lib/utils';
import { calculateEmploymentDuration, calculateSalaryBalanceToDate } from '../../lib/calculation';
import { exportEmployeeSalarySlipPDF } from '../../lib/export';
import { useSettings } from '../../context/SettingsContext';
import {
  Calendar,
  Clock,
  Phone,
  MapPin,
  FileText,
  Printer,
  History,
  CheckCircle,
  CreditCard,
  User,
} from 'lucide-react';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  monthlyRecords: MonthlySalaryRecord[];
  transactions: SalaryTransaction[];
  attendance: AttendanceRecord[];
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  monthlyRecords,
  transactions,
  attendance,
}) => {
  const { settings, selectedMonth } = useSettings();
  const [activeTab, setActiveTab] = useState<'overview' | 'salary' | 'attendance' | 'payments'>(
    'overview'
  );

  if (!employee) return null;

  const duration = calculateEmploymentDuration(
    employee.joining_date,
    employee.leaving_date
  );

  const empTransactions = transactions.filter((t) => t.employee_id === employee.id);
  const empMonthlyRecords = monthlyRecords.filter((r) => r.employee_id === employee.id);
  const empAttendance = attendance.filter((a) => a.employee_id === employee.id);

  const currentRecord = empMonthlyRecords.find((r) => r.salary_month === selectedMonth);
  const currentBalance = currentRecord ? calculateSalaryBalanceToDate(employee, currentRecord) : 0;

  const handleDownloadSlip = () => {
    if (currentRecord) {
      exportEmployeeSalarySlipPDF(employee, currentRecord, empTransactions, settings);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Driver Profile & Financial Ledger"
      description={`Permanent Records for ${employee.full_name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Driver Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50/50 rounded-2xl border border-purple-100">
          <div className="flex items-center gap-4">
            {employee.profile_photo_url ? (
              <img
                src={employee.profile_photo_url}
                alt={employee.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-2xl">
                {employee.full_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{employee.full_name}</h3>
                <Badge variant={employee.is_active ? 'success' : 'default'} size="sm">
                  {employee.is_active ? 'Active' : 'Archived'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                <Badge variant="purple" size="sm">
                  {employee.category}
                </Badge>
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.mobile_number}
                </span>
              </div>
            </div>
          </div>

          {currentRecord && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5 text-purple-600" />}
              onClick={handleDownloadSlip}
            >
              Export Slip
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'salary'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Monthly Salary Records ({empMonthlyRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payments & Advances ({empTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'attendance'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Attendance Logs ({empAttendance.length})
          </button>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Employment Details
                </span>
                <div className="text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joined Date:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(employee.joining_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Working Duration:</span>
                    <span className="font-semibold text-purple-700">{duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salary Type:</span>
                    <span className="font-semibold text-slate-800 uppercase">
                      {employee.salary_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Salary:</span>
                    <span className="font-bold text-slate-900">
                      {employee.salary_type === 'monthly'
                        ? `${formatINR(employee.monthly_salary)} / month`
                        : `${formatINR(employee.daily_salary)} / day`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact & Notes
                </span>
                <div className="text-sm space-y-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{employee.address || 'Address not set'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700 italic">
                      {employee.notes || 'No extra notes recorded.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Month Snapshot Card */}
            {currentRecord && (
              <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-purple-950">
                    Active Month Status ({formatMonthName(selectedMonth)})
                  </h4>
                  <Badge variant={currentBalance < 0 ? 'danger' : currentBalance > 0 ? 'warning' : 'success'}>
                    {currentBalance < 0 ? 'OVERPAID' : currentBalance > 0 ? 'DUE' : 'SETTLED'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                    <span className="text-xs text-slate-500 block">Salary Earned</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatINR(currentRecord.earned_salary)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                    <span className="text-xs text-slate-500 block">Money Taken</span>
                    <span className="text-sm font-bold text-amber-600">
                      -{formatINR(currentRecord.total_advances)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                    <span className="text-xs text-slate-500 block">Salary Paid</span>
                    <span className="text-sm font-bold text-indigo-600">
                      -{formatINR(currentRecord.total_salary_paid)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                    <span className="text-xs text-slate-500 block">Total Salary Left</span>
                    <span className="text-sm font-bold text-purple-700">
                      <span className={currentBalance < 0 ? 'text-rose-600' : currentBalance > 0 ? 'text-emerald-600' : 'text-slate-600'}>{formatINR(currentBalance)}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Monthly Salary History */}
        {activeTab === 'salary' && (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Paid Days</th>
                  <th className="py-2.5 px-3">Earned (₹)</th>
                  <th className="py-2.5 px-3">Advances (₹)</th>
                  <th className="py-2.5 px-3">Disbursed (₹)</th>
                  <th className="py-2.5 px-3">Balance (₹)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empMonthlyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      No monthly records generated yet.
                    </td>
                  </tr>
                ) : (
                  empMonthlyRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {formatMonthName(rec.salary_month)}
                      </td>
                      <td className="py-2 px-3">{rec.paid_days_equivalent}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {formatINR(rec.earned_salary)}
                      </td>
                      <td className="py-2 px-3 text-amber-600">
                        {formatINR(rec.total_advances)}
                      </td>
                      <td className="py-2 px-3 text-indigo-600">
                        {formatINR(rec.total_salary_paid)}
                      </td>
                      <td className="py-2 px-3 font-bold text-purple-700">
                        {formatINR(rec.remaining_balance)}
                      </td>
                      <td className="py-2 px-3">
                        <Badge size="sm" variant={rec.remaining_balance <= 0 ? 'success' : 'warning'}>
                          {rec.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Payments & Advances */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount (₹)</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">For Month</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No payments or advances recorded yet.
                    </td>
                  </tr>
                ) : (
                  empTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3">{formatDate(tx.date)}</td>
                      <td className="py-2 px-3">
                        <Badge
                          size="sm"
                          variant={tx.transaction_type === 'advance' ? 'warning' : 'primary'}
                        >
                          {tx.transaction_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {formatINR(tx.amount)}
                      </td>
                      <td className="py-2 px-3 uppercase text-slate-600">{tx.payment_method}</td>
                      <td className="py-2 px-3 text-slate-500">{tx.salary_month}</td>
                      <td className="py-2 px-3 text-slate-600">{tx.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Attendance */}
        {activeTab === 'attendance' && (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No attendance logged.
                    </td>
                  </tr>
                ) : (
                  empAttendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {formatDate(att.date)}
                      </td>
                      <td className="py-2 px-3">
                        <Badge status={att.status} size="sm" />
                      </td>
                      <td className="py-2 px-3 text-slate-500">{att.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
