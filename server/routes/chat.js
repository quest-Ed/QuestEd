// const express = require('express');
// const router = express.Router();
// const axios = require('axios'); 
// // You can also import any other dependencies or services you need, 
// // like a service that handles communication with the Google AI API

// router.ws('/chat', (ws, req) => {
//     console.log('WebSocket client connected.');

//     ws.send('Hello, how can I help you today?');
//     ws.on('message', async (msg) => {
//         try {
//             // Set up the URL for the Gemini API
//             const url = 'https://api.gemini.ai.dev/v1/chat/stream';
//             const headers = {
//                 'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
//                 'Content-Type': 'application/json'
//             };

//             // Set up the streaming request
//             const response = await axios({
//                 method: 'post',
//                 url: url,
//                 headers: headers,
//                 data: {
//                     prompt: msg, // your chat message or prompt
//                     max_tokens: 50, // customize as needed
//                 },
//                 responseType: 'stream'
//             });

//             // Stream the response back to the client
//             response.data.on('data', (chunk) => {
//                 const chunkText = chunk.toString();
//                 console.log(chunkText);
//                 ws.send(chunkText);
//             });

//         } catch (error) {
//             console.error('Error communicating with Gemini API:', error);
//             ws.send('Error processing your request.');
//         }
//     });

//     ws.on('close', () => {
//         console.log('WebSocket connection closed');
//     });
// });

// module.exports = router;
require('dotenv').config();
const { GoogleGenerativeAI, HarmCategory,
    HarmBlockThreshold, } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = "gemini-1.0-pro";

const { Router } = require('express');
const axios = require('axios');
console.log('Using API Key:', process.env.GOOGLE_API_KEY);
module.exports = (io) => {
    const router = Router();

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('send_message', async (message) => {
            console.log(`Received message: ${message}`);
            await sendMessageToGemini(socket, message);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    async function sendMessageToGemini(socket, message) {
        try {
            // Initialize the generative model
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            const safetySettings = [
                {
                  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
              ];

              const parts = [
                {text: "Act as an expert learning assistant called 'Questy' who has years of experience in helping people with any questions."}
              ];


            const chat = model.startChat({ contents: [{ role: "user", parts }],
                generationConfig: {
                  maxOutputTokens: 500,
                }, safetySettings,
              });
            
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();
    
            console.log('Received response:', text);
            socket.emit('receive_message', text);  // Send the response back to the client
    
        } catch (error) {
            console.error('Error communicating with Gemini API:', error);
            socket.emit('error_message', 'Error processing your request.');
        }
    }
    

    return router;
};
