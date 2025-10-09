require('dotenv').config();

async function initDb() {
  try {
    const { default: initDatabase } = await import('./src/lib/init-db.ts');
    await initDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDb();