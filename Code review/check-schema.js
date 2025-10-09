require('dotenv').config();
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'code_review_platform',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Check reviews table structure
    const reviewsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' 
      ORDER BY ordinal_position
    `);
    
    console.log('Reviews table columns:');
    reviewsResult.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable})`);
    });
    
    // Check review_history table structure
    const historyResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'review_history' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nReview_history table columns:');
    historyResult.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable})`);
    });
    
    // Check if version column exists in reviews table
    const versionCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'version'
    `);
    
    console.log(`\nVersion column exists in reviews table: ${versionCheck.rows[0].count > 0}`);
    
    // Test a simple query to see if we can access the version column
    try {
      const testQuery = await pool.query('SELECT version FROM reviews LIMIT 1');
      console.log('Successfully queried version column');
    } catch (error) {
      console.error('Error querying version column:', error.message);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error checking schema:', error);
    await pool.end();
  }
}

checkSchema();