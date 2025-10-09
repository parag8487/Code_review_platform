const { Pool, Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
};

async function migrateToIntegerIds() {
  console.log('Migrating database schema to use integer IDs...');
  
  let adminClient = null;
  
  try {
    // Connect to PostgreSQL server
    adminClient = new Client(dbConfig);
    await adminClient.connect();
    console.log('Connected to PostgreSQL server successfully');
    
    // Connect to the specific database
    const poolConfig = {
      ...dbConfig,
      database: 'code_review_platform'
    };
    
    const pool = new Pool(poolConfig);
    const client = await pool.connect();
    
    try {
      // Drop existing tables in the correct order to avoid foreign key constraints
      console.log('Dropping existing tables...');
      await client.query('DROP TABLE IF EXISTS audit_log CASCADE');
      await client.query('DROP TABLE IF EXISTS review_history CASCADE');
      await client.query('DROP TABLE IF EXISTS comments CASCADE');
      await client.query('DROP TABLE IF EXISTS reviews CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      
      // Create users table with serial ID
      console.log('Creating users table with integer IDs...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(50),
          bio TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create reviews table with serial ID
      console.log('Creating reviews table with integer IDs...');
      await client.query(`
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          language VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'In Progress',
          author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          issues INTEGER DEFAULT 0,
          current_code TEXT,
          baseline_time_complexity VARCHAR(100),
          baseline_space_complexity VARCHAR(100),
          baseline_loc INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create comments table with serial ID
      console.log('Creating comments table with integer IDs...');
      await client.query(`
        CREATE TABLE comments (
          id SERIAL PRIMARY KEY,
          review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
          author_id INTEGER REFERENCES users(id),
          text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create review_history table with serial ID
      console.log('Creating review_history table with integer IDs...');
      await client.query(`
        CREATE TABLE review_history (
          id SERIAL PRIMARY KEY,
          review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
          code TEXT NOT NULL,
          author_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create audit_log table with serial ID
      console.log('Creating audit_log table with integer IDs...');
      await client.query(`
        CREATE TABLE audit_log (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          action VARCHAR(255) NOT NULL,
          details TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes for better performance
      console.log('Creating indexes...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_reviews_author_id ON reviews(author_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_review_history_review_id ON review_history(review_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
      `);
      
      // Insert demo user
      console.log('Inserting demo user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const insertResult = await client.query(
        `INSERT INTO users (name, email, password_hash, full_name, phone, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          'demo_user',
          'demo@example.com',
          hashedPassword,
          'Demo User',
          '123-456-7890',
          'This is a bio. It can be a short or long description about the user.',
          'https://github.com/shadcn.png'
        ]
      );
      console.log('Demo user created with ID:', insertResult.rows[0].id);
      
      console.log('Database migration completed successfully!');
      await pool.end();
    } catch (err) {
      console.error('Error during migration:', err);
      await pool.end();
    }
  } catch (err) {
    console.error('Error connecting to database:', err);
    if (adminClient) {
      await adminClient.end().catch(() => {});
    }
  }
}

// Run the migration
migrateToIntegerIds();