const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const isAuthenticated = catchAsync(async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return next(new AppError("You are not logged in! please log in to access.",401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentuser = await User.findById(decoded.id);

    if(!currentuser)
        return next(new AppError("The user belonging to this token does not exist.", 401));
    req.user = currentuser;
    next();
});

module.exports = isAuthenticated;