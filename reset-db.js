import pool from './db.js';

async function resetDB() {
    try {
        await pool.query('DROP TABLE IF EXISTS UserToken');
        await pool.query('DROP TABLE IF EXISTS KodUser');
        console.log('Tables dropped');

        const schema = `
CREATE TABLE IF NOT EXISTS KodUser (
    uid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 100000.00,
    phone VARCHAR(20),
    role ENUM('Customer', 'Manager', 'Admin') DEFAULT 'Customer'
);

CREATE TABLE IF NOT EXISTS UserToken (
    tid INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    uid INT,
    expairy DATETIME,
    FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
);
        `;

        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
        for (let statement of statements) {
            await pool.query(statement);
        }

        console.log('Database reset successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error resetting database:', err);
        process.exit(1);
    }
}

resetDB();
