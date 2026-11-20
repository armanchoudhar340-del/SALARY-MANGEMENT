import React, { useMemo } from 'react';
import { Employee, MonthlySalaryRecord, SalaryTransaction, SalarySettings, AttendanceRecord } from '../../types';
import {
  exportEmployeesToExcel,
  exportSalaryReportToExcel,
  exportTransactionsToExcel,
  exportSalaryReportToPDF,
} from '../../lib/export';
import { formatMonthName } from '../../lib/utils';
import { Button } from '../common/Button';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Users,
  CreditCard,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

interface ReportGeneratorProps {
  employees: Employee[];
  monthlyRecords: MonthlySalaryRecord[];
  transactions: SalaryTransaction[];
  attendance: AttendanceRecord[];
  settings: SalarySettings;
  selectedMonth: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  employees,
  monthlyRecords,
  transactions,
  attendance,
  settings,
  selectedMonth,
}) => {
  const employeesMap = useMemo(() => {
    return new Map(employees.map((e) => [e.id, e]));
  }, [employees]);

  // 1. Employee Report Excel
  const handleExportEmployees = () => {
    exportEmployeesToExcel(employees, `Driver_Fleet_Roster_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 2. Monthly Salary Excel
  const handleExportSalaryExcel = () => {
    exportSalaryReportToExcel(monthlyRecords, employeesMap, selectedMonth);
  };

  // 3. Monthly Salary PDF
  const handleExportSalaryPDF = () => {
    exportSalaryReportToPDF(monthlyRecords, employeesMap, selectedMonth, settings);
  };

  // 4. Payments & Advances Excel
  const handleExportPaymentsExcel = () => {
    exportTransactionsToExcel(transactions, employeesMap, selectedMonth);
  };

  // 5. Advances Only Excel
  const handleExportAdvancesOnly = () => {
    const advancesOnly = transactions.filter((t) => t.transaction_type === 'advance');
    exportTransactionsToExcel(advancesOnly, employeesMap, `${selectedMonth}_Advances`);
  };

  // 6. Outstanding / Remaining Salary Excel
  const handleExportRemainingOnly = () => {
    const remainingOnly = monthlyRecords.filter((r) => r.remaining_balance > 0);
    exportSalaryReportToExcel(remainingOnly, employeesMap, `${selectedMonth}_PendingBalance`);
  };

  const reportsList = [
    {
      title: 'Full Monthly Salary Statement (PDF)',
      description: 'Formal company letterhead statement with earnings, advances, disbursed amounts, and signatures.',
      badge: 'PDF Print',
      icon: FileText,
      color: 'from-purple-600 to-indigo-600',
      action: handleExportSalaryPDF,
    },
    {
      title: 'Monthly Salary Sheet (Excel)',
      description: 'Tabular calculation sheet with calendar days, paid days, earned salary, deductions, and balance.',
      badge: 'XLSX Spreadsheet',
      icon: FileSpreadsheet,
      color: 'from-emerald-600 to-teal-600',
      action: handleExportSalaryExcel,
    },
    {
      title: 'Money Taken / Advances Ledger (Excel)',
      description: 'All driver advances, payment dates, payment modes (UPI/Cash), and operational reasons.',
      badge: 'XLSX Spreadsheet',
      icon: CreditCard,
      color: 'from-amber-600 to-orange-600',
      action: handleExportAdvancesOnly,
    },
    {
      title: 'Remaining Salary Due Report (Excel)',
      description: 'List of drivers with unpaid or pending balances for prompt payroll settlement.',
      badge: 'XLSX Spreadsheet',
      icon: Users,
      color: 'from-rose-600 to-red-600',
      action: handleExportRemainingOnly,
    },
    {
      title: 'Driver Master Roster (Excel)',
      description: 'Complete permanent profiles, contact numbers, joining dates, vehicle categories, and rates.',
      badge: 'XLSX Spreadsheet',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      action: handleExportEmployees,
    },
    {
      title: 'All Payment Transactions (Excel)',
      description: 'Comprehensive auditable transaction register across all payment categories for the period.',
      badge: 'XLSX Spreadsheet',
      icon: Download,
      color: 'from-indigo-600 to-purple-700',
      action: handleExportPaymentsExcel,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-purple-200 tracking-wider">
            Reports & Statements
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            Export Center - {formatMonthName(selectedMonth)}
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Download verified accounting spreadsheets and print-ready PDF payslips.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${rep.color} text-white shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 py-1 px-2.5 rounded-full">
                    {rep.badge}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{rep.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5 text-purple-600" />}
                  onClick={rep.action}
                >
                  Generate & Download
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
