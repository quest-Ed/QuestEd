import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Questy.css';

const Questy = () => {
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [socket, setSocket] = useState(null);
    const recognition = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3000`);
        setSocket(newSocket);

        newSocket.on('receive_message', (message) => {
            setMessages(prevMessages => [...prevMessages, { text: message, sender: 'Questy' }]);
            speak(message);
        });

        newSocket.on('error_message', (error) => {
            console.error('WebSocket error:', error);
        });

        return () => newSocket.close();
    }, []);

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





    const sendMessage = (message) => {
        
        if (typeof message !== 'string') {
            console.error('Expected a string for message but received:', message);
            return; // Exit if message is not a string to avoid further errors
        }
        
        // if (!message || !message.trim()) {
        //     console.log("No message to send");
        //     return; // Exit the function if message is null or empty
        // }
    
        if (socket && message.trim()) {
            socket.emit('send_message', message);
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
        const speech = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.name.includes("Google UK English Female")) || voices[1];
        speech.voice = voice;
        speech.pitch = 1.2;  // Slightly higher pitch to make the tone happier
        speech.rate = 1;  // Normal speaking rate
        window.speechSynthesis.speak(speech);
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
                onKeyPress={event => event.key === 'Enter' ? sendMessage(userMessage) : null}
            />

           <div id="button-container">

            <button id="sendButton" onClick={()=> sendMessage(userMessage)}>Send</button>
            <button  id="listenButton" onClick={toggleListening} style={{ backgroundColor: isListening ? 'red' : 'blue' }}>
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            </div>
        </div>
    );
};

export default Questy;
