import { chromium } from "playwright";
import { resolve } from "path";

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log("Navigating to http://localhost:3154/?tier=medium...");
  await page.goto("http://localhost:3154/?tier=medium", { waitUntil: "networkidle" });

  const artifactDir = "/home/kkingstoun/.gemini/antigravity-ide/brain/06fae17a-5de0-4f19-a175-cd8b7c5b8a0c";

  // 1. Grants section
  const grantsElem = page.locator("#grants");
  if (await grantsElem.count()) {
    await grantsElem.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: resolve(artifactDir, "homepage-grants-section.png"),
    });
    console.log("Captured homepage-grants-section.png");
  }

  // 2. Affiliations & Logos strip
  const affElem = page.locator("section[aria-label*='Affiliations'], section[aria-label*='Afiliacje']");
  if (await affElem.count()) {
    await affElem.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: resolve(artifactDir, "homepage-affiliations-logos.png"),
    });
    console.log("Captured homepage-affiliations-logos.png");
  }

  // 3. Switch to Polish language
  const plBtn = page.getByRole("button", { name: "Wersja polska" });
  if (await plBtn.count()) {
    await plBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: resolve(artifactDir, "homepage-polish-mode.png"),
    });
    console.log("Captured homepage-polish-mode.png");
  }

  // 4. Navigate to /publications
  console.log("Navigating to /publications...");
  await page.goto("http://localhost:3154/publications", { waitUntil: "networkidle" });
  await page.screenshot({
    path: resolve(artifactDir, "publications-archive-page.png"),
  });
  console.log("Captured publications-archive-page.png");

  // 5. Test search filter on /publications
  const searchInput = page.locator("input[type='search']");
  if (await searchInput.count()) {
    await searchInput.fill("skyrmion");
    await page.waitForTimeout(300);
    await page.screenshot({
      path: resolve(artifactDir, "publications-search-filter.png"),
    });
    console.log("Captured publications-search-filter.png");
  }

  // 6. Navigate to /admin/scholar
  console.log("Navigating to /admin/scholar...");
  await page.goto("http://localhost:3154/admin/scholar", { waitUntil: "networkidle" });
  await page.screenshot({
    path: resolve(artifactDir, "admin-scholar-dashboard.png"),
  });
  console.log("Captured admin-scholar-dashboard.png");

  // 7. Parse BibTeX and capture staged state
  const parseBtn = page.locator("[data-testid='bibtex-parse-btn']");
  if (await parseBtn.count()) {
    await parseBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: resolve(artifactDir, "admin-scholar-staged.png"),
      fullPage: true,
    });
    console.log("Captured admin-scholar-staged.png");
  }

  // 8. Navigate to /cv
  console.log("Navigating to /cv...");
  await page.goto("http://localhost:3154/cv", { waitUntil: "networkidle" });
  await page.screenshot({
    path: resolve(artifactDir, "cv-academic-profile.png"),
    fullPage: true,
  });
  console.log("Captured cv-academic-profile.png");

  await browser.close();
  console.log("Finished capturing visual evidence!");
}

capture().catch((err) => {
  console.error("Error capturing visual evidence:", err);
  process.exit(1);
});
