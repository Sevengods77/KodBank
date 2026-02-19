import pool from './db.js';
import fs from 'fs';

async function initDB() {
    try {
        const sql = fs.readFileSync('schema.sql', 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

        for (let statement of statements) {
            await pool.query(statement);
            console.log('Executed statement success');
        }

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
