"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { setPost } from "@/store/postSlice";

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

  return (
    <div>Feed</div>
  )
}

export default Feed