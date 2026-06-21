"use client";

/**
 * LoginForm Component
 * Handles the sign-in form logic, validation, and loading state.
 * Separated from page.tsx so it can be used as a pure client component.
 */

import { useState, useRef } from "react";
import InputField from "@/components/InputField/InputField";
import PrimaryButton from "@/components/PrimaryButton/PrimaryButton";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simulate network request — replace with real auth call
    await new Promise((res) => setTimeout(res, 1800));

    // TODO: Replace with actual authentication logic
    // const formData = new FormData(formRef.current!);
    // const result = await signIn(formData.get("email"), formData.get("password"));

    setIsLoading(false);
    setError("Invalid email or password. Please try again.");
  }

  return (
    <form
      id="login-form"
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={styles.form}
    >
      <InputField
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••••"
        autoComplete="current-password"
        required
      />

      {/* Row: Remember Me + Forgot */}
      <div className={styles.row}>
        <label className={styles.checkLabel}>
          <input
            id="remember-me"
            name="remember"
            type="checkbox"
            className={styles.checkbox}
          />
          <span className={styles.checkmark} aria-hidden="true" />
          <span className={styles.checkText}>Remember Me</span>
        </label>

        <a
          href="/forgot-password"
          id="forgot-password-link"
          className={styles.forgotLink}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.linkIcon}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Forgot my password
        </a>
      </div>

      {/* Server / auth error */}
      {error && (
        <div role="alert" className={styles.errorBanner}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.errorIcon}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      <PrimaryButton
        type="submit"
        fullWidth
        isLoading={isLoading}
        id="sign-in-btn"
      >
        Sign In
      </PrimaryButton>
    </form>
  );
}
