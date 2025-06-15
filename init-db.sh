#!/bin/bash

echo "🚀 Creating EGXpilot database tables and data..."

# Function to execute SQL file
execute_sql_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    if [ -f "$file_path" ]; then
        echo "📄 Executing: $file_name"
        docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P curhi6-qEbfid -d egxpilot_dev -C < "$file_path"
        
        if [ $? -eq 0 ]; then
            echo "✅ Completed: $file_name"
        else
            echo "❌ Failed: $file_name"
            exit 1
        fi
    else
        echo "⚠️ File not found: $file_path"
    fi
}

# Execute files in order
echo "1️⃣ Creating database tables..."
execute_sql_file "database/schema/01_create_tables.sql"

echo "2️⃣ Creating stored procedures..."
execute_sql_file "database/procedures/01_common_procedures.sql"

echo "3️⃣ Loading stocks data..."
execute_sql_file "database/seeds/01_stocks_data.sql"

echo "🎉 Database initialization completed successfully!"

# Verify setup
echo "📊 Verification:"
docker exec -i sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P curhi6-qEbfid -d egxpilot_dev -C -Q "
SELECT 
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as TableCount,
    (SELECT COUNT(*) FROM Stocks WHERE IsActive = 1) as StockCount,
    (SELECT COUNT(*) FROM Users) as UserCount
"
