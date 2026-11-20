import { describe, it, expect } from 'vitest';
import {
  getDaysInMonth,
  calculateEligibleDaysInMonth,
  calculateEmploymentDuration,
  computeEmployeeSalary,
  roundCurrency,
} from '../lib/calculation';
import { Employee, AttendanceRecord, SalaryTransaction, SalarySettings } from '../types';

describe('Salary Calculation Engine & Financial Accuracy', () => {
  const dummySettings: SalarySettings = {
    id: 's1',
    company_name: 'Test Fleet',
    currency_symbol: '₹',
    currency_code: 'INR',
    date_format: 'DD/MM/YYYY',
    weekly_off_days: [0], // Sunday
    is_weekly_off_paid: true,
    categories: ['Driver', 'Taxi', 'Tempo'],
    calculation_rule: 'calendar_days',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sampleEmployee: Employee = {
    id: 'emp-001',
    full_name: 'Rajesh Kumar',
    mobile_number: '+91 98112 34567',
    category: 'Driver',
    joining_date: '2023-01-15',
    leaving_date: null,
    salary_type: 'monthly',
    monthly_salary: 24000,
    daily_salary: 800,
    is_active: true,
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z',
  };

  it('1. Correctly calculates number of calendar days in different months (28, 29, 30, 31)', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28); // Non-leap Feb
    expect(getDaysInMonth(2024, 2)).toBe(29); // Leap Feb
    expect(getDaysInMonth(2026, 4)).toBe(30); // April (30)
    expect(getDaysInMonth(2026, 11)).toBe(30); // November (30)
    expect(getDaysInMonth(2026, 10)).toBe(31); // October (31)
    expect(getDaysInMonth(2026, 12)).toBe(31); // December (31)
  });

  it('2. Calculates eligible days respecting joining date and leaving date', () => {
    // Joined on 2026-11-16 in a 30-day month -> exactly 15 eligible days (16 to 30)
    const midMonthJoiner: Pick<Employee, 'joining_date' | 'leaving_date'> = {
      joining_date: '2026-11-16',
      leaving_date: null,
    };
    expect(calculateEligibleDaysInMonth(midMonthJoiner, 2026, 11)).toBe(15);

    // Left on 2026-11-10 -> 10 eligible days (1 to 10)
    const earlyLeaver: Pick<Employee, 'joining_date' | 'leaving_date'> = {
      joining_date: '2024-01-01',
      leaving_date: '2026-11-10',
    };
    expect(calculateEligibleDaysInMonth(earlyLeaver, 2026, 11)).toBe(10);
  });

  it('3. Computes human-readable exact employment duration', () => {
    const fixedNow = new Date('2026-11-20T00:00:00Z');
    const duration = calculateEmploymentDuration('2025-01-01', null, fixedNow);
    expect(duration).toContain('1 year');
    expect(duration).toContain('month');
  });

  it('4. Handles Daily Rate = Monthly Salary / Calendar Days', () => {
    // Month with 30 days: 24,000 / 30 = 800.00
    const calcNov = computeEmployeeSalary({
      employee: sampleEmployee,
      monthStr: '2026-11',
      attendanceList: [],
      transactionsList: [],
      settings: dummySettings,
    });
    expect(calcNov.calendarDays).toBe(30);
    expect(calcNov.calculatedDailyRate).toBe(800.0);

    // Month with 31 days (October 2026): 24,000 / 31 = 774.19
    const calcOct = computeEmployeeSalary({
      employee: sampleEmployee,
      monthStr: '2026-10',
      attendanceList: [],
      transactionsList: [],
      settings: dummySettings,
    });
    expect(calcOct.calendarDays).toBe(31);
    expect(calcOct.calculatedDailyRate).toBe(774.19);
  });

  it('5. Correctly calculates Paid Day Equivalents with half days and paid weekly off', () => {
    // 20 Present days, 2 Half days (= 1 day), 1 Paid Leave, 4 Weekly Offs
    // Paid Day Equivalents = 20 + (2 * 0.5) + 1 + 4 = 26.0
    const attendance: AttendanceRecord[] = [
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `att-p-${i}`,
        employee_id: sampleEmployee.id,
        date: `2026-11-${String(i + 1).padStart(2, '0')}`,
        status: 'present' as const,
        created_at: '',
        updated_at: '',
      })),
      {
        id: 'att-h-1',
        employee_id: sampleEmployee.id,
        date: '2026-11-21',
        status: 'half_day',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'att-h-2',
        employee_id: sampleEmployee.id,
        date: '2026-11-22',
        status: 'half_day',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'att-l-1',
        employee_id: sampleEmployee.id,
        date: '2026-11-23',
        status: 'paid_leave',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'att-w-1',
        employee_id: sampleEmployee.id,
        date: '2026-11-24',
        status: 'weekly_off',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'att-w-2',
        employee_id: sampleEmployee.id,
        date: '2026-11-25',
        status: 'weekly_off',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'att-w-3',
        employee_id: sampleEmployee.id,
        date: '2026-11-26',
        status: 'weekly_off',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'att-w-4',
        employee_id: sampleEmployee.id,
        date: '2026-11-27',
        status: 'weekly_off',
        created_at: '',
        updated_at: '',
      },
    ];

    const calc = computeEmployeeSalary({
      employee: sampleEmployee,
      monthStr: '2026-11',
      attendanceList: attendance,
      transactionsList: [],
      settings: dummySettings,
    });

    expect(calc.presentDays).toBe(20);
    expect(calc.halfDays).toBe(2);
    expect(calc.paidLeaveDays).toBe(1);
    expect(calc.weeklyOffDays).toBe(4);
    expect(calc.paidDaysEquivalent).toBe(26);
    // 26 days * 800/day = 20,800
    expect(calc.earnedSalary).toBe(20800);
  });

  it('6. Requirement 17: Four payments of ₹500, ₹1,000, ₹500, and ₹500 totaling ₹2,500 without double deduction', () => {
    // Setup full 30 days present = 30 * 800 = 24,000 earned
    const fullAttendance: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => ({
      id: `att-${i}`,
      employee_id: sampleEmployee.id,
      date: `2026-11-${String(i + 1).padStart(2, '0')}`,
      status: 'present',
      created_at: '',
      updated_at: '',
    }));

    const fourTransactions: SalaryTransaction[] = [
      {
        id: 'tx-1',
        employee_id: sampleEmployee.id,
        amount: 500,
        date: '2026-11-04',
        transaction_type: 'advance',
        payment_method: 'upi',
        salary_month: '2026-11',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'tx-2',
        employee_id: sampleEmployee.id,
        amount: 1000,
        date: '2026-11-08',
        transaction_type: 'advance',
        payment_method: 'cash',
        salary_month: '2026-11',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'tx-3',
        employee_id: sampleEmployee.id,
        amount: 500,
        date: '2026-11-12',
        transaction_type: 'advance',
        payment_method: 'upi',
        salary_month: '2026-11',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'tx-4',
        employee_id: sampleEmployee.id,
        amount: 500,
        date: '2026-11-16',
        transaction_type: 'salary_payment',
        payment_method: 'cash',
        salary_month: '2026-11',
        created_at: '',
        updated_at: '',
      },
    ];

    const calc = computeEmployeeSalary({
      employee: sampleEmployee,
      monthStr: '2026-11',
      attendanceList: fullAttendance,
      transactionsList: fourTransactions,
      settings: dummySettings,
    });

    // Total advances = 500 + 1000 + 500 = 2000
    expect(calc.totalAdvances).toBe(2000);
    // Total salary payment = 500
    expect(calc.totalSalaryPaid).toBe(500);
    // Total money disbursed/deducted = 2500
    const totalTransactionsAmount = calc.totalAdvances + calc.totalSalaryPaid;
    expect(totalTransactionsAmount).toBe(2500);

    // Remaining Salary:
    // Earned (24,000) - Advances (2,000) - Salary Paid (500) = 21,500
    expect(calc.earnedSalary).toBe(24000);
    expect(calc.remainingBalance).toBe(21500);
  });

  it('7. Properly carries over previous unpaid balance without duplicate multiplication', () => {
    const calcWithCarry = computeEmployeeSalary({
      employee: sampleEmployee,
      monthStr: '2026-11',
      attendanceList: [
        {
          id: 'att-1',
          employee_id: sampleEmployee.id,
          date: '2026-11-01',
          status: 'present',
          created_at: '',
          updated_at: '',
        },
      ],
      transactionsList: [],
      settings: dummySettings,
      previousUnpaidBalance: 3200.5,
    });

    // Earned: 1 day * 800 = 800
    // Previous balance: 3200.50
    // Remaining balance: 800 + 3200.50 = 4000.50
    expect(calcWithCarry.earnedSalary).toBe(800);
    expect(calcWithCarry.previousUnpaidBalance).toBe(3200.5);
    expect(calcWithCarry.remainingBalance).toBe(4000.5);
  });

  it('8. Daily-salaried employee accurately computes daily rate * paid days', () => {
    const dailyEmployee: Employee = {
      ...sampleEmployee,
      id: 'emp-daily',
      salary_type: 'daily',
      monthly_salary: 0,
      daily_salary: 850,
    };

    const attendance: AttendanceRecord[] = [
      { id: '1', employee_id: dailyEmployee.id, date: '2026-11-01', status: 'present', created_at: '', updated_at: '' },
      { id: '2', employee_id: dailyEmployee.id, date: '2026-11-02', status: 'half_day', created_at: '', updated_at: '' },
      { id: '3', employee_id: dailyEmployee.id, date: '2026-11-03', status: 'absent', created_at: '', updated_at: '' },
    ];

    const calc = computeEmployeeSalary({
      employee: dailyEmployee,
      monthStr: '2026-11',
      attendanceList: attendance,
      transactionsList: [],
      settings: dummySettings,
    });

    // Paid days = 1 + (1 * 0.5) = 1.5
    // Earned = 1.5 * 850 = 1275.00
    expect(calc.paidDaysEquivalent).toBe(1.5);
    expect(calc.earnedSalary).toBe(1275);
    expect(calc.remainingBalance).toBe(1275);
  });
});
