import React, { useState } from 'react';
import axios from 'axios';
import '../styles/login.css';

const Signupform = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/user/', { name, email },
        { withCredentials: true }
      );
      if (response && response.data) {
        setIsOtpSent(true);
        alert(response.data.message); 
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Something went wrong!';
      alert(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/user/verify', { otp },
        { withCredentials: true }
      );
      alert('Login successful!');
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = '/';
    } catch (error) {
      alert(error.response.data.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container2">
      <h3 className='my-4'>Create your account</h3>
      <input type="text" id="name" name="name" placeholder='Enter Your Name' value={name} 
              onChange={(e) => setName(e.target.value)}  />
      <input type="email" id="email" name="email" placeholder='Enter Your Email'value={email}
              onChange={(e) => setEmail(e.target.value)} />
      <button id='btn' type='button' className='my-5 btn btn-primary' onClick={handleLogin}>Verify</button>
      {isOtpSent && (
        <>
          <div className='container3'>
            <input type="number" id="otp" name="otp" placeholder='Enter Your otp' value={otp}
              onChange={(e) => setOtp(e.target.value)} />
            <button id='btn' type="button" className="my-5 btn btn-primary" onClick={handleVerifyLogin}>Sign up</button>
          </div>
        </>
      )}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}

export default Signupform;