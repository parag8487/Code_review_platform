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

async function deleteUser(email) {
  try {
    console.log(`Processing user deletion for email: ${email}`);
    
    // First, get the user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      await pool.end();
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`Found user with ID: ${userId}`);
    
    // Delete all related data first (CASCADE should handle most of this)
    // Delete audit logs
    const auditDeleteResult = await pool.query(
      'DELETE FROM audit_log WHERE user_id = $1',
      [userId]
    );
    console.log(`Deleted ${auditDeleteResult.rowCount} audit log entries`);
    
    // Delete comments
    const commentsDeleteResult = await pool.query(
      'DELETE FROM comments WHERE author_id = $1',
      [userId]
    );
    console.log(`Deleted ${commentsDeleteResult.rowCount} comments`);
    
    // Delete review history
    const historyDeleteResult = await pool.query(
      'DELETE FROM review_history WHERE author_id = $1',
      [userId]
    );
    console.log(`Deleted ${historyDeleteResult.rowCount} review history entries`);
    
    // Delete reviews where this user is the author (this will CASCADE to comments and history)
    const reviewsDeleteResult = await pool.query(
      'DELETE FROM reviews WHERE author_id = $1',
      [userId]
    );
    console.log(`Deleted ${reviewsDeleteResult.rowCount} reviews`);
    
    // Finally, delete the user completely
    const deleteUserResult = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [userId]
    );
    
    if (deleteUserResult.rows.length > 0) {
      console.log('User deleted successfully:');
      console.log(deleteUserResult.rows[0]);
    } else {
      console.log('User not found');
    }
    
    await pool.end();
    console.log('User data deletion completed successfully!');
  } catch (error) {
    console.error('Error deleting user data:', error);
    await pool.end();
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || '23102077@apsit.edu.in';
deleteUser(email);