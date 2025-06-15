-- Initial Database Setup Migration
-- EGXpilot System Database Creation and Configuration

USE [egxpilot_dev];
GO

-- Create system configuration table
CREATE TABLE SystemConfiguration (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ConfigKey NVARCHAR(100) NOT NULL UNIQUE,
    ConfigValue NVARCHAR(MAX) NOT NULL,
    DataType NVARCHAR(20) DEFAULT 'STRING' CHECK (DataType IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Insert default system configurations
INSERT INTO SystemConfiguration (ConfigKey, ConfigValue, DataType, Description) VALUES
('MARKET_HOURS_START', '09:30', 'STRING', 'EGX market opening time'),
('MARKET_HOURS_END', '14:30', 'STRING', 'EGX market closing time'),
('MIN_OPPORTUNITY_SCORE', '0.65', 'NUMBER', 'Minimum opportunity score threshold'),
('MAX_OPPORTUNITIES_PER_SCAN', '50', 'NUMBER', 'Maximum opportunities returned per scan'),
('DATA_COLLECTION_INTERVAL', '300', 'NUMBER', 'Data collection interval in seconds');
GO

PRINT 'Initial database setup completed successfully!';
GO