import React from "react";

const Contact = () => {
  return (
    <div className="contact-page-wrapper" id="contact">
      <h1 className="primary-heading">Facing any problems?</h1>
      <h1 className="primary-heading">Let Us Help You</h1>
      <textarea placeholder="Type your question here..." rows="4"></textarea>

      <div className="contact-form-container">
        <input type="text" placeholder="yourmail@gmail.com" />
        <button className="secondary-button">Submit</button>
      </div>
    </div>
  );
};

export default Contact;
