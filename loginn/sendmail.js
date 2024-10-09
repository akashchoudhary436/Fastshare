const nodemailer = require("nodemailer");

const sendMail = async (email, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "abhishekbharambe10@gmail.com", 
        pass: "wdnmyubnvtdbisqf",  
      },
    });

    const mailOptions = {
      from: "abhishekbharambe10@gmail.com", 
      to: email,                   
      subject: "OTP Verification",
      text: message,                
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Error sending email");
  }
};

module.exports = sendMail;
