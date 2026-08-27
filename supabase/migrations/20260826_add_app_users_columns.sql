ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email text DEFAULT '';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE app_users SET email = 'covacapp1@gmail.com' WHERE id = '43b6b231-5228-4aa9-a052-524f6c3b5766';
