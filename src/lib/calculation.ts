import { AttendanceRecord, Employee, SalarySettings, SalaryTransaction } from '../types';

/**
 * Returns number of calendar days in a given year and month (1-indexed month 1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Parses 'YYYY-MM' into year and 1-indexed month
 */
export function parseSalaryMonth(monthStr: string): { year: number; month: number } {
  const [yearStr, monthPart] = monthStr.split('-');
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthPart, 10),
  };
}

/**
 * Calculates how many days in the given month the employee was eligible to work,
 * respecting joining date and optional leaving date.
 */
export function calculateEligibleDaysInMonth(
  employee: Pick<Employee, 'joining_date' | 'leaving_date'>,
  year: number,
  month: number
): number {
  const totalDays = getDaysInMonth(year, month);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, totalDays);

  const joining = new Date(employee.joining_date);
  // Set to midnight for accurate day comparison
  joining.setHours(0, 0, 0, 0);

  if (joining > monthEnd) {
    return 0; // Joined after this month ended
  }

  const leaving = employee.leaving_date ? new Date(employee.leaving_date) : null;
  if (leaving) {
    leaving.setHours(23, 59, 59, 999);
    if (leaving < monthStart) {
      return 0; // Left before this month started
    }
  }

  let eligible = 0;
  for (let day = 1; day <= totalDays; day++) {
    const current = new Date(year, month - 1, day, 12, 0, 0);
    const isAfterOrOnJoining = current >= joining;
    const isBeforeOrOnLeaving = !leaving || current <= leaving;

    if (isAfterOrOnJoining && isBeforeOrOnLeaving) {
      eligible++;
    }
  }

  return eligible;
}

/**
 * Calculates human-readable employment duration (e.g., "1 yr 4 mos", "3 mos 12 days", "24 days")
 */
export function calculateEmploymentDuration(
  joiningDateStr: string,
  leavingDateStr?: string | null,
  referenceDate = new Date()
): string {
  const start = new Date(joiningDateStr);
  const end = leavingDateStr ? new Date(leavingDateStr) : referenceDate;

  if (isNaN(start.getTime())) return 'N/A';
  if (start > end) return 'Joining in future';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  return parts.join(', ');
}

/** Counts complete service-month anniversaries through the selected salary month. */
export function calculateCompletedServiceMonths(
  joiningDateStr: string,
  referenceMonth: string,
  leavingDateStr?: string | null
): number {
  const joining = new Date(`${joiningDateStr}T12:00:00`);
  const [year, month] = referenceMonth.split('-').map(Number);
  if (Number.isNaN(joining.getTime()) || !year || !month) return 0;

  const selectedMonthEnd = new Date(year, month, 0, 12, 0, 0);
  const today = new Date();
  const reference = selectedMonthEnd > today ? today : selectedMonthEnd;
  if (leavingDateStr) {
    const leaving = new Date(`${leavingDateStr}T12:00:00`);
    if (!Number.isNaN(leaving.getTime()) && leaving < reference) {
      reference.setTime(leaving.getTime());
    }
  }
  if (reference < joining) return 0;

  let months = (reference.getFullYear() - joining.getFullYear()) * 12;
  months += reference.getMonth() - joining.getMonth();
  if (reference.getDate() < joining.getDate()) months -= 1;
  return Math.max(0, months);
}

export interface CalculatedMonthlySalary {
  calendarDays: number;
  eligibleDays: number;
  baseSalary: number;
  calculatedDailyRate: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  weeklyOffDays: number;
  paidDaysEquivalent: number;
  earnedSalary: number;
  totalAdvances: number;
  totalSalaryPaid: number;
  totalBonus: number;
  totalDeductions: number;
  previousUnpaidBalance: number;
  remainingBalance: number;
}

/**
 * Round a currency number strictly to 2 decimal places avoiding IEEE-754 precision issues
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Computes all salary figures for a specific employee and salary month
 */
