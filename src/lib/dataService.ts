import { supabase, isSupabaseConfigured } from './supabase';
import {
  Employee,
  AttendanceRecord,
  SalaryTransaction,
  MonthlySalaryRecord,
  SalarySettings,
  DashboardStats,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  generateSampleAttendance,
} from './mockData';
import { computeEmployeeSalary } from './calculation';
import { getCurrentMonthString, getTodayDateString } from './utils';

// Local storage keys
const STORAGE_KEYS = {
  EMPLOYEES: 'driverpay_employees',
  ATTENDANCE: 'driverpay_attendance',
  TRANSACTIONS: 'driverpay_transactions',
  MONTHLY_RECORDS: 'driverpay_monthly_records',
  SETTINGS: 'driverpay_settings',
  AUDIT_LOGS: 'driverpay_audit_logs',
};

// Helper for local storage persistence
function loadLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return defaultVal;
  }
}

function saveLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

// Initialize seed data if empty in localStorage
function initLocalSeed() {
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    saveLocal(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    saveLocal(STORAGE_KEYS.ATTENDANCE, generateSampleAttendance());
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    saveLocal(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MONTHLY_RECORDS)) {
    saveLocal(STORAGE_KEYS.MONTHLY_RECORDS, []);
  }
}

initLocalSeed();

