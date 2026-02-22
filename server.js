import express from 'express';
import pool from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OpenAI } from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

let aiClient;
function getAiClient() {
    if (!aiClient) {
        aiClient = new OpenAI({
            baseURL: "https://router.huggingface.co/v1",
            apiKey: process.env.HF_TOKEN,
        });
    }
    return aiClient;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

// Register User
app.post('/api/register', async (req, res) => {
    const { uid, uname, password, email, phone, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO KodUser (uid, username, password, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [uid, uname, hashedPassword, email, phone, role || 'Customer']
        );
        res.status(201).json({ message: 'User registered successfully', uid: result.insertId });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM KodUser WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { sub: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const expairy = new Date(Date.now() + 3600000); // 1 hour from now
        await pool.query(
            'INSERT INTO UserToken (token, uid, expairy) VALUES (?, ?, ?)',
            [token, user.uid, expairy]
        );

        res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 });
        res.status(200).json({ message: 'Login successful', role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Check Balance
app.get('/api/balance', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.sub;
        const [users] = await pool.query('SELECT balance FROM KodUser WHERE username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ balance: users[0].balance });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
    console.log('Received AI chat request');
    const { messages } = req.body;
    console.log('Messages count:', messages ? messages.length : 'undefined');

    if (!messages) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    const client = getAiClient();

    try {
        const completion = await client.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct:together",
            messages: [
                {
                    role: "system",
                    content: "You are Kodask AI, a premium banking assistant for Kodnest. You provide helpful, polite, and professional banking-related information. Your tone is sophisticated and trustworthy. Format your responses using markdown where appropriate."
                },
                ...messages
            ],
        });

        console.log('AI responded successfully');
        res.status(200).json({ message: completion.choices[0].message });
    } catch (error) {
        console.error('AI Route Error:', error.message);
        if (error.response) {
            console.error('AI Response Error:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch AI response', details: error.message });
    }
});

app.get('/api/test', (req, res) => res.json({ status: 'ok', message: 'Server is reachable' }));

// Serve frontend files
app.get('/', (req, res) => res.sendFile(join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(join(__dirname, 'public', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(join(__dirname, 'public', 'dashboard.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
