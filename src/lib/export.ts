import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, MonthlySalaryRecord, SalarySettings, SalaryTransaction, AttendanceRecord } from '../types';
import { formatDate, formatINR, formatMonthName } from './utils';

/**
 * Export Employees to Excel
 */
export function exportEmployeesToExcel(employees: Employee[], fileName = 'Employees_List.xlsx') {
  const rows = employees.map((emp, idx) => ({
    'Sr No': idx + 1,
    'Full Name': emp.full_name,
    Category: emp.category,
    'Mobile Number': emp.mobile_number,
    'Salary Type': emp.salary_type.toUpperCase(),
    'Monthly Salary (₹)': emp.monthly_salary,
    'Daily Rate (₹)': emp.daily_salary,
    'Joining Date': formatDate(emp.joining_date),
    'Leaving Date': emp.leaving_date ? formatDate(emp.leaving_date) : 'Active',
    Status: emp.is_active ? 'Active' : 'Inactive',
    Address: emp.address || '',
    Notes: emp.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Monthly Salary Sheet to Excel
 */
export function exportSalaryReportToExcel(
  records: MonthlySalaryRecord[],
  employeesMap: Map<string, Employee>,
  monthStr: string
) {
  const rows = records.map((rec, idx) => {
    const emp = employeesMap.get(rec.employee_id);
    return {
      'Sr No': idx + 1,
      'Employee Name': emp?.full_name || 'Unknown',
      Category: emp?.category || '-',
      'Month Days': rec.calendar_days,
      'Present Days': rec.present_days,
      'Half Days': rec.half_days,
      'Absent Days': rec.absent_days,
      'Paid Leave': rec.paid_leave_days,
      'Paid Days Eq.': rec.paid_days_equivalent,
      'Earned Salary (₹)': rec.earned_salary,
      'Advances Taken (₹)': rec.total_advances,
      'Salary Paid (₹)': rec.total_salary_paid,
      'Bonus (₹)': rec.total_bonus,
      'Deductions (₹)': rec.total_deductions,
      'Remaining Balance (₹)': rec.remaining_balance,
      Status: rec.status.toUpperCase(),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Salary_${monthStr}`);
  XLSX.writeFile(workbook, `Salary_Report_${monthStr}.xlsx`);
}

/**
 * Export Transactions to Excel
 */
export function exportTransactionsToExcel(
  transactions: SalaryTransaction[],
  employeesMap: Map<string, Employee>,
  monthStr: string
) {
  const rows = transactions.map((tx, idx) => {
    const emp = employeesMap.get(tx.employee_id);
    return {
      'Sr No': idx + 1,
      Date: formatDate(tx.date),
      'Employee Name': emp?.full_name || 'Unknown',
      Type: tx.transaction_type.replace('_', ' ').toUpperCase(),
      'Amount (₹)': tx.amount,
      'Payment Method': tx.payment_method.toUpperCase(),
      'Salary Month': tx.salary_month,
      Description: tx.description || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `Payments_${monthStr}.xlsx`);
}

/**
 * Generate PDF Salary Sheet for Month
 */
export function exportSalaryReportToPDF(
  records: MonthlySalaryRecord[],
  employeesMap: Map<string, Employee>,
  monthStr: string,
  settings: SalarySettings
) {
  const doc = new jsPDF('landscape');
  const monthName = formatMonthName(monthStr);

  // Purple gradient-like header band
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.company_name || 'Transport Fleet & Logistics', 14, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Salary Statement - ${monthName}`, 14, 20);

  doc.setFontSize(9);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 230, 20);

  // Table rows
  const tableData = records.map((rec, idx) => {
    const emp = employeesMap.get(rec.employee_id);
    return [
      idx + 1,
      emp?.full_name || 'N/A',
      emp?.category || '-',
      formatINR(rec.base_salary),
      rec.paid_days_equivalent.toFixed(1),
      formatINR(rec.earned_salary),
      formatINR(rec.total_advances),
      formatINR(rec.total_salary_paid),
      formatINR(rec.remaining_balance),
      rec.status.toUpperCase(),
    ];
  });

  // Calculate totals
  const totalEarned = records.reduce((s, r) => s + r.earned_salary, 0);
  const totalAdvances = records.reduce((s, r) => s + r.total_advances, 0);
  const totalPaid = records.reduce((s, r) => s + r.total_salary_paid, 0);
  const totalRemaining = records.reduce((s, r) => s + r.remaining_balance, 0);

  const footData = [
    [
      '',
      'TOTALS',
      '',
      '',
      '',
      formatINR(totalEarned),
      formatINR(totalAdvances),
      formatINR(totalPaid),
      formatINR(totalRemaining),
      '',
    ],
  ];

  autoTable(doc, {
    startY: 32,
    head: [
      [
        '#',
        'Employee Name',
        'Category',
        'Base Rate',
        'Paid Days',
        'Earned',
        'Advances',
        'Paid',
        'Balance Due',
        'Status',
      ],
    ],
    body: tableData,
    foot: footData,
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  doc.save(`Salary_Statement_${monthStr}.pdf`);
}

/**
 * Generate Individual Employee Payslip PDF
 */
export function exportEmployeeSalarySlipPDF(
  employee: Employee,
  record: MonthlySalaryRecord,
  transactions: SalaryTransaction[],
  settings: SalarySettings
) {
  const doc = new jsPDF();
  const monthName = formatMonthName(record.salary_month);

  // Header banner
  doc.setFillColor(124, 58, 237); // purple-600
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.company_name || 'Fleet Management System', 14, 15);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`SALARY SLIP - ${monthName.toUpperCase()}`, 14, 25);

  // Employee details section
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 14, 42);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 45, 196, 45);

  doc.setFont('helvetica', 'normal');
  doc.text(`Employee Name: ${employee.full_name}`, 14, 52);
  doc.text(`Category / Role: ${employee.category}`, 14, 58);
  doc.text(`Mobile: ${employee.mobile_number}`, 14, 64);
  doc.text(`Joining Date: ${formatDate(employee.joining_date)}`, 14, 70);

  doc.text(`Salary Type: ${employee.salary_type.toUpperCase()}`, 120, 52);
  doc.text(`Base Rate: ${formatINR(record.base_salary)}`, 120, 58);
  doc.text(`Calendar Days: ${record.calendar_days}`, 120, 64);
  doc.text(`Status: ${record.status.toUpperCase()}`, 120, 70);

  // Attendance summary
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance & Working Days', 14, 82);
  doc.line(14, 85, 196, 85);

  const attSummary = [
    [
      `Present: ${record.present_days}`,
      `Half Days: ${record.half_days}`,
      `Absent: ${record.absent_days}`,
      `Paid Leave: ${record.paid_leave_days}`,
      `Paid Days Eq: ${record.paid_days_equivalent}`,
    ],
  ];

  autoTable(doc, {
    startY: 88,
    body: attSummary,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
  });

  // Earnings & Deductions breakdown table
  const salaryRows = [
    ['Gross Earned Salary (based on days worked)', formatINR(record.earned_salary)],
    ['Bonus / Incentive', formatINR(record.total_bonus)],
    ['Previous Unpaid Carry-forward Balance', formatINR(record.previous_unpaid_balance)],
    ['Total Advances / Money Taken', `-${formatINR(record.total_advances)}`],
    ['Salary Disbursed / Paid', `-${formatINR(record.total_salary_paid)}`],
    ['Deductions / Penalties', `-${formatINR(record.total_deductions)}`],
    ['NET BALANCE DUE / PAYABLE', formatINR(record.remaining_balance)],
  ];

  autoTable(doc, {
    startY: 104,
    head: [['Description', 'Amount']],
    body: salaryRows,
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right' },
    },
  });

  // Signature lines
  const finalY = 240;
  doc.line(14, finalY, 70, finalY);
  doc.text('Employee Signature', 14, finalY + 6);

  doc.line(140, finalY, 196, finalY);
  doc.text('Authorized Signatory', 140, finalY + 6);

  doc.save(`SalarySlip_${employee.full_name.replace(/\s+/g, '_')}_${record.salary_month}.pdf`);
}

/**
 * Export Attendance Sheet to Excel
 * Rows = Employees, Columns = Day 1..N of month
 * Codes: P=Present, A=Absent, H=Half Day, PL=Paid Leave, UL=Unpaid Leave, WO=Weekly Off, –=Not Marked
 */
export function exportAttendanceToExcel(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  monthStr: string, // YYYY-MM format
  fileName?: string
): void {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = formatMonthName(monthStr);

  // Build a lookup: employeeId + date => status
  const lookup = new Map<string, string>();
  attendanceRecords.forEach((rec) => {
    const key = `${rec.employee_id}::${rec.date}`;
    lookup.set(key, rec.status);
  });

  const statusCode = (status: string | undefined): string => {
    if (!status) return '–';
    switch (status) {
      case 'present':     return 'P';
      case 'absent':      return 'A';
      case 'half_day':    return 'H';
      case 'paid_leave':  return 'PL';
      case 'unpaid_leave':return 'UL';
      case 'weekly_off':  return 'WO';
      default:            return '–';
    }
  };

  // Header row: Employee Name, Category, then day numbers, then totals
  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => `${i + 1} ${monthName.slice(0, 3)}`);
  const headerRow = ['Employee Name', 'Category', ...dayHeaders, 'Present', 'Absent', 'Half Day', 'Paid Leave', 'Unpaid Leave', 'Weekly Off'];

  // Data rows
  const dataRows = employees.map((emp) => {
    let present = 0, absent = 0, halfDay = 0, paidLeave = 0, unpaidLeave = 0, weeklyOff = 0;

    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      const dateStr = `${monthStr}-${day}`;
      const status = lookup.get(`${emp.id}::${dateStr}`);
      const code = statusCode(status);
      if (code === 'P') present++;
      else if (code === 'A') absent++;
      else if (code === 'H') halfDay++;
      else if (code === 'PL') paidLeave++;
      else if (code === 'UL') unpaidLeave++;
      else if (code === 'WO') weeklyOff++;
      return code;
    });

    return [emp.full_name, emp.category, ...dayCells, present, absent, halfDay, paidLeave, unpaidLeave, weeklyOff];
  });

  const aoa = [headerRow, ...dataRows];

  // Legend row
  aoa.push([]);
  aoa.push(['Legend:', 'P = Present', 'A = Absent', 'H = Half Day', 'PL = Paid Leave', 'UL = Unpaid Leave', 'WO = Weekly Off', '– = Not Marked']);

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 22 }, // Employee Name
    { wch: 12 }, // Category
    ...Array(daysInMonth).fill({ wch: 7 }),
    { wch: 9 }, { wch: 9 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance_${monthStr}`);
  XLSX.writeFile(workbook, fileName || `Attendance_Sheet_${monthStr}.xlsx`);
}

/**
 * Export Attendance Sheet to PDF
 */
export function exportAttendanceToPDF(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  monthStr: string,
  companyName = 'Driver Management System'
): void {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = formatMonthName(monthStr);

  const lookup = new Map<string, string>();
  attendanceRecords.forEach((rec) => {
    lookup.set(`${rec.employee_id}::${rec.date}`, rec.status);
  });

  const statusCode = (status: string | undefined): string => {
    if (!status) return '–';
    switch (status) {
      case 'present':      return 'P';
      case 'absent':       return 'A';
      case 'half_day':     return 'H';
      case 'paid_leave':   return 'PL';
      case 'unpaid_leave': return 'UL';
      case 'weekly_off':   return 'WO';
      default:             return '–';
    }
  };

  const doc = new jsPDF('landscape', 'mm', 'a3');

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 420, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 11);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Attendance Sheet — ${monthName}`, 14, 19);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 350, 19);

  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const tableHead = [['#', 'Employee', 'Cat.', ...dayHeaders, 'P', 'A', 'H', 'PL']];

  const tableBody = employees.map((emp, idx) => {
    let p = 0, a = 0, h = 0, pl = 0;
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dateStr = `${monthStr}-${String(i + 1).padStart(2, '0')}`;
      const code = statusCode(lookup.get(`${emp.id}::${dateStr}`));
      if (code === 'P') p++;
      else if (code === 'A') a++;
      else if (code === 'H') h++;
      else if (code === 'PL') pl++;
      return code;
    });
    return [idx + 1, emp.full_name, emp.category, ...days, p, a, h, pl];
  });

  autoTable(doc, {
    startY: 28,
    head: tableHead,
    body: tableBody,
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 6, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 30 },
      2: { cellWidth: 14 },
    },
  });

  doc.save(`Attendance_Sheet_${monthStr}.pdf`);
}
