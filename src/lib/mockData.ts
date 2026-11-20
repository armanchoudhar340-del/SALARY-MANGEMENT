import { Employee, AttendanceRecord, SalaryTransaction, SalarySettings } from '../types';

export const INITIAL_SETTINGS: SalarySettings = {
  id: '00000000-0000-0000-0000-000000000001',
  company_name: 'FastTrack Logistics & Fleet Services',
  company_logo_url: null,
  company_phone: '+91 98765 43210',
  company_address: 'Plot 45, Transport Nagar, Outer Ring Road, New Delhi',
  admin_email: 'admin@fasttrackfleet.com',
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

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    full_name: 'Rajesh Kumar Sharma',
    profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mobile_number: '+91 98112 34567',
    address: 'H.No 124, Sector 4, Rohini, Delhi',
    category: 'Driver',
    joining_date: '2023-01-15',
    leaving_date: null,
    salary_type: 'monthly',
    monthly_salary: 24000,
    daily_salary: 800,
    is_active: true,
    notes: 'Senior heavy commercial vehicle driver. Reliable and punctual.',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 'emp-002',
    full_name: 'Vikram Singh Chauhan',
    profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mobile_number: '+91 98223 45678',
    address: 'Flat 302, Green Park, Noida Sector 62',
    category: 'Tempo',
    joining_date: '2024-03-01',
    leaving_date: null,
    salary_type: 'monthly',
    monthly_salary: 22000,
    daily_salary: 733.33,
    is_active: true,
    notes: 'Intra-city tempo and mini-truck operator.',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 'emp-003',
    full_name: 'Amit Patel',
    profile_photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    mobile_number: '+91 98334 56789',
    address: 'Vill. Badarpur, Near Metro Station, Delhi',
    category: 'Taxi',
    joining_date: '2024-08-10',
    leaving_date: null,
    salary_type: 'monthly',
    monthly_salary: 20000,
    daily_salary: 666.67,
    is_active: true,
    notes: 'Sedan and taxi driver for airport shuttle contracts.',
    created_at: '2024-08-10T09:00:00Z',
    updated_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 'emp-004',
    full_name: 'Suresh Yadav',
    profile_photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    mobile_number: '+91 98445 67890',
    address: 'Kapashera Border, Gurugram',
    category: 'TRP',
    joining_date: '2025-02-01',
    leaving_date: null,
    salary_type: 'monthly',
    monthly_salary: 25000,
    daily_salary: 833.33,
    is_active: true,
    notes: 'Transport permit long-haul driver.',
    created_at: '2025-02-01T09:00:00Z',
    updated_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 'emp-005',
    full_name: 'Manish Verma',
    profile_photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    mobile_number: '+91 98556 78901',
    address: 'Near Old Bus Stand, Faridabad',
    category: 'Delivery',
    joining_date: '2025-06-15',
    leaving_date: null,
    salary_type: 'daily',
    monthly_salary: 0,
    daily_salary: 850,
    is_active: true,
    notes: 'Daily wage logistics delivery driver.',
    created_at: '2025-06-15T09:00:00Z',
    updated_at: '2026-11-01T09:00:00Z',
  },
];

// Helper to generate attendance for current month (November 2026)
export function generateSampleAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const currentMonthStr = '2026-11';
  const todayDay = 20; // 20th of November 2026

  INITIAL_EMPLOYEES.forEach((emp) => {
    for (let day = 1; day <= todayDay; day++) {
      const dateStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`;
      const d = new Date(2026, 10, day); // month is 0-indexed, 10 = Nov
      const isSunday = d.getDay() === 0;

      let status: AttendanceRecord['status'] = 'present';
      if (isSunday) {
        status = 'weekly_off';
      } else if (emp.id === 'emp-002' && (day === 5 || day === 14)) {
        status = 'half_day';
      } else if (emp.id === 'emp-003' && day === 12) {
        status = 'absent';
      } else if (emp.id === 'emp-004' && day === 8) {
        status = 'paid_leave';
      }

      records.push({
        id: `att-${emp.id}-${dateStr}`,
        employee_id: emp.id,
        date: dateStr,
        status,
        overtime_hours: 0,
        remarks: null,
        created_at: `${dateStr}T18:00:00Z`,
        updated_at: `${dateStr}T18:00:00Z`,
      });
    }
  });

  return records;
}

// Sample transactions matching Requirement 17:
// "Four payments of ₹500, ₹1,000, ₹500, and ₹500 totaling ₹2,500."
export const INITIAL_TRANSACTIONS: SalaryTransaction[] = [
  {
    id: 'tx-001',
    employee_id: 'emp-001',
    amount: 500,
    date: '2026-11-04',
    transaction_type: 'advance',
    payment_method: 'upi',
    salary_month: '2026-11',
    description: 'Fuel & toll advance',
    created_at: '2026-11-04T11:00:00Z',
    updated_at: '2026-11-04T11:00:00Z',
  },
  {
    id: 'tx-002',
    employee_id: 'emp-001',
    amount: 1000,
    date: '2026-11-08',
    transaction_type: 'advance',
    payment_method: 'cash',
    salary_month: '2026-11',
    description: 'Personal urgent expense advance',
    created_at: '2026-11-08T14:30:00Z',
    updated_at: '2026-11-08T14:30:00Z',
  },
  {
    id: 'tx-003',
    employee_id: 'emp-001',
    amount: 500,
    date: '2026-11-12',
    transaction_type: 'advance',
    payment_method: 'upi',
    salary_month: '2026-11',
    description: 'Vehicle maintenance advance',
    created_at: '2026-11-12T16:00:00Z',
    updated_at: '2026-11-12T16:00:00Z',
  },
  {
    id: 'tx-004',
    employee_id: 'emp-001',
    amount: 500,
    date: '2026-11-16',
    transaction_type: 'salary_payment',
    payment_method: 'cash',
    salary_month: '2026-11',
    description: 'Mid-month cash disbursement',
    created_at: '2026-11-16T17:00:00Z',
    updated_at: '2026-11-16T17:00:00Z',
  },
  // Additional transactions for other employees
  {
    id: 'tx-005',
    employee_id: 'emp-002',
    amount: 2000,
    date: '2026-11-07',
    transaction_type: 'advance',
    payment_method: 'upi',
    salary_month: '2026-11',
    description: 'Home advance',
    created_at: '2026-11-07T12:00:00Z',
    updated_at: '2026-11-07T12:00:00Z',
  },
  {
    id: 'tx-006',
    employee_id: 'emp-003',
    amount: 1500,
    date: '2026-11-10',
    transaction_type: 'advance',
    payment_method: 'cash',
    salary_month: '2026-11',
    description: 'Emergency advance',
    created_at: '2026-11-10T15:00:00Z',
    updated_at: '2026-11-10T15:00:00Z',
  },
];
