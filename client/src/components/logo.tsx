import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "icon";
}

export default function Logo({ size = 40, className = "", showText = true, variant = "default" }: LogoProps) {
  const textColor = variant === "white" ? "#FFFFFF" : "#1F2937";
  const subColor = variant === "white" ? "rgba(255,255,255,0.7)" : "#7C3AED";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#logoGrad)" />
        <path
          d="M160 340 L256 180 L352 340"
          stroke="white"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="256" cy="152" r="28" fill="#10B981" />
        <line
          x1="140"
          y1="380"
          x2="372"
          y2="380"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: size * 0.45, color: textColor }}
          >
            JobThrive
          </span>
          {size >= 36 && (
            <span
              className="font-medium tracking-wide"
              style={{ fontSize: size * 0.2, color: subColor }}
            >
              your career, amplified
            </span>
          )}
        </div>
      )}
    </div>
  );
}
