import React from "react";

interface SiteLogoProps {
  size?: "small" | "medium" | "large";
}

export default function SiteLogo({ size = "medium" }: SiteLogoProps) {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-4xl"
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} tracking-tight`}>
      <span className="text-black">Fashion Search</span>
    </div>
  );
}
