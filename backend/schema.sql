CREATE DATABASE IF NOT EXISTS visitor_management;
USE visitor_management;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    designation VARCHAR(100),
    floor VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(200),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    photo_path VARCHAR(500),
    face_embedding LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id INT NOT NULL,
    employee_id INT NOT NULL,
    purpose VARCHAR(500),
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    duration_minutes INT NULL,
    badge_code VARCHAR(50) UNIQUE,
    status ENUM('checked_in', 'checked_out', 'cancelled') DEFAULT 'checked_in',
    floor VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_check_in ON visits(check_in_time);
CREATE INDEX idx_visits_visitor ON visits(visitor_id);
CREATE INDEX idx_visits_employee ON visits(employee_id);
CREATE INDEX idx_activity_timestamp ON activity_log(timestamp);
