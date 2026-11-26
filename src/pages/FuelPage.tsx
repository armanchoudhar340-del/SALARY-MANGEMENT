import React, { FormEvent, useMemo, useState } from 'react';
import { Fuel, IndianRupee, Route, Trash2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useEmployees } from '../hooks/useEmployees';
import { useFuelLogs } from '../hooks/useFuelLogs';
import { useSettings } from '../context/SettingsContext';
import { formatINR, formatDate, getTodayDateString } from '../lib/utils';

interface FuelFormState {
  date: string;
  employee_id: string;
  vehicle_number: string;
  start_km: string;
  end_km: string;
  fuel_litres: string;
  fuel_type: 'petrol' | 'diesel' | 'cng' | '';
  amount: string;
  use: string;
  notes: string;
}

const initialForm: FuelFormState = {
  date: getTodayDateString(),
  employee_id: '',
  vehicle_number: '',
  start_km: '',
  end_km: '',
  fuel_litres: '',
  fuel_type: '',
  amount: '',
  use: '',
  notes: '',
};

export const FuelPage: React.FC = () => {
  const { employees } = useEmployees();
  const { selectedMonth } = useSettings();
  const { fuelLogs, isLoading, isError, error, addFuelLog, isAdding, deleteFuelLog, isDeleting } = useFuelLogs();
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const monthFuelLogs = useMemo(() => fuelLogs.filter((log) => log.date.startsWith(`${selectedMonth}-`)), [fuelLogs, selectedMonth]);

  const totals = useMemo(() => monthFuelLogs.reduce(
    (summary, log) => ({
      distance: summary.distance + Math.max(0, Number(log.end_km) - Number(log.start_km)),
      dieselLitres: summary.dieselLitres + (log.fuel_type === 'diesel' ? Number(log.fuel_litres || 0) : 0),
      otherLitres: summary.otherLitres + (log.fuel_type === 'petrol' ? Number(log.fuel_litres || 0) : 0),
      cngKg: summary.cngKg + (log.fuel_type === 'cng' ? Number(log.fuel_litres || 0) : 0),
      amount: summary.amount + Number(log.amount || 0),
    }),
    { distance: 0, dieselLitres: 0, otherLitres: 0, cngKg: 0, amount: 0 }
  ), [monthFuelLogs]);

  const fuelUnit = form.fuel_type === 'cng' ? 'kg' : 'litres';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setSavedMessage('');

    const startKm = Number(form.start_km);
    const endKm = Number(form.end_km);
    const litres = Number(form.fuel_litres);
    const amount = Number(form.amount);
    if (!form.vehicle_number.trim()) return setFormError('Enter the vehicle number.');
    if (!form.start_km || !form.end_km || endKm < startKm) {
      return setFormError('Enter valid start and end kilometer readings.');
    }
    if (litres <= 0 || amount < 0) return setFormError('Enter valid fuel and cost values.');

    try {
      await addFuelLog({
        date: form.date,
        employee_id: form.employee_id || null,
        vehicle_number: form.vehicle_number.trim().toUpperCase(),
        start_km: startKm,
        end_km: endKm,
        fuel_litres: litres,
        fuel_type: form.fuel_type || null,
        amount,
        use: form.use?.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm({ ...initialForm, date: getTodayDateString() });
      setSavedMessage('Fuel entry saved.');
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Could not save this fuel entry.');
    }
  };

  const fieldClass = 'block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl sm:rounded-3xl border border-purple-100 bg-white p-4 sm:p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-purple-50 p-3 text-purple-700"><Fuel className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Fuel & Kilometer Statement</h2>
            <p className="mt-1 text-sm text-slate-500">Track the vehicle, driver, odometer readings, fuel, and cost for every fill.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Distance Recorded" value={`${totals.distance.toLocaleString('en-IN')} km`} icon={<Route className="h-5 w-5" />} />
        <SummaryCard label="Fuel Filled This Month" value={`${totals.dieselLitres.toLocaleString('en-IN')} L diesel · ${totals.otherLitres.toLocaleString('en-IN')} L petrol · ${totals.cngKg.toLocaleString('en-IN')} kg CNG`} icon={<Fuel className="h-5 w-5" />} />
        <SummaryCard label="Fuel Cost" value={formatINR(totals.amount)} icon={<IndianRupee className="h-5 w-5" />} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-soft">
        <h3 className="font-bold text-slate-900">Add fuel entry</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs font-semibold text-slate-600">Date<input className={fieldClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Driver (optional)<select className={fieldClass} value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}><option value="">Select driver</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Vehicle number<input className={fieldClass} value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} placeholder="e.g. MH 12 AB 1234" required /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Fuel type<select className={fieldClass} value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value as FuelFormState['fuel_type'] })} required><option value="">Select fuel type</option><option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="cng">CNG</option></select></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Fuel filled ({fuelUnit})<input className={fieldClass} type="number" min="0.01" step="0.01" value={form.fuel_litres} onChange={(e) => setForm({ ...form, fuel_litres: e.target.value })} required /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Start kilometer<input className={fieldClass} type="number" min="0" step="1" value={form.start_km} onChange={(e) => setForm({ ...form, start_km: e.target.value })} placeholder="22000" required /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">End kilometer<input className={fieldClass} type="number" min="0" step="1" value={form.end_km} onChange={(e) => setForm({ ...form, end_km: e.target.value })} placeholder="22300" required /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Fuel cost (₹)<input className={fieldClass} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Use (optional)<input className={fieldClass} value={form.use} onChange={(e) => setForm({ ...form, use: e.target.value })} placeholder="Trip 1, airport pickup" /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-600">Notes (optional)<input className={fieldClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Fuel station or details" /></label>
        </div>
        {form.start_km && form.end_km && Number(form.end_km) >= Number(form.start_km) && (
          <p className="text-sm font-semibold text-indigo-700">Distance between readings: {(Number(form.end_km) - Number(form.start_km)).toLocaleString('en-IN')} km</p>
        )}
        {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
        {savedMessage && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{savedMessage}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isError && <p role="alert" className="text-sm text-rose-700">Fuel log storage is unavailable. Apply the fuel-log database migration and reload. {error instanceof Error ? error.message : ''}</p>}
          <Button type="submit" variant="primary" isLoading={isAdding} disabled={isError}>Save fuel entry</Button>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 px-4 py-3"><h3 className="font-bold text-slate-900">Fuel statement</h3></div>
        {isLoading ? <p className="p-5 text-sm text-slate-500">Loading fuel records…</p> : monthFuelLogs.length === 0 ? <p className="p-5 text-sm text-slate-500">No fuel entries recorded for {selectedMonth}.</p> : (
          <>
          <div className="space-y-3 p-3 sm:hidden">{monthFuelLogs.map((log) => (
            <article key={log.id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <div className="flex items-start justify-between gap-2"><div><p className="font-bold text-slate-900">{log.vehicle_number}</p><p className="text-xs text-slate-500">{formatDate(log.date)} · {employees.find((employee) => employee.id === log.employee_id)?.full_name || 'No driver selected'}</p></div><span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold uppercase text-purple-700">{log.fuel_type || 'Unspecified'}</span></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><p><span className="text-slate-500">Use</span><br /><strong>{log.use || '—'}</strong></p><p><span className="text-slate-500">Odometer</span><br /><strong>{Number(log.start_km).toLocaleString('en-IN')} → {Number(log.end_km).toLocaleString('en-IN')} km</strong></p><p><span className="text-slate-500">Distance</span><br /><strong>{Math.max(0, Number(log.end_km) - Number(log.start_km)).toLocaleString('en-IN')} km</strong></p><p><span className="text-slate-500">Fuel</span><br /><strong>{Number(log.fuel_litres).toLocaleString('en-IN')} {log.fuel_type === 'cng' ? 'kg' : 'L'}</strong></p><p><span className="text-slate-500">Cost</span><br /><strong>{formatINR(Number(log.amount))}</strong></p><button type="button" disabled={isDeleting} onClick={() => void deleteFuelLog(log.id)} className="mt-2 inline-flex items-center gap-1 text-rose-700"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>
            </article>
          ))}</div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3">Use</th><th className="px-4 py-3">Start → End</th><th className="px-4 py-3">Distance</th><th className="px-4 py-3">Fuel type</th><th className="px-4 py-3">Fuel</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{monthFuelLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3">{formatDate(log.date)}</td>
                  <td className="px-4 py-3 font-semibold">{log.vehicle_number}</td>
                  <td className="px-4 py-3">{employees.find((employee) => employee.id === log.employee_id)?.full_name || '—'}</td>
                  <td className="px-4 py-3">{log.use || '—'}</td>
                  <td className="px-4 py-3">{Number(log.start_km).toLocaleString('en-IN')} → {Number(log.end_km).toLocaleString('en-IN')} km</td>
                  <td className="px-4 py-3">{Math.max(0, Number(log.end_km) - Number(log.start_km)).toLocaleString('en-IN')} km</td>
                  <td className="px-4 py-3 uppercase">{log.fuel_type || 'Unspecified'}</td>
                  <td className="px-4 py-3">{Number(log.fuel_litres).toLocaleString('en-IN')} {log.fuel_type === 'cng' ? 'kg' : 'L'}</td>
                  <td className="px-4 py-3 font-semibold">{formatINR(Number(log.amount))}</td>
                  <td className="px-4 py-3"><button type="button" aria-label={`Delete fuel entry for ${log.vehicle_number} on ${log.date}`} disabled={isDeleting} onClick={() => void deleteFuelLog(log.id)} className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900"><Trash2 className="h-4 w-4" />Delete</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          </>
        )}
      </section>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
    <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value}</p></div>
    <div className="rounded-xl bg-purple-50 p-2.5 text-purple-700">{icon}</div>
  </div>
);
