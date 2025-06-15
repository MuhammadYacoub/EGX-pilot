-- Database Schema Initialization
-- Run this script to set up the complete EGXpilot database schema

-- Source the table creation script
:r .\01_create_tables.sql

-- Verify schema creation
SELECT 
    'Tables Created' as Status,
    COUNT(*) as Count
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

PRINT 'Schema initialization completed successfully!';