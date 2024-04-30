const express = require('express');
const router = express.Router();
const axios = require('axios'); 
// You can also import any other dependencies or services you need, 
// like a service that handles communication with the Google AI API

router.ws('/chat', (ws, req) => {
    console.log('WebSocket client connected.');

    ws.send('Hello, how can I help you today?');
    ws.on('message', async (msg) => {
        try {
            // Set up the URL for the Gemini API
            const url = 'https://api.gemini.ai.dev/v1/chat/stream';
            const headers = {
                'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
                'Content-Type': 'application/json'
            };

            // Set up the streaming request
            const response = await axios({
                method: 'post',
                url: url,
                headers: headers,
                data: {
                    prompt: msg, // your chat message or prompt
                    max_tokens: 50, // customize as needed
                },
                responseType: 'stream'
            });

            // Stream the response back to the client
            response.data.on('data', (chunk) => {
                const chunkText = chunk.toString();
                console.log(chunkText);
                ws.send(chunkText);
            });

        } catch (error) {
            console.error('Error communicating with Gemini API:', error);
            ws.send('Error processing your request.');
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

module.exports = router;
