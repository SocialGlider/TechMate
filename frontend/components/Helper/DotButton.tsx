"use client";
import { Post, User } from "@/types";
import React from "react";
import { useDispatch } from "react-redux";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Ellipsis } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

type Props ={
  post: Post | null;
  user: User | null;
};

const DotButton = ({post, user}: Props) => {
  const isOwnPost = post?.user?._id === user?._id;
  const isFollwing = post?.user?._id ? user?.following.includes(post.user._id):false;

  const dispatch = useDispatch();

  const handleDeletePost = async () => {};
  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <Ellipsis className="w-8 h-8 text-black" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <div className="space-y-4 flex flex-col w-fit justify-center items-center mx-auto">
            {!isOwnPost && (
              <div>
                <Button variant={isFollwing ? "destructive":"secondary"}>
                  {isFollwing ?"unfollow": "Follow"}
                </Button>
              </div>
            )}
            <Link href={`/profile/${post?.user?._id}`}>
          <Button variant={"secondary"}>
            About This Account
            </Button></Link>
            {isOwnPost && (
              <Button variant={"destructive"} onClick={handleDeletePost}>
                Delete Post
              </Button>
            )}
            <DialogClose>
              Cancel
            </DialogClose>
          </div>
          
        </DialogContent>
      </Dialog>
    </div>
  )
};

export default DotButton;