import React, { useState, useEffect, useRef } from 'react';
import './Questy.css';
import { useUpload } from './UploadContext';

const Questy = ({topic}) => {
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState([{ text: `Let's have a quest on ${topic}! Are you ready?`, sender: 'Questy' }]);
    const [isListening, setIsListening] = useState(false);
   // const [socket, setSocket] = useState(null);
   const { socket, documentText } = useUpload();

    const recognition = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (message) => {
                setMessages(prevMessages => [...prevMessages, { text: message, sender: 'Questy' }]);
                speak(message);
            });

            socket.on('error_message', (error) => {
                console.error('WebSocket error:', error);
            });

            return () => {
                socket.off('receive_message');
                socket.off('error_message');
            };
        }
    }, [socket]);

    useEffect(() => {
        if (documentText) {
            console.log('Document text available in Questy:', documentText);  // Add this log
            sendMessage(documentText, topic, true);  // Sending document text as a special command or flag
        }
    }, [documentText, socket]);



    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;  // We'll manage continuous listening via the button
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserMessage(transcript);
                sendMessage(transcript);
            };

            recognition.current.onstart = () => {
                setIsListening(true);
            };

            recognition.current.onend = () => {
                setIsListening(false);
            };

            recognition.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognition.current.stop();
        } else {
            recognition.current.start();
        }
    };





    const sendMessage = (message, topic, isDocument = false) => {
        
        if (typeof message !== 'string') {
            console.error('Expected a string for message but received:', message);
            return; 
        }

        const data = { message, topic };
    if (isDocument && documentText) {
        data.documentText = documentText;  // Including document text if it's from the document
    }
        
        if (socket && message.trim()) {
            socket.emit('send_message', data);
            console.log(`Sending message: ${message}, Topic: ${topic}, Document used: ${isDocument}`)
            setMessages(prevMessages => [...prevMessages, { text: message, sender: 'User' }]);
            setUserMessage('');
        }
    };


    const speak = (text) => {
        const speechSynthesis = window.speechSynthesis;
        if (!speechSynthesis) {
            console.log("Speech synthesis not supported in this browser.");
            return;
        }
    
        // Wait for voices to be loaded if not loaded
        let voices = speechSynthesis.getVoices();
        if (!voices.length) {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                doSpeak(text, voices);
            };
        } else {
            doSpeak(text, voices);
        }
    };
    
    const doSpeak = (text, voices) => {
        // Split the text into chunks
        const chunkLength = 200; // You can adjust the chunk length
        const regex = new RegExp(`.{1,${chunkLength}}(\\s|$)|\\S+?(\\s|$)`, 'g');
        const chunks = text.match(regex);
    
        // Voice settings
        const voice = voices.find(v => v.name.includes("Google UK English Female")) || voices[1];
        
        chunks.forEach(chunk => {
            const speech = new SpeechSynthesisUtterance(chunk);
            speech.voice = voice;
            speech.pitch = 1;
            speech.rate = 1.1;
            speech.onend = () => {
                console.log("Finished speaking a chunk.");
            };
            window.speechSynthesis.speak(speech);
        });
    };

    return (
        <div className="questy-container">
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <p key={index} className={`message ${msg.sender === 'User' ? 'user' : 'questy'}`}>
                        {msg.text}
                    </p>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={event => event.key === 'Enter' ? sendMessage(userMessage,topic) : null}
            />

           <div id="button-container">

            <button id="sendButton" onClick={()=> sendMessage(userMessage,topic)}>Send</button>
            <button  id="listenButton" onClick={toggleListening} style={{ backgroundColor: isListening ? 'red' : 'blue' }}>
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            </div>
        </div>
    );
};

export default Questy;
