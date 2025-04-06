import React from "react";

export default function FashionBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
      {/* Left side gradient */}
      <div 
        className="absolute -left-1/4 top-0 w-1/2 h-screen bg-gradient-to-r from-blue-50 to-transparent opacity-70"
        style={{ transform: "rotate(-15deg) translateY(-20%)" }}
      />
      
      {/* Right side gradient */}
      <div 
        className="absolute -right-1/4 top-0 w-1/2 h-screen bg-gradient-to-l from-green-50 to-transparent opacity-70"
        style={{ transform: "rotate(15deg) translateY(-20%)" }}
      />
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-gray-50 to-transparent" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[url('/pattern.svg')] bg-repeat bg-center" />
      </div>
    </div>
  );
}
