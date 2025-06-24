import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-md ${className || "h-4 w-full"}`}
      style={{ opacity: 0.7 }}
    />
  );
}
export default Skeleton; 