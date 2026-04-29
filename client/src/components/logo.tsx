import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 40, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="112" fill="#A3E635" />
        <path
          d="M160 340 L256 200 L352 340"
          stroke="#0C0C0C"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="256" cy="172" r="26" fill="#0C0C0C" opacity="0.85" />
      </svg>
      {showText && (
        <span
          className="font-black tracking-tight"
          style={{ fontSize: size * 0.48, color: "#F5F5F5", letterSpacing: "-0.04em" }}
        >
          jobthrive
        </span>
      )}
    </div>
  );
}
