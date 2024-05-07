require('dotenv').config();
const { GoogleGenerativeAI, HarmCategory,
    HarmBlockThreshold, } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = "gemini-1.0-pro";

const { Router } = require('express');
console.log('Using API Key:', process.env.GOOGLE_API_KEY);
module.exports = (io) => {
    const router = Router();
    const sessions = {}; 

    io.on('connection', (socket) => {
        console.log('A user connected');
        sessions[socket.id] = { history: [] };

        socket.on('send_message', async ({ message, topic }) => {
            console.log(`Received message: ${message} on topic: ${topic}`);
            
            if (sessions[socket.id].history.length === 0) {

              sessions[socket.id].history.push({
                role: "user",
                parts: [{ text: `You are telling a story about a character who is trying to study ${topic}. 
                You talk about multiple observations this fictional character finds. After each observation,
                you ask the user if they can help this character to figure out what it means, and wait for the answer.
                 Do not continue with the story unless the user has answered a question.
                  Tell them the correct answer if they get it wrong. Be polite.
                  Your every response should end with a question. 
                  Your response should not be more than 3 sentences long. 
                 `}]});

                 sessions[socket.id].history.push({ role: "model", parts: [{ text: `Alright, Let dive into a quest on ${topic}! Are you ready?` }] });
          }

            await sendMessageToGemini(socket, message, sessions[socket.id].history);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            delete sessions[socket.id];  
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    async function sendMessageToGemini(socket, message, history) {
        try {
            // Initialize the generative model
            const model = genAI.getGenerativeModel({ 
            model: MODEL_NAME});
          
          //      systemInstruction: `You are a Learning Assistant. Your name is Questy. 
          //      You create engaging stories called Quest with fictional characters to help user
          //      learn a concept they want to understand. The current topic is ${topic}` 
          // });
              
              // For the commented out part, there is a bug in the Gemini API; due to which this functionality doesn't work. The model still acts as Gemini and not Questy. This won't affect the core functionality below. 
              // hoping the future fixes will improve the model outputs.
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
            //   if (history.length === 0 || history[history.length - 1].role === "model") {
            //     history.push({ role: "user", parts: [{ text: message }] });
            // } else {
            //     // Ensuring we don't add a user message after another user message
            //     console.error("Attempting to add a user message after another user message.");
            //     return;
            // }





            const chat = model.startChat(
               { generationConfig: {
                  maxOutputTokens: 300,
                  temperature: 1,
                  topK: 1,
                  topP: 0.65,

                }
                , safetySettings,

                history} );
            
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

           // history.push({ role: "model", parts: [{ text }] });

            // Check if response naturally leads to user input, if not, add a prompt
          //   if (!text.trim().endsWith('?')) {
          //     history.push({
          //         role: "model",
          //         parts: [{ text: "What do you think about that?" }]
          //     });
          // }


    
            console.log('Received response:', text);
            socket.emit('receive_message', text);  // Send the response back to the client
    
        } catch (error) {
            console.error('Error communicating with Gemini API:', error);
            socket.emit('error_message', 'Error processing your request.');
        }
    }
    

    return router;
};
