const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
// Make sure the environment variable is printed to verify it's being read correctly
console.log('Using API Key:', process.env.GOOGLE_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
    const generationConfig = {
        stopSequences: ["red"],
        maxOutputTokens: 200,
        temperature: 0.9,
        topP: 0.1,
        topK: 16,
    };
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig});

    const prompt = "Write a story about a magic backpack.";

    try {
        const result = await model.generateContent(prompt);
        console.log('Generation succeeded:', result);
    } catch (error) {
        console.error('Error during content generation:', error);
    }
}

run();
