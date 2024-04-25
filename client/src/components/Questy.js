import React, { useState } from 'react';
import './Questy.css';
const Questy = ({ message }) => {
    return (
        <div className="questy-container">
             <div className="thought-cloud">
                 <p className="thought-message">{message}</p>
            </div>
            <img src="/Questy.gif" alt="Questy, your Learning Assistant" className="questy-gif" />
         </div>   
    );
};

export default Questy;
