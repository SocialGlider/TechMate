const Message = require("../models/messageModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.getConversations = catchAsync(async(req,res,next)=>{
    const loginUserId = req.user._id;

    const conversations = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender: loginUserId },
                    { recipient: loginUserId }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$sender", loginUserId] },
                        "$recipient",
                        "$sender"
                    ]
                },
                lastMessage: { $first: "$text" },
                lastMessageTime: { $first: "$createdAt" },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$recipient", loginUserId] },
                                    { $eq: ["$isRead", false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                userId: "$_id",
                user: {
                    _id: "$user._id",
                    username: "$user.username",
                    profilePicture: "$user.profilePicture"
                },
                lastMessage: 1,
                lastMessageTime: 1,
                unreadCount: 1
            }
        },
        {
            $sort: { lastMessageTime: -1 }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            conversations
        }
    });
});

exports.getMessages = catchAsync(async(req,res,next)=>{
    const loginUserId = req.user._id;
    const { userId } = req.params;

    if(loginUserId.toString() === userId.toString()){
        return next(new AppError("You cannot message yourself",400));
    }

    const messages = await Message.find({
        $or: [
            { sender: loginUserId, recipient: userId },
            { sender: userId, recipient: loginUserId }
        ]
    }).sort({ createdAt: 1 }).populate([
        { path: 'sender', select: 'username profilePicture _id' },
        { path: 'recipient', select: 'username profilePicture _id' }
    ]);

    // Mark messages as read
    await Message.updateMany(
        { sender: userId, recipient: loginUserId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        status: "success",
        data: {
            messages
        }
    });
});

exports.sendMessage = catchAsync(async(req,res,next)=>{
    const loginUserId = req.user._id;
    const { recipientId, text, image } = req.body;

    if(!recipientId || (!text && !image)){
        return next(new AppError("Recipient and either message text or image is required",400));
    }

    if(loginUserId.toString() === recipientId.toString()){
        return next(new AppError("You cannot message yourself",400));
    }

    const recipient = await User.findById(recipientId);

    if(!recipient){
        return next(new AppError("Recipient not found",404));
    }

    const message = await Message.create({
        sender: loginUserId,
        recipient: recipientId,
        text: text ? text.trim() : undefined,
        image: image ? image.trim() : undefined,
        isRead: false
    });

    await message.populate([
        { path: 'sender', select: 'username profilePicture _id' },
        { path: 'recipient', select: 'username profilePicture _id' }
    ]);

    res.status(201).json({
        status: "success",
        data: {
            message
        }
    });
});
