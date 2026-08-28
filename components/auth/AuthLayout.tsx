// components/auth/AuthLayout.tsx
"use client";

import React from "react";
import Image from "next/image";
import { BackgroundPattern } from "./BackgroundPattern";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen w-full bg-bg flex flex-col md:grid md:grid-cols-2 lg:grid-cols-12">
      {/* =========================
          LEFT SIDE - LOGIN FORM
      ========================== */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center bg-card px-6 py-12 shadow-xl md:px-10 md:shadow-none sm:px-12 lg:col-span-5 xl:col-span-5">
        {/* Vertical Divider */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border to-transparent md:block" />

        {/* Login Form */}
        <div className="w-full max-w-[420px] transition-all duration-500">
          {children}
        </div>
      </div>

      {/* =========================
          RIGHT SIDE - BRANDING
      ========================== */}
      <div className="relative flex min-h-[450px] flex-1 items-center justify-center overflow-hidden px-8 py-12 md:min-h-screen md:px-14 lg:col-span-7 xl:col-span-7">
        {/* Background Design */}
        <BackgroundPattern />

        {/* Center Content */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
          {/* Logo */}
          <div className="flex w-full items-center justify-center">
            <Image
              src="/logo.png"
              alt="The Realty Bulls"
              width={700}
              height={700}
              priority
              className="
                h-auto
                w-[320px]
                sm:w-[400px]
                md:w-[500px]
                lg:w-[580px]
                xl:w-[650px]
                2xl:w-[720px]
                object-contain
                drop-shadow-2xl
                select-none
              "
            />
          </div>

          {/* Tagline */}
          <p className="mt-10 max-w-md text-center text-sm font-medium uppercase tracking-[0.35em] text-text/60 leading-8 md:text-base">
            EXPERIENCE PREMIUM ELEGANCE
            <br />
            &amp;
            <br />
            SOPHISTICATED DESIGN
          </p>
        </div>
      </div>
    </main>
  );
};