import fetch from 'node-fetch';

async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'hello' }]
            })
        });

        const text = await response.text();
        console.log('Response Status:', response.status);
        try {
            const data = JSON.parse(text);
            console.log('Response Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response Text (Not JSON):', text);
        }

        const testRes = await fetch('http://localhost:3001/api/test');
        console.log('Test Route Status:', testRes.status);
        console.log('Test Route Data:', await testRes.text());
    } catch (err) {
        console.error('Test Error:', err);
    }
}

test();
