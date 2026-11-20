import React, { useState } from 'react';

interface Section {
  title: string;
  icon: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    title: '1. How to Add a Driver / Employee',
    icon: '👤',
    content: (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
        <li>Go to the <strong>Dashboard</strong> or <strong>Employees</strong> page.</li>
        <li>Click the <strong>"Add Employee"</strong> button (top right).</li>
        <li>Fill in the driver's name, mobile number, and category (Driver / Taxi / Tempo etc.).</li>
        <li>Set the salary: choose <strong>Monthly Salary</strong> and enter the amount (e.g. ₹22,000).</li>
        <li>Click <strong>"Create Employee"</strong> to save.</li>
        <li>The driver now appears on the dashboard and all salary calculations start automatically.</li>
      </ol>
    ),
  },
  {
    title: '2. How to Mark Daily Attendance',
    icon: '✅',
    content: (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
        <li>Go to the <strong>Daily Attendance</strong> page from the sidebar.</li>
        <li>Today's date is selected by default.</li>
        <li>For each driver, click the status button: <strong>Present, Absent, Half Day, Paid Leave, Unpaid Leave,</strong> or <strong>Weekly Off</strong>.</li>
        <li>Use the <strong>"Mark All Present"</strong> button to quickly mark everyone present for the day.</li>
        <li>Attendance is saved automatically — no extra save button needed.</li>
        <li>Salary is recalculated based on attendance at the end of the month.</li>
      </ol>
    ),
  },
  {
    title: '3. How Salary is Calculated',
    icon: '💰',
    content: (
      <div className="space-y-3 text-slate-700 text-sm">
        <p>The salary is calculated using a simple formula based on the actual calendar days in the month:</p>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 font-mono text-xs space-y-1">
          <p>Daily Rate = Monthly Salary ÷ Total Days in Month</p>
          <p>Salary Earned = Daily Rate × (Present + Half Days × 0.5 + Paid Leave)</p>
          <p>Total Salary Left = Salary Earned − Money Taken − Salary Paid</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1">
          <p><strong>Example (November 2026, 30 days):</strong></p>
          <p>Monthly Salary: ₹22,000</p>
          <p>Daily Rate: ₹22,000 ÷ 30 = ₹733</p>
          <p>Present: 25 days, Half Day: 2 days</p>
          <p>Salary Earned: ₹733 × (25 + 1) = ₹19,066</p>
          <p>Money Taken: ₹2,500 | Salary Paid: ₹5,000</p>
          <p><strong>Total Salary Left: ₹19,066 − ₹2,500 − ₹5,000 = ₹11,566</strong></p>
        </div>
      </div>
    ),
  },
  {
    title: '4. What is "Money Taken" (Advance)?',
    icon: '💵',
    content: (
      <div className="space-y-2 text-slate-700 text-sm">
        <p><strong>Money Taken</strong> means money given to a driver in advance before the full salary is paid. This is also called an <em>advance</em>.</p>
        <p>For example, if a driver asks for ₹2,000 before the month ends, you record it as "Money Taken". This amount is automatically deducted from the total salary left.</p>
        <p><strong>How to record:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"Add Money"</strong> on the driver's card or go to <strong>Money Taken / Payments</strong> page.</li>
          <li>Select the driver, type the amount, choose <strong>Advance</strong> as the type.</li>
          <li>Click Save — it will be deducted from the salary automatically.</li>
        </ol>
      </div>
    ),
  },
  {
    title: '5. How to Pay Monthly Salary',
    icon: '🏦',
    content: (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
        <li>Go to <strong>Money Taken / Payments</strong> page.</li>
        <li>Click <strong>"Add Payment"</strong>.</li>
        <li>Select the driver and enter the salary amount paid.</li>
        <li>Choose the payment method (Cash / Bank / UPI).</li>
        <li>Select the type as <strong>Salary Payment</strong>.</li>
        <li>Click Save. The <strong>Total Salary Left</strong> for that driver will update automatically.</li>
      </ol>
    ),
  },
  {
    title: '6. What Does "Total Salary Left" Mean?',
    icon: '📊',
    content: (
      <div className="space-y-2 text-slate-700 text-sm">
        <p><strong>Total Salary Left</strong> = The money you still need to pay the driver this month after all deductions and payments.</p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1">
          <p>Salary Earned: ₹20,000</p>
          <p>Money Taken (Advance): −₹2,500</p>
          <p>Salary Already Paid: −₹5,000</p>
          <p><strong>Total Salary Left: ₹12,500</strong></p>
        </div>
        <p>When this reaches ₹0, the driver is fully paid for the month.</p>
      </div>
    ),
  },
  {
    title: '7. How to Download Attendance Sheet',
    icon: '📥',
    content: (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
        <li>Go to the <strong>Daily Attendance</strong> page.</li>
        <li>Make sure the correct month is selected at the top.</li>
        <li>Click <strong>"Download Sheet"</strong> button for Excel format.</li>
        <li>Click <strong>"PDF Report"</strong> for a printable PDF version.</li>
        <li>The file will include all drivers with daily attendance codes:<br />
          <strong>P</strong> = Present · <strong>A</strong> = Absent · <strong>H</strong> = Half Day · <strong>PL</strong> = Paid Leave · <strong>WO</strong> = Weekly Off
        </li>
      </ol>
    ),
  },
  {
    title: '8. How to Download Salary Reports',
    icon: '📄',
    content: (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
        <li>Go to <strong>Monthly Salary Cards</strong> page.</li>
        <li>Select the month from the top-right month picker.</li>
        <li>Click <strong>"Excel Sheet"</strong> for a spreadsheet of all salary records.</li>
        <li>Click <strong>"Print PDF Statement"</strong> for a formatted salary statement.</li>
        <li>To get an individual driver's salary slip, click <strong>"View Details"</strong> on their card, then click <strong>"Export Slip"</strong>.</li>
      </ol>
    ),
  },
  {
    title: '9. How to Edit a Driver\'s Information',
    icon: '✏️',
    content: (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
        <li>Find the driver's card on the Dashboard or Employees page.</li>
        <li>Click the <strong>"Edit"</strong> button on their card.</li>
        <li>Update any field — name, mobile, salary, category, status.</li>
        <li>Click <strong>"Save Changes"</strong>.</li>
        <li>Salary calculations will update automatically for the current month.</li>
      </ol>
    ),
  },
  {
    title: '10. How to Deactivate a Driver (Who Leaves)',
    icon: '🚪',
    content: (
      <div className="space-y-2 text-slate-700 text-sm">
        <p>When a driver leaves your service, you should <strong>deactivate</strong> them (not delete) to preserve all past records.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"Edit"</strong> on the driver's card.</li>
          <li>Uncheck the <strong>"Active Employee Status"</strong> checkbox.</li>
          <li>Enter the <strong>Leaving Date</strong>.</li>
          <li>Click <strong>"Save Changes"</strong>.</li>
        </ol>
        <p>All past salary, attendance, and payment records will be safely preserved. The driver will no longer appear in active lists but their history is permanent.</p>
      </div>
    ),
  },
  {
    title: '11. What is the Monthly Salary Cards Page?',
    icon: '🗂️',
    content: (
      <div className="space-y-2 text-slate-700 text-sm">
        <p>The <strong>Monthly Salary Cards</strong> page shows a detailed salary summary for every active driver for the selected month.</p>
        <p>Each card shows:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Salary Earned (based on attendance)</li>
          <li>Money Taken (advances given)</li>
          <li>Salary Paid (payments made)</li>
          <li><strong>Total Salary Left</strong> (amount still to pay)</li>
        </ul>
        <p>Click <strong>"Re-calculate Month"</strong> after making any changes to attendance or payments to refresh all cards.</p>
      </div>
    ),
  },
  {
    title: '12. Reports & Export Page',
    icon: '📈',
    content: (
      <div className="space-y-2 text-slate-700 text-sm">
        <p>Go to <strong>Reports &amp; Export</strong> from the sidebar to get a full overview of all data.</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Export all employees list to Excel</li>
          <li>Download all payment transactions</li>
          <li>Filter by month and category</li>
          <li>Print or save PDF reports</li>
        </ul>
      </div>
    ),
  },
  {
    title: '13. Settings — Company Name & Categories',
    icon: '⚙️',
    content: (
      <div className="space-y-2 text-slate-700 text-sm">
        <p>Go to <strong>Settings</strong> from the sidebar to customize the app:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Set your <strong>Company Name</strong> (appears on salary slips and PDF reports)</li>
          <li>Add or remove <strong>Employee Categories</strong> (e.g. Driver, Taxi, Tempo, TRP)</li>
          <li>Change week start day for attendance calendar</li>
        </ul>
      </div>
    ),
  },
];

