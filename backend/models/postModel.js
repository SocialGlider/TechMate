const mongoose = require('mongoose');
const { trim } = require('validator');

const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        maxlength:[2200,"Caption should be less than 2200 charachters"],
        trim:true,
    },
    Image:{
        url:{type:String,required:true},
        publicId:{
            type:String,
            required: true,
        },
    },

    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: [true, "User ID is required"],
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" ,
        },
    ],
    Comments : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
},
{timestamps: true}
);

postSchema.index({user:1,createdAt:-1})

const Post = mongoose.model("Post", postSchema);

module.exports = Post;