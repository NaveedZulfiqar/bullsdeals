// components/auth/BackgroundPattern.tsx
"use client";

import React from "react";

export const BackgroundPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-bg via-[#FAF8F5] to-primary-light/20 flex items-center justify-center pointer-events-none">
      {/* Soft blurred golden circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-primary-light/40 to-primary/10 blur-[80px] opacity-60 animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-primary/15 to-primary-light/30 blur-[100px] opacity-50 animate-pulse duration-[10s]" />
      <div className="absolute top-[30%] left-[20%] w-[250px] h-[250px] rounded-full bg-primary-light/10 blur-[60px] opacity-40" />

      {/* Luxury Geometric Pattern in Background & Thin Diagonal Golden Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="luxury-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Fine luxury hotel style grid pattern */}
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="var(--color-primary-light)"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
            {/* Elegant tiny intersection dots */}
            <circle
              cx="0"
              cy="0"
              r="1.5"
              fill="var(--color-primary)"
              fillOpacity="0.4"
            />
          </pattern>
          <linearGradient id="gold-grad-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-primary-light)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Fill with luxury grid pattern */}
        <rect width="100%" height="100%" fill="url(#luxury-grid)" />

        {/* Main luxury diagonal gold lines */}
        <line
          x1="-10%"
          y1="10%"
          x2="110%"
          y2="130%"
          stroke="url(#gold-grad-line)"
          strokeWidth="1.5"
        />
        <line
          x1="-20%"
          y1="30%"
          x2="100%"
          y2="150%"
          stroke="url(#gold-grad-line)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <line
          x1="0%"
          y1="-10%"
          x2="120%"
          y2="110%"
          stroke="url(#gold-grad-line)"
          strokeWidth="1"
        />

        {/* Abstract elegant concentric circles/curves in center */}
        <circle
          cx="50%"
          cy="50%"
          r="160"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="0.75"
          strokeOpacity="0.25"
        />
        <circle
          cx="50%"
          cy="50%"
          r="220"
          fill="none"
          stroke="var(--color-primary-light)"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          strokeDasharray="5 5"
        />
        <circle
          cx="50%"
          cy="50%"
          r="280"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="0.5"
          strokeOpacity="0.15"
        />

        {/* Diamond shape overlay for hotel/real-estate aesthetic */}
        <polygon
          points="350,150 450,250 350,350 250,250"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          className="origin-center transform translate-x-[calc(50%-350px)] translate-y-[calc(50%-250px)] rotate-45"
        />
      </svg>

      {/* Vignette / Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/30 via-transparent to-[#FAF8F5]/10" />
    </div>
  );
};
