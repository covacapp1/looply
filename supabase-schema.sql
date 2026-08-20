-- Schema for LOOPLY - Supabase
-- Run this in Supabase SQL Editor

-- Tabla de premios de fidelidad
CREATE TABLE loyalty_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL DEFAULT '1',
  name TEXT NOT NULL,
  description TEXT,
  stamps_required INTEGER NOT NULL DEFAULT 6,
  stamp_action TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL DEFAULT '1',
  loyalty_reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country_code TEXT DEFAULT '+54',
  stamps INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de sellos
CREATE TABLE stamp_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  loyalty_reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
  stamps_added INTEGER NOT NULL,
  total_stamps INTEGER NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_history ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (para desarrollo, cambiar en producción)
CREATE POLICY "Allow all operations" ON loyalty_rewards FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON stamp_history FOR ALL USING (true);

-- Índices para búsquedas rápidas
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_loyalty_reward ON customers(loyalty_reward_id);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_loyalty_rewards_business ON loyalty_rewards(business_id);
CREATE INDEX idx_stamp_history_customer ON stamp_history(customer_id);

-- Bucket de Storage para imágenes de tarjetas de fidelidad
-- Ejecutar esto en el SQL Editor de Supabase o crear el bucket manualmente desde Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('stamp-cards', 'stamp-cards', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el bucket stamp-cards
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'stamp-cards');

CREATE POLICY "Allow authenticated insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'stamp-cards');

CREATE POLICY "Allow authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'stamp-cards');

CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'stamp-cards');

-- Tabla de configuración del negocio
CREATE TABLE business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  slug TEXT DEFAULT '',
  description TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  country TEXT DEFAULT '',
  website TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can read own settings" ON business_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON business_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON business_settings
  FOR UPDATE USING (auth.uid() = user_id);
