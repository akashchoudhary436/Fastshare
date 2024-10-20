// src/App.js


import React from 'react';
import CloudUpload from './components/cloudupload'; // Use the correct name
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import P2pSender from "./pages/P2pSender";
import P2pReceiver from "./pages/P2pReceiver";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<CloudUpload />} /> {/* Add the upload route */}
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/sender" element={<P2pSender />} />
        <Route path="/receiver/:roomId" element={<P2pReceiver />} /> 

      </Routes>
    </Router>
  );
}

export default App;
