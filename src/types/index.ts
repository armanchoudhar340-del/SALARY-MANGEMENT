export type SalaryType = 'monthly' | 'daily';

export type EmployeeCategory = 'Driver' | 'Taxi' | 'Tempo' | 'TRP' | 'Delivery' | 'Helper' | string;

export interface Employee {
  id: string;
  full_name: string;
  profile_photo_url?: string | null;
  mobile_number: string;
  address?: string | null;
  category: EmployeeCategory;
  joining_date: string; // ISO date YYYY-MM-DD
  leaving_date?: string | null; // ISO date YYYY-MM-DD
  salary_type: SalaryType;
  monthly_salary: number;
  daily_salary: number;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'weekly_off';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  overtime_hours?: number;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'advance' | 'salary_payment' | 'bonus' | 'deduction';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque';

export interface SalaryTransaction {
  id: string;
  employee_id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  transaction_type: TransactionType;
  payment_method: PaymentMethod;
  salary_month: string; // YYYY-MM
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlySalaryRecord {
  id: string;
  employee_id: string;
  salary_month: string; // YYYY-MM
  base_salary: number;
  salary_type: SalaryType;
  calendar_days: number;
  eligible_days: number;
  calculated_daily_rate: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  weekly_off_days: number;
  paid_days_equivalent: number;
  earned_salary: number;
  total_advances: number;
  total_salary_paid: number;
  total_bonus: number;
  total_deductions: number;
  previous_unpaid_balance: number;
  remaining_balance: number;
  status: 'pending' | 'partial' | 'settled' | 'closed';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalarySettings {
  id: string;
  company_name: string;
  company_logo_url?: string | null;
  company_phone?: string;
  company_address?: string;
  admin_email?: string;
  currency_symbol: string;
  currency_code: string;
  date_format: string;
  weekly_off_days: number[]; // 0 = Sunday, 1 = Monday, etc.
  is_weekly_off_paid: boolean;
  categories: string[];
  calculation_rule: 'calendar_days' | 'fixed_30';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalMonthlySalaryBudget: number;
  totalAdvancesTaken: number;
  totalSalaryPaid: number;
  totalRemainingSalary: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  todayHalfDayCount: number;
  todayLeaveCount: number;
  todayPendingCount: number;
}
