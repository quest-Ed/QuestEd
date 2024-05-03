import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateQuest from './components/CreateQuest';
import Quest from './components/Quest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateQuest />} />
        <Route path="/quest/:topic" element={<Quest />} />
      </Routes>
    </Router>
  );
}

export default App;
