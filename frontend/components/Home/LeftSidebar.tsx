"use client";
import { Heart, HomeIcon, LogOutIcon, MessageCircle, Search, SquarePlus } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LeftSidebar = () => {
    const user = useSelector((state:RootState)=>state.auth.user);
    const router = useRouter();
    const SidebarLinks = [
        {
            icon:<HomeIcon/>,
            label: "Home",
        },{
            icon:<Search/>,
            label: "Search",
        },{
            icon:<MessageCircle/>,
            label: "Message",
        },{
            icon:<Heart/>,
            label:"Notification",
        },{
            icon:<SquarePlus/>,
            label: "Create",
        },{
            icon:(
                <Avatar className="w-9 h-9">
                    <AvatarImage src={user?.profilePicture} className="h-full w-full"/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            label: "Profile",
        },{
            icon: <LogOutIcon/>,
            label: "Logout",
        },
    ];
  return (
    <div className="h-full">
        <div className="lg:p-6 p-3 cursor-pointer">
              <div onClick={()=>{
            router.push("/");
        }}>
            <Image src="/images/p.png" alt="Logo" width={150} height={150} className="mt-[-2rem]"/>
        </div>
        <div className="mt-6">
            {SidebarLinks.map((link)=>{
                return (
                    <div key={link.label} className="flex items-center mb-2 p-3 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-gray-100 space-x-2">
                        <div className="group-hover:scale-110 transition-all duration-200">
                            {link.icon}
                        </div>
                        <p className="lg:text-lg text-base">{link.label}</p>
                    </div>
                );
            })}
        </div>
        </div>
      
    </div>
  );
};

export default LeftSidebar