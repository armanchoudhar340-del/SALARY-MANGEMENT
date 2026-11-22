CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  vehicle_number TEXT NOT NULL,
  date DATE NOT NULL,
  start_km NUMERIC(12, 1) NOT NULL CHECK (start_km >= 0),
  end_km NUMERIC(12, 1) NOT NULL CHECK (end_km >= start_km),
  fuel_litres NUMERIC(10, 2) NOT NULL CHECK (fuel_litres > 0),
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle_date
  ON public.fuel_logs(vehicle_number, date DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_employee_date
  ON public.fuel_logs(employee_id, date DESC);

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fuel_logs'
      AND policyname = 'Admins have full access to fuel logs'
  ) THEN
    CREATE POLICY "Admins have full access to fuel logs"
      ON public.fuel_logs FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'fuel_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_logs;
  END IF;
END
$$;
