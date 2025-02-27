import React from "react";
import AboutBackground from "../Assets/about-background.png";
import p2p from "../Assets/p2p.png";
import { Link } from "react-router-dom";

const About = () => {
  return (
    
    <div className="about-section-container" id="about">
      
      <div className="about-background-image-container">
        <img src={AboutBackground} alt="" />
      </div>
      <div className="about-section-image-container">
        <img src={p2p} alt="" />
      </div>
      <div className="about-section-text-container">
        <p className="primary-subheading">About</p>
        <h1 className="primary-heading">P2P Transfer</h1>
        <p className="primary-text">
          Share files directly between devices without intermediaries. 
        </p>
        <p className="primary-text">
          Experience fast, secure transfers with no data limits 
          or third-party involvement.
        </p>
        <div className="about-buttons-container">
          <Link to="/sender" className="secondary-button">
            Learn More
          </Link>
        </div>
      </div>
     
    </div>
   
  );
};

export default About;
