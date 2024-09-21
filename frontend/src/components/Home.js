import React from "react";
import BannerBackground from "../Assets/home-banner-background.png";
import hb1 from "../Assets/hb1.png";
import Navbar from "./Navbar";
import { FiArrowRight } from "react-icons/fi";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt=""  />
        </div>
        <div className="home-text-section" style={{width:"600px"}}>
          <h1 className="primary-heading">
            Share your files seamlessly
          </h1>
          <p className="primary-text">
          enables quick file sharing with peer-to-peer transfers, torrent support, and temporary cloud storage for secure data exchange
          </p><div className="btn" style={{display:"flex", justifyContent:"space-between" ,gap: "10px"}} >
          <button className="secondary-button">
            Order Now <FiArrowRight />{" "}
          </button>
          

          </div>
          
        </div>
        <div className="home-image-section">
          <img src={hb1} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
