
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css'; // Import any specific styles

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to FastShare</h1>
        <p>Your solution for secure and efficient file sharing.</p>
      </header>
      <main className="landing-main">
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
       
      </main>
    </div>
  );
};

export default LandingPage;