const Database = require('./database');

async function setupDatabase() {
  try {
    console.log('Setting up database for production...');
    const db = new Database();
    await db.initialize();
    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();