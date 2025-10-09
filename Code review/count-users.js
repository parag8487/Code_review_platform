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

async function countUsers() {
  try {
    console.log('Counting users in the database...');
    
    // Count the users
    const countResult = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const userCount = countResult.rows[0].user_count;
    
    console.log(`Total users in database: ${userCount}`);
    
    // List all users (without sensitive data)
    if (userCount > 0) {
      console.log('\nUser list:');
      const usersResult = await pool.query(
        'SELECT id, name, email, created_at FROM users ORDER BY created_at'
      );
      
      usersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Created: ${user.created_at}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error counting users:', error);
    await pool.end();
  }
}

countUsers();