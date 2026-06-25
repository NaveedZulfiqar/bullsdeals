// components/auth/Divider.tsx
"use client";

import React from "react";

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = "or" }) => {
  return (
    <div className="relative flex py-5 items-center w-full">
      <div className="flex-grow border-t border-border" />
      <span className="flex-shrink mx-4 text-xs font-medium tracking-widest text-text/40 uppercase">
        {text}
      </span>
      <div className="flex-grow border-t border-border" />
    </div>
  );
};
