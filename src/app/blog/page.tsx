"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { blogPosts } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import type { BlogPost } from "../../content/schemas/blog.schema";
import styles from "./blog.module.css";

interface ParallaxItemProps {
  post: BlogPost;
  onOpenLightbox: (post: BlogPost) => void;
  specsTitle: string;
}

function ParallaxGalleryItem({ post, onOpenLightbox, specsTitle }: ParallaxItemProps) {
  const itemRef = useRef<HTMLElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const centerDistance = viewportHeight / 2 - (rect.top + rect.height / 2);
            const move = Math.max(-28, Math.min(28, centerDistance * 0.06));
            setParallaxY(move);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <article ref={itemRef} className={styles.galleryItem} data-testid={`blog-post-${post.id}`}>
      {/* Image Pane with Parallax Depth and Ambient Glow */}
      <div
        className={styles.imageFrameWrapper}
        style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
        onClick={() => onOpenLightbox(post)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenLightbox(post);
          }
        }}
        aria-label={`Open high-resolution view of: ${post.title}`}
      >
        <div className={styles.ambientBacklight} aria-hidden="true" />
        <div className={styles.imageContainer}>
          <Image
            src={post.imageUrl}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 960px) 100vw, 50vw"
            className={styles.parallaxImage}
          />
          <div className={styles.zoomBadge}>
            <span aria-hidden="true">⤢</span>
            <span>Zoom View</span>
          </div>
        </div>
      </div>

      {/* Editorial Content Card */}
      <div className={styles.contentCard}>
        <div className={styles.cardMetaRow}>
          <span className={styles.categoryPill}>{post.category}</span>
          <span className={styles.datePill}>{post.date}</span>
          <span className={styles.locationPill}>📍 {post.location}</span>
        </div>

        <h2 className={styles.postHeading}>{post.title}</h2>
        <p className={styles.postDescription}>{post.description}</p>

        {post.technicalDetails && (
          <div className={styles.specsBox}>
            <div className={styles.specsTitle}>✦ {specsTitle}</div>
            <div className={styles.specsList}>
              {post.technicalDetails.instrument && (
                <span>Instrument: {post.technicalDetails.instrument}</span>
              )}
              {post.technicalDetails.simulationEngine && (
                <span>Engine: {post.technicalDetails.simulationEngine}</span>
              )}
              {post.technicalDetails.magneticField && (
                <span>Field: {post.technicalDetails.magneticField}</span>
              )}
              {post.technicalDetails.temperature && <span>Temp: {post.technicalDetails.temperature}</span>}
              {post.technicalDetails.magnification && (
                <span>Magnification: {post.technicalDetails.magnification}</span>
              )}
            </div>
          </div>
        )}

        <div className={styles.tagRow}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tagPill}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeLightboxPost, setActiveLightboxPost] = useState<BlogPost | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxPost(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categories = [
    { id: "all", label: t.blogPage.allCategories },
    { id: "Laboratory", label: t.blogPage.categoryLab },
    { id: "Simulation", label: t.blogPage.categorySim },
    { id: "Equipment", label: t.blogPage.categoryEquip },
    { id: "Theory", label: t.blogPage.categoryTheory },
    { id: "Conference", label: t.blogPage.categoryConf },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const matchesTitle = post.title.toLowerCase().includes(q);
    const matchesDesc = post.description.toLowerCase().includes(q);
    const matchesLocation = post.location.toLowerCase().includes(q);
    const matchesTags = post.tags.some((tag) => tag.toLowerCase().includes(q));
    const matchesInstrument = post.technicalDetails?.instrument?.toLowerCase().includes(q) || false;

    return matchesTitle || matchesDesc || matchesLocation || matchesTags || matchesInstrument;
  });

  return (
    <div className={styles.container}>
      <Header />

      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        <Link href="/" className={styles.backLink}>
          {t.blogPage.backToHome}
        </Link>

        <header className={styles.headerArea}>
          <span className={styles.tag}>{t.blogPage.tag}</span>
          <h1 className={styles.title}>
            {t.blogPage.heading} <br />
            <span className={styles.titleAccent}>{t.blogPage.headingAccent}</span>
          </h1>
          <p className={styles.lead}>{t.blogPage.lead}</p>
        </header>

        {/* Search & Category Filters */}
        <div className={styles.searchContainer}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laboratory notes, apparatus, tags..."
            className={styles.searchInput}
            aria-label="Search blog entries"
          />
        </div>

        <nav className={styles.filterBar} aria-label="Filter blog posts by category">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.filterBtnActive : ""}`}
              aria-pressed={selectedCategory === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        <div className={styles.resultsMeta}>
          <span>
            {filteredPosts.length} / {blogPosts.length} articles displayed
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-primary)",
                cursor: "pointer",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "var(--text-mono-xs)",
              }}
            >
              Clear search ✕
            </button>
          )}
        </div>

        {/* Vertical Parallax Gallery */}
        {filteredPosts.length === 0 ? (
          <p className={styles.lead}>{t.blogPage.noPosts}</p>
        ) : (
          <div className={styles.gallery} data-testid="blog-parallax-gallery">
            {filteredPosts.map((post) => (
              <ParallaxGalleryItem
                key={post.id}
                post={post}
                onOpenLightbox={setActiveLightboxPost}
                specsTitle={t.blogPage.technicalSpecs}
              />
            ))}
          </div>
        )}

        {/* High-Resolution Lightbox Modal */}
        {activeLightboxPost && (
          <div
            className={styles.lightboxOverlay}
            onClick={() => setActiveLightboxPost(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeLightboxPost.title}
          >
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.lightboxImageWrapper}>
                <Image
                  src={activeLightboxPost.imageUrl}
                  alt={activeLightboxPost.imageAlt || activeLightboxPost.title}
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>

              <div className={styles.lightboxDetails}>
                <div>
                  <h3 className={styles.lightboxTitle}>{activeLightboxPost.title}</h3>
                  <div className={styles.datePill}>
                    {activeLightboxPost.location} · {activeLightboxPost.date}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveLightboxPost(null)}
                  className={styles.lightboxCloseBtn}
                  aria-label={t.blogPage.lightboxClose}
                >
                  {t.blogPage.lightboxClose}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
