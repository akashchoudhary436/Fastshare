const express = require('express');
const { registerUser, verifyUser, authUser, verifyLogin } = require('../controllers/userController');
const router = express.Router();

router.route('/').post(registerUser); // Registration route
router.post('/verify', verifyUser);   // Route to verify OTP during registration
router.post('/login', authUser);      // Login route
router.post('/verify-login', verifyLogin);  // Route to verify OTP during login

module.exports = router;
