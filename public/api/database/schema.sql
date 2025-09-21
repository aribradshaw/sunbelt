-- Create database and tables for South Amherst voter data
CREATE DATABASE IF NOT EXISTS redsaber_sunbelt_voters;
USE redsaber_sunbelt_voters;

-- Voters table - dynamic structure to handle CSV columns
CREATE TABLE IF NOT EXISTS voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- SAMHERST.csv columns (all as VARCHAR to handle dynamic data)
    LASTN VARCHAR(100),
    FIRSTN VARCHAR(100),
    MIDDLEN VARCHAR(100),
    PREFIXN VARCHAR(100),
    SUFFIXN VARCHAR(100),
    STNUM VARCHAR(20),
    STDIR VARCHAR(10),
    STNAME VARCHAR(255),
    APT VARCHAR(50),
    CITY VARCHAR(100),
    ZIP VARCHAR(10),
    MADDR1 VARCHAR(255),
    MADDR2 VARCHAR(255),
    MCITY VARCHAR(100),
    MSTATE VARCHAR(10),
    MZIP VARCHAR(10),
    REGDATE VARCHAR(50),
    BIRTHYEAR VARCHAR(10),
    PARTYAFFIL VARCHAR(50),
    LASTVOTE VARCHAR(50),
    `2025 MAY` VARCHAR(10),
    `2024` VARCHAR(10),
    `2023` VARCHAR(10),
    `2022` VARCHAR(10),
    `2021` VARCHAR(10),
    `2020` VARCHAR(10),
    `2019` VARCHAR(10),
    `2018` VARCHAR(10),
    `2017` VARCHAR(10),
    `2016` VARCHAR(10),
    `2015` VARCHAR(10),
    `2014` VARCHAR(10),
    `2013` VARCHAR(10),
    `2012` VARCHAR(10),
    `2011` VARCHAR(10),
    `2010` VARCHAR(10),
    `Knocked Door` VARCHAR(10),
    `Voter Status` VARCHAR(50),
    `Voter Called` VARCHAR(10),
    `Voter Texted` VARCHAR(10),
    `Left Pamphlet` VARCHAR(10),
    `Voter Mailed` VARCHAR(10),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_name ON voters (last_name, first_name);
CREATE INDEX idx_address ON voters (street_address);
CREATE INDEX idx_phone ON voters (phone_main);
CREATE INDEX idx_status ON voters (voter_status);
