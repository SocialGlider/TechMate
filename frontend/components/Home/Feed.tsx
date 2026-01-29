"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { addComment, likeOrDislike, setPost } from "@/store/postSlice";
import { Bookmark, Bookmark as BookmarkFilled, Heart, HeartIcon, Loader, MessageCircle, Share2, X } from "lucide-react";
import Post from "../Profile/Post";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";
import Comment from "../Helper/Comment";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";

const Feed = () => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.post.posts);

  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);
  const [shareUsers, setShareUsers] = useState<any[]>([]);
  const [shareUsersLoading, setShareUsersLoading] = useState(false);
  const [searchShareQuery, setSearchShareQuery] = useState("");

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

  const handleOpenShareDialog = async (post: any) => {
    setSelectedPostForShare(post);
    setSearchShareQuery("");
    setShareUsers([]);
    setShareDialogOpen(true);
  };

  const fetchShareUsers = async (query: string) => {
    if (!query.trim()) {
      setShareUsers([]);
      return;
    }
    
    setShareUsersLoading(true);
    try {
      const response = await axios.get(
        `${BASE_API_URL}/users/search?q=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      setShareUsers(response.data.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setShareUsers([]);
    } finally {
      setShareUsersLoading(false);
    }
  };

  const handleSearchShare = (query: string) => {
    setSearchShareQuery(query);
    fetchShareUsers(query);
  };

  const handleShareToUser = async (targetUserId: string) => {
    if (!selectedPostForShare) return;

    try {
      await axios.post(
        `${BASE_API_URL}/messages/send`,
        {
          recipientId: targetUserId,
          image: selectedPostForShare.Image?.url,
          text: selectedPostForShare.caption || "Check out this post!",
        },
        { withCredentials: true }
      );

      toast.success("Post shared successfully!");
      setShareDialogOpen(false);
      setSelectedPostForShare(null);
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    }
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
                  onClick={() => handleOpenShareDialog(post)}
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

      {/* Share Dialog - Outside the map loop */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Share Post</DialogTitle>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchShareQuery}
                onChange={(e) => handleSearchShare(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {shareUsersLoading ? (
              <div className="flex justify-center py-4">
                <Loader className="animate-spin" />
              </div>
            ) : shareUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchShareQuery ? "No users found" : "Search for users to share"}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {shareUsers.map((shareUser) => (
                  <div
                    key={shareUser._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={shareUser.profilePicture}
                          className="h-full w-full"
                        />
                        <AvatarFallback>{shareUser.username[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-sm">{shareUser.username}</p>
                    </div>
                    <Button
                      onClick={() => handleShareToUser(shareUser._id)}
                      size="sm"
                      variant="default"
                    >
                      Share
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feed;
