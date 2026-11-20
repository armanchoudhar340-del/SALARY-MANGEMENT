import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Employee, SalaryTransaction, TransactionType, PaymentMethod } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { getTodayDateString } from '../../lib/utils';
import { DollarSign, Calendar, FileText, User } from 'lucide-react';

const paymentSchema = z.object({
  employee_id: z.string().min(1, 'Please select an employee'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  transaction_type: z.enum(['advance', 'salary_payment', 'bonus', 'deduction']),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  salary_month: z.string().min(7, 'Salary month is required'),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SalaryTransaction, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  employees: Employee[];
  defaultEmployeeId?: string | null;
  transactionToEdit?: SalaryTransaction | null;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  defaultEmployeeId,
  transactionToEdit,
}) => {
  const { selectedMonth } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      employee_id: defaultEmployeeId || (employees[0]?.id ?? ''),
      amount: 1000,
      date: getTodayDateString(),
      transaction_type: 'advance',
      payment_method: 'upi',
      salary_month: selectedMonth,
      description: '',
    },
  });

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        employee_id: transactionToEdit.employee_id,
        amount: transactionToEdit.amount,
        date: transactionToEdit.date,
        transaction_type: transactionToEdit.transaction_type,
        payment_method: transactionToEdit.payment_method,
        salary_month: transactionToEdit.salary_month,
        description: transactionToEdit.description || '',
      });
    } else {
      reset({
        employee_id: defaultEmployeeId || (employees[0]?.id ?? ''),
        amount: 1000,
        date: getTodayDateString(),
        transaction_type: 'advance',
        payment_method: 'upi',
        salary_month: selectedMonth,
        description: '',
      });
    }
  }, [transactionToEdit, defaultEmployeeId, employees, selectedMonth, reset]);

  const handleFormSubmit = async (data: PaymentFormData) => {
    await onSubmit({
      employee_id: data.employee_id,
      amount: Number(data.amount),
      date: data.date,
      transaction_type: data.transaction_type as TransactionType,
      payment_method: data.payment_method as PaymentMethod,
      salary_month: data.salary_month,
      description: data.description || null,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Money Taken / Payment'}
      description="Record advances, salary disbursements, bonuses, or deductions."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Employee Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Select Driver / Employee <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              {...register('employee_id')}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.category})
                </option>
              ))}
            </select>
          </div>
          {errors.employee_id && (
            <p className="mt-1 text-xs text-rose-600">{errors.employee_id.message}</p>
          )}
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            placeholder="e.g. 500"
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Input
            label="Transaction Date"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            required
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        {/* Transaction Type & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Payment Type <span className="text-rose-500">*</span>
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              {...register('transaction_type')}
            >
              <option value="advance">Money Taken (Advance)</option>
              <option value="salary_payment">Salary Payment (Disbursement)</option>
              <option value="bonus">Bonus / Incentive</option>
              <option value="deduction">Deduction / Fine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              {...register('payment_method')}
            >
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="cash">Cash in Hand</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Salary Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Assign To Salary Month (YYYY-MM) <span className="text-rose-500">*</span>
          </label>
          <input
            type="month"
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            {...register('salary_month')}
          />
          {errors.salary_month && (
            <p className="mt-1 text-xs text-rose-600">{errors.salary_month.message}</p>
          )}
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Description / Reason
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Fuel advance, toll advance, mid-month salary..."
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            {...register('description')}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {transactionToEdit ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
