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

async function debugSaveProcess() {
  try {
    const reviewId = '88d7d3c0-37d1-4c90-a81a-7c670b50c308';
    
    // Get the current review state before save
    console.log('=== BEFORE SAVE ===');
    const beforeResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    console.log('Review before save:', beforeResult.rows[0]);
    
    // Simulate what should happen during save
    console.log('\n=== SIMULATING SAVE PROCESS ===');
    
    // 1. Update code (what updateReviewCode does)
    const newCode = 'print("Hello World")';
    const updateCodeResult = await pool.query(
      'UPDATE reviews SET current_code = $1, updated_at = CURRENT_TIMESTAMP, version = version + 1 WHERE id = $2 AND version = $3 RETURNING *',
      [newCode, reviewId, beforeResult.rows[0].version]
    );
    console.log('Update code result:', updateCodeResult.rows[0]);
    
    // 2. Update metrics (what updateReviewMetrics does)
    const updateMetricsResult = await pool.query(
      'UPDATE reviews SET baseline_time_complexity = $1, baseline_space_complexity = $2, baseline_loc = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      ['O(1)', 'O(1)', 1, reviewId]
    );
    console.log('Update metrics result:', updateMetricsResult.rows[0]);
    
    // Get the final state
    console.log('\n=== AFTER SAVE ===');
    const afterResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    console.log('Review after save:', afterResult.rows[0]);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

debugSaveProcess();