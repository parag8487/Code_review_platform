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

async function debugFullSaveProcess() {
  try {
    const reviewId = '88d7d3c0-37d1-4c90-a81a-7c670b50c308';
    
    console.log('=== STEP 1: GET CURRENT REVIEW STATE ===');
    const beforeResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    const review = beforeResult.rows[0];
    console.log('Review:', {
      id: review.id,
      current_code: review.current_code,
      baseline_time_complexity: review.baseline_time_complexity,
      baseline_space_complexity: review.baseline_space_complexity,
      baseline_loc: review.baseline_loc,
      version: review.version
    });
    
    console.log('\n=== STEP 2: SIMULATE ANALYSIS RESULTS ===');
    // Simulate what the AI analysis would return for the new code
    const newCode = 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)';
    console.log('New code to analyze:', newCode);
    
    // Simulated analysis results (what the AI would return)
    const analysisResult = {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      loc: 4
    };
    console.log('Analysis result:', analysisResult);
    
    console.log('\n=== STEP 3: CHECK IF COMPARISON SHOULD HAPPEN ===');
    const hasSavedCode = review.current_code && review.current_code.trim() !== "";
    const hasBaselineMetrics = review.baseline_time_complexity && 
                              review.baseline_space_complexity && 
                              review.baseline_loc !== null && 
                              review.baseline_loc !== undefined;
    
    console.log('Has saved code:', hasSavedCode);
    console.log('Has baseline metrics:', hasBaselineMetrics);
    
    if (hasSavedCode && hasBaselineMetrics) {
      console.log('Should perform comparison');
      // This is where the comparison would happen
    } else if (hasSavedCode && !hasBaselineMetrics) {
      console.log('Has saved code but no baseline metrics - THIS IS THE ISSUE!');
      console.log('This should not happen in a properly working system');
    } else {
      console.log('No saved code - initial analysis');
    }
    
    console.log('\n=== STEP 4: WHAT HAPPENS DURING SAVE ===');
    console.log('During save, the system should:');
    console.log('1. Update current_code');
    console.log('2. Update baseline metrics with analysis results');
    console.log('But it seems step 2 is not happening properly');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

debugFullSaveProcess();