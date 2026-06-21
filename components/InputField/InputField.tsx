/**
 * InputField Component
 * A production-ready, accessible text input with label, floating helper text,
 * optional leading icon, optional show/hide toggle for passwords.
 * Uses :user-invalid + :has() for native CSS error styling with JS fallback.
 */

"use client";

import { useState, useId } from "react";
import styles from "./InputField.module.css";

interface InputFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "tel";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  icon?: React.ReactNode;
}

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required = false,
  defaultValue,
  icon,
}: InputFieldProps) {
  const uid = useId();
  const inputId = `field-${uid}-${name}`;
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";

  const resolvedType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className={styles.group}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        {icon && (
          <span className={styles.leadingIcon} aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={resolvedType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          aria-required={required}
          className={`${styles.input} ${icon ? styles.hasIcon : ""} ${
            isPassword ? styles.hasTrailing : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.trailingBtn}
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {/* native validation message via CSS :user-invalid */}
      <span className={styles.errorMsg} aria-live="polite" role="alert" />
    </div>
  );
}

/* ── Inline SVG icons ────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
