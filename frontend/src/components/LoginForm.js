// src/components/LoginForm.js

import '../styles/login.css';  // Import the CSS file here


export default function LoginForm() {
  return (
    <div className="container2">
      <h3 className='my-4'>Create your account</h3>
      <input type="email" id="email" name="email" placeholder='Enter Your Email' />
      <input type="number" id="otp" name="otp" placeholder='Enter Your otp' />
      <div className='container3'>
        <button id='btn' type="button" className="my-5 btn btn-primary">Sign up</button>
        <button id='btn' type="button" className="my-5 btn btn-primary">Sign in</button>
      </div>
    </div>
  );
}