import React from "react";
import loginLogo from "../assets//images/login-logo.jpg";

export default function LoginLogo() {
  return (
           <div
               className="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 flex items-center justify-center shadow-lg mb-6
                        animate-fadeInScale
                       hover:scale-110
                       hover:rotate-6
                       transition-transform
                       duration-500
                       ease-in-out absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       "
             >
               <img
                 src={loginLogo}
                 alt="Logo"
                 className="w-20 h-20 rounded-full object-cover"
               />
             </div>
  );
}
