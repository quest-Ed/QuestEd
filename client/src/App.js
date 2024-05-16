import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import  {UploadProvider} from './components/UploadContext';
import CreateQuest from './components/CreateQuest';
import Quest from './components/Quest';

function App() {
  return (
    <Router>
      <UploadProvider> {/* Wrap all routes within UploadProvider */}
        <Routes>
          <Route path="/" element={<CreateQuest />} />
          <Route path="/quest/:topic" element={<Quest />} />
        </Routes>
      </UploadProvider>
    </Router>
  );
}
export default App;
