import { Employee, AttendanceRecord, SalaryTransaction, SalarySettings } from '../types';

export const INITIAL_SETTINGS: SalarySettings = {
  id: '00000000-0000-0000-0000-000000000001',
  company_name: 'Driver Salary & Fleet Management',
  company_logo_url: null,
  company_phone: '',
  company_address: '',
  admin_email: '',
  currency_symbol: '₹',
  currency_code: 'INR',
  date_format: 'DD/MM/YYYY',
  weekly_off_days: [0], // Sunday
  is_weekly_off_paid: true,
  categories: ['Driver', 'Taxi', 'Tempo', 'TRP', 'Delivery', 'Helper'],
  calculation_rule: 'calendar_days',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_EMPLOYEES: Employee[] = [];

export function generateSampleAttendance(): AttendanceRecord[] {
  return [];
}

export const INITIAL_TRANSACTIONS: SalaryTransaction[] = [];
