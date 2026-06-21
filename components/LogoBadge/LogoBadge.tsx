/**
 * LogoBadge Component
 * A placeholder logo badge that accepts a letter/initials, label, and tagline.
 * Themed via CSS variables — swap colors by overriding --color-primary.
 */

import styles from "./LogoBadge.module.css";

interface LogoBadgeProps {
  /** Short initials or letter shown inside the badge */
  initials?: string;
  /** Company / app name displayed below the badge */
  label?: string;
  /** Subtitle shown under the label */
  tagline?: string;
}

export default function LogoBadge({
  initials = "BD",
  label = "Bulls Deals",
  tagline = "Affordable Transaction Management for Real Estate Brokerages",
}: LogoBadgeProps) {
  return (
    <div className={styles.wrapper}>
      {/* Badge */}
      <div className={styles.badge} aria-hidden="true">
        <div className={styles.badgeInner}>
          <span className={styles.initials}>{initials}</span>
          <div className={styles.ornament} />
        </div>
      </div>

      {/* Text */}
      <h1 className={styles.label}>{label}</h1>
      <p className={styles.tagline}>{tagline}</p>
    </div>
  );
}
