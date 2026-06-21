import type { Metadata } from "next";
import LogoBadge from "@/components/LogoBadge/LogoBadge";
import FeatureItem from "@/components/FeatureItem/FeatureItem";
import LoginForm from "@/components/LoginForm/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sign In — Bulls Deals",
  description:
    "Access your Bulls Deals dashboard. Affordable transaction management for real estate brokerages.",
};

/* ── Feature data ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    label: "User-Friendly Interface",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    label: "Collaboration Tools",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Cost Efficiency",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },];

/* ── Page ─────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.card} role="region" aria-label="Sign in">
        {/* ── Left panel: branded ─────────────────────────────── */}
        <aside className={styles.panel}>
          {/* decorative rings */}
          <div className={styles.ring1} aria-hidden="true" />
          <div className={styles.ring2} aria-hidden="true" />

          <div className={styles.panelContent}>
            <LogoBadge
              initials="BD"
              label="Bulls Deals"
              tagline="Affordable Transaction Management for Real Estate Brokerages"
            />

            <ul className={styles.features} aria-label="Platform features">
              {FEATURES.map((f) => (
                <li key={f.label}>
                  <FeatureItem icon={f.icon} label={f.label} />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Right panel: form ───────────────────────────────── */}
        <section className={styles.formSection}>
          <div className={styles.formHeader}>
            <h2 className={styles.heading}>Welcome Back</h2>
            <p className={styles.subheading}>Sign in to start your session</p>
          </div>

          <LoginForm />

          <footer className={styles.footer}>
            <p className={styles.copyright}>
              © 2025‑2026 Bulls Deals
            </p>
            <p className={styles.rights}>All rights reserved.</p>
          </footer>
        </section>
      </div>
    </main>
  );
}
