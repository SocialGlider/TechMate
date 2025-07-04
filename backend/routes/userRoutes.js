const express = require("express");
const { signup, 
    verifyAccount, 
    resendOtp, 
    login, 
    logout,
    forgetPassword,
    resetPassword,
    changePassword,
} = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");
const { getProfile } = require("../controllers/userController");

const router = express.Router();

//Auth routes
router.post("/signup",signup);
router.post("/verify",isAuthenticated,verifyAccount);
router.post("/resend-otp",isAuthenticated,resendOtp);
router.post("/login",login);
router.post("/logout",logout);
router.post("/forget-password",forgetPassword);
router.post("/reset-password",resetPassword);
router.post("/change-password",isAuthenticated,changePassword);

//User routes
router.get('/profile/:id', getProfile);

module.exports = router;
