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

async function testSaveFlow() {
  try {
    const reviewId = '88d7d3c0-37d1-4c90-a81a-7c670b50c308';
    
    console.log('=== TESTING SAVE FLOW ===');
    
    // 1. Get current review state
    console.log('1. Getting current review state...');
    const currentReviewResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    const currentReview = currentReviewResult.rows[0];
    console.log('Current review:', {
      id: currentReview.id,
      current_code: currentReview.current_code,
      baseline_time_complexity: currentReview.baseline_time_complexity,
      baseline_space_complexity: currentReview.baseline_space_complexity,
      baseline_loc: currentReview.baseline_loc,
      version: currentReview.version
    });
    
    // 2. Simulate analysis results (what AI would return)
    console.log('\n2. Simulating analysis results...');
    const analysisResult = {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      loc: 4
    };
    console.log('Analysis result:', analysisResult);
    
    // 3. Check if we should perform validation (has saved code and baseline metrics)
    console.log('\n3. Checking if validation should be performed...');
    const hasSavedCode = currentReview.current_code && currentReview.current_code.trim() !== "";
    const hasBaselineMetrics = currentReview.baseline_time_complexity && 
                              currentReview.baseline_space_complexity && 
                              currentReview.baseline_loc !== null && 
                              currentReview.baseline_loc !== undefined;
    
    console.log('Has saved code:', hasSavedCode);
    console.log('Has baseline metrics:', hasBaselineMetrics);
    
    if (hasSavedCode && hasBaselineMetrics) {
      console.log('Should perform validation/comparison');
      
      // 4. Perform comparison (what isNewCodeAcceptable would do)
      console.log('\n4. Performing comparison...');
      const savedMetrics = {
        time: currentReview.baseline_time_complexity,
        space: currentReview.baseline_space_complexity,
        loc: currentReview.baseline_loc
      };
      
      const newMetrics = {
        time: analysisResult.timeComplexity,
        space: analysisResult.spaceComplexity,
        loc: analysisResult.loc
      };
      
      console.log('Saved metrics:', savedMetrics);
      console.log('New metrics:', newMetrics);
      
      // Simple comparison logic (Time Complexity > Space Complexity > Lines of Code)
      // Lower is better
      const complexityRank = {
        'o(1)': 0,
        'o(log n)': 1,
        'o(n)': 2,
        'o(n log n)': 3,
        'o(n^2)': 4,
        'o(n^3)': 5,
        'o(2^n)': 6,
        'o(n!)': 7,
      };
      
      const savedTimeRank = complexityRank[savedMetrics.time.toLowerCase()] ?? Infinity;
      const newTimeRank = complexityRank[newMetrics.time.toLowerCase()] ?? Infinity;
      
      console.log(`Time complexity comparison: saved=${savedMetrics.time} (rank ${savedTimeRank}) vs new=${newMetrics.time} (rank ${newTimeRank})`);
      
      if (newTimeRank > savedTimeRank) {
        console.log('RESULT: Save rejected - Time complexity is worse');
      } else if (newTimeRank < savedTimeRank) {
        console.log('RESULT: Save allowed - Time complexity is better');
      } else {
        console.log('Time complexity is the same, checking space complexity...');
        
        const savedSpaceRank = complexityRank[savedMetrics.space.toLowerCase()] ?? Infinity;
        const newSpaceRank = complexityRank[newMetrics.space.toLowerCase()] ?? Infinity;
        
        console.log(`Space complexity comparison: saved=${savedMetrics.space} (rank ${savedSpaceRank}) vs new=${newMetrics.space} (rank ${newSpaceRank})`);
        
        if (newSpaceRank > savedSpaceRank) {
          console.log('RESULT: Save rejected - Space complexity is worse');
        } else if (newSpaceRank < savedSpaceRank) {
          console.log('RESULT: Save allowed - Space complexity is better');
        } else {
          console.log('Space complexity is the same, checking LOC...');
          
          console.log(`LOC comparison: saved=${savedMetrics.loc} vs new=${newMetrics.loc}`);
          
          if (newMetrics.loc > savedMetrics.loc) {
            console.log('RESULT: Save rejected - Lines of code increased');
          } else {
            console.log('RESULT: Save allowed - Metrics are equal or better');
          }
        }
      }
    } else {
      console.log('Would skip validation (initial save or missing baseline metrics)');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

testSaveFlow();