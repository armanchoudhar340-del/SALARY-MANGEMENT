ALTER TABLE public.fuel_logs
  ADD COLUMN IF NOT EXISTS fuel_type TEXT
  CHECK (fuel_type IS NULL OR fuel_type IN ('petrol', 'diesel', 'cng'));
