import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "default" | "white";
}

export default function Logo({ size = 40, className = "", showText = true, variant = "default" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`logoGrad-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6D5BF7" />
            <stop offset="50%" stopColor="#A259FF" />
            <stop offset="100%" stopColor="#1DB954" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill={`url(#logoGrad-${size})`} />
        <path
          d="M160 340 L256 200 L352 340"
          stroke="white"
          strokeWidth="38"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="256" cy="172" r="26" fill="white" opacity="0.9" />
      </svg>
      {showText && (
        <span
          className="font-black tracking-tight"
          style={{ fontSize: size * 0.5, color: "#FAFAFA", letterSpacing: "-0.03em" }}
        >
          jobthrive
        </span>
      )}
    </div>
  );
}
