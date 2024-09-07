// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} /> {/* Replace component prop with element */}
        
      </Routes>
    </Router>
  );
}

export default App;