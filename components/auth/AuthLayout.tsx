// components/auth/AuthLayout.tsx
"use client";

import React from "react";
import { BackgroundPattern } from "./BackgroundPattern";
import { LogoPlaceholder } from "./LogoPlaceholder";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen w-full bg-bg flex flex-col md:grid md:grid-cols-2 lg:grid-cols-12">
      {/* LEFT SIDE: Login Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 md:px-10 lg:col-span-5 xl:col-span-5 bg-card relative z-10 shadow-xl md:shadow-none">
        {/* Decorative subtle border light on card side */}
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent hidden md:block" />
        
        {/* Interactive card wrapper */}
        <div className="w-full max-w-[420px] transition-all duration-500">
          {children}
        </div>
      </div>

      {/* RIGHT SIDE: Elegant Decorative Panel */}
      {/* Moves below login form on mobile (flex-col behavior), side-by-side on desktop */}
      <div className="flex-1 min-h-[400px] md:min-h-screen relative flex flex-col items-center justify-center p-8 md:p-12 lg:col-span-7 xl:col-span-7 overflow-hidden">
        {/* Background Patterns, Blurred Circles and Gradients */}
        <BackgroundPattern />

        {/* Foreground Content: Dedicated empty Logo Placeholder area */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <LogoPlaceholder />
          
          {/* Subtle luxurious tagline under the placeholder */}
          <p className="mt-6 text-xs text-text/50 font-medium tracking-[0.2em] uppercase text-center max-w-[280px] leading-relaxed">
            Experience Premium Elegance &amp; Sophisticated Design
          </p>
        </div>
      </div>
    </main>
  );
};
