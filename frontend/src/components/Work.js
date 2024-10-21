import React from "react";
import PickMeals from "../Assets/pick-meals-image.png";
import ChooseMeals from "../Assets/choose-image.png";
import DeliveryMeals from "../Assets/delivery-image.png";
import socketio from "../Assets/socketio.png";
import { color } from "@mui/system";

const Work = () => {
  const workInfoData = [
    {
      image: <img src={socketio} alt="socketio" style={{ width: '300px', height: 'auto' }} /> ,
      title: <h3 style={{ color: '#fe9e0d', fontSize: '4rem' }}>Webrtc</h3>,
      text: "WebRTC enables real-time peer-to-peer audio, video, and data sharing between browsers without a dedicated server..",
    },
    {
      
      title:<h3 style={{ color: '#fe9e0d', fontSize: '4rem' }}>Socket.io</h3>,
      text: "Socket.IO enables real-time communication between clients and servers.  ",
    },
    {
     
      title: <h3 style={{ color: '#fe9e0d', fontSize: '4rem' }}>Cloud</h3>,
      text: "Temporary cloud technology helps manage storage effectively",
    }
  ];
 
  return (
    <div className="work-section-wrapper">
      <div className="work-section-top">
        <p className="primary-subheading">Work</p>
        <h1 className="primary-heading">How It Works</h1>
        <p className="primary-text">
        FastShare leverages WebRTC for fast peer-to-peer file transfers, while Socket.io ensures real-time communication during the sharing process. Temporary cloud storage adds flexibility, with files auto-deleted after a set period.


        </p>
      </div>
      <div className="work-section-bottom">
        {workInfoData.map((data) => (
          <div className="work-section-info" key={data.title}>
            <div className="info-boxes-img-container">
              <img src={data.image} alt="" />
            </div>
            <h2>{data.title}</h2>
            <p>{data.text}</p>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Work;
