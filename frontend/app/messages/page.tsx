"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
}

interface Message {
  _id: string;
  sender: User;
  recipient: User;
  text: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [directUser, setDirectUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("user");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // If coming from profile page with user parameter, find and select that conversation
    if (userIdParam && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.userId === userIdParam);
      if (conversation) {
        setSelectedConversation(conversation);
        setDirectUser(null);
      }
    } else if (userIdParam && conversations.length === 0) {
      // If no conversations exist but we have a user parameter, fetch that user
      fetchUserDetails(userIdParam);
      setDirectUser(null); // Will be set by fetchUserDetails
    }
  }, [userIdParam, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await axios.get(
        `${BASE_API_URL}/users/profile/${userId}`,
        { withCredentials: true }
      );
      setDirectUser(response.data.data.user);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `${BASE_API_URL}/messages/conversations`,
        { withCredentials: true }
      );
      setConversations(response.data.data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setConversationLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_API_URL}/messages/${userId}`,
        { withCredentials: true }
      );
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || (!selectedConversation && !userIdParam)) {
      return;
    }

    const recipientId = selectedConversation?.userId || userIdParam;
    const messageText = messageInput;
    setMessageInput("");

    try {
      const response = await axios.post(
        `${BASE_API_URL}/messages/send`,
        {
          recipientId: recipientId,
          text: messageText,
        },
        { withCredentials: true }
      );

      // Add message to the current messages list
      if (response.data.data.message) {
        setMessages([...messages, response.data.data.message]);
      }
      
      // Refresh conversations list to update last message and timestamps
      await fetchConversations();
      
      // Also fetch fresh messages to stay in sync
      if (selectedConversation) {
        await fetchMessages(selectedConversation.userId);
      } else if (userIdParam) {
        await fetchMessages(userIdParam);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessageInput(messageText); // Restore input on error
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white">
      {/* Conversations List */}
      <div className="w-full md:w-80 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Messages</h2>
        </div>

        {conversationLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.userId}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                selectedConversation?.userId === conversation.userId
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={conversation.user.profilePicture}
                    className="h-full w-full"
                  />
                  <AvatarFallback>
                    {conversation.user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {conversation.user.username}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Messages Area */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedConversation || directUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={selectedConversation?.user.profilePicture || directUser?.profilePicture}
                  className="h-full w-full"
                />
                <AvatarFallback>
                  {selectedConversation?.user.username[0] || directUser?.username[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {selectedConversation?.user.username || directUser?.username}
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedConversation?.user.email || directUser?.email}
                </p>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender._id === user?._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender._id === user?._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender._id === user?._id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
