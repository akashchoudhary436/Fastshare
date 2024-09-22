const asyncHandler = require('express-async-handler');
const Usermodel = require('../models/usermodel');
const generateToken = require('../config/generatetoken');
const sendMail = require('../sendmail');

const OTP_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes

// User Registration with Email Verification
const registerUser = asyncHandler(async (req, res) => {
    const { name,email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Please provide both name and email" });
    }

    const userExists = await Usermodel.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + OTP_EXPIRATION_TIME;

    await sendMail(email, `Your OTP is ${otp}`);

    req.session.otp = otp;
    req.session.otpExpires = otpExpires;
    req.session.email = email;
    req.session.name = name;

    res.status(200).json({ message: "OTP sent to your email for verification" });
});

// Verify OTP and Create User
const verifyUser = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    if (parseInt(req.session.otp) === parseInt(otp) && Date.now() < req.session.otpExpires) {
        const user = await Usermodel.create({
            name: req.session.name,
            email: req.session.email
        });

        // Clear session data
        req.session.destroy();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else if (Date.now() >= req.session.otpExpires) {
        res.status(400).json({ message: "OTP has expired" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});

// User Login
const authUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Please provide an email" });
    }

    const user = await Usermodel.findOne({ email });
    if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpires = Date.now() + OTP_EXPIRATION_TIME;

        await sendMail(email, `Your OTP is ${otp}`);

        req.session.otp = otp;
        req.session.otpExpires = otpExpires;
        req.session.userId = user._id;

        res.status(200).json({ message: "OTP sent to your email for verification" });
    } else {
        res.status(400).json({ message: "User not found" });
    }
});

// Verify OTP for Login
const verifyLogin = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    if (parseInt(req.session.otp) === parseInt(otp) && Date.now() < req.session.otpExpires) {
        const user = await Usermodel.findById(req.session.userId);

        // Clear session data
        req.session.destroy();

        res.json({
            _id: user._id,
            name: user.name,
            
            email: user.email,
   
            token: generateToken(user._id),
        });
    } else if (Date.now() >= req.session.otpExpires) {
        res.status(400).json({ message: "OTP has expired" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});

module.exports = { registerUser, verifyUser, authUser, verifyLogin };
