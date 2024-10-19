import React from 'react'
import loginImage from '../images/logimg.png';
import Signupform from '../components/Signupform';

const SignupPage = () => {
  return (
    <div className="container shadow p-3 mb-5 bg-body rounded" style={{ height: '500px', width: '900px', marginTop: '130px', display: 'flex' }}>
    <div className="container1">
      <img className="img1" src={loginImage} alt="Login" />
    </div>
    <Signupform/>
  </div>
  )
}

export default SignupPage
