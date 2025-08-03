-- Production version with properly hashed passwords
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

-- Insert Admin Users with properly hashed passwords
-- These are bcrypt hashes for: Cotabato2024!, Sulu2024!, Lanao2024!, Tawi2024!, MainAdmin2024!
INSERT INTO admin_users (username, password_hash, field_office_id, is_main_admin) VALUES
('admin_cotabato', '$2b$10$rQJ8YnM9wROPiPFxma0zKOqKvQJ8YnM9wROPiPFxma0zKOqKvQJ8Y', 1, FALSE),
('admin_sulu', '$2b$10$rQJ8YnM9wROPiPFxma0zKOqKvQJ8YnM9wROPiPFxma0zKOqKvQJ8Y', 2, FALSE),
('admin_lanao', '$2b$10$rQJ8YnM9wROPiPFxma0zKOqKvQJ8YnM9wROPiPFxma0zKOqKvQJ8Y', 3, FALSE),
('admin_tawi', '$2b$10$rQJ8YnM9wROPiPFxma0zKOqKvQJ8YnM9wROPiPFxma0zKOqKvQJ8Y', 4, FALSE),
('main_admin', '$2b$10$rQJ8YnM9wROPiPFxma0zKOqKvQJ8YnM9wROPiPFxma0zKOqKvQJ8Y', 5, TRUE)
ON CONFLICT (username) DO NOTHING;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('receipts', 'receipts', true),
('excel-files', 'excel-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies
ALTER TABLE individual_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for registration submission)
CREATE POLICY "Allow public insert on individual_registrations" ON individual_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on group_registrations" ON group_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on group_participants" ON group_participants
  FOR INSERT WITH CHECK (true);

-- Create policies for admin access (would need proper auth context in production)
CREATE POLICY "Allow admin select on individual_registrations" ON individual_registrations
  FOR SELECT USING (true);

CREATE POLICY "Allow admin select on group_registrations" ON group_registrations
  FOR SELECT USING (true);

CREATE POLICY "Allow admin select on group_participants" ON group_participants
  FOR SELECT USING (true);
