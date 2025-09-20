-- Create database and tables for South Amherst voter data
CREATE DATABASE IF NOT EXISTS redsaber_sunbelt_voters;
USE redsaber_sunbelt_voters;

-- Voters table
CREATE TABLE IF NOT EXISTS voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_main VARCHAR(20),
    phone_type ENUM('L', 'C') DEFAULT 'L',
    phone_2 VARCHAR(20),
    phone_3 VARCHAR(20),
    street_address VARCHAR(255),
    apt VARCHAR(50),
    city VARCHAR(100),
    county VARCHAR(100),
    state VARCHAR(10),
    zip_code VARCHAR(10),
    religion VARCHAR(100),
    
    -- Campaign tracking fields
    voter_status ENUM('Confirmed', 'Unconfirmed', 'Not Voter') DEFAULT 'Unconfirmed',
    voter_texted BOOLEAN DEFAULT FALSE,
    voter_mailed BOOLEAN DEFAULT FALSE,
    knocked_door BOOLEAN DEFAULT FALSE,
    voter_called BOOLEAN DEFAULT FALSE,
    left_pamphlet BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicates
    UNIQUE KEY unique_voter (first_name, last_name, street_address)
);

-- Indexes for better performance
CREATE INDEX idx_name ON voters (last_name, first_name);
CREATE INDEX idx_address ON voters (street_address);
CREATE INDEX idx_phone ON voters (phone_main);
CREATE INDEX idx_status ON voters (voter_status);
