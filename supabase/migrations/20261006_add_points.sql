-- Sistema de puntos (opcional) para clientes

-- Puntos en clientes del shop
ALTER TABLE shop_customers ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- Configuración del sistema de puntos por comercio
CREATE TABLE IF NOT EXISTS points_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  pesos_per_point INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE points_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Merchants manage own points_settings' AND tablename = 'points_settings') THEN
    CREATE POLICY "Merchants manage own points_settings" ON points_settings
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Historial de movimientos de puntos
CREATE TABLE IF NOT EXISTS points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES shop_customers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Merchants manage own points_history' AND tablename = 'points_history') THEN
    CREATE POLICY "Merchants manage own points_history" ON points_history
      FOR ALL USING (auth.uid() = merchant_id) WITH CHECK (auth.uid() = merchant_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_points_history_customer ON points_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_history_merchant ON points_history(merchant_id);
