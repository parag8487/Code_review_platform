const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'code_review_platform',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function resetUserPassword(email, newPassword) {
  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`User with email ${email} not found.`);
      
      // Create the user since they don't exist
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const createUserResult = await pool.query(
        `INSERT INTO users (name, email, password_hash, full_name)
         VALUES ($1, $2, $3, $4) RETURNING id, name, email`,
        [
          'Parag Mohare', // name
          email, // email
          hashedPassword, // password_hash
          'Parag Mohare' // full_name
        ]
      );
      
      console.log('User created successfully:');
      console.log(createUserResult.rows[0]);
    } else {
      // User exists, update their password
      const user = userResult.rows[0];
      console.log('User found:', user);
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateResult = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, email',
        [hashedPassword, email]
      );
      
      console.log('Password updated successfully:');
      console.log(updateResult.rows[0]);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error resetting password:', error);
    await pool.end();
  }
}

// Run the function with the provided email and password
resetUserPassword('paragmohare049@gmail.com', 'parag@1111');