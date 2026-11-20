import React, { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useSalaryRecords } from '../hooks/useSalaryRecords';
import { useTransactions } from '../hooks/useTransactions';
import { useAttendance } from '../hooks/useAttendance';
import { useSettings } from '../context/SettingsContext';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { BackupRestoreModal } from '../components/reports/BackupRestoreModal';
import { Button } from '../components/common/Button';
import { Database, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { settings, selectedMonth } = useSettings();
  const { employees } = useEmployees();
  const { records } = useSalaryRecords(selectedMonth);
  const { transactions } = useTransactions(selectedMonth);
  const { attendance } = useAttendance(selectedMonth);

  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Banner with Backup Trigger */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Reports & Database Safeguards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accounting ledger exports, attendance sheets, and encrypted JSON backups.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Database className="w-4 h-4" />}
          onClick={() => setIsBackupOpen(true)}
        >
          Backup & Restore Database
        </Button>
      </div>

      {/* Main Reports Hub */}
      <ReportGenerator
        employees={employees}
        monthlyRecords={records}
        transactions={transactions}
        attendance={attendance}
        settings={settings}
        selectedMonth={selectedMonth}
      />

      {/* Backup and Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRestoreComplete={() => {
          setIsBackupOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};
