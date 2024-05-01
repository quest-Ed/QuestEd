import React, { useState, useEffect, useRef } from 'react';
import thoughtCloud from '../assets/ThoughtCloud.png';
import './Questy.css';
import ReconnectingWebSocket from 'reconnecting-websocket';

const Questy = () => {
    const [userMessage, setUserMessage] = useState('');
    const [questyMessage, setQuestyMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new ReconnectingWebSocket('ws://localhost:3000/chat', [], {
            reconnectInterval: 4000, // Reconnect every 4000ms
            reconnectDecay: 1.5,     // Increase the reconnect interval by 1.5x each attempt
            maxReconnectInterval: 60000, // Maximum reconnect interval
        });
        ws.current.onopen = () => {
            console.log('WebSocket connection opened');
            setConnectionStatus('Connected');
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket connection closed', event.reason);
            setConnectionStatus('Disconnected');
        };
        ws.current.onmessage = (event) => {
            setQuestyMessage(event.data);
            speak(event.data);
        };
        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            console.log('Closing WebSocket');
            ws.current.close();
        };
    }, []);

    useEffect(() => {
        setSpeechRecognitionSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const getSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = true;
        return recognition;
    };

    const startListening = () => {
        const recognition = getSpeechRecognition();
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            recognition.stop();
            setUserMessage(transcript);
            sendMessageToApi(transcript);
        };

        recognition.onerror = (event) => {
            recognition.stop();
            console.error('Speech recognition error', event.error);
        };

        recognition.onend = () => {setIsListening(false);};
    };

    const stopListening = () => {
        const recognition = getSpeechRecognition();
        recognition.stop();
        setIsListening(false);
    };

    const sendMessageToApi = (message) => {
        console.log("sendMessageToApi called with message:", message);
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log("message is being sent");
            ws.current.send(message);
        } else {
            console.log("WebSocket not open or ws.current not available"); // Log the issue if not sending
        }
    
    };

    const speak = (text) => {
        const speechSynthesis = window.speechSynthesis;
        const speech = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(speech);
    };

    return (
        <div className="questy-container">
        <div className="top-section">
            <div className="thought-cloud" style={{ backgroundImage: `url(${thoughtCloud})` }}>
                <p className="thought-message">{questyMessage}</p>
            </div>
            <img src="/Questy.gif" alt="Questy, your Learning Assistant" className="questy-gif" />
        </div>
        <div className="status">Connection Status: {connectionStatus}</div>
        <div className="user-message">You said: {userMessage}</div>
        {speechRecognitionSupported ? (
            <button className="toggle-listen" onClick={toggleListening}>
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
        ) : (
            <p>Your browser does not support speech recognition.</p>
        )}
    </div>
    );
};

export default Questy;
