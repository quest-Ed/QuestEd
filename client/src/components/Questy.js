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
        ws.current = new ReconnectingWebSocket('ws://localhost:3000/chat');

        ws.current.onopen = () => setConnectionStatus('Connected');
        ws.current.onclose = () => setConnectionStatus('Disconnected');
        ws.current.onmessage = (event) => {
            setQuestyMessage(event.data);
            speak(event.data);
        };

        return () => ws.current.close();
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
        return recognition;
    };

    const startListening = () => {
        const recognition = getSpeechRecognition();
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            recognition.stop();
            setIsListening(false);
            setUserMessage(transcript);
            sendMessageToApi(transcript);
        };

        recognition.onerror = (event) => {
            recognition.stop();
            setIsListening(false);
            console.error('Speech recognition error', event.error);
        };

        recognition.onend = () => setIsListening(false);
    };

    const stopListening = () => {
        const recognition = getSpeechRecognition();
        recognition.stop();
        setIsListening(false);
    };

    const sendMessageToApi = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
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
            <img src="/Questy.gif" alt="Questy, your Learning Assistant" className="questy-gif" />
            <div className="thought-cloud" style={{ backgroundImage: `url(${thoughtCloud})` }}>
                <p className="thought-message">{questyMessage}</p>
            </div>
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
