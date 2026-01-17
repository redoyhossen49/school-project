import React from "react";

export default function Button({
  children,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  // Default styles
  const baseClasses = `
    bg-blue-600 text-white text-sm h-8
    hover:bg-slate-800
    hover:shadow-md hover:shadow-slate-800/50
    transition-shadow duration-300
    
    flex items-center justify-center
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
