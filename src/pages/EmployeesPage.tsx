import React, { useState, useMemo } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useSettings } from '../context/SettingsContext';
import { useSalaryRecords } from '../hooks/useSalaryRecords';
import { useTransactions } from '../hooks/useTransactions';
import { useAttendance } from '../hooks/useAttendance';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { EmployeeProfileModal } from '../components/employees/EmployeeProfileModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { Employee } from '../types';
import { formatINR, formatDate } from '../lib/utils';
import { calculateEmploymentDuration } from '../lib/calculation';
import { exportEmployeesToExcel } from '../lib/export';
import {
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  Clock,
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { employees, isLoading, addEmployee, updateEmployee, toggleEmployeeActive } = useEmployees();
  const { settings, selectedMonth } = useSettings();
  const { records: monthlyRecords } = useSalaryRecords(selectedMonth);
  const { transactions } = useTransactions(selectedMonth);
  const { attendance } = useAttendance(selectedMonth);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.mobile_number.includes(searchTerm) ||
        (emp.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || emp.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? emp.is_active
          : !emp.is_active;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [employees, searchTerm, categoryFilter, statusFilter]);

  const handleToggleActive = async () => {
    if (!deactivatingEmployee) return;
    await toggleEmployeeActive({
      id: deactivatingEmployee.id,
      is_active: !deactivatingEmployee.is_active,
    });
    setDeactivatingEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Driver Master Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent driver records, contract types, vehicle categories, and rate history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-purple-600" />}
            onClick={() => exportEmployeesToExcel(employees)}
          >
            Export Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
          >
            Add New Driver
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter by employee status"
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / Deactivated</option>
          </select>
        </div>
      </div>

      {/* Employees Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Salary Base</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const duration = calculateEmploymentDuration(
                    emp.joining_date,
                    emp.leaving_date
                  );
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {emp.profile_photo_url ? (
                            <img
                              src={emp.profile_photo_url}
                              alt={emp.full_name}
                              className="w-10 h-10 rounded-xl object-cover border border-purple-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                              {emp.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {emp.full_name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {emp.salary_type.toUpperCase()} CONTRACT
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {emp.mobile_number}
                        </span>
                        {emp.address && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {emp.address}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="purple" size="sm">
                          {emp.category}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(emp.joining_date)}
                      </td>

                      <td className="py-3 px-4 text-purple-700 font-semibold truncate max-w-[120px]">
                        {duration}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {emp.salary_type === 'monthly'
                            ? `${formatINR(emp.monthly_salary)}/mo`
                            : `${formatINR(emp.daily_salary)}/day`}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={emp.is_active ? 'success' : 'default'} size="sm">
                          {emp.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            title="View Full History"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setIsModalOpen(true);
                            }}
                            title="Edit Driver Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeactivatingEmployee(emp)}
                            title={emp.is_active ? 'Deactivate Driver' : 'Activate Driver'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              emp.is_active
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {emp.is_active ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No drivers found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={async (data) => {
          if (editingEmployee) {
            await updateEmployee({ id: editingEmployee.id, updates: data });
          } else {
            await addEmployee(data);
          }
        }}
        employeeToEdit={editingEmployee}
      />

      {/* View Full Profile Modal */}
      <EmployeeProfileModal
        isOpen={Boolean(viewingEmployee)}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
        monthlyRecords={monthlyRecords}
        transactions={transactions}
        attendance={attendance}
      />

      {/* Confirm Deactivation / Activation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deactivatingEmployee)}
        onClose={() => setDeactivatingEmployee(null)}
        onConfirm={handleToggleActive}
        title={deactivatingEmployee?.is_active ? 'Deactivate Employee' : 'Activate Employee'}
        message={
          deactivatingEmployee?.is_active
            ? `Are you sure you want to deactivate ${deactivatingEmployee?.full_name}? All previous salary and attendance history will remain permanently intact.`
            : `Re-activate ${deactivatingEmployee?.full_name} for active attendance and salary generation?`
        }
        confirmLabel={deactivatingEmployee?.is_active ? 'Deactivate' : 'Activate'}
        variant={deactivatingEmployee?.is_active ? 'danger' : 'primary'}
      />
    </div>
  );
};
