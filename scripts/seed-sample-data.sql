-- Insert sample individual registrations for Funrun 2025
INSERT INTO individual_registrations (full_name, age, gender, contact_number, address, field_office_id, status) VALUES
('Maria Santos', 28, 'Female', '09123456789', 'Brgy. Poblacion, Cotabato City', 1, 'pending'),
('Juan Dela Cruz', 35, 'Male', '09987654321', 'Brgy. Tamontaka, General Santos City', 1, 'approved'),
('Ana Rodriguez', 24, 'Female', '09555123456', 'Brgy. Amas, Kidapawan City', 1, 'pending'),
('Pedro Gonzales', 42, 'Male', '09777888999', 'Brgy. Rosary Heights, Cotabato City', 1, 'approved'),
('Carmen Lopez', 31, 'Female', '09444555666', 'Brgy. Kalanganan, Cotabato City', 1, 'pending'),

('Ahmad Hassan', 29, 'Male', '09111222333', 'Brgy. Walled City, Jolo, Sulu', 2, 'pending'),
('Fatima Abdullah', 26, 'Female', '09333444555', 'Brgy. Tulay, Jolo, Sulu', 2, 'approved'),
('Omar Malik', 38, 'Male', '09666777888', 'Brgy. Chinese Pier, Jolo, Sulu', 2, 'pending'),

('Aminah Maranao', 33, 'Female', '09222333444', 'Brgy. Poblacion, Marawi City', 3, 'approved'),
('Hassan Ali', 27, 'Male', '09555666777', 'Brgy. East Basak, Malabang, Lanao del Sur', 3, 'pending'),

('Nur Tausug', 30, 'Female', '09888999000', 'Brgy. Poblacion, Bongao, Tawi-Tawi', 4, 'pending'),
('Jalal Sama', 25, 'Male', '09000111222', 'Brgy. Lamion, Bongao, Tawi-Tawi', 4, 'approved'),

('Bai Maguindanao', 32, 'Female', '09333555777', 'Brgy. Poblacion, Shariff Aguak, Maguindanao', 5, 'pending'),
('Datu Pendatun', 45, 'Male', '09777999111', 'Brgy. Poblacion, Datu Odin Sinsuat, Maguindanao', 5, 'approved');

-- Insert sample group registrations for Funrun 2025
INSERT INTO group_registrations (agency_name, contact_number, field_office_id, participant_count, status) VALUES
('City Health Office - Cotabato', '09123456789', 1, 15, 'approved'),
('Department of Education - Cotabato', '09987654321', 1, 25, 'pending'),
('Barangay Officials Association - Sulu', '09555123456', 2, 12, 'approved'),
('Teachers Federation - Lanao', '09777888999', 3, 18, 'pending'),
('Youth Council - Tawi-Tawi', '09444555666', 4, 8, 'approved'),
('Municipal Employees - Maguindanao', '09111222333', 5, 22, 'pending');

-- Insert sample group participants for the first group registration
INSERT INTO group_participants (group_registration_id, full_name, age, gender) VALUES
(1, 'Dr. Jose Rizal', 35, 'Male'),
(1, 'Nurse Maria Clara', 28, 'Female'),
(1, 'Dr. Andres Bonifacio', 42, 'Male'),
(1, 'Nurse Gabriela Silang', 31, 'Female'),
(1, 'Dr. Emilio Jacinto', 29, 'Male'),
(1, 'Nurse Melchora Aquino', 45, 'Female'),
(1, 'Dr. Antonio Luna', 38, 'Male'),
(1, 'Nurse Gregoria de Jesus', 33, 'Female'),
(1, 'Dr. Marcelo del Pilar', 40, 'Male'),
(1, 'Nurse Trinidad Tecson', 36, 'Female'),
(1, 'Dr. Graciano Lopez Jaena', 32, 'Male'),
(1, 'Nurse Josefa Llanes Escoda', 39, 'Female'),
(1, 'Dr. Mariano Ponce', 34, 'Male'),
(1, 'Nurse Corazon Santos', 30, 'Female'),
(1, 'Dr. Manuel Quezon', 37, 'Male');

-- Insert participants for second group registration
INSERT INTO group_participants (group_registration_id, full_name, age, gender) VALUES
(2, 'Teacher Anna Reyes', 29, 'Female'),
(2, 'Principal Roberto Cruz', 45, 'Male'),
(2, 'Teacher Carmen Flores', 32, 'Female'),
(2, 'Teacher Miguel Torres', 38, 'Male'),
(2, 'Teacher Sofia Mendoza', 27, 'Female'),
(2, 'Teacher Carlos Villanueva', 41, 'Male'),
(2, 'Teacher Elena Pascual', 35, 'Female'),
(2, 'Teacher Ramon Gutierrez', 39, 'Male'),
(2, 'Teacher Luz Hernandez', 33, 'Female'),
(2, 'Teacher Antonio Morales', 44, 'Male'),
(2, 'Teacher Rosa Jimenez', 28, 'Female'),
(2, 'Teacher Fernando Castillo', 36, 'Male'),
(2, 'Teacher Gloria Ramos', 31, 'Female'),
(2, 'Teacher Eduardo Vargas', 43, 'Male'),
(2, 'Teacher Patricia Aguilar', 26, 'Female'),
(2, 'Teacher Ricardo Medina', 40, 'Male'),
(2, 'Teacher Esperanza Ortiz', 34, 'Female'),
(2, 'Teacher Alejandro Ruiz', 37, 'Male'),
(2, 'Teacher Dolores Perez', 30, 'Female'),
(2, 'Teacher Francisco Gomez', 42, 'Male'),
(2, 'Teacher Remedios Silva', 29, 'Female'),
(2, 'Teacher Joaquin Rivera', 46, 'Male'),
(2, 'Teacher Concepcion Diaz', 33, 'Female'),
(2, 'Teacher Esteban Moreno', 38, 'Male'),
(2, 'Teacher Pilar Romero', 35, 'Female');
