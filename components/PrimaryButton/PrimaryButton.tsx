/**
 * PrimaryButton Component
 * A themed, accessible button supporting loading state and full-width variant.
 * Primary style is golden gradient with glow shadow; ghost variant is outlined.
 */

import styles from "./PrimaryButton.module.css";

type ButtonVariant = "primary" | "ghost";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function PrimaryButton({
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...rest
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.fullWidth : "",
        isLoading ? styles.loading : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.loadingText}>Signing in…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
