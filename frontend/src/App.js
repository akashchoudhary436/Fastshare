// src/App.js


import React from 'react';
import CloudUpload from './components/cloudupload'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import P2pSender from "./pages/P2pSender";
import P2pReceiver from "./pages/P2pReceiver";
import SignupPage from "./pages/SignupPage";
import DownloadPage from "./pages/DownloadPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/sender" element={<P2pSender />} />
        <Route path="/receiver/:roomId" element={<P2pReceiver />} /> 
        <Route path="/upload" element={<CloudUpload />} />
        <Route path="/download/:fileId" element={<DownloadPage />} />



      </Routes>
    </Router>
  );
}

export default App;
