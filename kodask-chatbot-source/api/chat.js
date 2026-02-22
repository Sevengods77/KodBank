import { OpenAI } from 'openai';

let client;

function getClient() {
    if (!client) {
        client = new OpenAI({
            baseURL: "https://router.huggingface.co/v1",
            apiKey: process.env.HF_TOKEN,
        });
    }
    return client;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const aiClient = getClient();

    try {
        const completion = await aiClient.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct:together",
            messages: [
                {
                    role: "system",
                    content: "You are Kodask AI, a premium banking assistant for Kodnest. You provide helpful, polite, and professional banking-related information. Your tone is sophisticated and trustworthy. Format your responses using markdown where appropriate."
                },
                ...messages
            ],
        });

        res.status(200).json({ message: completion.choices[0].message });
    } catch (error) {
        console.error('Full Error from Hugging Face API:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ error: 'Failed to fetch AI response', details: error.message });
    }
}
