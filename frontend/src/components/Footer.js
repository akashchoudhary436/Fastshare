import React from "react";
import Logo from "../Assets/logo4.png";


const Footer = () => {
  return (
    <div className="footer-wrapper">
      <div className="footer-section-one">
        <div className="footer-logo-container">
          <img src={Logo} alt="" />
        </div>
        
      </div>
      <div className="footer-section-two">
        <div className="footer-section-columns">
          <span>Contact</span>
          <span>Help</span>
          <span>Share</span>
          <span>Address</span>
          
        </div>
        <div className="footer-section-columns">
          <span>222-222-2222</span>
          <span>@fastshare.com</span>
          <span>@fastshare.com</span>
          <span>@Atharva college</span>
        </div>
        <div className="footer-section-columns">
          <span>Terms & Conditions</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
