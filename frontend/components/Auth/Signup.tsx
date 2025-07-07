import Image from "next/image";
import React from "react";

const Signup = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
            {/* Banner */}
            <div className="md:col-span-4 h-screen  md:block">
                <Image src="/images/ban.png" alt="signup" width={1000} height={1000} className="w-full h-full object-cover" />
            </div>
            {/* Form */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen ">
                <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">Sign Up with <span className="text-rose-600">Pixora</span></h1>
                <form className="block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[90%] xl:w-[80%]">
                    <div className="mb-4">
                        <label htmlFor="name" className="font-semibold mb-2 block">
                            Username
                        </label>
                        <input type="text" name="username" placeholder="Username" className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="font-semibold mb-2 block">
                            Email
                        </label>
                        <input type="email" name="email" placeholder="Email adress" className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"/>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
};

export default Signup;