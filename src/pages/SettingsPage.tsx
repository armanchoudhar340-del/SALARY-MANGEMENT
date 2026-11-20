import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { isSupabaseConfigured, uploadCompanyLogo } from '../lib/supabase';
import {
  Building2,
  DollarSign,
  Calendar,
  Shield,
  Layers,
  Upload,
  CheckCircle,
  Database,
  ExternalLink,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState(settings.company_name);
  const [companyPhone, setCompanyPhone] = useState(settings.company_phone || '');
  const [companyAddress, setCompanyAddress] = useState(settings.company_address || '');
  const [logoUrl, setLogoUrl] = useState(settings.company_logo_url || '');
  const [categoriesStr, setCategoriesStr] = useState(settings.categories.join(', '));
  const [calculationRule, setCalculationRule] = useState<'calendar_days' | 'fixed_30'>(
    settings.calculation_rule
  );
  const [isWeeklyOffPaid, setIsWeeklyOffPaid] = useState(settings.is_weekly_off_paid);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const uploaded = await uploadCompanyLogo(file);
      if (uploaded) {
        setLogoUrl(uploaded);
      }
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const categoriesArray = categoriesStr
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      await updateSettings({
        company_name: companyName,
        company_phone: companyPhone,
        company_address: companyAddress,
        company_logo_url: logoUrl || null,
        categories: categoriesArray.length > 0 ? categoriesArray : ['Driver', 'Taxi', 'Tempo'],
        calculation_rule: calculationRule,
        is_weekly_off_paid: isWeeklyOffPaid,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          System Configuration & Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Company details, payroll computation rules, weekly off policy, and database integration.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-purple-700">
            <Building2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Company / Transport Agency Details</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-8 h-8 text-purple-500" />
              )}
            </div>

            <div className="text-xs space-y-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold cursor-pointer border border-purple-200 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploadingLogo}
                />
              </label>
              <p className="text-slate-400">Appears on PDF salary slips & statements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone Number"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Head Office Address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
            <Input
              label="Logo Image URL (Optional)"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Salary & Attendance Rules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-700">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Payroll & Attendance Computation Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Monthly Salary Divisor Rule
              </label>
              <select
                value={calculationRule}
                onChange={(e) => setCalculationRule(e.target.value as any)}
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="calendar_days">
                  Exact Calendar Days in Month (28, 29, 30, or 31 days)
                </option>
                <option value="fixed_30">Fixed 30 Days Basis</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Calendar days engine divides base salary by exact days in the active month.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Weekly Off (Sunday) Treatment
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWeeklyOffPaid}
                    onChange={(e) => setIsWeeklyOffPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Paid Weekly Off</span>
                </label>
                <p className="text-slate-500">
                  When enabled, weekly off days count towards paid days equivalent in monthly salary.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Currency
              </label>
              <input
                disabled
                value="INR (₹) - Indian Rupee"
                className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Date Format
              </label>
              <input
                disabled
                value="DD/MM/YYYY"
                className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Vehicle & Employee Categories */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-purple-700">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Driver & Vehicle Categories</h3>
          </div>

          <Input
            label="Configured Categories (comma separated)"
            value={categoriesStr}
            onChange={(e) => setCategoriesStr(e.target.value)}
            helperText="Example: Driver, Taxi, Tempo, TRP, Delivery, Helper, Trailer"
          />
        </div>

        {/* Database & Security Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-purple-700">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Supabase Database Connection Status</h3>
          </div>

          <div
            className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  {isSupabaseConfigured
                    ? 'Connected to Live Supabase Backend'
                    : 'Running in Standalone Local/Demo Mode'}
                </p>
                <p className="mt-0.5 opacity-80">
                  {isSupabaseConfigured
                    ? 'PostgreSQL tables, Supabase Realtime, and Supabase Storage active.'
                    : 'To connect to your cloud Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'}
                </p>
              </div>
            </div>

            {!isSupabaseConfigured && (
              <span className="shrink-0 px-2.5 py-1 bg-amber-200 text-amber-900 font-bold rounded-lg uppercase tracking-wider text-[10px]">
                Demo Active
              </span>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully!</span>
            </div>
          )}
          {!savedSuccess && <div />}

          <Button type="submit" isLoading={isSaving} size="md">
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
