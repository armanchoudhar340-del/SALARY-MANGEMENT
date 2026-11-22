import React, { useState, useMemo } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useSalaryRecords } from '../hooks/useSalaryRecords';
import { useAttendance } from '../hooks/useAttendance';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../context/SettingsContext';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeProfileModal } from '../components/employees/EmployeeProfileModal';
import { AddPaymentModal } from '../components/payments/AddPaymentModal';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Skeleton } from '../components/common/Skeleton';
import { Employee } from '../types';
import { formatINR, formatMonthName } from '../lib/utils';
import { exportSalaryReportToExcel, exportSalaryReportToPDF } from '../lib/export';
import {
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export const MonthlySalaryPage: React.FC = () => {
  const { settings, selectedMonth } = useSettings();
  const { employees, updateEmployee } = useEmployees();
  const { records, isLoading, regenerate, isRegenerating } = useSalaryRecords(selectedMonth);
  const { attendance } = useAttendance(selectedMonth);
  const { transactions, addTransaction } = useTransactions(selectedMonth);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [viewingProfileEmp, setViewingProfileEmp] = useState<Employee | null>(null);
  const [paymentEmpId, setPaymentEmpId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const employeesMap = useMemo(() => {
    return new Map(employees.map((e) => [e.id, e]));
  }, [employees]);

  const recordMap = useMemo(() => {
    const map = new Map();
    records.forEach((r) => map.set(r.employee_id, r));
    return map;
  }, [records]);

  // Totals across all generated records
  const totals = useMemo(() => {
    let totalEarned = 0;
    let totalRemaining = 0;

    records.forEach((r) => {
      totalEarned += r.earned_salary;
      totalRemaining += Math.max(0, r.remaining_balance);
    });

    const totalAdvances = transactions
      .filter((transaction) => transaction.transaction_type === 'advance')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const totalPaid = transactions
      .filter((transaction) => transaction.transaction_type === 'salary_payment')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      totalEarned,
      totalAdvances,
      totalPaid,
      totalRemaining,
    };
  }, [records, transactions]);

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => e.is_active)
      .filter((emp) => {
        const matchesSearch =
          emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.mobile_number.includes(searchTerm);
        const matchesCategory =
          categoryFilter === 'all' || emp.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  }, [employees, searchTerm, categoryFilter]);

  const handleExportPDF = () => {
    exportSalaryReportToPDF(records, employeesMap, selectedMonth, settings);
  };

  const handleExportExcel = () => {
    exportSalaryReportToExcel(records, employeesMap, selectedMonth);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900">
            Monthly Salary Records - {formatMonthName(selectedMonth)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calendar-based salary calculation and balance tracking for each driver.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial justify-center"
            leftIcon={<RotateCcw className="w-4 h-4 text-purple-600" />}
            onClick={() => regenerate()}
            isLoading={isRegenerating}
            title="Recalculate snapshots based on attendance and transactions"
          >
            Re-calculate
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial justify-center"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={handleExportExcel}
          >
            Excel Sheet
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto justify-center"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={handleExportPDF}
          >
            Print PDF Statement
          </Button>
        </div>
      </div>

      {employees.some((employee) => employee.is_active) && attendance.length === 0 && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>No attendance is recorded for {formatMonthName(selectedMonth)}. Earned salary and salary due remain ₹0 until attendance is marked.</p>
        </div>
      )}

      {/* Financial Aggregation Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Salary Earned This Month
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            {formatINR(totals.totalEarned)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Based on days worked & daily rates
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
            Total Money Taken
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-800 mt-1 block">
            {formatINR(totals.totalAdvances)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Given to drivers this month
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Total Salary Paid
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 mt-1 block">
            {formatINR(totals.totalPaid)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Paid out to drivers so far
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
            Total Salary Left to Pay
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-700 mt-1 block">
            {formatINR(totals.totalRemaining)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Still to be paid to all drivers
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search driver name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by vehicle category"
          className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="all">All Categories</option>
          {settings.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Salary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              salaryRecord={recordMap.get(emp.id)}
              onViewDetails={(e) => setViewingProfileEmp(e)}
              onAddPayment={(e) => setPaymentEmpId(e.id)}
              onEdit={(e) => setEditingEmployee(e)}
            />
          ))}
        </div>
      )}

      {/* Profile Modal */}
      <EmployeeProfileModal
        isOpen={Boolean(viewingProfileEmp)}
        onClose={() => setViewingProfileEmp(null)}
        employee={viewingProfileEmp}
        monthlyRecords={records}
        transactions={transactions}
        attendance={attendance}
      />

      {/* Payment Modal */}
      <AddPaymentModal
        isOpen={Boolean(paymentEmpId)}
        onClose={() => setPaymentEmpId(null)}
        onSubmit={async (data) => {
          await addTransaction(data);
          regenerate();
        }}
        employees={employees}
        defaultEmployeeId={paymentEmpId}
      />

      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        onSubmit={async (data) => {
          if (editingEmployee) {
            await updateEmployee({ id: editingEmployee.id, updates: data });
            regenerate();
          }
        }}
        employeeToEdit={editingEmployee}
      />
    </div>
  );
};
