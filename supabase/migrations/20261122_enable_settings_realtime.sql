-- Keep company and payroll settings current across open browsers.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'salary_settings'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.salary_settings;
  END IF;
END $$;
