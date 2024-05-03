import React from 'react';
import QuestyGif from '../assets/questy.gif';
import Questy from './Questy'; 
import { useParams } from 'react-router-dom';
import './Quest.css';

function Quest() {
    const { topic } = useParams(); // This retrieves the topic from the URL.

    return (
        
        <div className="QuestContainer">
            <h1> QuestEd </h1>
            <Questy topic={decodeURIComponent(topic)} />
            <img src={QuestyGif} alt="Questy" className="questyImage" />
        </div>

        
    );
}

export default Quest;

