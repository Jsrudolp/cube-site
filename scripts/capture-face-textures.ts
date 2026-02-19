import { chromium } from "@playwright/test";
import { FACES } from "../src/lib/faces";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(__dirname, "../public/face-textures");

async function main() {
  // Check if dev server is reachable
  try {
    await fetch(BASE_URL);
  } catch {
    console.error(
      `ERROR: Dev server not reachable at ${BASE_URL}.\nStart it with "npm run dev" in another terminal.`
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  for (const face of FACES) {
    const url = `${BASE_URL}${face.route}`;
    const outPath = path.join(OUTPUT_DIR, `${face.id}.png`);

    console.log(`Capturing ${face.id} → ${url}`);

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    // Hide the top nav bar so the screenshot is just page content
    await page.addStyleTag({ content: "nav { display: none !important; }" });

    await page.screenshot({ path: outPath });
    await page.close();

    console.log(`  Saved ${outPath}`);
  }

  await browser.close();
  console.log("\nDone! All face textures captured.");
}

main();
