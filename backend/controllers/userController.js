const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getProfile = catchAsync(async(req,res,next)=>{
    const {id} = req.params;
    
    const user = await User.findById(id).select("-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
    ).populate({
        path:'post',
        options:{sort:{createdAt: -1 } },
    }).populate({
        path:"savePosts",
        options:{sort:{createdAt: -1 }}
    });

    if(!user){
        return next(new AppError("User not found",404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

exports.editProfile = catchAsync(async(req,res,next)=>{
    const userId = req.user.id;

    const {bio} = req.body;
    const profilePicture = req.file;
});