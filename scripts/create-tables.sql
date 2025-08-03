-- Create Field Offices table
CREATE TABLE field_offices (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admin Users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  field_office_id INTEGER REFERENCES field_offices(id),
  is_main_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Individual Registrations table
CREATE TABLE individual_registrations (
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
CREATE TABLE group_registrations (
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
CREATE TABLE group_participants (
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
('maguindanao', 'Maguindanao');

-- Insert Admin Users (passwords should be hashed in real implementation)
INSERT INTO admin_users (username, password_hash, field_office_id, is_main_admin) VALUES
('admin_cotabato', '$2b$10$example_hash', 1, FALSE),
('admin_sulu', '$2b$10$example_hash', 2, FALSE),
('admin_lanao', '$2b$10$example_hash', 3, FALSE),
('admin_tawi', '$2b$10$example_hash', 4, FALSE),
('main_admin', '$2b$10$example_hash', 5, TRUE);
