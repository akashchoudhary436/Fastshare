
import React from 'react';
import Home from "../components/Home";
import About from "../components/About";
import About2 from "../components/About2";
import About3 from "../components/About3";
import Work from "../components/Work";
import Testimonials from "../components/Testimolnials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/LandingPage.css"

const LandingPage = () => {
  return (
    <div>
      <Home />
      <About />
      <About2 />
      <About3 />
      <Work />
      <Testimonials />
      <Contact />
      <Footer />
    </div>  
  );
};

export default LandingPage;