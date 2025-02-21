import React, { useState, useEffect } from "react";
import BannerBackground from "../Assets/home-banner-background.png";
import hb1 from "../Assets/hb1.png";
import Navbar from "./Navbar";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check local storage for user authentication state
    const userInfo = localStorage.getItem("userInfo");
    console.log(userInfo);
    if (userInfo) {
      setIsAuthenticated(true);
    }

    // Remove user info when the user leaves the website
    const handleUnload = () => {
      localStorage.removeItem("userInfo");
    };

    window.addEventListener("beforeunload", handleUnload);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleShareClick = () => {
    if (isAuthenticated) {
      window.location.href = "https://torrent.fastsharetorrent.me/";
    } else {
      alert("You need to log in or sign up to access this feature.");
    }
  };

  return (
    <div className="home-container" id="home">
      <Navbar />
      
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section" style={{ width: "600px" }}>
          <h1 className="primary-heading">
            Share your files seamlessly
          </h1>
          <p className="primary-text">
            Enables quick file sharing with peer-to-peer transfers, torrent support, and temporary cloud storage for secure data exchange.
          </p>
          <div className="btn" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            <button className="secondary-button" onClick={handleShareClick}>
              Share
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
