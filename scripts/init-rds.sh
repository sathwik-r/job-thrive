# Database Setup Script
# Run this after RDS is created to initialize the database schema

#!/bin/bash

# Install PostgreSQL client if not already installed
# For Ubuntu/Debian: sudo apt-get install postgresql-client
# For macOS: brew install postgresql

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier job-thrive-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-south-1)

echo "Connecting to RDS at: $RDS_ENDPOINT"

# Create database (if it doesn't exist)
PGPASSWORD="YOUR_STRONG_PASSWORD" psql \
  -h $RDS_ENDPOINT \
  -U jobthrive \
  -d postgres \
  -c "CREATE DATABASE jobthrive;"

# Run Drizzle migrations
# You can either:
# 1. Run the migrations manually using drizzle-kit
# 2. Or copy the schema and run it directly

echo "Database 'jobthrive' created successfully!"
echo "Next steps:"
echo "1. Update your DATABASE_URL in SSM Parameter Store"
echo "2. Run 'npm run db:push' locally to apply schema"
echo "3. Or copy schema from shared/schema.ts and run manually"
