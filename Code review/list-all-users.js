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

// Mock database users (from the source code)
const mockUsers = [
  {
    id: "1",
    name: "demo_user",
    email: "demo@example.com",
    password: "password123",
    fullName: "Demo User",
    phone: "123-456-7890",
    bio: "This is a bio. It can be a short or long description about the user.",
    avatarUrl: "https://github.com/shadcn.png"
  }
];

async function listAllUsers() {
  try {
    console.log('=== Real Database Users ===');
    const userResult = await pool.query(
      'SELECT id, name, email FROM users ORDER BY id'
    );
    
    if (userResult.rows.length === 0) {
      console.log('No users found in real database');
    } else {
      userResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }
    
    console.log('\n=== Mock Database Users ===');
    if (mockUsers.length === 0) {
      console.log('No users found in mock database');
    } else {
      mockUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error listing users:', error);
    await pool.end();
  }
}

listAllUsers();