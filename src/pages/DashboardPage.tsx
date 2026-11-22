import React, { useState, useMemo } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useAttendance } from '../hooks/useAttendance';
import { useTransactions } from '../hooks/useTransactions';
import { useSalaryRecords } from '../hooks/useSalaryRecords';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useSettings } from '../context/SettingsContext';
import { QuickStats } from '../components/dashboard/QuickStats';
import { SalaryChart } from '../components/dashboard/SalaryChart';
import { AttendanceChart } from '../components/dashboard/AttendanceChart';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { EmployeeProfileModal } from '../components/employees/EmployeeProfileModal';
import { AddPaymentModal } from '../components/payments/AddPaymentModal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { Employee, SalaryTransaction } from '../types';
import { formatMonthName } from '../lib/utils';
import { calculateSalaryBalanceToDate } from '../lib/calculation';
import {
  UserPlus,
  PlusCircle,
  Search,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { settings, selectedMonth } = useSettings();
  const { employees, isLoading: loadingEmployees, addEmployee, updateEmployee } = useEmployees();
  const { attendance } = useAttendance(selectedMonth);
  const { transactions, addTransaction } = useTransactions(selectedMonth);
  const { records: salaryRecords, isLoading: loadingSalary } = useSalaryRecords(selectedMonth);
  const { data: stats, isLoading: loadingStats } = useDashboardStats(selectedMonth);

  // Search, filter & sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'remaining'>('name');

  // Modal states
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedEmployeeForPayment, setSelectedEmployeeForPayment] = useState<string | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeProfileToView, setEmployeeProfileToView] = useState<Employee | null>(null);

  // Map of employeeId -> monthly record
  const salaryRecordMap = useMemo(() => {
    const map = new Map();
    salaryRecords.forEach((r) => map.set(r.employee_id, r));
    return map;
  }, [salaryRecords]);

  // Filtered and sorted employees
  const displayedEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.mobile_number.includes(searchTerm);
        const matchesCategory =
          categoryFilter === 'all' || emp.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.full_name.localeCompare(b.full_name);
        } else if (sortBy === 'salary') {
          return b.monthly_salary - a.monthly_salary;
        } else if (sortBy === 'remaining') {
          const recordA = salaryRecordMap.get(a.id);
          const recordB = salaryRecordMap.get(b.id);
          const remA = recordA ? calculateSalaryBalanceToDate(a, recordA) : 0;
          const remB = recordB ? calculateSalaryBalanceToDate(b, recordB) : 0;
          return remB - remA;
        }
        return 0;
      });
  }, [employees, searchTerm, categoryFilter, sortBy, salaryRecordMap]);

  // Handlers for employee card buttons
  const handleViewDetails = (emp: Employee) => {
    setEmployeeProfileToView(emp);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsAddEmployeeOpen(true);
  };

  const handleAddPaymentForEmployee = (emp: Employee) => {
    setSelectedEmployeeForPayment(emp.id);
    setIsAddPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-100 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Operational Fleet Overview
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
            Dashboard for {formatMonthName(selectedMonth)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live salary calculations, today's attendance summary, and driver ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial justify-center"
            leftIcon={<PlusCircle className="w-4 h-4 text-indigo-600" />}
            onClick={() => {
              setSelectedEmployeeForPayment(null);
              setIsAddPaymentOpen(true);
            }}
          >
            Add Money Taken
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-initial justify-center"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setEmployeeToEdit(null);
              setIsAddEmployeeOpen(true);
            }}
          >
            Add Employee
          </Button>
        </div>
      </div>

      {/* 9 Main Dashboard Statistics */}
      {loadingStats || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <QuickStats stats={stats} />
      )}

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SalaryChart records={salaryRecords} employees={employees} />
        </div>
        <div>
          {stats && <AttendanceChart stats={stats} />}
        </div>
      </div>

      {/* Employee Cards Section Header & Filters */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Driver Salary Cards ({displayedEmployees.length})
            </h3>
            <p className="text-xs text-slate-500">
              Individual salary cards with live balance for each driver.
            </p>
          </div>

          {/* Search, Category, and Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
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
              {settings.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort employees by"
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="salary">Sort: Salary (High to Low)</option>
              <option value="remaining">Sort: Balance Due</option>
            </select>
          </div>
        </div>

        {/* Grid of Employee Cards */}
        {loadingEmployees ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                salaryRecord={salaryRecordMap.get(emp.id)}
                onViewDetails={handleViewDetails}
                onAddPayment={handleAddPaymentForEmployee}
                onEdit={handleEditEmployee}
              />
            ))}
          </div>
        )}

        {displayedEmployees.length === 0 && !loadingEmployees && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            No drivers found matching your search or filters.
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => {
          setIsAddEmployeeOpen(false);
          setEmployeeToEdit(null);
        }}
        onSubmit={async (data) => {
          if (employeeToEdit) {
            await updateEmployee({ id: employeeToEdit.id, updates: data });
          } else {
            await addEmployee(data);
          }
        }}
        employeeToEdit={employeeToEdit}
      />

      {/* Add Money Taken / Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => {
          setIsAddPaymentOpen(false);
          setSelectedEmployeeForPayment(null);
        }}
        onSubmit={async (data) => {
          await addTransaction(data);
        }}
        employees={employees}
        defaultEmployeeId={selectedEmployeeForPayment}
      />

      {/* Full Profile Details Modal */}
      <EmployeeProfileModal
        isOpen={Boolean(employeeProfileToView)}
        onClose={() => setEmployeeProfileToView(null)}
        employee={employeeProfileToView}
        monthlyRecords={salaryRecords}
        transactions={transactions}
        attendance={attendance}
      />
    </div>
  );
};
