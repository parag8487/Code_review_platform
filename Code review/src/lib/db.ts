import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'code_review_platform',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.warn('Database connection warning:', err.message);
    console.warn('The application will use in-memory storage until database is properly configured.');
  } else {
    console.log('Database connected successfully');
  }
});

export { pool };