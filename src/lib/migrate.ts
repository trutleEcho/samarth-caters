import { sql } from './database';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read and execute the initial schema migration
    const migrationPath = path.join(process.cwd(), 'src/lib/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
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
