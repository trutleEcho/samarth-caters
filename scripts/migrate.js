const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Read and execute the initial schema migration
    const migrationPath = path.join(__dirname, '../src/lib/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon but handle dollar-quoted strings properly
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    
    const lines = migrationSQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      // Check for start of dollar-quoted string
      if (!inDollarQuote && trimmedLine.includes('$$')) {
        const parts = trimmedLine.split('$$');
        if (parts.length >= 2) {
          inDollarQuote = true;
          dollarTag = '$$';
          currentStatement += line + '\n';
          continue;
        }
      }
      
      // Check for end of dollar-quoted string
      if (inDollarQuote && trimmedLine.includes(dollarTag)) {
        currentStatement += line + '\n';
        inDollarQuote = false;
        dollarTag = '';
        continue;
      }
      
      // Add line to current statement
      currentStatement += line + '\n';
      
      // Check for statement end (semicolon not in dollar-quoted string)
      if (!inDollarQuote && trimmedLine.endsWith(';')) {
        const statement = currentStatement.trim();
        if (statement) {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await sql.query(statement);
        } catch (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }
    
    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runMigrations };