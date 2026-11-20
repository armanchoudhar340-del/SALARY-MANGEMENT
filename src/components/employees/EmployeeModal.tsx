import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Employee, SalaryType } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { uploadEmployeePhoto } from '../../lib/supabase';
import { Upload, User, DollarSign, Calendar, Phone, MapPin, Tag } from 'lucide-react';

const employeeSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile_number: z.string().min(10, 'Valid 10-digit mobile number required'),
  address: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  joining_date: z.string().min(1, 'Joining date is required'),
  leaving_date: z.string().optional().nullable(),
  salary_type: z.enum(['monthly', 'daily']),
  monthly_salary: z.coerce.number().min(0, 'Monthly salary cannot be negative'),
  daily_salary: z.coerce.number().min(0, 'Daily salary cannot be negative'),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
  profile_photo_url: z.string().optional().nullable(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  employeeToEdit?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeToEdit,
}) => {
  const { settings } = useSettings();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: '',
      mobile_number: '',
      address: '',
      category: 'Driver',
      joining_date: new Date().toISOString().split('T')[0],
      leaving_date: null,
      salary_type: 'monthly',
      monthly_salary: 20000,
      daily_salary: 666.67,
      is_active: true,
      notes: '',
      profile_photo_url: null,
    },
  });

  const salaryType = watch('salary_type');
  const monthlySalary = watch('monthly_salary');

  // Auto-calculate approximate daily salary when monthly changes
  useEffect(() => {
    if (salaryType === 'monthly' && monthlySalary > 0) {
      setValue('daily_salary', Math.round((monthlySalary / 30) * 100) / 100);
    }
  }, [monthlySalary, salaryType, setValue]);

  useEffect(() => {
    if (employeeToEdit) {
      reset({
        full_name: employeeToEdit.full_name,
        mobile_number: employeeToEdit.mobile_number,
        address: employeeToEdit.address || '',
        category: employeeToEdit.category,
        joining_date: employeeToEdit.joining_date,
        leaving_date: employeeToEdit.leaving_date || null,
        salary_type: employeeToEdit.salary_type,
        monthly_salary: employeeToEdit.monthly_salary,
        daily_salary: employeeToEdit.daily_salary,
        is_active: employeeToEdit.is_active,
        notes: employeeToEdit.notes || '',
        profile_photo_url: employeeToEdit.profile_photo_url || null,
      });
      setPhotoPreview(employeeToEdit.profile_photo_url || null);
    } else {
      reset({
        full_name: '',
        mobile_number: '',
        address: '',
        category: 'Driver',
        joining_date: new Date().toISOString().split('T')[0],
        leaving_date: null,
        salary_type: 'monthly',
        monthly_salary: 20000,
        daily_salary: 666.67,
        is_active: true,
        notes: '',
        profile_photo_url: null,
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  }, [employeeToEdit, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      let finalPhotoUrl = data.profile_photo_url;
      if (photoFile) {
        setIsUploading(true);
        const tempId = employeeToEdit?.id || 'new';
        const uploadedUrl = await uploadEmployeePhoto(photoFile, tempId);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
        }
      }

      await onSubmit({
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        address: data.address || null,
        category: data.category,
        joining_date: data.joining_date,
        leaving_date: data.leaving_date || null,
        salary_type: data.salary_type as SalaryType,
        monthly_salary: Number(data.monthly_salary),
        daily_salary: Number(data.daily_salary),
        is_active: data.is_active,
        notes: data.notes || null,
        profile_photo_url: finalPhotoUrl || photoPreview || null,
      });

      onClose();
    } catch (err) {
      console.error('Error saving employee:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? 'Edit Employee / Driver' : 'Add New Employee / Driver'}
      description="Enter permanent driver profile and salary details."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Profile Photo & Basic Header */}
        <div className="flex items-center gap-4 p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
          <div className="relative shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-300 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl border-2 border-purple-200">
                <User className="w-8 h-8" />
              </div>
            )}
            <label
              htmlFor="photo-upload"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-purple-600 text-white cursor-pointer hover:bg-purple-700 shadow-sm"
              title="Upload photo"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Driver Profile Photo</p>
            <p className="text-slate-500 mt-0.5">
              JPG or PNG. Upload from device or enter image URL below.
            </p>
          </div>
        </div>

        {/* Input fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kumar"
            leftIcon={<User className="w-4 h-4" />}
            required
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="Mobile Number"
            placeholder="e.g. +91 98765 43210"
            leftIcon={<Phone className="w-4 h-4" />}
            required
            error={errors.mobile_number?.message}
            {...register('mobile_number')}
          />

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Category / Vehicle Type <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                {...register('category')}
              >
                {settings.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p>
            )}
          </div>

          <Input
            label="Joining Date"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            required
            error={errors.joining_date?.message}
            {...register('joining_date')}
          />
        </div>

        {/* Salary Type & Amounts */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Salary Configuration
            </span>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  value="monthly"
                  className="text-purple-600 focus:ring-purple-500"
                  {...register('salary_type')}
                />
                <span>Monthly Salary</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  value="daily"
                  className="text-purple-600 focus:ring-purple-500"
                  {...register('salary_type')}
                />
                <span>Daily Wage</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {salaryType === 'monthly' ? (
              <>
                <Input
                  label="Monthly Salary (₹)"
                  type="number"
                  step="0.01"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  required
                  error={errors.monthly_salary?.message}
                  {...register('monthly_salary')}
                />
                <Input
                  label="Calculated Daily Rate (₹)"
                  type="number"
                  step="0.01"
                  helperText="Auto-computed: Monthly / Days"
                  {...register('daily_salary')}
                />
              </>
            ) : (
              <Input
                label="Daily Wage Rate (₹)"
                type="number"
                step="0.01"
                leftIcon={<DollarSign className="w-4 h-4" />}
                required
                error={errors.daily_salary?.message}
                {...register('daily_salary')}
              />
            )}
          </div>
        </div>

        {/* Address & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Residential Address"
            placeholder="House/Plot, City, State"
            leftIcon={<MapPin className="w-4 h-4" />}
            {...register('address')}
          />

          <Input
            label="Photo URL (Optional)"
            placeholder="https://..."
            helperText="Or use device upload icon above"
            {...register('profile_photo_url')}
          />
        </div>

        {/* Status & Leaving Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                {...register('is_active')}
              />
              <span>Active Employee Status</span>
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Deactivating preserves all past salary & attendance history permanently.
            </p>
          </div>

          <Input
            label="Leaving Date (If Inactive)"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            {...register('leaving_date')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Notes / Vehicle Assigned
          </label>
          <textarea
            rows={2}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Driving license number, vehicle registration number, route details..."
            {...register('notes')}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting || isUploading}>
            {employeeToEdit ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
