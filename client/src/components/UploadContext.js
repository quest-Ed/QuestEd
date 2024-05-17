import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const UploadContext = createContext(null);

export function useUpload() {
    return useContext(UploadContext);
}

export const UploadProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [documentText, setdocumentText] = useState("");

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3000`);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const handleDocumentUpload = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.extractedText) {
                setdocumentText(data.extractedText);
                console.log('documentText is now set')
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <UploadContext.Provider value={{ socket, documentText, handleDocumentUpload }}>
            {children}
        </UploadContext.Provider>
    );
};
