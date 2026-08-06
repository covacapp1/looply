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
