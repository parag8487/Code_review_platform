import { Pool, Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function initDatabase() {
  console.log('Attempting to connect to PostgreSQL...');
  
  // Database connection configuration
  const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  };
  
  let adminClient = null;
  
  try {
    // Connect to PostgreSQL server
    adminClient = new Client(dbConfig);
    await adminClient.connect();
    console.log('Connected to PostgreSQL server successfully');
    
    // Check if database exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'code_review_platform'"
    );
    
    if (dbCheckResult.rows.length === 0) {
      // Create database
      await adminClient.query('CREATE DATABASE code_review_platform');
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
    
    await adminClient.end();
    
    // Now connect to the specific database
    const poolConfig = {
      ...dbConfig,
      database: 'code_review_platform'
    };
    
    const pool = new Pool(poolConfig);
    const client = await pool.connect();
    
    try {
      // Enable UUID extension
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
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
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
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
      await client.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
          author_id UUID REFERENCES users(id),
          text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create review_history table
      await client.query(`
        CREATE TABLE IF NOT EXISTS review_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
          code TEXT NOT NULL,
          author_id UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create audit_log table
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          action VARCHAR(255) NOT NULL,
          details TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes for better performance
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
      
      console.log('Database tables created successfully');
      
      // Insert demo user if not exists
      const demoUserResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['demo@example.com']
      );
      
      if (demoUserResult.rows.length === 0) {
        // Hash the password
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
        console.log('Demo user created successfully with ID:', insertResult.rows[0].id);
      } else {
        console.log('Demo user already exists');
      }
      
      await pool.end();
      console.log('Database initialization completed successfully!');
    } catch (err) {
      console.error('Error creating database tables:', err);
      await pool.end();
    }
  } catch (err) {
    console.error('Error during database setup:', err);
    if (adminClient) {
      await adminClient.end().catch(() => {});
    }
  }
}

// Run the initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export default initDatabase;