export function computeEmployeeSalary({
  employee,
  monthStr, // YYYY-MM
  attendanceList,
  transactionsList,
  settings,
  previousUnpaidBalance = 0,
}: {
  employee: Employee;
  monthStr: string;
  attendanceList: AttendanceRecord[];
  transactionsList: SalaryTransaction[];
  settings: Pick<SalarySettings, 'weekly_off_days' | 'is_weekly_off_paid' | 'calculation_rule'>;
  previousUnpaidBalance?: number;
}): CalculatedMonthlySalary {
  const { year, month } = parseSalaryMonth(monthStr);
  const calendarDays = getDaysInMonth(year, month);
  const eligibleDays = calculateEligibleDaysInMonth(employee, year, month);

  // Daily rate calculation
  let calculatedDailyRate = 0;
  const baseSalary = employee.salary_type === 'monthly' ? employee.monthly_salary : employee.daily_salary;

  if (employee.salary_type === 'monthly') {
    const divisor = settings.calculation_rule === 'fixed_30' ? 30 : calendarDays;
    calculatedDailyRate = divisor > 0 ? roundCurrency(employee.monthly_salary / divisor) : 0;
  } else {
    calculatedDailyRate = roundCurrency(employee.daily_salary);
  }

  // Filter attendance for this month
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthAttendance = attendanceList.filter(
    (att) => att.employee_id === employee.id && att.date.startsWith(monthPrefix)
  );

  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let weeklyOffDays = 0;

  monthAttendance.forEach((att) => {
    switch (att.status) {
      case 'present':
        presentDays += 1;
        break;
      case 'absent':
        absentDays += 1;
        break;
      case 'half_day':
        halfDays += 1;
        break;
      case 'paid_leave':
        paidLeaveDays += 1;
        break;
      case 'unpaid_leave':
        unpaidLeaveDays += 1;
        break;
      case 'weekly_off':
        weeklyOffDays += 1;
        break;
      default:
        break;
    }
  });

  // Calculate Paid Day Equivalents:
  // Present Days + (Half Days × 0.5) + Paid Leave Days + (is_weekly_off_paid ? Weekly Off Days : 0)
  const paidWeeklyOffPortion = settings.is_weekly_off_paid ? weeklyOffDays : 0;
  const paidDaysEquivalent = roundCurrency(
    presentDays + halfDays * 0.5 + paidLeaveDays + paidWeeklyOffPortion
  );

  // Earned Salary
  // If monthly employee and attended full eligible month with no unpaid absences:
  // Daily Salary × Paid Day Equivalents
  const earnedSalary = roundCurrency(calculatedDailyRate * paidDaysEquivalent);

  // Filter transactions for this employee and month
  const empTransactions = transactionsList.filter(
    (tx) => tx.employee_id === employee.id && tx.salary_month === monthStr
  );

  let totalAdvances = 0;
  let totalSalaryPaid = 0;
  let totalBonus = 0;
  let totalDeductions = 0;

  empTransactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.transaction_type === 'advance') {
      totalAdvances += amt;
    } else if (tx.transaction_type === 'salary_payment') {
      totalSalaryPaid += amt;
    } else if (tx.transaction_type === 'bonus') {
      totalBonus += amt;
    } else if (tx.transaction_type === 'deduction') {
      totalDeductions += amt;
    }
  });

  totalAdvances = roundCurrency(totalAdvances);
  totalSalaryPaid = roundCurrency(totalSalaryPaid);
  totalBonus = roundCurrency(totalBonus);
  totalDeductions = roundCurrency(totalDeductions);
  const roundedPrevBalance = roundCurrency(previousUnpaidBalance);

  // Remaining Salary:
  // Earned Salary + Bonus − Deductions − Advances − Salary Payments + Applicable Previous Unpaid Balance
  const remainingBalance = roundCurrency(
    earnedSalary + totalBonus - totalDeductions - totalAdvances - totalSalaryPaid + roundedPrevBalance
  );

  return {
    calendarDays,
    eligibleDays,
    baseSalary,
    calculatedDailyRate,
    presentDays,
    absentDays,
    halfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    weeklyOffDays,
    paidDaysEquivalent,
    earnedSalary,
    totalAdvances,
    totalSalaryPaid,
    totalBonus,
    totalDeductions,
    previousUnpaidBalance: roundedPrevBalance,
    remainingBalance,
  };
}
