"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { Footer } from "../../../components/footer/Footer";
import { Header } from "../../../components/navigation/Header";
import type { BlogPost } from "../../../content/schemas/blog.schema";
import styles from "./admin-blog.module.css";

export default function AdminBlogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editing state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Laboratory");
  const [location, setLocation] = useState("RPTU Kaiserslautern-Landau");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("Spintronics, Laboratory, Research");
  const [instrument, setInstrument] = useState("");
  const [magneticField, setMagneticField] = useState("");
  const [temperature, setTemperature] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Check auth and load posts
  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const authRes = await fetch("/api/admin/auth");
        const authData = await authRes.json();

        if (!authData.authenticated) {
          router.replace("/admin/login");
          return;
        }

        setIsAuthenticated(true);

        const postsRes = await fetch("/api/admin/blog");
        const postsData = await postsRes.json();
        if (postsData.posts) {
          setPosts(postsData.posts);
        }
      } catch {
        router.replace("/admin/login");
      }
    }

    checkAuthAndLoad();
  }, [router]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
  };

  const handleStartEdit = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setDate(post.date);
    setCategory(post.category);
    setLocation(post.location || "RPTU Kaiserslautern-Landau");
    setDescription(post.description);
    setTags(post.tags.join(", "));
    setInstrument(post.technicalDetails?.instrument || "");
    setMagneticField(post.technicalDetails?.magneticField || "");
    setTemperature(post.technicalDetails?.temperature || "");
    setPreviewUrl(post.imageUrl);
    setSelectedFile(null);
    setErrorMsg("");
    setSuccessMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setInstrument("");
    setMagneticField("");
    setTemperature("");
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        if (editingPostId === id) {
          handleCancelEdit();
        }
        setSuccessMsg("Blog post deleted successfully.");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg("Failed to delete blog post.");
      }
    } catch {
      setErrorMsg("Network error deleting post.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      if (editingPostId) {
        formData.append("id", editingPostId);
      }
      formData.append("title", title);
      formData.append("date", date);
      formData.append("category", category);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("tags", tags);

      if (instrument) formData.append("instrument", instrument);
      if (magneticField) formData.append("magneticField", magneticField);
      if (temperature) formData.append("temperature", temperature);

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const method = editingPostId ? "PUT" : "POST";

      const res = await fetch("/api/admin/blog", {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save blog post.");
      } else {
        if (editingPostId) {
          setPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
          setSuccessMsg("Blog post updated and saved successfully!");
        } else {
          setPosts((prev) => [data.post, ...prev.filter((p) => p.id !== data.post.id)]);
          setSuccessMsg("Blog post published and committed successfully!");
        }
        // Reset form
        handleCancelEdit();
      }
    } catch {
      setErrorMsg("Error submitting post to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className={styles.container}>
        <Header />
        <main id="main-content" className={styles.mainContent} tabIndex={-1}>
          <h1
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
          >
            Weryfikacja autoryzacji Blog Studio
          </h1>
          <div style={{ textAlign: "center", padding: "8rem 0" }}>
            <p style={{ color: "var(--color-ink-muted)" }}>Weryfikacja tożsamości administratora...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <Link href="/admin" className={styles.backLink}>
            ← Panel Główny (/admin)
          </Link>
          <Link href="/blog" className={styles.backLink}>
            Zobacz Blog Publiczny →
          </Link>
        </div>

        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <div className={styles.badge}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>Admin Terminal · Authenticated</span>
            </div>
            <h1 className={styles.pageTitle}>Research Blog & Media Studio</h1>
          </div>

          <div className={styles.actionsGroup}>
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Log Out
            </button>
          </div>
        </div>

        {successMsg && <div className={styles.bannerSuccess}>{successMsg}</div>}
        {errorMsg && <div className={styles.bannerError}>{errorMsg}</div>}

        <div className={styles.grid}>
          {/* Upload / Edit Form */}
          <section className={styles.panel} aria-label="Upload New Blog Entry">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 className={styles.panelTitle} style={{ margin: 0 }}>
                {editingPostId ? "Edytuj Wpis Laboratoryjny" : "Publish New Blog Entry"}
              </h2>

              {editingPostId && (
                <button type="button" onClick={handleCancelEdit} className={styles.cancelEditBtn}>
                  Anuluj edycję ✕
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="post-title">
                  Entry Title *
                </label>
                <input
                  id="post-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Laser Excitation of Curvilinear Spin-Waves..."
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="post-category">
                    Category *
                  </label>
                  <select
                    id="post-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Simulation">Simulation</option>
                    <option value="Conference">Conference</option>
                    <option value="Theory">Theory</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Publication">Publication</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="post-date">
                    Publication Date *
                  </label>
                  <input
                    id="post-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="post-location">
                  Research Location / Facility
                </label>
                <input
                  id="post-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. RPTU Kaiserslautern-Landau / UAM Poznań"
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="post-desc">
                  Scientific Description & Abstract *
                </label>
                <textarea
                  id="post-desc"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Concise overview of observation, methodology, results or simulation parameters..."
                  className={styles.textarea}
                />
              </div>

              {/* Image Upload Zone */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {editingPostId ? "Zmień Zdjęcie (opcjonalne)" : "Laboratory Photograph / Micrograph *"}
                </label>

                <div
                  className={styles.dropZone}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/avif"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />

                  {previewUrl ? (
                    <div className={styles.previewContainer}>
                      <Image
                        src={previewUrl}
                        alt="Upload preview"
                        fill
                        unoptimized
                        className={styles.previewImage}
                      />
                      <span className={styles.replaceHint}>Kliknij, aby zmienić grafikę</span>
                    </div>
                  ) : (
                    <div className={styles.dropZoneContent}>
                      <span className={styles.uploadIcon} aria-hidden="true">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </span>
                      <span className={styles.dropZoneText}>
                        Kliknij lub przeciągnij plik (JPEG, PNG, WebP, AVIF do 10MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Details Accordion */}
              <div className={styles.detailsBox}>
                <span className={styles.detailsBoxTitle}>Parametry Eksperymentalne (Opcjonalne)</span>

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.labelSmall} htmlFor="spec-instrument">
                      Aparatura Pomiarowa
                    </label>
                    <input
                      id="spec-instrument"
                      type="text"
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}
                      placeholder="np. BLS Spectrometer / Mumax3 GPU"
                      className={styles.inputSmall}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.labelSmall} htmlFor="spec-field">
                      Pole Zewnętrzne (B)
                    </label>
                    <input
                      id="spec-field"
                      type="text"
                      value={magneticField}
                      onChange={(e) => setMagneticField(e.target.value)}
                      placeholder="np. 45 mT prostopadłe"
                      className={styles.inputSmall}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.labelSmall} htmlFor="spec-temp">
                      Temperatura (T)
                    </label>
                    <input
                      id="spec-temp"
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="np. 293 K / Pokojowa"
                      className={styles.inputSmall}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="post-tags">
                  Tags (comma separated)
                </label>
                <input
                  id="post-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Skyrmions, DMI, Nanomagnetism"
                  className={styles.input}
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Saving..." : editingPostId ? "Zapisz Zmiany we Wpisie →" : "Publish to Blog →"}
              </button>
            </form>
          </section>

          {/* Existing Posts Manager */}
          <section className={styles.panel} aria-label="Existing Blog Posts">
            <h2 className={styles.panelTitle}>Published Entries ({posts.length})</h2>

            <div className={styles.postsList}>
              {posts.map((post) => (
                <div key={post.id} className={styles.postItem}>
                  <div style={{ position: "relative", width: 60, height: 45, flexShrink: 0 }}>
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      fill
                      unoptimized
                      style={{ objectFit: "cover", borderRadius: 2 }}
                    />
                  </div>

                  <div className={styles.postMeta}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <div className={styles.postSubtext}>
                      {post.date} · {post.category} · {post.location}
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(post)}
                      className={styles.editBtn}
                      aria-label={`Edit post: ${post.title}`}
                      title="Edit post"
                    >
                      Edytuj
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className={styles.deleteBtn}
                      aria-label={`Delete post: ${post.title}`}
                      title="Delete post"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
