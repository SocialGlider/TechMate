const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const hbs = require("hbs");
const sendEmail = require("../utils/email");


const loadTemplate = (templateName,replacements)=>{
    const templatePath = path.join(__dirname,"../emailTemplate",templateName);
    const source = fs.readFileSync(templatePath,'utf-8');
    const template = hbs.compile(source);
    return template(replacements);
};

const signToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken =(user,statusCode,res,message)=>{
    const token = signToken(user._id);
    const cookieOptions ={
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"? "none" : "Lax",
    };

    res.cookie("token",token,cookieOptions);
    user.password=undefined;
    user.otp=undefined;
    res.status(statusCode).json({
        status: "success",
        message,
        token,
        data: {
            user,
            
        },
    });
};

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

     const htmlTemplate = loadTemplate("otpTemplate.hbs",{
        title:"otp Verification",
        username:newUser.username,
        otp,
        message:"Your one-time password (OTP) for account verification is : ",
     });

     try {
        await sendEmail({
            email:newUser.email,
            subject:"OTP for Email Verification",
            html:htmlTemplate,
        });

        createSendToken(newUser,200,res,"Registration Successful. Check your email for otp verification");

     } catch (error) {
        await User.findByIdAndDelete(newUser.id);
        return next(new AppError("There is an error creating the account. please try again later!",500));
     }

});