// src/pages/LoginPage.js

import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/login.css';  // Import the CSS file here
import loginImage from '../images/logimg.png';  // Path to the image

export default function LoginPage() {
  return (
    <div className="container shadow p-3 mb-5 bg-body rounded" style={{ height: '500px', width: '900px', marginTop: '130px', display: 'flex' }}>
      <div className="container1">
        <img className="img1" src={loginImage} alt="Login" />
      </div>
      <LoginForm />
    </div>
  );
}