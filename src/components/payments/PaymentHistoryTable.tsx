import React, { useState, useMemo } from 'react';
import { SalaryTransaction, Employee } from '../../types';
import { formatDate, formatINR, formatMonthName } from '../../lib/utils';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Search, Trash2, Edit, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface PaymentHistoryTableProps {
  transactions: SalaryTransaction[];
  employees: Employee[];
  onEdit: (tx: SalaryTransaction) => void;
  onDelete: (id: string) => Promise<any>;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  transactions,
  employees,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Map of employeeId -> Employee
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const emp = employeeMap.get(tx.employee_id);
      const matchesSearch =
        (emp?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || tx.transaction_type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [transactions, employeeMap, searchTerm, selectedType]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search driver or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by transaction type"
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Types</option>
            <option value="advance">Money Taken (Advance)</option>
            <option value="salary_payment">Salary Payment</option>
            <option value="bonus">Bonus</option>
            <option value="deduction">Deduction</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Driver / Employee</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount (₹)</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Salary Month</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No transaction records found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const emp = employeeMap.get(tx.employee_id);
                const isAdvance = tx.transaction_type === 'advance';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {emp?.full_name || 'Unknown'}
                      </div>
                      <div className="text-[10px] text-slate-400">{emp?.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        size="sm"
                        variant={
                          tx.transaction_type === 'advance'
                            ? 'warning'
                            : tx.transaction_type === 'salary_payment'
                            ? 'primary'
                            : tx.transaction_type === 'bonus'
                            ? 'success'
                            : 'danger'
                        }
                      >
                        {tx.transaction_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-bold flex items-center gap-1 ${
                          isAdvance ? 'text-amber-700' : 'text-indigo-700'
                        }`}
                      >
                        {isAdvance ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {formatINR(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-600 font-medium">
                      {tx.payment_method}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatMonthName(tx.salary_month)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {tx.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(tx)}
                          title="Edit transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(tx.id)}
                          title="Delete / Reverse transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal for delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to delete or reverse this transaction? The employee's remaining salary balance will automatically update."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
