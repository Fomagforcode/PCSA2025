-- Create Field Offices table
CREATE TABLE IF NOT EXISTS field_offices (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  field_office_id INTEGER REFERENCES field_offices(id),
  is_main_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Individual Registrations table
CREATE TABLE IF NOT EXISTS individual_registrations (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  field_office_id INTEGER REFERENCES field_offices(id),
  receipt_url VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);

-- Create Group Registrations table
CREATE TABLE IF NOT EXISTS group_registrations (
  id SERIAL PRIMARY KEY,
  agency_name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  field_office_id INTEGER REFERENCES field_offices(id),
  excel_file_url VARCHAR(255),
  receipt_url VARCHAR(255),
  participant_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);

-- Create Group Participants table (parsed from Excel)
CREATE TABLE IF NOT EXISTS group_participants (
  id SERIAL PRIMARY KEY,
  group_registration_id INTEGER REFERENCES group_registrations(id),
  full_name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Field Offices
INSERT INTO field_offices (code, name) VALUES
('cotabato', 'Cotabato City'),
('sulu', 'Sulu/Basilan'),
('lanao', 'Lanao Del Sur'),
('tawi', 'Tawi-Tawi'),
('maguindanao', 'Maguindanao')
ON CONFLICT (code) DO NOTHING;

-- Insert Admin Users with plain passwords for demo (use hashed passwords in production)
INSERT INTO admin_users (username, password_hash, field_office_id, is_main_admin) VALUES
('admin_cotabato', 'Cotabato2024!', 1, FALSE),
('admin_sulu', 'Sulu2024!', 2, FALSE),
('admin_lanao', 'Lanao2024!', 3, FALSE),
('admin_tawi', 'Tawi2024!', 4, FALSE),
('main_admin', 'MainAdmin2024!', 5, TRUE)
ON CONFLICT (username) DO NOTHING;

-- Disable RLS for tables to allow public access for demo
ALTER TABLE individual_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert on individual_registrations" ON individual_registrations;
DROP POLICY IF EXISTS "Allow public insert on group_registrations" ON group_registrations;
DROP POLICY IF EXISTS "Allow public insert on group_participants" ON group_participants;
DROP POLICY IF EXISTS "Allow admin select on individual_registrations" ON individual_registrations;
DROP POLICY IF EXISTS "Allow admin select on group_registrations" ON group_registrations;
DROP POLICY IF EXISTS "Allow admin select on group_participants" ON group_participants;
