const express = require("express");
const { signup, 
    verifyAccount, 
    resendOtp, 
    login ,
} = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();
router.post("/signup",signup);
router.post("/verify",isAuthenticated,verifyAccount);
router.post("/resend-otp",isAuthenticated,resendOtp);
router.post("/login",login);
module.exports = router;
