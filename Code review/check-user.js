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

async function checkUser(email) {
  try {
    console.log(`Checking if user exists with email: ${email}`);
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('User not found in database');
    } else {
      const user = userResult.rows[0];
      console.log('User found:');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password hash exists: ${!!user.password_hash}`);
      
      // Check if password hash is empty
      if (!user.password_hash) {
        console.log('Password hash is empty - user should not be able to log in');
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error checking user:', error);
    await pool.end();
  }
}

// Check the specified user
checkUser('23102077@apsit.edu.in');