"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { Footer } from "../../../components/footer/Footer";
import { Header } from "../../../components/navigation/Header";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
      } else {
        router.push("/admin/blog");
      }
    } catch {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <div className={styles.loginCard}>
          <span className={styles.badge}>Restricted Access</span>
          <h1 className={styles.title}>Admin Authentication</h1>
          <p className={styles.subtitle}>
            Enter the administrative secret key to access the research blog management terminal and upload
            laboratory imagery.
          </p>

          {error && (
            <div className={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="admin-password" className={styles.label}>
                Secret Password / Token
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="••••••••••••"
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading || !password} className={styles.submitBtn}>
              {loading ? "Authenticating..." : "Authorize Access →"}
            </button>
          </form>

          <Link href="/" className={styles.backLink}>
            ← Return to public website
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
