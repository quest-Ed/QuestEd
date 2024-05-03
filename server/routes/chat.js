require('dotenv').config();
const { GoogleGenerativeAI, HarmCategory,
    HarmBlockThreshold, } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = "gemini-1.5-pro-latest";

const { Router } = require('express');
const axios = require('axios');
console.log('Using API Key:', process.env.GOOGLE_API_KEY);
module.exports = (io) => {
    const router = Router();

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('send_message', async ({ message, topic }) => {
            console.log(`Received message: ${message} on topic: ${topic}`);
            await sendMessageToGemini(socket, message,topic);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    async function sendMessageToGemini(socket, message, topic) {
        try {
            // Initialize the generative model
            const model = genAI.getGenerativeModel({ 
              model: MODEL_NAME,
              // system_instruction: {text: `You are a Learning Assistant. Your name is Questy. 
              // You create engaging stories called Quest with fictional characters to help user
              // learn a concept they want to understand. The current topic is ${topic}
              // } ` 
          
            });
              
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

               const parts = [
                 {text: `You are a Learning Assistant. Your name is Questy. 
                  You create engaging stories called Quest with fictional characters to help user
                  learn a concept they want to understand. The current topic is ${topic}`}
               ];


            const chat = model.startChat({ contents: [{ role: "user", parts }],
                generationConfig: {
                  maxOutputTokens: 500,
                  temperature: 1,
                  topK: 1,
                  topP: 0.65,

                }
                , safetySettings,

                history: [
                  {
                  role: "user",
                    parts: [{ text: ` Create an interactive story on ${topic}. Stop talking after 2-3 sentences and ask the user a question related to the story you discussed. 
                    `}]
                  }
                    ,
                  {
                    role: "model",
                    parts: [{ text: "Once upon a time, there was a curious geologist named Rocky.  One day, he went on an adventure to explore the Earth's layers.  He started at the Earth's crust, which is the outermost layer.  Rocky found many interesting rocks and minerals there. Can you guess what is the layer beneath the Earth's crust?"}],
                  },
                  {
                    role: "user",
                    parts: [{ text: "hmm, i don't know"}],
                  },
                  {
                    role: "model",
                    parts: [{ text: "Hey, just so you know, we can't move forward, if you don't answer the question!"}],
                  },
                  {
                    role: "user",
                    parts: [{ text: "crust"}],
                  },
                  {
                    role: "model",
                    parts: [{ text: "Oh No, you are incorrect ! The layer beneath the Earth's crust is called the mantle. After exploring the crust, Rocky dug deeper and reached the mantle. The mantle is the thickest layer of the Earth.  It is made up of hot, molten rock called magma. What do you think happens to the magma when it cools down?"}],
                  },
                  {
                    role: "user",
                    parts: [{ text: "it becomes a rock"}],
                  },
                  {
                    role: "model",
                    parts: [{ text: "Yes, you are correct! Good job!"}],
                  },]
    
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
