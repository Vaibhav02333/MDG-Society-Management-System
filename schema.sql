-- ============================================================================
-- MDG — Modern Digital Governance Society Management System
-- MySQL 8.0 Complete Database Schema
-- Database Name: mdg_society_management_db
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `mdg_society_management_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `mdg_society_management_db`;

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION TABLE
-- Roles: ADMIN, RESIDENT, SECURITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(60) NOT NULL UNIQUE,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `role` ENUM('ADMIN', 'RESIDENT', 'SECURITY') NOT NULL DEFAULT 'RESIDENT',
    `flat_number` VARCHAR(20) NULL,
    `wing` VARCHAR(10) NULL,
    `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_role` (`role`),
    INDEX `idx_user_flat` (`flat_number`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. SOCIETY FLATS TABLE (All 48 Flats across Wings A, B, C)
-- Statuses: Owner-Occupied, Tenant-Occupied, Vacant, Under Process
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `flats` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `flat_number` VARCHAR(20) NOT NULL UNIQUE,
    `wing` ENUM('A', 'B', 'C') NOT NULL,
    `floor` INT NOT NULL,
    `bhk` ENUM('1BHK', '2BHK', '3BHK') NOT NULL,
    `area_sq_ft` INT NOT NULL,
    `occupancy_status` ENUM('Owner-Occupied', 'Tenant-Occupied', 'Vacant', 'Under Process') NOT NULL DEFAULT 'Vacant',
    `current_owner_name` VARCHAR(120) NULL,
    `current_owner_phone` VARCHAR(20) NULL,
    `current_owner_email` VARCHAR(120) NULL,
    `purchase_date` DATE NULL,
    `purchase_amount` DECIMAL(12, 2) NULL,
    `monthly_maintenance` DECIMAL(10, 2) NOT NULL DEFAULT 4200.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_flat_wing` (`wing`),
    INDEX `idx_flat_occupancy` (`occupancy_status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. OWNERSHIP PURCHASE & TRANSFER HISTORY TABLE
-- Retains permanent historical record of all ownership transfers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ownership_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `flat_id` INT NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `wing` VARCHAR(10) NOT NULL,
    `buyer_name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `address` TEXT NOT NULL,
    `purchase_amount` DECIMAL(12, 2) NOT NULL,
    `purchase_date` DATE NOT NULL,
    `previous_owner_name` VARCHAR(120) NULL,
    `transfer_date` DATE NOT NULL,
    `remarks` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_ownership_flat` FOREIGN KEY (`flat_id`) REFERENCES `flats` (`id`) ON DELETE RESTRICT,
    INDEX `idx_history_flat` (`flat_number`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. RESIDENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `residents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `flat_id` INT NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `wing` VARCHAR(10) NOT NULL,
    `full_name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `resident_type` ENUM('Owner', 'Tenant') NOT NULL DEFAULT 'Owner',
    `move_in_date` DATE NOT NULL,
    `emergency_contact_name` VARCHAR(120) NULL,
    `emergency_contact_phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_resident_flat` FOREIGN KEY (`flat_id`) REFERENCES `flats` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_resident_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_resident_flat` (`flat_number`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. FAMILY MEMBERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `family_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` INT NOT NULL,
    `full_name` VARCHAR(120) NOT NULL,
    `relation` ENUM('Spouse', 'Child', 'Parent', 'Sibling', 'Other') NOT NULL,
    `age` INT NOT NULL,
    `phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_family_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. MAINTENANCE BILLING & PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `maintenance_bills` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `flat_id` INT NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `wing` VARCHAR(10) NOT NULL,
    `resident_name` VARCHAR(120) NOT NULL,
    `billing_month` VARCHAR(30) NOT NULL, -- e.g. "April 2025"
    `amount` DECIMAL(10, 2) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
    `paid_date` DATE NULL,
    `payment_mode` ENUM('UPI', 'NetBanking', 'Card', 'Cheque', 'Cash') NULL,
    `transaction_ref` VARCHAR(100) NULL,
    `receipt_number` VARCHAR(50) NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bill_flat` FOREIGN KEY (`flat_id`) REFERENCES `flats` (`id`) ON DELETE CASCADE,
    INDEX `idx_bill_status` (`status`),
    INDEX `idx_bill_month` (`billing_month`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. GYM PLANS & MEMBERSHIPS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gym_plans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `duration_months` INT NOT NULL,
    `fee` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `gym_memberships` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` INT NOT NULL,
    `resident_name` VARCHAR(120) NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `plan_id` INT NOT NULL,
    `plan_name` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `expiry_date` DATE NOT NULL,
    `fee_paid` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Active', 'Expired', 'Cancelled') NOT NULL DEFAULT 'Active',
    `payment_status` ENUM('Paid', 'Pending') NOT NULL DEFAULT 'Paid',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_gym_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gym_plan` FOREIGN KEY (`plan_id`) REFERENCES `gym_plans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. FACILITIES & BOOKINGS TABLE (Prevents overlapping time slots)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facilities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NOT NULL,
    `capacity` INT NOT NULL,
    `hourly_rate` DECIMAL(10, 2) NOT NULL,
    `timings` VARCHAR(60) NOT NULL,
    `rules` TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `facility_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `facility_id` INT NOT NULL,
    `facility_name` VARCHAR(120) NOT NULL,
    `resident_id` INT NOT NULL,
    `resident_name` VARCHAR(120) NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `booking_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `purpose` VARCHAR(255) NOT NULL,
    `status` ENUM('Confirmed', 'Pending', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_booking_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_booking_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
    INDEX `idx_booking_overlap` (`facility_id`, `booking_date`, `start_time`, `end_time`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. VISITORS & VERIFIABLE QR PASS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visitors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `visitor_name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `host_flat_number` VARCHAR(20) NOT NULL,
    `host_resident_name` VARCHAR(120) NOT NULL,
    `purpose` VARCHAR(255) NOT NULL,
    `vehicle_number` VARCHAR(50) NULL,
    `entry_time` DATETIME NULL,
    `exit_time` DATETIME NULL,
    `status` ENUM('Expected', 'Checked-In', 'Checked-Out', 'Denied') NOT NULL DEFAULT 'Expected',
    `qr_pass_code` VARCHAR(80) NOT NULL UNIQUE,
    `visit_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_qr_pass` (`qr_pass_code`),
    INDEX `idx_visitor_flat` (`host_flat_number`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. PARKING SLOTS & VEHICLE ALLOCATION TABLE
-- Prevents duplicate slot allocation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parking_slots` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slot_number` VARCHAR(30) NOT NULL UNIQUE,
    `wing` ENUM('A', 'B', 'C') NOT NULL,
    `floor_level` VARCHAR(40) NOT NULL DEFAULT 'Basement 1',
    `is_allocated` TINYINT(1) NOT NULL DEFAULT 0,
    `allocated_flat_number` VARCHAR(20) NULL,
    `allocated_resident_name` VARCHAR(120) NULL,
    `vehicle_number` VARCHAR(50) NULL,
    `vehicle_type` ENUM('4-Wheeler', '2-Wheeler', 'EV 4-Wheeler') NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 11. COMPLAINT & SERVICE REQUESTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `category` ENUM('Plumbing', 'Electrical', 'Carpentry', 'Security', 'Cleanliness', 'Elevator', 'Other') NOT NULL,
    `description` TEXT NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `resident_name` VARCHAR(120) NOT NULL,
    `resident_phone` VARCHAR(20) NOT NULL,
    `priority` ENUM('Low', 'Medium', 'High', 'Emergency') NOT NULL DEFAULT 'Medium',
    `status` ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
    `assigned_staff` VARCHAR(120) NULL,
    `deadline` DATE NULL,
    `admin_response` TEXT NULL,
    `resolved_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_complaint_status` (`status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 12. PARCELS MANAGEMENT TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parcels` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `recipient_name` VARCHAR(120) NOT NULL,
    `flat_number` VARCHAR(20) NOT NULL,
    `courier_company` VARCHAR(100) NOT NULL,
    `tracking_number` VARCHAR(100) NULL,
    `received_at` VARCHAR(60) NOT NULL,
    `status` ENUM('Pending Collection', 'Collected') NOT NULL DEFAULT 'Pending Collection',
    `collected_at` VARCHAR(60) NULL,
    `collected_by` VARCHAR(120) NULL,
    `security_staff_name` VARCHAR(120) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 13. EVENTS & POLLS TABLE (Single vote restriction)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `event_date` DATE NOT NULL,
    `event_time` VARCHAR(30) NOT NULL,
    `location` VARCHAR(120) NOT NULL,
    `category` ENUM('Cultural', 'Festival', 'Meeting', 'Health', 'Sports') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `polls` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `question` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `total_votes` INT NOT NULL DEFAULT 0,
    `end_date` DATE NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `poll_options` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `poll_id` INT NOT NULL,
    `option_text` VARCHAR(255) NOT NULL,
    `votes_count` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_poll_option` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `poll_votes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `poll_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `option_id` INT NOT NULL,
    `voted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_user_poll_vote` (`poll_id`, `user_id`),
    CONSTRAINT `fk_vote_poll` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vote_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vote_option` FOREIGN KEY (`option_id`) REFERENCES `poll_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 14. NOTICES & NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `category` ENUM('Urgent', 'General', 'Maintenance', 'Security') NOT NULL DEFAULT 'General',
    `published_by` VARCHAR(120) NOT NULL DEFAULT 'Management Committee',
    `published_date` DATE NOT NULL,
    `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `target_role` VARCHAR(30) NULL,
    `target_flat` VARCHAR(20) NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 15. EXPENSES & FINANCIAL REPORTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category` ENUM('Security Staff', 'Electricity & Water', 'Gardening & Housekeeping', 'Elevator AMC', 'Repairs', 'Events', 'Administrative') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `description` TEXT NOT NULL,
    `vendor_name` VARCHAR(120) NOT NULL,
    `payment_mode` ENUM('Bank Transfer', 'Cheque', 'UPI') NOT NULL DEFAULT 'Bank Transfer',
    `invoice_number` VARCHAR(80) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 16. SECURE DOCUMENT VAULT TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `file_size` VARCHAR(30) NOT NULL DEFAULT '2.5 MB',
    `allowed_roles` VARCHAR(100) NOT NULL DEFAULT 'ADMIN,RESIDENT',
    `upload_date` DATE NOT NULL,
    `file_path` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 17. SYSTEM ACTIVITY & AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `action` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `details` TEXT NOT NULL,
    `performed_by` VARCHAR(120) NOT NULL,
    `role` VARCHAR(30) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DATA INSERTIONS (Wings A, B, C; All 48 Flats; Demo Accounts)
-- Password for all accounts: admin123 / resident123 (pbkdf2:sha256 hash)
-- ============================================================================

-- Insert Demo Users
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `role`, `flat_number`, `wing`, `is_approved`)
VALUES
(1, 'admin', 'admin@mdgsociety.in', 'pbkdf2:sha256:260000$MDG$c8f7470f1a662762', 'Admin', '+91 98765 43210', 'ADMIN', NULL, NULL, 1),
(2, 'rahul_sharma', 'rahul.sharma@example.com', 'pbkdf2:sha256:260000$MDG$c8f7470f1a662762', 'Rahul Sharma', '+91 98451 12345', 'RESIDENT', 'A-101', 'A', 1),
(3, 'sneha_patel', 'sneha.patel@example.com', 'pbkdf2:sha256:260000$MDG$c8f7470f1a662762', 'Sneha Patel', '+91 97321 44556', 'RESIDENT', 'B-203', 'B', 1),
(4, 'security_head', 'gate1.security@mdgsociety.in', 'pbkdf2:sha256:260000$MDG$c8f7470f1a662762', 'Vikram Singh', '+91 99123 77889', 'SECURITY', NULL, NULL, 1)
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- Insert 48 Flats across Wing A, B, C (Floors 1-4, 4 Flats each)
INSERT INTO `flats` (`flat_number`, `wing`, `floor`, `bhk`, `area_sq_ft`, `occupancy_status`, `current_owner_name`, `current_owner_phone`, `current_owner_email`, `purchase_date`, `purchase_amount`, `monthly_maintenance`) VALUES
('A-101', 'A', 1, '1BHK', 680, 'Owner-Occupied', 'Rahul Sharma', '+91 98451 12345', 'rahul.sharma@example.com', '2023-01-10', 4600000.00, 2500.00),
('A-102', 'A', 1, '2BHK', 1150, 'Owner-Occupied', 'Prakash Kulkarni', '+91 98451 22334', 'prakash.k@example.com', '2023-01-15', 7800000.00, 4200.00),
('A-103', 'A', 1, '2BHK', 1150, 'Owner-Occupied', 'Suresh Iyer', '+91 98451 33445', 'suresh.iyer@example.com', '2023-02-01', 7850000.00, 4200.00),
('A-104', 'A', 1, '3BHK', 1580, 'Owner-Occupied', 'Kavita Menon', '+91 98451 44556', 'kavita.m@example.com', '2023-02-15', 10500000.00, 5800.00),
('A-201', 'A', 2, '1BHK', 680, 'Owner-Occupied', 'Rohit Kumar', '+91 98112 33445', 'rohit.kumar@example.com', '2023-02-10', 4650000.00, 2500.00),
('A-202', 'A', 2, '2BHK', 1150, 'Tenant-Occupied', 'Gaurav Aggarwal', '+91 98112 44556', 'gaurav.a@example.com', '2023-03-01', 7900000.00, 4200.00),
('A-203', 'A', 2, '2BHK', 1150, 'Owner-Occupied', 'Naveen Rao', '+91 98112 55667', 'naveen.r@example.com', '2023-03-10', 7900000.00, 4200.00),
('A-204', 'A', 2, '3BHK', 1580, 'Owner-Occupied', 'Alok Verma', '+91 98112 66778', 'alok.verma@example.com', '2023-03-15', 10600000.00, 5800.00),
('A-301', 'A', 3, '1BHK', 680, 'Owner-Occupied', 'Deepak Jain', '+91 98220 11223', 'deepak.j@example.com', '2023-04-01', 4700000.00, 2500.00),
('A-302', 'A', 3, '2BHK', 1150, 'Owner-Occupied', 'Meera Nair', '+91 98220 22334', 'meera.n@example.com', '2023-04-10', 7950000.00, 4200.00),
('A-303', 'A', 3, '2BHK', 1150, 'Tenant-Occupied', 'Vikram Sengupta', '+91 98220 33445', 'vikram.s@example.com', '2023-04-15', 7950000.00, 4200.00),
('A-304', 'A', 3, '3BHK', 1580, 'Owner-Occupied', 'Arun Swaminathan', '+91 98220 44556', 'arun.s@example.com', '2023-05-01', 10700000.00, 5800.00),
('A-401', 'A', 4, '1BHK', 680, 'Owner-Occupied', 'Priya Nambiar', '+91 98450 12099', 'priya.n@example.com', '2023-05-10', 4750000.00, 2500.00),
('A-402', 'A', 4, '2BHK', 1150, 'Owner-Occupied', 'Sunil Mittal', '+91 98450 22334', 'sunil.m@example.com', '2023-05-15', 8000000.00, 4200.00),
('A-403', 'A', 4, '2BHK', 1150, 'Owner-Occupied', 'Vinod Pillai', '+91 98450 33445', 'vinod.p@example.com', '2023-06-01', 8000000.00, 4200.00),
('A-404', 'A', 4, '3BHK', 1580, 'Owner-Occupied', 'Rajeshwari S', '+91 98450 44556', 'rajeshwari.s@example.com', '2023-06-15', 10800000.00, 5800.00),
('B-101', 'B', 1, '1BHK', 680, 'Owner-Occupied', 'Abhishek Bose', '+91 97320 11223', 'abhishek.b@example.com', '2023-01-20', 4600000.00, 2500.00),
('B-102', 'B', 1, '2BHK', 1150, 'Owner-Occupied', 'Pooja Hegde', '+91 97320 22334', 'pooja.h@example.com', '2023-02-05', 7800000.00, 4200.00),
('B-103', 'B', 1, '2BHK', 1150, 'Tenant-Occupied', 'Manish Pandey', '+91 97320 33445', 'manish.p@example.com', '2023-02-20', 7850000.00, 4200.00),
('B-104', 'B', 1, '3BHK', 1580, 'Owner-Occupied', 'Sanjay Dutt', '+91 97320 44556', 'sanjay.d@example.com', '2023-03-01', 10500000.00, 5800.00),
('B-201', 'B', 2, '1BHK', 680, 'Owner-Occupied', 'Rekha Murthy', '+91 97321 11223', 'rekha.m@example.com', '2023-03-15', 4650000.00, 2500.00),
('B-202', 'B', 2, '2BHK', 1150, 'Owner-Occupied', 'Chetan Bhagat', '+91 97321 22334', 'chetan.b@example.com', '2023-04-01', 7900000.00, 4200.00),
('B-203', 'B', 2, '2BHK', 1150, 'Tenant-Occupied', 'Sneha Patel', '+91 97321 44556', 'sneha.patel@example.com', '2023-03-22', 7600000.00, 4200.00),
('B-204', 'B', 2, '3BHK', 1580, 'Owner-Occupied', 'Shyam Sundar', '+91 97321 55667', 'shyam.s@example.com', '2023-04-20', 10600000.00, 5800.00),
('B-301', 'B', 3, '1BHK', 680, 'Vacant', 'MDG Society Assets', '+91 98765 43210', 'admin@mdgsociety.in', NULL, NULL, 2500.00),
('B-302', 'B', 3, '2BHK', 1150, 'Owner-Occupied', 'Harish Kalyan', '+91 97440 22334', 'harish.k@example.com', '2023-05-10', 7950000.00, 4200.00),
('B-303', 'B', 3, '2BHK', 1150, 'Owner-Occupied', 'Divya Spandana', '+91 97440 33445', 'divya.s@example.com', '2023-05-25', 7950000.00, 4200.00),
('B-304', 'B', 3, '3BHK', 1580, 'Owner-Occupied', 'Raghavendra Joshi', '+91 97440 44556', 'raghav.j@example.com', '2023-06-05', 10700000.00, 5800.00),
('B-401', 'B', 4, '1BHK', 680, 'Owner-Occupied', 'Anupama Parameswaran', '+91 97441 11223', 'anupama.p@example.com', '2023-06-20', 4750000.00, 2500.00),
('B-402', 'B', 4, '2BHK', 1150, 'Owner-Occupied', 'Siddharth Rao', '+91 97441 22334', 'siddharth.r@example.com', '2023-07-01', 8000000.00, 4200.00),
('B-403', 'B', 4, '2BHK', 1150, 'Tenant-Occupied', 'Pranitha Subhash', '+91 97441 33445', 'pranitha.s@example.com', '2023-07-15', 8000000.00, 4200.00),
('B-404', 'B', 4, '3BHK', 1580, 'Owner-Occupied', 'Girish Karnad', '+91 97441 44556', 'girish.k@example.com', '2023-08-01', 10800000.00, 5800.00),
('C-101', 'C', 1, '1BHK', 680, 'Owner-Occupied', 'Dr. Anita Roy', '+91 94330 66778', 'anita.roy@example.com', '2023-03-05', 4600000.00, 2500.00),
('C-102', 'C', 1, '2BHK', 1150, 'Owner-Occupied', 'Sourav Ganguly', '+91 94330 22334', 'sourav.g@example.com', '2023-03-15', 7800000.00, 4200.00),
('C-103', 'C', 1, '2BHK', 1150, 'Owner-Occupied', 'Pooja Sundaram', '+91 99001 22334', 'pooja.s@example.com', '2024-02-14', 9200000.00, 4200.00),
('C-104', 'C', 1, '3BHK', 1580, 'Owner-Occupied', 'Mithun Chakraborty', '+91 94330 44556', 'mithun.c@example.com', '2023-04-01', 10500000.00, 5800.00),
('C-201', 'C', 2, '1BHK', 680, 'Owner-Occupied', 'Rituparna Sengupta', '+91 94331 11223', 'rituparna.s@example.com', '2023-04-15', 4650000.00, 2500.00),
('C-202', 'C', 2, '2BHK', 1150, 'Owner-Occupied', 'Prosenjit Chatterjee', '+91 94331 22334', 'prosenjit.c@example.com', '2023-05-01', 7900000.00, 4200.00),
('C-203', 'C', 2, '2BHK', 1150, 'Tenant-Occupied', 'Subhashree Ganguly', '+91 94331 33445', 'subhashree.g@example.com', '2023-05-15', 7900000.00, 4200.00),
('C-204', 'C', 2, '3BHK', 1580, 'Owner-Occupied', 'Dev Adhikari', '+91 94331 44556', 'dev.a@example.com', '2023-06-01', 10600000.00, 5800.00),
('C-301', 'C', 3, '1BHK', 680, 'Owner-Occupied', 'Parambrata Chattopadhyay', '+91 94332 11223', 'parambrata.c@example.com', '2023-06-15', 4700000.00, 2500.00),
('C-302', 'C', 3, '2BHK', 1150, 'Owner-Occupied', 'Karthik Rao', '+91 98901 33445', 'karthik.rao@example.com', '2023-07-01', 7950000.00, 4200.00),
('C-303', 'C', 3, '2BHK', 1150, 'Vacant', 'MDG Society Assets', '+91 98765 43210', 'admin@mdgsociety.in', NULL, NULL, 4200.00),
('C-304', 'C', 3, '3BHK', 1580, 'Owner-Occupied', 'Anirban Bhattacharya', '+91 94332 44556', 'anirban.b@example.com', '2023-07-20', 10700000.00, 5800.00),
('C-401', 'C', 4, '1BHK', 680, 'Owner-Occupied', 'Jisshu Sengupta', '+91 94333 11223', 'jisshu.s@example.com', '2023-08-01', 4750000.00, 2500.00),
('C-402', 'C', 4, '2BHK', 1150, 'Tenant-Occupied', 'Koel Mallick', '+91 94333 22334', 'koel.m@example.com', '2023-08-15', 8000000.00, 4200.00),
('C-403', 'C', 4, '2BHK', 1150, 'Owner-Occupied', 'Rukmini Maitra', '+91 94333 33445', 'rukmini.m@example.com', '2023-09-01', 8000000.00, 4200.00),
('C-404', 'C', 4, '3BHK', 1580, 'Owner-Occupied', 'Aparna Sen', '+91 94333 44556', 'aparna.s@example.com', '2023-09-15', 10800000.00, 5800.00)
ON DUPLICATE KEY UPDATE `area_sq_ft`=VALUES(`area_sq_ft`);

-- Seed Gym Plans
INSERT INTO `gym_plans` (`id`, `name`, `duration_months`, `fee`, `description`) VALUES
(1, 'Monthly Fitness Plan', 1, 1200.00, 'Full cardio and weight equipment access during morning and evening hours.'),
(2, 'Quarterly Wellness Plan', 3, 3200.00, 'Includes trainer assistance, locker access, and personal diet orientation.'),
(3, 'Annual Elite Membership', 12, 10000.00, 'All-inclusive 365 days access + priority sauna and guest pass perks.')
ON DUPLICATE KEY UPDATE `fee`=VALUES(`fee`);

-- Seed Facilities
INSERT INTO `facilities` (`id`, `name`, `description`, `capacity`, `hourly_rate`, `timings`, `rules`) VALUES
(1, 'Club House Banquet Hall', 'Air-conditioned multipurpose event hall with stage, AV projection, and banquet seating for up to 120 people.', 120, 1500.00, '09:00 AM - 10:00 PM', 'No loud music after 10:00 PM. Catering waste must be cleared by organizer.'),
(2, 'Community Open Amphitheatre', 'Open-air stepped amphitheatre for festivals, cultural performances, and evening gatherings.', 200, 800.00, '06:00 AM - 09:30 PM', 'Residents can book for non-commercial community celebrations.'),
(3, 'Swimming Pool & Deck', 'Semi-Olympic temperature-regulated swimming pool with toddler splash zone and poolside loungers.', 35, 300.00, '06:00 AM - 08:00 PM', 'Appropriate swimwear mandatory. Children under 12 must be accompanied by adults.'),
(4, 'Badminton & Squash Court', 'Indoor wooden maple flooring twin courts with LED tournament lighting.', 8, 200.00, '06:00 AM - 10:00 PM', 'Non-marking gum sole shoes mandatory. Max 2 slots per flat per week.')
-- Seed Initial Residents
INSERT INTO `residents` (`id`, `full_name`, `email`, `phone`, `flat_id`, `flat_number`, `wing`, `type`, `move_in_date`, `emergency_contact_name`, `emergency_contact_phone`, `status`) VALUES
(1, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98451 12345', 1, 'A-101', 'A', 'Owner', '2023-01-10', 'Priya Sharma (Spouse)', '+91 98451 99887', 'Active'),
(2, 'Prakash Kulkarni', 'prakash.k@example.com', '+91 98451 22334', 2, 'A-102', 'A', 'Owner', '2023-01-15', 'Sunita Kulkarni', '+91 98451 33441', 'Active'),
(3, 'Gaurav Aggarwal', 'gaurav.a@example.com', '+91 98112 44556', 6, 'A-202', 'A', 'Tenant', '2023-03-01', 'Anita Aggarwal', '+91 98112 99882', 'Active'),
(4, 'Sneha Patel', 'sneha.patel@example.com', '+91 97321 44556', 23, 'B-203', 'B', 'Tenant', '2023-03-22', 'Rohan Patel', '+91 97321 88990', 'Active'),
(5, 'Dr. Anita Roy', 'anita.roy@example.com', '+91 94330 66778', 33, 'C-101', 'C', 'Owner', '2023-03-05', 'Subhash Roy', '+91 94330 11229', 'Active')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- Seed Ownership History
INSERT INTO `ownership_history` (`id`, `flat_id`, `flat_number`, `wing`, `buyer_name`, `phone`, `email`, `address`, `purchase_amount`, `purchase_date`, `previous_owner_name`, `transfer_date`, `remarks`) VALUES
(1, 1, 'A-101', 'A', 'Rahul Sharma', '+91 98451 12345', 'rahul.sharma@example.com', 'Flat A-101, Green Valley Residency, Bengaluru', 4600000.00, '2023-01-10', 'Builder Allotment', '2023-01-10', 'First deed of conveyance registered with sub-registrar office.'),
(2, 2, 'A-102', 'A', 'Prakash Kulkarni', '+91 98451 22334', 'prakash.k@example.com', 'Flat A-102, Green Valley Residency, Bengaluru', 7800000.00, '2023-01-15', 'Builder Allotment', '2023-01-15', 'Standard sale agreement registered.'),
(3, 35, 'C-103', 'C', 'Pooja Sundaram', '+91 99001 22334', 'pooja.s@example.com', 'Flat C-103, Green Valley Residency, Bengaluru', 9200000.00, '2024-02-14', 'Ramesh Sundaram', '2024-02-14', 'Secondary sale and title deed transfer stamp registered.')
ON DUPLICATE KEY UPDATE `purchase_amount`=VALUES(`purchase_amount`);

-- Seed Maintenance Bills
INSERT INTO `maintenance_bills` (`id`, `flat_number`, `resident_name`, `billing_month`, `amount`, `due_date`, `status`, `paid_date`, `payment_mode`, `receipt_number`) VALUES
(1, 'A-101', 'Rahul Sharma', 'April 2025', 2500.00, '2025-04-10', 'Paid', '2025-04-05', 'UPI', 'MDG-REC-2025-0001'),
(2, 'A-102', 'Prakash Kulkarni', 'April 2025', 4200.00, '2025-04-10', 'Paid', '2025-04-08', 'NetBanking', 'MDG-REC-2025-0002'),
(3, 'A-202', 'Gaurav Aggarwal', 'April 2025', 4200.00, '2025-04-10', 'Pending', NULL, NULL, NULL),
(4, 'B-203', 'Sneha Patel', 'April 2025', 4200.00, '2025-04-10', 'Paid', '2025-04-09', 'UPI', 'MDG-REC-2025-0003'),
(5, 'C-101', 'Dr. Anita Roy', 'April 2025', 2500.00, '2025-04-10', 'Paid', '2025-04-06', 'Card', 'MDG-REC-2025-0004'),
(6, 'A-101', 'Rahul Sharma', 'May 2025', 2500.00, '2025-05-10', 'Pending', NULL, NULL, NULL),
(7, 'A-102', 'Prakash Kulkarni', 'May 2025', 4200.00, '2025-05-10', 'Pending', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE `amount`=VALUES(`amount`);

-- Seed Parking Slots (24 slots across Wings A, B, C)
INSERT INTO `parking_slots` (`id`, `slot_number`, `wing`, `floor_level`, `slot_type`, `is_allocated`, `allocated_flat_number`, `allocated_resident_name`, `vehicle_number`, `vehicle_type`) VALUES
(1, 'P-A01', 'A', 'Ground', 'Covered', 1, 'A-101', 'Rahul Sharma', 'KA-01-AB-1234', 'Car'),
(2, 'P-A02', 'A', 'Ground', 'Covered', 1, 'A-102', 'Prakash Kulkarni', 'KA-01-MJ-5678', 'Car'),
(3, 'P-A03', 'A', 'Ground', 'Covered', 0, NULL, NULL, NULL, 'Car'),
(4, 'P-A04', 'A', 'Ground', 'Open', 1, 'A-101', 'Rahul Sharma', 'KA-01-EE-9012', 'Bike'),
(5, 'P-A05', 'A', 'Ground', 'Open', 0, NULL, NULL, NULL, 'Car'),
(6, 'P-A06', 'A', 'Ground', 'Covered', 0, NULL, NULL, NULL, 'Car'),
(7, 'P-B01', 'B', 'Ground', 'Covered', 1, 'B-203', 'Sneha Patel', 'KA-03-CD-3456', 'Car'),
(8, 'P-B02', 'B', 'Ground', 'Covered', 0, NULL, NULL, NULL, 'Car'),
(9, 'P-B03', 'B', 'Ground', 'Covered', 0, NULL, NULL, NULL, 'Car'),
(10, 'P-B04', 'B', 'Ground', 'Open', 0, NULL, NULL, NULL, 'Bike'),
(11, 'P-C01', 'C', 'Ground', 'Covered', 1, 'C-101', 'Dr. Anita Roy', 'KA-05-XY-7890', 'Car'),
(12, 'P-C02', 'C', 'Ground', 'Covered', 0, NULL, NULL, NULL, 'Car')
ON DUPLICATE KEY UPDATE `slot_type`=VALUES(`slot_type`);

-- Seed Complaints
INSERT INTO `complaints` (`id`, `title`, `description`, `category`, `flat_number`, `resident_name`, `priority`, `status`, `assigned_staff`, `deadline`, `admin_response`) VALUES
(1, 'Water leakage in master bathroom ceiling', 'Slight dripping noticed along false ceiling junction near exhaust pipe.', 'Plumbing', 'A-101', 'Rahul Sharma', 'High', 'In Progress', 'Suresh Plumber', '2025-05-02', 'Technician dispatched to inspect overhead shaft.'),
(2, 'Elevator 2 door jerk while closing', 'The elevator door makes a grinding sound on Floor 3.', 'Elevator', 'B-203', 'Sneha Patel', 'Emergency', 'Pending', 'Otis AMC Technician', '2025-05-01', 'AMC vendor notified under critical service ticket.'),
(3, 'Common corridor light fixture blinking', 'Corridor light near flat C-102 flickers continuously at night.', 'Electrical', 'C-101', 'Dr. Anita Roy', 'Medium', 'Resolved', 'Mahesh Electrician', '2025-04-20', 'Bulb and ballast replaced with new Philips LED.')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Seed Visitors
INSERT INTO `visitors` (`id`, `visitor_name`, `phone`, `host_flat_number`, `host_resident_name`, `purpose`, `status`, `qr_pass_code`, `vehicle_number`, `visit_date`, `check_in_time`, `check_out_time`, `entry_gate`) VALUES
(1, 'Amitabh Sengupta', '+91 98450 99881', 'A-101', 'Rahul Sharma', 'Family Friend', 'Checked-In', 'MDG-PASS-A101-4412', 'KA-04-ZZ-1122', CURDATE(), '10:15 AM', NULL, 'Gate 1 Main Entry'),
(2, 'Swiggy Delivery Partner', '+91 97410 55443', 'B-203', 'Sneha Patel', 'Food Delivery', 'Checked-Out', 'MDG-PASS-B203-1109', 'KA-01-EK-4321', CURDATE(), '11:30 AM', '11:42 AM', 'Gate 1 Main Entry'),
(3, 'Dr. Venkat Raman', '+91 98800 22119', 'C-101', 'Dr. Anita Roy', 'Medical Consultation', 'Expected', 'MDG-PASS-C101-8877', NULL, CURDATE(), NULL, NULL, 'Gate 1 Main Entry')
ON DUPLICATE KEY UPDATE `visitor_name`=VALUES(`visitor_name`);

-- Seed Parcels
INSERT INTO `parcels` (`id`, `recipient_name`, `flat_number`, `courier_company`, `tracking_number`, `received_at`, `status`, `collected_at`, `collected_by`, `security_staff_name`) VALUES
(1, 'Rahul Sharma', 'A-101', 'Amazon Prime', 'AMZ-IN-889123', 'Today 09:30 AM', 'Pending Collection', NULL, NULL, 'Vikram Singh (Gate 1)'),
(2, 'Sneha Patel', 'B-203', 'Blue Dart', 'BD-445566778', 'Today 10:45 AM', 'Pending Collection', NULL, NULL, 'Vikram Singh (Gate 1)'),
(3, 'Dr. Anita Roy', 'C-101', 'DTDC Express', 'DTDC-990011', 'Yesterday 04:15 PM', 'Collected', 'Yesterday 06:30 PM', 'Dr. Anita Roy', 'Vikram Singh (Gate 1)')
ON DUPLICATE KEY UPDATE `recipient_name`=VALUES(`recipient_name`);

-- Seed Events & Polls
INSERT INTO `events` (`id`, `title`, `description`, `event_date`, `event_time`, `location`, `category`) VALUES
(1, 'Annual General Body Meeting (AGM 2025)', 'Discussion of annual audited accounts, society election results, and solar rooftop panel installation approval.', '2025-05-18', '10:30 AM', 'Club House Banquet Hall', 'Meeting'),
(2, 'World Environment Day Tree Plantation', 'Community tree sapling planting drive along perimeter wall and herbal garden zone.', '2025-06-05', '08:00 AM', 'Community Open Amphitheatre', 'Cultural'),
(3, 'Society Badminton Tournament', 'Singles and doubles inter-wing tournament across Junior and Senior brackets.', '2025-06-14', '09:00 AM', 'Indoor Badminton Courts', 'Sports')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

INSERT INTO `polls` (`id`, `question`, `description`, `total_votes`, `end_date`, `is_active`) VALUES
(1, 'Should we install 50KW Solar Rooftop Panels to reduce common electricity bills?', 'Capital investment ₹18 Lakhs with estimated 3-year payback period and 60% reduction in corridor bills.', 34, '2025-05-25', 1)
ON DUPLICATE KEY UPDATE `question`=VALUES(`question`);

INSERT INTO `poll_options` (`id`, `poll_id`, `option_text`, `votes_count`) VALUES
(1, 1, 'Yes, strongly approve solar rooftop project', 28),
(2, 1, 'No, prefer current grid electricity', 4),
(3, 1, 'Need more financial breakdown first', 2)
ON DUPLICATE KEY UPDATE `option_text`=VALUES(`option_text`);

-- Seed Notices
INSERT INTO `notices` (`id`, `title`, `content`, `category`, `published_by`, `published_date`, `is_pinned`) VALUES
(1, 'Water Tank Overhead Cleaning Schedule - May 3rd', 'Notice to all residents: Wing A and Wing B overhead tanks will undergo annual disinfection on Saturday from 9 AM to 2 PM. Please store adequate drinking water.', 'Maintenance', 'Secretary, MDG Society', '2025-04-28', 1),
(2, 'EV Charging Station Policy & Bay Regulations', 'EV charging slots in Basement Level 1 are now energized. Residents must register vehicles at office for smart RFID access tags.', 'General', 'Management Committee', '2025-04-25', 1),
(3, 'Security Gate QR Pass System Rollout', 'All visitor entries now require verified digital passes. Residents can generate instant guest passes from their resident portal.', 'Security', 'Chief Security Officer', '2025-04-20', 0)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Seed Expenses
INSERT INTO `expenses` (`id`, `category`, `amount`, `expense_date`, `description`, `vendor_name`, `payment_mode`, `invoice_number`) VALUES
(1, 'Security Staff', 85000.00, '2025-04-05', 'Monthly guard wages for 6 round-the-clock security personnel at Gates 1 and 2.', 'SIS Security Services Ltd', 'Bank Transfer', 'INV-SIS-2025-04'),
(2, 'Electricity & Water', 42800.00, '2025-04-08', 'BESCOM common area streetlights, booster pumps, and clubhouse electricity.', 'BESCOM Bengaluru', 'Bank Transfer', 'BESCOM-8821990'),
(3, 'Elevator AMC', 18500.00, '2025-04-12', 'Comprehensive quarterly AMC inspection and lubricant replacement for 4 lifts.', 'Otis Elevator India', 'Cheque', 'OTIS-BLR-44102'),
(4, 'Gardening & Housekeeping', 24000.00, '2025-04-15', 'Housekeeping consumables, waste garbage bags, and landscape maintenance.', 'GreenThumb Facilities', 'UPI', 'GT-APR-2025-18')
ON DUPLICATE KEY UPDATE `amount`=VALUES(`amount`);

-- Seed Activity Logs
INSERT INTO `activity_logs` (`id`, `action`, `category`, `details`, `performed_by`, `role`) VALUES
(1, 'Flat Purchase Registered', 'Ownership', 'Flat A-101 registered to Rahul Sharma for ₹ 4,600,000', 'Admin', 'ADMIN'),
(2, 'Monthly Maintenance Bills Generated', 'Payment', 'Generated 48 bills for billing cycle April 2025', 'Admin', 'ADMIN'),
(3, 'Maintenance Payment Recorded', 'Payment', 'Receipt MDG-REC-2025-0001 issued for Flat A-101', 'Rahul Sharma', 'RESIDENT'),
(4, 'Parking Slot Allocated', 'Ownership', 'Allocated Slot P-A01 to Flat A-101 (KA-01-AB-1234)', 'Admin', 'ADMIN'),
(5, 'Visitor QR Pass Issued', 'Visitor', 'Pass MDG-PASS-A101-4412 created for Amitabh Sengupta', 'Rahul Sharma', 'RESIDENT')
ON DUPLICATE KEY UPDATE `action`=VALUES(`action`);

-- ============================================================================
-- VERIFICATION QUERIES FOR COLLEGE PROJECT DEMONSTRATION & TESTING
-- ============================================================================
-- 1. Check all 48 Flats count by Wing:
-- SELECT wing, COUNT(*) AS total_flats, SUM(CASE WHEN occupancy_status='Owner-Occupied' THEN 1 ELSE 0 END) AS owner_occupied, SUM(CASE WHEN occupancy_status='Tenant-Occupied' THEN 1 ELSE 0 END) AS tenant_occupied, SUM(CASE WHEN occupancy_status='Vacant' THEN 1 ELSE 0 END) AS vacant FROM flats GROUP BY wing;
-- 2. Verify Maintenance Collection Rate:
-- SELECT status, COUNT(*) AS bill_count, SUM(amount) AS total_amount FROM maintenance_bills GROUP BY status;
-- 3. Check Overlap conflict detection logic:
-- SELECT * FROM facility_bookings WHERE facility_id=1 AND booking_date='2025-04-28' AND NOT (end_time <= '17:00:00' OR start_time >= '21:00:00');
-- 4. Verify Single Vote constraint in Polls:
-- SELECT poll_id, user_id, COUNT(*) FROM poll_votes GROUP BY poll_id, user_id HAVING COUNT(*) > 1; -- (Always returns 0 rows)
-- 5. Check Parking slot allocations:
-- SELECT wing, floor_level, COUNT(*) as total_slots, SUM(is_allocated) as occupied_slots FROM parking_slots GROUP BY wing, floor_level;
