"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Footer } from "../../components/footer/Footer";
import { Header } from "../../components/navigation/Header";
import { blogPosts } from "../../content";
import { useTranslation } from "../../content/i18n/i18n-context";
import type { BlogPost } from "../../content/schemas/blog.schema";
import styles from "./blog.module.css";

export default function BlogPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  const filteredPosts =
    selectedCategory === "all" ? blogPosts : blogPosts.filter((post) => post.category === selectedCategory);

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

        {/* Category Filters */}
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

        {/* Vertical Parallax Gallery */}
        {filteredPosts.length === 0 ? (
          <p className={styles.lead}>{t.blogPage.noPosts}</p>
        ) : (
          <div className={styles.gallery} data-testid="blog-parallax-gallery">
            {filteredPosts.map((post) => (
              <article key={post.id} className={styles.galleryItem} data-testid={`blog-post-${post.id}`}>
                {/* Image Pane with Parallax Hover and Ambient Glow */}
                <div
                  className={styles.imageFrameWrapper}
                  onClick={() => setActiveLightboxPost(post)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveLightboxPost(post);
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
                      <div className={styles.specsTitle}>✦ {t.blogPage.technicalSpecs}</div>
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
                        {post.technicalDetails.temperature && (
                          <span>Temp: {post.technicalDetails.temperature}</span>
                        )}
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
