import React, { useState } from 'react';
import QuestyGif from '../assets/questy.gif';
import ThoughtCloud from '../assets/ThoughtCloud.png';

import './CreateQuest.css';


function CreateQuest() {
    const [topic, setTopic] = useState('');
    const [document, setDocument] = useState(null);
    const [questLink, setQuestLink] = useState('');

    const handleTopicChange = (event) => {
        setTopic(event.target.value);
    };

    const handleDocumentUpload = (event) => {
        setDocument(event.target.files[0]);
    };

    const handleCreateQuest = () => {
        // Include the topic in the URL for the Quest component
        const topicLink = `http://localhost:3001/quest/${encodeURIComponent(topic)}`;
        setQuestLink(topicLink);
    };

    return (
        <div className="createQuestContainer">
            <h1>QuestEd</h1>
            <p className="description">
                Create a <strong>Quest</strong>, a story-based learning experience, to engage your learners and assess their needs with Questy!<br /> 
            </p>
            <div className="questHeader">
                
                <div className="thoughtCloudContainer">
                    <img src={ThoughtCloud} alt="Thought Cloud" className="thoughtCloudImage" />
                    <p className="thoughtCloudText">
                        Hi! I am Questy, your learning assistant! 
                    </p>
                </div>
                <img src={QuestyGif} alt="Questy" className="questyImag" />
            </div>
            <input className="inputField" type="text" value={topic} onChange={handleTopicChange} placeholder="Specify a topic to tailor the quest (e.g., Biology, History)" />
            <label>
            Upload a document (Optional) 
            <input className="fileUpload" type="file" onChange={handleDocumentUpload} /> 
            </label>
             
            <button className="createButton" onClick={handleCreateQuest}>Create a Quest</button>
            Quest created at: {questLink && <a className="link" href={questLink} target="_blank"> {questLink}</a>}
        </div>
    );
}

export default CreateQuest;
