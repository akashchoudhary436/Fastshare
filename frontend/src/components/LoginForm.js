// src/components/LoginForm.js

import React from 'react';
import '../styles/login.css';  // Import the CSS file here

export default function LoginForm() {
  return (
    <div className="container2">
      <h3 className='my-4'>Create your account</h3>
      <input type="text" id="fname" name="fname" placeholder='Enter Your Name' />
      <input type="email" id="email" name="email" placeholder='Enter Your Email' />
      <input type="password" id="password" name="password" placeholder='Enter Your Password' />
      <div className='container3'>
        <button id='btn' type="button" className="my-5 btn btn-primary">Sign up</button>
        <button id='btn' type="button" className="my-5 btn btn-primary">Sign in</button>
      </div>
    </div>
  );
}