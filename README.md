# Driver Salary & Attendance Management System

> **Production-ready, full-stack PWA** for managing driver salaries, daily attendance, advances, and payroll reports.
> Built with React + TypeScript + Vite + TailwindCSS + Supabase.

---

## ✨ Features

| Feature | Detail |
|---|---|
| 📊 **Live Dashboard** | 9 real-time statistics auto-calculated from DB |
| 👷 **Employee Management** | Permanent profiles with photo, category, joining date |
| 📅 **Daily Attendance** | One-tap marking (Present/Half-Day/Absent/Leave/Weekly Off) |
| 💰 **Salary Calculation** | Calendar-based daily rate × paid days engine |
| 💸 **Money Taken/Payments** | Advances, disbursements, bonuses, deductions |
| 📋 **Monthly Salary Records** | Idempotent snapshots, historical salary preservation |
| 📈 **Charts & Analytics** | Recharts-powered salary breakdown & attendance pie |
| 📄 **Reports & Export** | PDF salary slips + Excel sheets for all data |
| 🔐 **Secure Auth** | Supabase Auth, Row Level Security, single-admin |
| 🌐 **Real-time Sync** | Supabase Realtime across all devices |
| 📱 **PWA** | Installable on iPhone, Android, MacBook |
| 🧪 **8 Auto-Tests** | Vitest financial calculation tests (all passing) |

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
node -v   # Node.js 18+
npm -v    # npm 9+
```

### 2. Install Dependencies

```bash
cd "new  Sahil"
npm install
```

### 3. Set Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note:** Without these, the app runs in **Demo Mode** with pre-seeded sample data stored in localStorage. All features work. Connect Supabase to sync across devices.

### 4. Run Development Server

```bash
npm run dev
# → http://localhost:5173
```

**Demo login credentials:**
- Email: `admin@fleetmanager.com`
- Password: `admin123` (any 6+ char password in Demo Mode)

---

## 🗄️ Supabase Database Setup

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy `Project URL` and `anon public` key

### Step 2: Run SQL Migration

Go to **Supabase → SQL Editor** and paste the full contents of:

```
supabase/schema.sql
```

This creates all tables, indexes, RLS policies, Storage buckets, and Realtime publications.

### Step 3: Create Admin User

Go to **Supabase → Authentication → Users → Create User**:
- Email: your admin email
- Password: strong password
- Email confirmed: YES

### Step 4: Connect .env

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📦 Deploy to Vercel

### One-click via CLI

```bash
npm run build
npx vercel --prod
```

### Environment Variables in Vercel Dashboard

Go to **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1N...` |

### Supabase Auth Redirect

Go to **Supabase → Authentication → URL Configuration**:
- **Site URL:** `https://your-app.vercel.app`
- **Additional Redirect URLs:** `https://your-app.vercel.app/`

---

## 🏗️ Project Architecture

```
src/
├── __tests__/        # Vitest financial calculation tests
├── components/
│   ├── common/       # Reusable UI (Modal, Button, Badge, StatCard...)
│   ├── layout/       # Navbar, Sidebar, MobileNav, Layout
│   ├── dashboard/    # QuickStats, SalaryChart, AttendanceChart
│   ├── employees/    # EmployeeCard, EmployeeModal, ProfileModal
│   ├── attendance/   # DailyAttendanceSheet, AttendanceCalendar
│   ├── payments/     # AddPaymentModal, PaymentHistoryTable
│   └── reports/      # ReportGenerator, BackupRestoreModal
├── context/          # AuthContext, SettingsContext, SyncContext
├── hooks/            # useEmployees, useAttendance, useTransactions, useSalaryRecords
├── lib/
│   ├── calculation.ts  # Core salary engine (100% tested)
│   ├── dataService.ts  # Supabase ↔ localStorage unified service
│   ├── export.ts       # Excel (xlsx) + PDF (jsPDF) generators
│   ├── mockData.ts     # Seeded demo data
│   ├── supabase.ts     # Supabase client + storage helpers
│   └── utils.ts        # Formatters, helpers
├── pages/            # DashboardPage, EmployeesPage, AttendancePage, etc.
└── types/            # TypeScript interfaces
supabase/
└── schema.sql        # Complete Supabase DB schema + RLS + Storage
```

---

## 🧮 Salary Calculation Engine

The core calculation engine (`src/lib/calculation.ts`) implements:

```
Daily Rate = Monthly Salary ÷ Calendar Days in Month  (28/29/30/31)

Paid Days Equivalent = Present Days
                     + (Half Days × 0.5)
                     + Paid Leave Days
                     + (is_weekly_off_paid ? Weekly Off Days : 0)

Earned Salary = Daily Rate × Paid Days Equivalent

Remaining Balance = Earned Salary
                  + Bonus
                  - Deductions
                  - Total Advances
                  - Total Salary Paid
                  + Previous Unpaid Carry-forward Balance
```

All amounts rounded to 2 decimal places via `roundCurrency()` using `Math.round((val + Number.EPSILON) * 100) / 100` to prevent IEEE-754 floating-point errors.

---

## ✅ Test Results

```bash
npm test
```

```
✓ Correctly calculates calendar days (28/29/30/31 months)
✓ Eligible days respecting joining/leaving dates
✓ Human-readable employment duration calculation
✓ Daily Rate = Monthly Salary / Calendar Days
✓ Paid Day Equivalents with half days and weekly off
✓ Req 17: 4 payments ₹500+₹1000+₹500+₹500 = ₹2500 (no double deduction)
✓ Carry-forward previous unpaid balance without duplication
✓ Daily-salaried employee daily rate × paid days

8/8 Tests Passing ✓
```

---

## 🔐 Security Architecture

- **Supabase Auth** — Secure email/password, JWT session tokens
- **Row Level Security** — All tables enforce `auth.uid()` based access
- **No Public Registration** — Admin account created server-side only
- **Anon Key Only in Frontend** — Service-role key never exposed to browser
- **Supabase Storage RLS** — Employee photos only accessible to authenticated admin
- **Financial Operations** — Atomic operations, no partial writes
- **Backup Validation** — JSON backup restore validates schema before writing

---

## 📱 PWA Installation

| Platform | Instructions |
|---|---|
| **iPhone Safari** | Tap Share → "Add to Home Screen" |
| **Android Chrome** | Tap Menu → "Add to Home Screen" or install banner |
| **MacBook Chrome** | Click ⊕ install icon in address bar |

---

## 📊 Database Tables

| Table | Purpose |
|---|---|
| `salary_settings` | Company config, weekly off rules, calculation method |
| `admin_users` | Link to Supabase Auth users |
| `employees` | Permanent driver profiles (never deleted) |
| `attendance` | Daily attendance records (unique per emp+date) |
| `salary_transactions` | All money taken / payments (advance, payment, bonus, deduction) |
| `monthly_salary_records` | Idempotent monthly salary snapshots (unique per emp+month) |
| `audit_logs` | Tamper-evident action log |

---

## 🛠️ Scripts

```bash
npm run dev       # Start development server
npm run build     # TypeScript compile + Vite production build
npm test          # Run Vitest automated test suite
npm run preview   # Preview production build locally
```

---

*Built with ❤️ using React, Vite, TypeScript, TailwindCSS, Supabase, and Recharts.*
