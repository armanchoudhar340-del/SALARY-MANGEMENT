import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { dataService } from '../../lib/dataService';
import { Download, Upload, ShieldAlert, CheckCircle, Database } from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreComplete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const backupJson = await dataService.exportFullBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DriverSalary_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const result = await dataService.restoreFullBackup(content);
        setRestoreStatus(result);
        if (result.success) {
          onRestoreComplete();
        }
      } catch (err: any) {
        setRestoreStatus({
          success: false,
          message: err.message || 'Corrupted or unreadable JSON backup file.',
        });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Database Backup & Safe Restore"
      description="Download complete system snapshot or restore from a verified JSON backup."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Export Backup Card */}
        <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-600" />
              Download Database Backup
            </h4>
            <p className="text-xs text-slate-600">
              Exports all employees, attendance logs, salary transactions, and configuration.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadBackup}
            isLoading={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>
        </div>

        {/* Restore Backup Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-slate-600" />
            Restore from Verified Backup
          </h4>
          <p className="text-xs text-slate-500">
            Select a verified `.json` file. The restore engine validates records prior to writing.
          </p>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors">
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            <span>Select JSON Backup File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileRestore}
              className="hidden"
              disabled={isRestoring}
            />
          </label>

          {isRestoring && (
            <p className="text-xs text-purple-600 animate-pulse font-medium">
              Validating and restoring database...
            </p>
          )}

          {restoreStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                restoreStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {restoreStatus.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{restoreStatus.message}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
