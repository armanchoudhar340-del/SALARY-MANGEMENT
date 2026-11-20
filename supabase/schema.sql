-- Driver Salary & Attendance Management System Schema
-- Production Ready PostgreSQL Migration for Supabase

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Salary Settings Table (Singleton settings for company / system)
CREATE TABLE IF NOT EXISTS public.salary_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'Transport Fleet & Logistics',
    company_logo_url TEXT,
    company_phone TEXT DEFAULT '+91 98765 43210',
    company_address TEXT DEFAULT 'Main Transport Hub, Sector 12, Industrial Area',
    admin_email TEXT,
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    currency_code TEXT NOT NULL DEFAULT 'INR',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    weekly_off_days INTEGER[] NOT NULL DEFAULT '{0}', -- 0 = Sunday
    is_weekly_off_paid BOOLEAN NOT NULL DEFAULT true,
    categories TEXT[] NOT NULL DEFAULT '{"Driver", "Taxi", "Tempo", "TRP", "Delivery", "Helper"}',
    calculation_rule TEXT NOT NULL DEFAULT 'calendar_days',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert default settings row if empty
INSERT INTO public.salary_settings (id, company_name)
SELECT gen_random_uuid(), 'Transport Fleet & Logistics'
WHERE NOT EXISTS (SELECT 1 FROM public.salary_settings);

-- 3. Create Admin Users table (link to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT DEFAULT 'Fleet Administrator',
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create Permanent Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    profile_photo_url TEXT,
    mobile_number TEXT NOT NULL,
    address TEXT,
    category TEXT NOT NULL DEFAULT 'Driver',
    joining_date DATE NOT NULL,
    leaving_date DATE,
    salary_type TEXT NOT NULL DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'daily')),
    monthly_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_salary >= 0),
    daily_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (daily_salary >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create Daily Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'paid_leave', 'unpaid_leave', 'weekly_off')),
    overtime_hours NUMERIC(4, 2) NOT NULL DEFAULT 0.00 CHECK (overtime_hours >= 0),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- 6. Create Salary Transactions Table (Advances, Payments, Bonus, Deductions)
CREATE TABLE IF NOT EXISTS public.salary_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('advance', 'salary_payment', 'bonus', 'deduction')),
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
    salary_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Create Monthly Salary Records Table (Permanent monthly snapshot and balance tracking)
CREATE TABLE IF NOT EXISTS public.monthly_salary_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    salary_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    salary_type TEXT NOT NULL DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'daily')),
    calendar_days INTEGER NOT NULL CHECK (calendar_days BETWEEN 28 AND 31),
    eligible_days INTEGER NOT NULL CHECK (eligible_days >= 0),
    calculated_daily_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    present_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    absent_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    half_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    paid_leave_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    unpaid_leave_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    weekly_off_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    paid_days_equivalent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    earned_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_advances NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_salary_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_bonus NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    previous_unpaid_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'settled', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_employee_month UNIQUE (employee_id, salary_month)
);

-- 8. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_category ON public.employees(category);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_transactions_emp_month ON public.salary_transactions(employee_id, salary_month);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.salary_transactions(date);
CREATE INDEX IF NOT EXISTS idx_monthly_salary_emp_month ON public.monthly_salary_records(employee_id, salary_month);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.salary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 11. Create Secure RLS Policies: Allow authenticated admin users
-- Salary Settings
CREATE POLICY "Admin users can view settings"
    ON public.salary_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin users can update settings"
    ON public.salary_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin Users
CREATE POLICY "Admins can view admin_users"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can update own admin_users"
    ON public.admin_users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Employees
CREATE POLICY "Admins have full access to employees"
    ON public.employees FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Attendance
CREATE POLICY "Admins have full access to attendance"
    ON public.attendance FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Salary Transactions
CREATE POLICY "Admins have full access to transactions"
    ON public.salary_transactions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Monthly Salary Records
CREATE POLICY "Admins have full access to monthly records"
    ON public.monthly_salary_records FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Audit Logs
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 12. Supabase Storage Setup (Run in Storage SQL or bucket admin)
-- Buckets: 'employee-photos', 'company-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true),
       ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Authenticated users can upload employee photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('employee-photos', 'company-assets'));

CREATE POLICY "Authenticated users can update photos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id IN ('employee-photos', 'company-assets'));

CREATE POLICY "Authenticated users can delete photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id IN ('employee-photos', 'company-assets'));

CREATE POLICY "Public read for employee photos and company assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id IN ('employee-photos', 'company-assets'));

-- 13. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.salary_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monthly_salary_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.salary_settings;
