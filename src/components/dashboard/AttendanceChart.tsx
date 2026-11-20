import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardStats } from '../../types';

interface AttendanceChartProps {
  stats: DashboardStats;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#94a3b8'];

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ stats }) => {
  const data = [
    { name: 'Present', value: stats.todayPresentCount },
    { name: 'Half Day', value: stats.todayHalfDayCount },
    { name: 'Absent', value: stats.todayAbsentCount },
    { name: 'On Leave', value: stats.todayLeaveCount },
    { name: 'Pending', value: stats.todayPendingCount },
  ].filter((d) => d.value > 0);

  const totalMarked =
    stats.todayPresentCount +
    stats.todayHalfDayCount +
    stats.todayAbsentCount +
    stats.todayLeaveCount;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Today's Attendance Ratio</h3>
          <p className="text-xs text-slate-500">Live operational workforce breakdown</p>
        </div>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length > 0 ? data : [{ name: 'Pending', value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
          <span className="text-2xl font-black text-slate-800">{totalMarked}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Punched</span>
        </div>
      </div>
    </div>
  );
};
