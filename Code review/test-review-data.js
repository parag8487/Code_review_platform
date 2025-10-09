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

async function testReviewData() {
  try {
    // Get all reviews to see what data we have
    const reviewsResult = await pool.query('SELECT * FROM reviews');
    console.log('All reviews:', reviewsResult.rows);
    
    // Get a specific review if there is one
    if (reviewsResult.rows.length > 0) {
      const reviewId = reviewsResult.rows[0].id;
      console.log(`\nDetails for review ${reviewId}:`);
      console.log(reviewsResult.rows[0]);
      
      // Get review history for this review
      const historyResult = await pool.query('SELECT * FROM review_history WHERE review_id = $1', [reviewId]);
      console.log(`\nHistory for review ${reviewId}:`, historyResult.rows);
    }
    
    // Get all users
    const usersResult = await pool.query('SELECT * FROM users');
    console.log('\nAll users:', usersResult.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testReviewData();