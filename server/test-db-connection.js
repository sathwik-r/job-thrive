// test-db-connection.js - ES Module version
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'job-thrive-db.cj0w2kkqmq02.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'jobthrive',
  user: 'postgres',
  password: 'JobThrive2024!Strong', // Use your actual password
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔄 Connecting to database...');
    
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);
    
    // Test database exists
    const dbCheck = await client.query('SELECT current_database()');
    console.log('📋 Current database:', dbCheck.rows[0].current_database);
    
    // List existing tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log('📁 Existing tables:', tables.rows.length === 0 ? 'None (fresh database)' : tables.rows);
    
    client.release();
    console.log('🎉 Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Details:', {
      code: error.code,
      detail: error.detail || 'No additional details',
      hint: error.hint || 'No hints available'
    });
  } finally {
    await pool.end();
  }
}

testConnection()