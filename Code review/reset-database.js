const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'code_review_platform',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function resetDatabase() {
  try {
    console.log('Resetting database - deleting all users and related data...\n');
    
    // First, let's see what we're about to delete
    console.log('=== Current Database State ===');
    
    // Count users
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users: ${userCount.rows[0].count}`);
    
    // Count reviews
    const reviewCount = await pool.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`Reviews: ${reviewCount.rows[0].count}`);
    
    // Count comments
    const commentCount = await pool.query('SELECT COUNT(*) as count FROM comments');
    console.log(`Comments: ${commentCount.rows[0].count}`);
    
    // Count review history
    const historyCount = await pool.query('SELECT COUNT(*) as count FROM review_history');
    console.log(`Review History: ${historyCount.rows[0].count}`);
    
    // Count audit logs
    const auditCount = await pool.query('SELECT COUNT(*) as count FROM audit_log');
    console.log(`Audit Logs: ${auditCount.rows[0].count}`);
    
    console.log('\n=== Deleting All Data ===');
    
    // Delete in proper order to respect foreign key constraints
    // Delete audit logs first
    const auditDeleteResult = await pool.query('DELETE FROM audit_log');
    console.log(`Deleted ${auditDeleteResult.rowCount} audit log entries`);
    
    // Delete comments
    const commentsDeleteResult = await pool.query('DELETE FROM comments');
    console.log(`Deleted ${commentsDeleteResult.rowCount} comments`);
    
    // Delete review history
    const historyDeleteResult = await pool.query('DELETE FROM review_history');
    console.log(`Deleted ${historyDeleteResult.rowCount} review history entries`);
    
    // Delete reviews
    const reviewsDeleteResult = await pool.query('DELETE FROM reviews');
    console.log(`Deleted ${reviewsDeleteResult.rowCount} reviews`);
    
    // Finally, delete all users
    const usersDeleteResult = await pool.query('DELETE FROM users');
    console.log(`Deleted ${usersDeleteResult.rowCount} users`);
    
    console.log('\n=== Database After Reset ===');
    
    // Count users
    const userCountAfter = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users: ${userCountAfter.rows[0].count}`);
    
    // Count reviews
    const reviewCountAfter = await pool.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`Reviews: ${reviewCountAfter.rows[0].count}`);
    
    // Count comments
    const commentCountAfter = await pool.query('SELECT COUNT(*) as count FROM comments');
    console.log(`Comments: ${commentCountAfter.rows[0].count}`);
    
    // Count review history
    const historyCountAfter = await pool.query('SELECT COUNT(*) as count FROM review_history');
    console.log(`Review History: ${historyCountAfter.rows[0].count}`);
    
    // Count audit logs
    const auditCountAfter = await pool.query('SELECT COUNT(*) as count FROM audit_log');
    console.log(`Audit Logs: ${auditCountAfter.rows[0].count}`);
    
    await pool.end();
    console.log('\nDatabase reset completed successfully!');
    console.log('The database is now clean with no users or related data.');
  } catch (error) {
    console.error('Error resetting database:', error);
    await pool.end();
  }
}

resetDatabase();