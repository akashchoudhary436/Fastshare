import React, { useState } from 'react';
import axios from 'axios';
import '../styles/login.css';

const Signupform = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/user/register', 
        { name, email, password },
        { withCredentials: true }
      );
      
      if (response && response.data) {
        alert('Signup successful! Logging you in...');
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        window.location.href = '/'; // Redirect to home or dashboard
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong!');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="container2">
      <h3 className='my-4'>Create your account</h3>
      <input type="text" placeholder='Enter Your Name' value={name} 
        onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder='Enter Your Email' value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder='Enter Your Password' value={password}
        onChange={(e) => setPassword(e.target.value)} required />
      <button id='btn' type='button' className='my-5 btn btn-primary' onClick={handleSignup}>
        Sign Up
      </button>
    </div>
  );
};

export default Signupform;
