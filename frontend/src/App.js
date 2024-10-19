// src/App.js

import React from 'react';
import CloudUpload from './components/cloudupload'; // Use the correct name
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<CloudUpload />} /> {/* Add the upload route */}
      </Routes>
    </Router>
  );
}

export default App;
