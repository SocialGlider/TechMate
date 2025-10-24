"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { setPost } from "@/store/postSlice";
import { Loader } from "lucide-react";
import Post from "../Profile/Post";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";

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
              <DotButton />
          </div>
          {/* Image */}
          <div className="mt-2">
            <Image src={`${Post.Image?.url}`} alt="Post" width={400} height={400} className="w-full"/>
          </div>
        </div>
      })}
    </div>
  )
};

export default Feed