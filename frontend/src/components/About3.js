import React from "react";
import AboutBackground from "../Assets/about-background.png";
import cloudstorage from "../Assets/cloudstorage.png";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="about-section-container">
      <div className="about-background-image-container">
        <img src={AboutBackground} alt="" />
      </div>
      <div className="about-section-image-container">
        <img src={cloudstorage} alt=""/>
      </div>
      <div className="about-section-text-container">
        <h1 className="primary-heading">
         Temporary  Cloud Storage
        </h1>
        <p className="primary-text">
        Upload files for short-term access with auto-expiry. 
        </p>
        <p className="primary-text">
        Share download links easily while ensuring security with time-limited storage.
        </p>
        <div className="about-buttons-container">
          <Link to="/upload" className="secondary-button">
            Learn More
          </Link>

        </div>
      </div>
    </div>
  );
};

export default About;