export const dataService = {
  // --------------------------------------------------------------------------
  // Settings
  // --------------------------------------------------------------------------
  async getSettings(): Promise<SalarySettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('salary_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        saveLocal(STORAGE_KEYS.SETTINGS, data);
        return data as SalarySettings;
      }
    }
    return loadLocal<SalarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: Partial<SalarySettings>): Promise<SalarySettings> {
    const current = await this.getSettings();
    const updated: SalarySettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('salary_settings')
        .upsert(updated)
        .select()
        .single();

      if (error) throw error;
      saveLocal(STORAGE_KEYS.SETTINGS, data);
      return data as SalarySettings;
    }

    saveLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // Employees
  // --------------------------------------------------------------------------
  async getEmployees(): Promise<Employee[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('is_active', { ascending: false })
        .order('full_name', { ascending: true });

      if (!error && data) {
        saveLocal(STORAGE_KEYS.EMPLOYEES, data);
        return data as Employee[];
      }
    }
    return loadLocal<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },

  async addEmployee(emp: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const newRecord: Employee = {
      ...emp,
      id: crypto.randomUUID ? crypto.randomUUID() : `emp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('employees')
        .insert([newRecord])
        .select()
        .single();

      if (error) throw error;
      const list = loadLocal<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
      saveLocal(STORAGE_KEYS.EMPLOYEES, [data as Employee, ...list]);
      return data as Employee;
    }

    const list = loadLocal<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    const updatedList = [newRecord, ...list];
    saveLocal(STORAGE_KEYS.EMPLOYEES, updatedList);
    return newRecord;
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const list = await this.getEmployees();
    const existing = list.find((e) => e.id === id);
    if (!existing) throw new Error('Employee not found');

    const updated: Employee = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('employees')
        .update(updated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updatedList = list.map((e) => (e.id === id ? (data as Employee) : e));
      saveLocal(STORAGE_KEYS.EMPLOYEES, updatedList);
      return data as Employee;
    }

    const updatedList = list.map((e) => (e.id === id ? updated : e));
    saveLocal(STORAGE_KEYS.EMPLOYEES, updatedList);
    return updated;
  },

  // --------------------------------------------------------------------------
  // Attendance
  // --------------------------------------------------------------------------
  async getAttendance(monthStr?: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('attendance').select('*').order('date', { ascending: false });
      if (monthStr) {
        query = query.gte('date', `${monthStr}-01`).lte('date', `${monthStr}-31`);
      }
      const { data, error } = await query;
      if (!error && data) {
        saveLocal(STORAGE_KEYS.ATTENDANCE, data);
        return data as AttendanceRecord[];
      }
    }
    const all = loadLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    if (monthStr) {
      return all.filter((r) => r.date.startsWith(monthStr));
    }
    return all;
  },

  async markAttendance(
    record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<AttendanceRecord> {
    const list = loadLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    const existingIndex = list.findIndex(
      (a) => a.employee_id === record.employee_id && a.date === record.date
    );

    const fullRecord: AttendanceRecord = {
      ...record,
      id: existingIndex >= 0 ? list[existingIndex].id : crypto.randomUUID ? crypto.randomUUID() : `att-${Date.now()}`,
      created_at: existingIndex >= 0 ? list[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(fullRecord, { onConflict: 'employee_id,date' })
        .select()
        .single();

      if (error) throw error;
      const result = data as AttendanceRecord;
      if (existingIndex >= 0) {
        list[existingIndex] = result;
      } else {
        list.push(result);
      }
      saveLocal(STORAGE_KEYS.ATTENDANCE, list);
      return result;
    }

    if (existingIndex >= 0) {
      list[existingIndex] = fullRecord;
    } else {
      list.push(fullRecord);
    }
    saveLocal(STORAGE_KEYS.ATTENDANCE, list);
    return fullRecord;
  },

  async bulkMarkAttendance(
    records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<AttendanceRecord[]> {
    const results: AttendanceRecord[] = [];
    for (const rec of records) {
      const res = await this.markAttendance(rec);
      results.push(res);
    }
    return results;
  },

  // --------------------------------------------------------------------------
  // Transactions (Advances, Payments, Bonus, Deductions)
  // --------------------------------------------------------------------------
  async getTransactions(monthStr?: string): Promise<SalaryTransaction[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('salary_transactions').select('*').order('date', { ascending: false });
      if (monthStr) {
        query = query.eq('salary_month', monthStr);
      }
      const { data, error } = await query;
      if (!error && data) {
        saveLocal(STORAGE_KEYS.TRANSACTIONS, data);
        return data as SalaryTransaction[];
      }
    }
    const all = loadLocal<SalaryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    if (monthStr) {
      return all.filter((t) => t.salary_month === monthStr);
    }
    return all;
  },

  async addTransaction(
    tx: Omit<SalaryTransaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SalaryTransaction> {
    const newRecord: SalaryTransaction = {
      ...tx,
      amount: Number(tx.amount),
      id: crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('salary_transactions')
        .insert([newRecord])
        .select()
        .single();

      if (error) throw error;
      const list = loadLocal<SalaryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      saveLocal(STORAGE_KEYS.TRANSACTIONS, [data as SalaryTransaction, ...list]);
      return data as SalaryTransaction;
    }

    const list = loadLocal<SalaryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const updated = [newRecord, ...list];
    saveLocal(STORAGE_KEYS.TRANSACTIONS, updated);
    return newRecord;
  },

  async updateTransaction(
    id: string,
    updates: Partial<SalaryTransaction>
  ): Promise<SalaryTransaction> {
    const list = loadLocal<SalaryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const existing = list.find((t) => t.id === id);
    if (!existing) throw new Error('Transaction not found');

    const updated: SalaryTransaction = {
      ...existing,
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('salary_transactions')
        .update(updated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updatedList = list.map((t) => (t.id === id ? (data as SalaryTransaction) : t));
      saveLocal(STORAGE_KEYS.TRANSACTIONS, updatedList);
      return data as SalaryTransaction;
    }

    const updatedList = list.map((t) => (t.id === id ? updated : t));
    saveLocal(STORAGE_KEYS.TRANSACTIONS, updatedList);
    return updated;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('salary_transactions').delete().eq('id', id);
      if (error) throw error;
    }
    const list = loadLocal<SalaryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const filtered = list.filter((t) => t.id !== id);
    saveLocal(STORAGE_KEYS.TRANSACTIONS, filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // Monthly Salary Records (Snapshots & Generation)
  // --------------------------------------------------------------------------
  async getMonthlyRecords(monthStr: string): Promise<MonthlySalaryRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('monthly_salary_records')
        .select('*')
        .eq('salary_month', monthStr);

      if (!error && data) {
        return data as MonthlySalaryRecord[];
      }
    }
    const all = loadLocal<MonthlySalaryRecord[]>(STORAGE_KEYS.MONTHLY_RECORDS, []);
    return all.filter((r) => r.salary_month === monthStr);
  },

  /**
   * Idempotently computes and persists monthly salary records for all active employees
   */
  async generateMonthlyRecords(monthStr: string): Promise<MonthlySalaryRecord[]> {
    const [employees, attendance, transactions, settings] = await Promise.all([
      this.getEmployees(),
      this.getAttendance(monthStr),
      this.getTransactions(monthStr),
      this.getSettings(),
    ]);

    const activeEmployees = employees.filter((e) => e.is_active);
    const existingRecords = await this.getMonthlyRecords(monthStr);

    const generated: MonthlySalaryRecord[] = [];

    for (const emp of activeEmployees) {
      const calc = computeEmployeeSalary({
        employee: emp,
        monthStr,
        attendanceList: attendance,
        transactionsList: transactions,
        settings,
      });

      const existing = existingRecords.find((r) => r.employee_id === emp.id);

      const record: MonthlySalaryRecord = {
        id: existing?.id || (crypto.randomUUID ? crypto.randomUUID() : `msr-${Date.now()}-${emp.id}`),
        employee_id: emp.id,
        salary_month: monthStr,
        base_salary: calc.baseSalary,
        salary_type: emp.salary_type,
        calendar_days: calc.calendarDays,
        eligible_days: calc.eligibleDays,
        calculated_daily_rate: calc.calculatedDailyRate,
        present_days: calc.presentDays,
        absent_days: calc.absentDays,
        half_days: calc.halfDays,
        paid_leave_days: calc.paidLeaveDays,
        unpaid_leave_days: calc.unpaidLeaveDays,
        weekly_off_days: calc.weeklyOffDays,
        paid_days_equivalent: calc.paidDaysEquivalent,
        earned_salary: calc.earnedSalary,
        total_advances: calc.totalAdvances,
        total_salary_paid: calc.totalSalaryPaid,
        total_bonus: calc.totalBonus,
        total_deductions: calc.totalDeductions,
        previous_unpaid_balance: calc.previousUnpaidBalance,
        remaining_balance: calc.remainingBalance,
        status: calc.remainingBalance <= 0 ? 'settled' : calc.totalSalaryPaid > 0 ? 'partial' : 'pending',
        notes: existing?.notes || null,
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      generated.push(record);
    }

    if (isSupabaseConfigured && supabase && generated.length > 0) {
      const { error } = await supabase
        .from('monthly_salary_records')
        .upsert(generated, { onConflict: 'employee_id,salary_month' });

      if (error) console.error('Error syncing monthly records to Supabase:', error);
    }

    // Update local storage
    const allRecords = loadLocal<MonthlySalaryRecord[]>(STORAGE_KEYS.MONTHLY_RECORDS, []);
    const otherMonths = allRecords.filter((r) => r.salary_month !== monthStr);
    saveLocal(STORAGE_KEYS.MONTHLY_RECORDS, [...otherMonths, ...generated]);

    return generated;
  },

  // --------------------------------------------------------------------------
  // Dashboard Live Stats
  // --------------------------------------------------------------------------
  async getDashboardStats(selectedMonth: string): Promise<DashboardStats> {
    const today = getTodayDateString();
    const [employees, attendance, transactions, settings] = await Promise.all([
      this.getEmployees(),
      this.getAttendance(selectedMonth),
      this.getTransactions(selectedMonth),
      this.getSettings(),
    ]);

    const activeEmployees = employees.filter((e) => e.is_active);

    // Sum monthly budget
    const totalMonthlySalaryBudget = activeEmployees.reduce((sum, e) => {
      return sum + (e.salary_type === 'monthly' ? e.monthly_salary : e.daily_salary * 30);
    }, 0);

    // Calculate aggregated earned, advances, salary paid, remaining for all active employees
    let totalAdvancesTaken = 0;
    let totalSalaryPaid = 0;
    let totalEarnedSalary = 0;
    let totalRemainingSalary = 0;

    activeEmployees.forEach((emp) => {
      const calc = computeEmployeeSalary({
        employee: emp,
        monthStr: selectedMonth,
        attendanceList: attendance,
        transactionsList: transactions,
        settings,
      });

      totalAdvancesTaken += calc.totalAdvances;
      totalSalaryPaid += calc.totalSalaryPaid;
      totalEarnedSalary += calc.earnedSalary;
      totalRemainingSalary += calc.remainingBalance;
    });

    // Today's attendance counts
    const todayAttendance = attendance.filter((a) => a.date === today);
    let todayPresentCount = 0;
    let todayAbsentCount = 0;
    let todayHalfDayCount = 0;
    let todayLeaveCount = 0;

    const markedEmployeeIds = new Set<string>();

    todayAttendance.forEach((a) => {
      markedEmployeeIds.add(a.employee_id);
      if (a.status === 'present') todayPresentCount++;
      else if (a.status === 'absent') todayAbsentCount++;
      else if (a.status === 'half_day') todayHalfDayCount++;
      else if (a.status === 'paid_leave' || a.status === 'unpaid_leave') todayLeaveCount++;
      else if (a.status === 'weekly_off') todayPresentCount++; // or weekly off
    });

    const todayPendingCount = Math.max(0, activeEmployees.length - markedEmployeeIds.size);

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      totalMonthlySalaryBudget,
      totalAdvancesTaken,
      totalSalaryPaid,
      totalRemainingSalary: Math.max(0, totalRemainingSalary),
      todayPresentCount,
      todayAbsentCount,
      todayHalfDayCount,
      todayLeaveCount,
      todayPendingCount,
    };
  },

  // --------------------------------------------------------------------------
  // Full Backup & Restore
  // --------------------------------------------------------------------------
  async exportFullBackup(): Promise<string> {
    const [employees, attendance, transactions, settings, monthly] = await Promise.all([
      this.getEmployees(),
      this.getAttendance(),
      this.getTransactions(),
      this.getSettings(),
      loadLocal<MonthlySalaryRecord[]>(STORAGE_KEYS.MONTHLY_RECORDS, []),
    ]);

    const backupPayload = {
      app: 'DriverSalaryManager',
      version: '1.0',
      exported_at: new Date().toISOString(),
      data: {
        settings,
        employees,
        attendance,
        transactions,
        monthly_records: monthly,
      },
    };

    return JSON.stringify(backupPayload, null, 2);
  },

  async restoreFullBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.employees)) {
        throw new Error('Invalid backup file structure: missing employees table.');
      }

      saveLocal(STORAGE_KEYS.SETTINGS, parsed.data.settings || INITIAL_SETTINGS);
      saveLocal(STORAGE_KEYS.EMPLOYEES, parsed.data.employees || []);
      saveLocal(STORAGE_KEYS.ATTENDANCE, parsed.data.attendance || []);
      saveLocal(STORAGE_KEYS.TRANSACTIONS, parsed.data.transactions || []);
      saveLocal(STORAGE_KEYS.MONTHLY_RECORDS, parsed.data.monthly_records || []);

      if (isSupabaseConfigured && supabase) {
        // Upsert to Supabase
        if (parsed.data.settings) {
          await supabase.from('salary_settings').upsert(parsed.data.settings);
        }
        if (parsed.data.employees?.length) {
          await supabase.from('employees').upsert(parsed.data.employees);
        }
        if (parsed.data.attendance?.length) {
          await supabase.from('attendance').upsert(parsed.data.attendance);
        }
        if (parsed.data.transactions?.length) {
          await supabase.from('salary_transactions').upsert(parsed.data.transactions);
        }
      }

      return {
        success: true,
        message: `Successfully restored ${parsed.data.employees.length} employees, ${parsed.data.attendance?.length || 0} attendance records, and ${parsed.data.transactions?.length || 0} transactions.`,
      };
    } catch (err: any) {
      console.error('Backup restore failed:', err);
      return { success: false, message: err.message || 'Failed to restore backup' };
    }
  },
};
