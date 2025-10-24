"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { setPost } from "@/store/postSlice";
import { Bookmark, HeartIcon, Loader, MessageCircle, Send } from "lucide-react";
import Post from "../Profile/Post";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";
import Comment from "../Helper/Comment";

const Feed = () => {
  const dispatch = useDispatch();

  const user = useSelector((state:RootState)=>state.auth.user);
  const posts = useSelector((state:RootState)=>state.post.posts);

  const [comment,setComment]=useState("");
  const [isLoading,setIsLoading]=useState(false);

  useEffect(()=>{
    const getAllPost = async () => {
      const getAllPostReq = async()=>
        await axios.get(`${BASE_API_URL}/posts/all`);
      const result = await handleAuthRequest(getAllPostReq,setIsLoading);
      if(result){
        dispatch(setPost(result.data.data.posts));
      }
    };
    getAllPost();
  },[dispatch]);

  const handleLikeDislike = async (id: string) => {};

  const handleSaveUnsave = async (id: string)=> {};

  const handleComment = async (id:string)=>{};

  // handle Loading state
  if(isLoading) {
    return (
      <div className="W-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin"/>
      </div>
    );
  }

  if(posts.length<1){
    return(
      <div className="text-3xl m-8 text-center capitalize font-bold">
        No Post To Show
      </div>
    );
  }

  return (
    <div className="mt-20 w-[70%] mx-auto">
      {/* Main Post */}
      {posts.map((Post)=>{
        return <div key={Post._id} className="mt-8">
          <div className="flex items-center justify-between">
            {/* User info */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-9 h-9">
                <AvatarImage src={Post.user?.profilePicture} className="h-full w-full"/>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1>{Post.user?.username}</h1>
            </div>
              <DotButton post={Post} user={user} />
          </div>
          {/* Image */}
          <div className="mt-2">
            <Image src={`${Post.Image?.url}`} alt="Post" width={400} height={400} className="w-full"/>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HeartIcon className="cursor-pointer" />
              <MessageCircle className="cursor-pointer" />
              <Send className="cursor-pointer" />
            </div>
            <Bookmark className="cursor-pointer" />
          </div>
          <h1 className="mt-2 text-sm font-semibold">
            {Post.likes.length} likes
          </h1>
          <p className="mt-2 font-medium">{Post.caption}</p>
          <Comment post={Post} user={user}  />
          <div className="mt-2 flex items-center">
            <input type="text" placeholder="Add a Comment.." className="flex-1 placeholder:text-gray-800 outline-none" value={comment} onChange={(e)=>setComment(e.target.value)} />
            <p role="button" className="text-sm font-semibold text-blue-700 cursor-pointer" onClick={()=>{handleComment(Post._id)}}>Post</p>
          </div>
          <div className="pb-6 border-b-2"></div>
        </div>
      })}
    </div>
  );
};

export default Feed