DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Merchants manage own recipes' AND tablename = 'recipes') THEN
    CREATE POLICY "Merchants manage own recipes" ON recipes FOR ALL USING (auth.uid() = merchant_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recipes_merchant ON recipes(merchant_id);
