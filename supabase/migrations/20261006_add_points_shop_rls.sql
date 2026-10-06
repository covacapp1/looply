-- Puntos desde el shop (link de compra): accesos públicos mínimos

-- Flag para no otorgar dos veces los puntos de un mismo pedido
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN DEFAULT false;

-- El shop (anónimo) necesita leer la config de puntos para otorgarlos al comprar
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'points_settings_select_public' AND tablename = 'points_settings') THEN
    CREATE POLICY "points_settings_select_public" ON points_settings FOR SELECT USING (true);
  END IF;
END $$;

-- El shop necesita registrar el historial de puntos de cada compra
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'points_history_insert_public' AND tablename = 'points_history') THEN
    CREATE POLICY "points_history_insert_public" ON points_history FOR INSERT WITH CHECK (true);
  END IF;
END $$;
