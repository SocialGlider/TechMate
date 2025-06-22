const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");

exports.signup = catchAsync(async(req,res,next)=>{
    const {email,password,passwordConfirm,username}=req.body;
    const existingUser = await User.findOne({email});

    if(existingUser){
        return next(new AppError("Email already registered",400));
    }
     const otp = generateOtp();
     const otpExpires = Date.now()+24*60*60*100;
     const newUser = await User.create({
        username,
        email,
        password,
        passwordConfirm,
        otp,
        otpExpires,
     });
     res.status(200).json({
        status: "success",
        data:{
            user: newUser,
        },
     });
});