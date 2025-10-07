#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config();

// Database configuration - reads from environment variables
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    ...(process.env.MYSQL_PORT && { port: parseInt(process.env.MYSQL_PORT) }),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10'),
    multipleStatements: true
};

async function runMigrations() {
    let connection;

    try {
        console.log('🚀 Starting database migrations...');

        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Get all migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql') && !file.startsWith('._'))
            .sort(); // This ensures they run in order (000_, 001_, etc.)

        console.log(`📁 Found ${migrationFiles.length} migration files`);

        // Ensure migrations table exists first
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_filename (filename)
                )
            `);
        } catch (error) {
            console.log('⚠️  Could not create migrations table:', error.message);
        }

        for (const filename of migrationFiles) {
            // Check if migration has already been applied
            const [rows] = await connection.execute(
                'SELECT filename FROM migrations WHERE filename = ? LIMIT 1',
                [filename]
            );

            if (rows.length > 0) {
                console.log(`⏭️  Skipping ${filename} (already applied)`);
                continue;
            }

            // Read and execute migration
            const migrationPath = path.join(migrationsDir, filename);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            console.log(`🔄 Running migration: ${filename}`);

            // Execute the migration (use query() to support multiple statements)
            await connection.query(migrationSQL);

            // Record that migration was applied
            await connection.execute(
                'INSERT INTO migrations (filename) VALUES (?)',
                [filename]
            );

            console.log(`✅ Applied migration: ${filename}`);
        }

        console.log('🎉 All migrations completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run migrations
runMigrations();