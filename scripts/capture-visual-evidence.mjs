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

  await browser.close();
  console.log("Finished capturing visual evidence!");
}

capture().catch((err) => {
  console.error("Error capturing visual evidence:", err);
  process.exit(1);
});
