import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatHandler from './api/chat.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Proxy the serverless handler
app.post('/api/chat', (req, res) => {
    chatHandler(req, res);
});

app.listen(port, () => {
    console.log(`Local API Server running on port ${port}`);
});
