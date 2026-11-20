import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useEmployees } from '../hooks/useEmployees';
import { useSettings } from '../context/SettingsContext';
import { PaymentHistoryTable } from '../components/payments/PaymentHistoryTable';
import { AddPaymentModal } from '../components/payments/AddPaymentModal';
import { Button } from '../components/common/Button';
import { SalaryTransaction } from '../types';
import { formatINR, formatMonthName } from '../lib/utils';
import { exportTransactionsToExcel } from '../lib/export';
import { PlusCircle, Download, ArrowDownRight, CheckCircle2, Wallet } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { selectedMonth } = useSettings();
  const { employees } = useEmployees();
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(selectedMonth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<SalaryTransaction | null>(null);

  // Compute summary numbers for this month
  const totalAdvances = transactions
    .filter((t) => t.transaction_type === 'advance')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSalaryDisbursed = transactions
    .filter((t) => t.transaction_type === 'salary_payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBonuses = transactions
    .filter((t) => t.transaction_type === 'bonus')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const handleEdit = (tx: SalaryTransaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleExportExcel = () => {
    const empMap = new Map(employees.map((e) => [e.id, e]));
    exportTransactionsToExcel(transactions, empMap, selectedMonth);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Money Taken & Salary Payments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit register for advances, mid-month cash, bank transfers, bonuses, and fines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-purple-600" />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
          >
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Total Advances Taken
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatINR(totalAdvances)}
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Deducted automatically from salary
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Salary Disbursed
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatINR(totalSalaryDisbursed)}
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Direct salary disbursements
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Total Cash Flow
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatINR(totalAdvances + totalSalaryDisbursed + totalBonuses)}
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Total payments processed in {formatMonthName(selectedMonth)}
            </span>
          </div>
          <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Transactions History Table */}
      <PaymentHistoryTable
        transactions={transactions}
        employees={employees}
        onEdit={handleEdit}
        onDelete={deleteTransaction}
      />

      {/* Add / Edit Transaction Modal */}
      <AddPaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={async (data) => {
          if (editingTransaction) {
            await updateTransaction({ id: editingTransaction.id, updates: data });
          } else {
            await addTransaction(data);
          }
        }}
        employees={employees}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
