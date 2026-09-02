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

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to publish blog post.");
      } else {
        setPosts((prev) => [data.post, ...prev.filter((p) => p.id !== data.post.id)]);
        setSuccessMsg("Blog post published and committed successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setInstrument("");
        setMagneticField("");
        setTemperature("");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setErrorMsg("Error submitting post to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return null; // Initial loading check
  }

  return (
    <div className={styles.container}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <div className={styles.badge}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>Admin Terminal · Authenticated</span>
            </div>
            <h1 className={styles.pageTitle}>Research Blog & Media Studio</h1>
          </div>

          <div className={styles.actionsGroup}>
            <Link href="/blog" className={styles.viewBlogBtn}>
              View Live Blog →
            </Link>
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Log Out
            </button>
          </div>
        </div>

        {successMsg && <div className={styles.bannerSuccess}>{successMsg}</div>}
        {errorMsg && <div className={styles.bannerError}>{errorMsg}</div>}

        <div className={styles.grid}>
          {/* Upload Form */}
          <section className={styles.panel} aria-label="Upload New Blog Entry">
            <h2 className={styles.panelTitle}>Publish New Blog Entry</h2>

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
                  Research Location *
                </label>
                <input
                  id="post-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. RPTU Kaiserslautern-Landau / UAM Poznań"
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="post-image">
                  Photo / Scientific Figure Upload
                </label>
                <div
                  className={styles.fileDropZone}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Click to select blog image file"
                >
                  <input
                    ref={fileInputRef}
                    id="post-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className={styles.fileInput}
                  />
                  <p className={styles.dropPrompt}>
                    {selectedFile
                      ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
                      : "Drag & drop or click to upload scientific photograph / graphic (PNG, JPG, WEBP)"}
                  </p>
                </div>

                {previewUrl && (
                  <div style={{ position: "relative", width: "100%", height: 180, marginTop: 8 }}>
                    <Image
                      src={previewUrl}
                      alt="Upload preview"
                      fill
                      unoptimized
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  </div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="post-description">
                  Description & Context *
                </label>
                <textarea
                  id="post-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide scientific notes, experimental conditions, or simulation observations..."
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="post-instrument">
                    Apparatus / Instrument
                  </label>
                  <input
                    id="post-instrument"
                    type="text"
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    placeholder="e.g. BLS Spectrometer / MuMax3"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="post-field">
                    Magnetic Field (optional)
                  </label>
                  <input
                    id="post-field"
                    type="text"
                    value={magneticField}
                    onChange={(e) => setMagneticField(e.target.value)}
                    placeholder="e.g. 150 mT out-of-plane"
                    className={styles.input}
                  />
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
                {loading ? "Publishing Entry..." : "Publish to Blog →"}
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
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
