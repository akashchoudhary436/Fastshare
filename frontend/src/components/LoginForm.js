import React, { useState } from 'react';
import axios from 'axios';
import '../styles/login.css';  

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/user/login', 
        { email, password },
        { withCredentials: true }
      );
      
      alert('Login successful!');
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = '/'; // Redirect after login
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid credentials');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container2">
      <h3 className='my-4'>Login to your account</h3>
      <input type="email" placeholder='Enter Your Email' value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder='Enter Your Password' value={password}
        onChange={(e) => setPassword(e.target.value)} required />
      <button id='btn' type='button' className='my-5 btn btn-primary' onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default LoginForm;