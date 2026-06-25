// components/auth/LogoPlaceholder.tsx
"use client";

import React from "react";

export const LogoPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 transition-all duration-500 hover:scale-105">
      {/* Decorative Outer Border Box with premium spacing */}
      <div className="relative flex flex-col items-center justify-center w-64 h-64 border border-primary-light/40 rounded-2xl bg-card/60 backdrop-blur-md shadow-[0_8px_32px_0_rgba(176,141,87,0.08)] px-6 text-center group">
        
        {/* Elegant Corner accents for luxury aesthetic */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl-sm transition-all duration-300 group-hover:top-1 group-hover:left-1" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr-sm transition-all duration-300 group-hover:top-1 group-hover:right-1" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl-sm transition-all duration-300 group-hover:bottom-1 group-hover:left-1" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br-sm transition-all duration-300 group-hover:bottom-1 group-hover:right-1" />

        {/* Minimal geometric central icon/mark representing gold class */}
        <div className="mb-4 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 shadow-inner transition-all duration-300 group-hover:bg-primary/10">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </div>
        </div>

        {/* Text Area */}
        <p className="text-sm tracking-[0.25em] font-light text-primary uppercase mb-1">
          YOUR LOGO
        </p>
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-primary-light to-transparent my-1.5" />
        <p className="text-[10px] tracking-[0.3em] font-medium text-text/50 uppercase">
          PLACE HERE
        </p>
      </div>
    </div>
  );
};