export const HelpPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Help & How to Use</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simple guide to using the Driver Salary & Attendance Management System
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 text-sm text-purple-900">
          <strong>Welcome!</strong> This guide explains how to manage your drivers, mark attendance,
          record salary payments, and download reports — all in simple everyday language.
          Click any topic below to read more.
        </div>
      </div>

      {/* Quick Reference Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Reference — What Each Page Does</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { page: 'Dashboard', desc: 'See all drivers + salary summary + today\'s attendance', emoji: '🏠' },
            { page: 'Employees', desc: 'Add, edit, view or deactivate driver profiles', emoji: '👤' },
            { page: 'Daily Attendance', desc: 'Mark who came today — present, absent, half day etc.', emoji: '✅' },
            { page: 'Money Taken / Payments', desc: 'Record advances given and salary payments made', emoji: '💵' },
            { page: 'Monthly Salary Cards', desc: 'View salary earned, money owed, and payment status for each driver', emoji: '📋' },
            { page: 'Reports & Export', desc: 'Download Excel and PDF reports for salary and attendance', emoji: '📄' },
            { page: 'Settings', desc: 'Set company name and driver categories', emoji: '⚙️' },
            { page: 'Help & Guide', desc: 'This page — simple instructions for everything', emoji: '📖' },
          ].map((item) => (
            <div key={item.page} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <span>{item.emoji}</span>
                <span className="font-bold text-slate-800">{item.page}</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <span className="font-bold text-slate-800 text-sm">{section.title}</span>
              </div>
              <span className={`text-slate-400 text-lg font-light transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-6 border-t border-slate-100">
                <div className="pt-4">{section.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Salary Codes Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">📋 Attendance Code Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { code: 'P', label: 'Present', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
            { code: 'A', label: 'Absent', color: 'bg-rose-100 text-rose-800 border-rose-200' },
            { code: 'H', label: 'Half Day', color: 'bg-amber-100 text-amber-800 border-amber-200' },
            { code: 'PL', label: 'Paid Leave', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            { code: 'UL', label: 'Unpaid Leave', color: 'bg-orange-100 text-orange-800 border-orange-200' },
            { code: 'WO', label: 'Weekly Off', color: 'bg-purple-100 text-purple-800 border-purple-200' },
            { code: '–', label: 'Not Marked Yet', color: 'bg-slate-100 text-slate-600 border-slate-200' },
          ].map((item) => (
            <div key={item.code} className={`p-3 rounded-xl border ${item.color} flex items-center gap-2`}>
              <span className="font-black text-base w-7 text-center">{item.code}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact / Support Note */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5 text-center text-sm text-purple-900">
        <p className="font-semibold text-base mb-1">Need more help?</p>
        <p className="text-slate-600 text-xs">
          If something is not working as expected, try clicking <strong>"Re-calculate Month"</strong> on the
          Monthly Salary Cards page to refresh all salary data.
        </p>
      </div>
    </div>
  );
};
