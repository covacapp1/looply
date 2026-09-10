DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Merchants manage own locales' AND tablename = 'locales') THEN
    CREATE POLICY "Merchants manage own locales" ON locales FOR ALL USING (auth.uid() = merchant_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_locales_merchant ON locales(merchant_id);

ALTER TABLE daily_registers ADD COLUMN IF NOT EXISTS local_id UUID REFERENCES locales(id) ON DELETE SET NULL;
