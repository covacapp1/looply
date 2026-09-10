CREATE TABLE IF NOT EXISTS locales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE locales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants manage own locales" ON locales
  FOR ALL USING (auth.uid() = merchant_id);

CREATE INDEX idx_locales_merchant ON locales(merchant_id);

-- Add local_id to daily_registers
ALTER TABLE daily_registers ADD COLUMN IF NOT EXISTS local_id UUID REFERENCES locales(id) ON DELETE SET NULL;
