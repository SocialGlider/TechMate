"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  followers: string[];
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_API_URL}/users/search?q=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      setSearchResults(response.data.data.users);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleFollow = async (
    userId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `${BASE_API_URL}/users/follow-unfollow/${userId}`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message);
      // Update search results
      handleSearch(searchQuery);
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Failed to follow user");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      )}

      {!loading && searchResults.length === 0 && !searchQuery && (
        <div className="text-center py-8 text-gray-500">
          Start typing to search for users
        </div>
      )}

      <div className="space-y-3">
        {searchResults.map((searchUser) => {
          const isFollowing = searchUser.followers.includes(user?._id || "");
          return (
            <div
              key={searchUser._id}
              onClick={() => handleUserClick(searchUser._id)}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={searchUser.profilePicture}
                    className="h-full w-full"
                  />
                  <AvatarFallback>{searchUser.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base">{searchUser.username}</p>
                  <p className="text-sm text-gray-500">{searchUser.email}</p>
                </div>
              </div>
              <Button
                onClick={(e) => handleFollow(searchUser._id, e)}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchPage;
