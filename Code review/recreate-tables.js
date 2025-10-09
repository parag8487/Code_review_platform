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

async function recreateTables() {
  try {
    console.log('Recreating database tables with correct schema...');
    
    // Drop existing tables in proper order to respect foreign key constraints
    console.log('Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS audit_log CASCADE');
    await pool.query('DROP TABLE IF EXISTS review_history CASCADE');
    await pool.query('DROP TABLE IF EXISTS comments CASCADE');
    await pool.query('DROP TABLE IF EXISTS reviews CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('Creating tables with correct schema...');
    
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    
    // Create reviews table
    await pool.query(`
      CREATE TABLE reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        language VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'In Progress',
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        issues INTEGER DEFAULT 0,
        current_code TEXT,
        baseline_time_complexity VARCHAR(100),
        baseline_space_complexity VARCHAR(100),
        baseline_loc INTEGER,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create comments table
    await pool.query(`
      CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
        author_id UUID REFERENCES users(id),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create review_history table
    await pool.query(`
      CREATE TABLE review_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        author_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create audit_log table
    await pool.query(`
      CREATE TABLE audit_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX idx_reviews_author_id ON reviews(author_id);
    `);
    await pool.query(`
      CREATE INDEX idx_comments_review_id ON comments(review_id);
    `);
    await pool.query(`
      CREATE INDEX idx_comments_author_id ON comments(author_id);
    `);
    await pool.query(`
      CREATE INDEX idx_review_history_review_id ON review_history(review_id);
    `);
    await pool.query(`
      CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
    `);
    
    console.log('Database tables recreated successfully');
    
    // Insert demo user
    const hashedPassword = require('bcrypt').hashSync('password123', 10);
    const insertResult = await pool.query(
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
    console.log('Demo user created successfully with ID:', insertResult.rows[0].id);
    
    await pool.end();
    console.log('Database recreation completed successfully!');
  } catch (error) {
    console.error('Error recreating tables:', error);
    await pool.end();
  }
}

recreateTables();