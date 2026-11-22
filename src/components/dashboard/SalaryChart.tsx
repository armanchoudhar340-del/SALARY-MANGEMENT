import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MonthlySalaryRecord, Employee } from '../../types';
import { formatINR } from '../../lib/utils';
import { calculateSalaryBalanceToDate } from '../../lib/calculation';

interface SalaryChartProps {
  records: MonthlySalaryRecord[];
  employees: Employee[];
}

export const SalaryChart: React.FC<SalaryChartProps> = ({ records, employees }) => {
  const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));

  const chartData = records.slice(0, 8).map((rec) => {
    const employee = employees.find((item) => item.id === rec.employee_id);
    return {
      name: (employeeMap.get(rec.employee_id) || 'Emp').split(' ')[0],
      fullName: employeeMap.get(rec.employee_id) || 'Employee',
      Earned: rec.earned_salary,
      Advances: rec.total_advances,
      Paid: rec.total_salary_paid,
      Remaining: Math.max(0, employee ? calculateSalaryBalanceToDate(employee, rec) : rec.remaining_balance),
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft h-80 flex items-center justify-center text-slate-400 text-sm">
        No salary data recorded yet for chart.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Driver Financial Comparison</h3>
          <p className="text-xs text-slate-500">
            Earned vs Advances vs Disbursed vs Balance
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              formatter={(value: any) => [formatINR(Number(value)), '']}
              labelFormatter={(label, items) => {
                const item = items?.[0]?.payload;
                return item ? item.fullName : label;
              }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Earned" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Advances" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Remaining" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
