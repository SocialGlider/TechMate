"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { addComment, likeOrDislike, setPost } from "@/store/postSlice";
import { Bookmark, Bookmark as BookmarkFilled, Heart, HeartIcon, Loader, MessageCircle, Send, Share2 } from "lucide-react";
import Post from "../Profile/Post";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";
import Comment from "../Helper/Comment";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";

const Feed = () => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.post.posts);

  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${BASE_API_URL}/posts/all`);
      const result = await handleAuthRequest(getAllPostReq, setIsLoading);
      if (result) {
        dispatch(setPost(result.data.data.posts));
      }
    };
    getAllPost();
  }, [dispatch]);

  const handleLikeDislike = async (id: string) => {
    const result = await axios.post(
      `${BASE_API_URL}/posts/like-dislike/${id}`,
      {},
      { withCredentials: true }
    );
    if (result.data.status == "success") {
      if (user?._id) {
        dispatch(likeOrDislike({ postId: id, userId: user?._id }));
        toast(result.data.message);
      }
    }
  };

  const handleSaveUnsave = async (id: string) => {
    const result = await axios.post(`${BASE_API_URL}/posts/save-unsave-post/${id}`,
      {},
      {withCredentials : true}
    );
    if(result.data.status=="success"){
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message)
    }
  };

  const handleSharePost = async (post: any) => {
    try {
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare) {
        // Fetch the image blob
        const response = await fetch(post.Image?.url);
        const blob = await response.blob();
        const file = new File([blob], `post-${post._id}.jpg`, { type: 'image/jpeg' });

        // Check if the file can be shared
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: post.caption || 'Check out this post!',
          });
          toast.success('Post shared successfully!');
        } else {
          // Fallback: download the image
          downloadImage(post.Image?.url, `post-${post._id}.jpg`);
          toast.success('Image downloaded to your device!');
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        downloadImage(post.Image?.url, `post-${post._id}.jpg`);
        toast.success('Image downloaded to your device!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        downloadImage(post.Image?.url, `post-${post._id}.jpg`);
        toast.success('Image downloaded to your device!');
      }
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleComment = async (id: string) => {
    if(!comment) return;
    const addCommentReq = async() => await axios.post(`${BASE_API_URL}/posts/comment/${id}`, { text: comment},{withCredentials: true}
    );
    const result = await handleAuthRequest(addCommentReq);
    if(result?.data.status=="success") {
      dispatch(addComment({postId: id,comment : result?.data.data.comment}));
      toast.success("Comment Posted");
      setComment("");
    }
  };

  // handle Loading state
  if (isLoading) {
    return (
      <div className="W-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="text-3xl m-8 text-center capitalize font-bold">
        No Post To Show
      </div>
    );
  }

  return (
    <div className="mt-20 w-[70%] mx-auto">
      {/* Main Post */}
      {posts.map((post) => {
        return (
          <div key={post._id} className="mt-8">
            <div className="flex items-center justify-between">
              {/* User info */}
              <div className="flex items-center space-x-2">
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={post.user?.profilePicture}
                    className="h-full w-full"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1>{post.user?.username}</h1>
              </div>
              <DotButton post={post} user={user} />
            </div>
            {/* Image */}
            <div className="mt-2">
              <Image
                src={`${post.Image?.url}`}
                alt="Post"
                width={400}
                height={400}
                className="w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {user?._id && post.likes.includes(user?._id) ? (
                  <Heart
                    fill="red"
                    color="red"
                    onClick={() => handleLikeDislike(post?._id)}
                    className="cursor-pointer"
                  />
                ) : (
                  <HeartIcon
                    onClick={() => handleLikeDislike(post?._id)}
                    className="cursor-pointer"
                  />
                )}
                <MessageCircle className="cursor-pointer" />
                <Share2 
                  onClick={() => handleSharePost(post)}
                  className="cursor-pointer"
                  title="Share post"
                />
              </div>
              {(user?.savedPosts as string[])?.some(
                (savedPostId: string) => savedPostId === post._id
              ) ? (
                <Bookmark
                  fill="black"
                  color="black"
                  onClick={() => handleSaveUnsave(post?._id)}
                  className="cursor-pointer"
                />
              ) : (
                <Bookmark
                  onClick={() => handleSaveUnsave(post?._id)}
                  className="cursor-pointer"
                />
              )}
            </div>
            <h1 className="mt-2 text-sm font-semibold">
              {post.likes.length} likes
            </h1>
            <p className="mt-2 font-medium">{post.caption}</p>
            <Comment post={post} user={user} />
            <div className="mt-2 flex items-center">
              <input
                type="text"
                placeholder="Add a Comment.."
                className="flex-1 placeholder:text-gray-800 outline-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p
                role="button"
                className="text-sm font-semibold text-blue-700 cursor-pointer"
                onClick={() => {
                  handleComment(post._id);
                }}
              >
                Post
              </p>
            </div>
            <div className="pb-6 border-b-2"></div>
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
