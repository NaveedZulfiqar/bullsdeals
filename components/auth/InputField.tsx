// components/auth/InputField.tsx
"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  iconType?: "email" | "password" | "text";
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  type = "text",
  iconType,
  className = "",
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  // Select lucide icon based on iconType or type
  const renderIcon = () => {
    const iconClass = "w-5 h-5 text-text/40 transition-colors duration-300 group-focus-within:text-primary";
    
    if (iconType === "email" || type === "email") {
      return <Mail className={iconClass} />;
    }
    if (iconType === "password" || isPasswordType) {
      return <Lock className={iconClass} />;
    }
    return null;
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-wider text-text/70 uppercase transition-all duration-300 group-focus-within:text-primary"
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative group flex items-center">
        {/* Left Icon (Mail, Lock, etc.) */}
        {renderIcon() && (
          <div className="absolute left-4 pointer-events-none flex items-center justify-center">
            {renderIcon()}
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          type={inputType}
          className={`w-full text-sm text-text bg-card border border-border rounded-2xl py-3.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 placeholder:text-text/30
            ${renderIcon() ? "pl-11" : "px-4"} 
            ${isPasswordType ? "pr-11" : "pr-4"}
            ${error ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""}
          `}
          {...props}
        />

        {/* Right Icon for Password Show/Hide Toggle */}
        {isPasswordType && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-text/40 hover:text-text/70 focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 transition-transform active:scale-90" />
            ) : (
              <Eye className="w-5 h-5 transition-transform active:scale-90" />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <span className="text-xs text-red-500 font-medium pl-1 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};
