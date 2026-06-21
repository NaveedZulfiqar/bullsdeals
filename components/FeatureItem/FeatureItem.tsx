/**
 * FeatureItem Component
 * A single feature bullet shown on the colored panel of the login card.
 * Accepts an icon (SVG path), label, and optional description.
 */

import styles from "./FeatureItem.module.css";

interface FeatureItemProps {
  icon: React.ReactNode;
  label: string;
}

export default function FeatureItem({ icon, label }: FeatureItemProps) {
  return (
    <div className={styles.item}>
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
