"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas-pro";
import * as THREE from "three";
import { FaceId, FACES } from "@/lib/faces";
import { FACE_INDEX_TO_ID, FACE_COLORS } from "@/lib/cube-config";

interface DynamicTextureState {
  textures: (THREE.CanvasTexture | null)[];
  canvases: Map<FaceId, HTMLCanvasElement>;
  ready: boolean;
  loadedCount: number;
}

/**
 * On portrait viewports (mobile), the capture renders the page at its natural vw width,
 * then composes it centered onto a squareSize×squareSize canvas with the face's background
 * color filling the side padding. This lets the zoom animation naturally "zoom past"
 * the padding into the core content.
 */
function composeSquare(
  src: HTMLCanvasElement,
  squareSize: number,
  contentWidth: number,
  bgColor: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, squareSize, squareSize);
  const xOffset = Math.round((squareSize - contentWidth) / 2);
  ctx.drawImage(src, xOffset, 0);
  return canvas;
}

/**
 * Detects the slope (dy/dx, pixels down per pixel right) of the dominant
 * diagonal color boundary near the left edge of a canvas.
 * Horizontal boundaries contribute zero and are averaged out, so only
 * slanted boundaries (like the building page's orange polygon) register.
 */
function detectLeftEdgeSlope(src: HTMLCanvasElement, squareSize: number): number {
  const srcCtx = src.getContext("2d");
  if (!srcCtx) return 0;

  const dx = Math.min(48, Math.floor(src.width * 0.1));
  if (dx < 4) return 0;

  const col0 = srcCtx.getImageData(0, 0, 1, squareSize).data;
  const colDx = srcCtx.getImageData(dx, 0, 1, squareSize).data;

  function findTransitions(data: Uint8ClampedArray): number[] {
    const raw: number[] = [];
    for (let y = 2; y < squareSize - 2; y++) {
      const i = y * 4, pi = (y - 2) * 4;
      const delta =
        Math.abs(data[i] - data[pi]) +
        Math.abs(data[i + 1] - data[pi + 1]) +
        Math.abs(data[i + 2] - data[pi + 2]);
      if (delta > 60) raw.push(y);
    }
    // Merge transitions within 5px of each other
    const merged: number[] = [];
    for (const t of raw) {
      if (merged.length === 0 || t - merged[merged.length - 1] > 5) merged.push(t);
    }
    return merged;
  }

  const t0 = findTransitions(col0);
  const tDx = findTransitions(colDx);
  if (t0.length === 0 || tDx.length === 0) return 0;

  let totalDy = 0, count = 0;
  for (const y0 of t0) {
    let bestDy = Infinity;
    for (const yd of tDx) {
      if (Math.abs(yd - y0) < Math.abs(bestDy)) bestDy = yd - y0;
    }
    if (Math.abs(bestDy) < squareSize * 0.3) {
      totalDy += bestDy;
      count++;
    }
  }

  return count > 0 ? (totalDy / count) / dx : 0;
}

/**
 * Like composeSquare, but extrapolates diagonal color boundaries into the padding
 * instead of flattening them. Detects the slope of the left edge, then for each
 * padding pixel samples the edge column at a y offset proportional to how far
 * left it sits — continuing the slant naturally.
 */
function composeSquareSlanted(
  src: HTMLCanvasElement,
  squareSize: number,
  contentWidth: number,
  bgColor: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext("2d")!;
  const srcCtx = src.getContext("2d")!;
  const xOffset = Math.round((squareSize - contentWidth) / 2);

  const slope = detectLeftEdgeSlope(src, squareSize);

  // Solid fill as fallback base
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, squareSize, squareSize);

  if (xOffset > 0) {
    // Left padding: for each pixel (px, py), sample col0 at py + (xOffset-px)*slope
    // This continues the diagonal rather than flattening it to a horizontal band.
    const col0 = srcCtx.getImageData(0, 0, 1, squareSize).data;
    const padL = ctx.createImageData(xOffset, squareSize);
    for (let py = 0; py < squareSize; py++) {
      for (let px = 0; px < xOffset; px++) {
        const d = xOffset - px;
        const sy = Math.max(0, Math.min(squareSize - 1, Math.round(py + d * slope)));
        const si = sy * 4;
        const di = (py * xOffset + px) * 4;
        padL.data[di]     = col0[si];
        padL.data[di + 1] = col0[si + 1];
        padL.data[di + 2] = col0[si + 2];
        padL.data[di + 3] = col0[si + 3];
      }
    }
    ctx.putImageData(padL, 0, 0);
  }

  ctx.drawImage(src, xOffset, 0);

  const rightStart = xOffset + contentWidth;
  const rightWidth = squareSize - rightStart;
  if (rightWidth > 0) {
    // Right padding: mirror logic — boundary continues downward as we go right,
    // so sample colR at py - d*slope.
    const colR = srcCtx.getImageData(contentWidth - 1, 0, 1, squareSize).data;
    const padR = ctx.createImageData(rightWidth, squareSize);
    for (let py = 0; py < squareSize; py++) {
      for (let px = 0; px < rightWidth; px++) {
        const d = px + 1;
        const sy = Math.max(0, Math.min(squareSize - 1, Math.round(py - d * slope)));
        const si = sy * 4;
        const di = (py * rightWidth + px) * 4;
        padR.data[di]     = colR[si];
        padR.data[di + 1] = colR[si + 1];
        padR.data[di + 2] = colR[si + 2];
        padR.data[di + 3] = colR[si + 3];
      }
    }
    ctx.putImageData(padR, rightStart, 0);
  }

  return canvas;
}

/**
 * Like composeSquare, but also extends the horizontal "hanging lines" from each
 * CommunityRow into the padding zones. Scans a thin strip near the left edge of
 * the content (before photos start, which begin at ~24px due to px-6 padding)
 * and detects rows where pixels consistently differ from the background color —
 * those are the 2px wire lines. It then fills the same rows in the padding zones
 * with the detected line color.
 */
function composeSquareCommunity(
  src: HTMLCanvasElement,
  squareSize: number,
  contentWidth: number,
  bgColor: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext("2d")!;
  const xOffset = Math.round((squareSize - contentWidth) / 2);
  const rightStart = xOffset + contentWidth;
  const rightWidth = squareSize - rightStart;

  // Background fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, squareSize, squareSize);

  // Draw captured content in center
  ctx.drawImage(src, xOffset, 0);

  // Parse background color for comparison
  const bgHex = bgColor.replace("#", "");
  const bgR = parseInt(bgHex.slice(0, 2), 16);
  const bgG = parseInt(bgHex.slice(2, 4), 16);
  const bgB = parseInt(bgHex.slice(4, 6), 16);

  // Sample strip at x=3..10 — within the CommunityRow's full-bleed area but
  // before any photo content (photos start at ~24px due to px-6 padding).
  const SCAN_X = 3;
  const SCAN_W = 8;
  const strip = src.getContext("2d")!.getImageData(SCAN_X, 0, SCAN_W, squareSize).data;
  const DIFF_THRESHOLD = 15; // min sum-RGB diff from bg to count as "line pixel"
  const MIN_RATIO = 0.75;    // fraction of strip columns that must be line pixels

  for (let y = 0; y < squareSize; y++) {
    let count = 0;
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    for (let x = 0; x < SCAN_W; x++) {
      const i = (y * SCAN_W + x) * 4;
      const r = strip[i], g = strip[i + 1], b = strip[i + 2], a = strip[i + 3];
      if (a < 128) continue;
      if (Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) > DIFF_THRESHOLD) {
        count++; sumR += r; sumG += g; sumB += b; sumA += a;
      }
    }
    if (count >= Math.ceil(SCAN_W * MIN_RATIO)) {
      ctx.fillStyle = `rgba(${Math.round(sumR/count)},${Math.round(sumG/count)},${Math.round(sumB/count)},${sumA/count/255})`;
      if (xOffset > 0)   ctx.fillRect(0,          y, xOffset,    1);
      if (rightWidth > 0) ctx.fillRect(rightStart, y, rightWidth, 1);
    }
  }

  return canvas;
}

// Module-level cache so the image is only fetched once across all captures
let _musicHeroImg: HTMLImageElement | null = null;
let _musicHeroLoading: Promise<HTMLImageElement | null> | null = null;

function getMusicHeroImage(): Promise<HTMLImageElement | null> {
  if (_musicHeroImg) return Promise.resolve(_musicHeroImg);
  if (_musicHeroLoading) return _musicHeroLoading;
  _musicHeroLoading = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { _musicHeroImg = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = "/music-hero.png";
  });
  return _musicHeroLoading;
}

/**
 * Draws /music-hero.png behind the square canvas using the same bg-cover bg-center
 * positioning the browser uses on the content element (contentWidth × squareSize).
 * This extends the real image into the padding zones rather than showing a solid fill.
 */
function composeSquareMusicHero(
  src: HTMLCanvasElement,
  squareSize: number,
  contentWidth: number,
  heroImg: HTMLImageElement | null
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext("2d")!;
  const xOffset = Math.round((squareSize - contentWidth) / 2);

  if (heroImg) {
    // Replicate bg-cover bg-center on the contentWidth × squareSize content element,
    // then offset by xOffset so the image position matches what the browser rendered.
    const iw = heroImg.naturalWidth;
    const ih = heroImg.naturalHeight;
    const scale = Math.max(contentWidth / iw, squareSize / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const imgX = xOffset + (contentWidth - sw) / 2;
    const imgY = (squareSize - sh) / 2;
    ctx.drawImage(heroImg, imgX, imgY, sw, sh);
  } else {
    ctx.fillStyle = FACE_COLORS.music;
    ctx.fillRect(0, 0, squareSize, squareSize);
  }

  ctx.drawImage(src, xOffset, 0);
  return canvas;
}

export function useDynamicTextures(skip = false) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframesRef = useRef<Map<FaceId, HTMLIFrameElement>>(new Map());
  const captureStarted = useRef<Set<FaceId>>(new Set());
  const [state, setState] = useState<DynamicTextureState>({
    textures: FACE_INDEX_TO_ID.map(() => null),
    canvases: new Map(),
    ready: false,
    loadedCount: 0,
  });
  const texturesRef = useRef<(THREE.CanvasTexture | null)[]>(
    FACE_INDEX_TO_ID.map(() => null)
  );
  const canvasesRef = useRef<Map<FaceId, HTMLCanvasElement>>(new Map());
  const mountToken = useRef(0);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const setTexture = useCallback((faceId: FaceId, canvas: HTMLCanvasElement) => {
    if (!mountedRef.current) return;
    canvasesRef.current.set(faceId, canvas);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    const idx = FACE_INDEX_TO_ID.indexOf(faceId);
    if (idx !== -1) {
      texturesRef.current[idx]?.dispose();
      texturesRef.current[idx] = texture;
      const loaded = texturesRef.current.filter((t) => t !== null).length;
      setState({
        textures: [...texturesRef.current],
        canvases: new Map(canvasesRef.current),
        ready: loaded === FACE_INDEX_TO_ID.length,
        loadedCount: loaded,
      });
    }
  }, []);

  const captureIframe = useCallback(
    async (faceId: FaceId, iframe: HTMLIFrameElement, token: number) => {
      // console.log(`[tex] ${faceId}: onload fired, token=${token}`);
      if (mountToken.current !== token) return;

      try {
        // Wait for Next.js hydration
        const maxWait = 10_000;
        const pollInterval = 50;
        const start = Date.now();
        await new Promise<void>((resolve) => {
          const check = () => {
            if (mountToken.current !== token) { resolve(); return; }
            const doc = iframe.contentDocument;
            const hasContent = doc?.body && doc.body.querySelector("img, canvas, h1, h2, p, main");
            if (hasContent || Date.now() - start > maxWait) {
              resolve();
            } else {
              setTimeout(check, pollInterval);
            }
          };
          check();
        });
        if (mountToken.current !== token) return;

        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc?.body) return;

        // Inject real viewport height so vh units match the browser viewport
        const realVh = window.innerHeight;
        const style = iframeDoc.createElement("style");
        const realVhUnit = realVh / 100;
        style.textContent = `
          .h-screen { height: ${realVh}px !important; }
          * { --real-vh: ${realVhUnit}px; }
          .pb-\\[calc\\(8vh\\+64px\\)\\] { padding-bottom: calc(${realVhUnit * 8}px + 64px) !important; }
          html, body { scrollbar-width: none !important; overflow-y: auto; }
          html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; }
          nav.fixed { display: none !important; }
        `;
        iframeDoc.head.appendChild(style);

        // Force lazy images to load
        const images = Array.from(iframeDoc.querySelectorAll("img"));
        for (const img of images) {
          if (img.loading === "lazy") img.loading = "eager";
        }
        await Promise.all(
          images.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  setTimeout(resolve, 8_000);
                })
          )
        );

        // Wait for fonts to resolve before capturing — especially important for
        // text-heavy pages like the resume where spacing depends on font metrics.
        await iframeDoc.fonts?.ready?.catch(() => {});

        // Wait multiple frames for CSS/layout/effects to settle
        // (Tailwind responsive classes, useEffect hooks like community sync(), Suspense)
        for (let i = 0; i < 3; i++) {
          await new Promise((r) => requestAnimationFrame(r));
        }
        // Yield to React scheduler so useEffect state updates (e.g. isMobile)
        // can fire and trigger re-renders before we capture
        await new Promise((r) => setTimeout(r, 200));
        // Wait for the re-render from those state updates to paint
        for (let i = 0; i < 2; i++) {
          await new Promise((r) => requestAnimationFrame(r));
        }
        if (mountToken.current !== token) return;

        // Force community artifacts visible for capture (they start visibility:hidden
        // until sync() runs, which may not have fired yet)
        if (faceId === "community") {
          const captureStyle = iframeDoc.createElement("style");
          captureStyle.textContent = `[style*="visibility: hidden"] { visibility: visible !important; }`;
          iframeDoc.head.appendChild(captureStyle);
          await new Promise((r) => requestAnimationFrame(r));
        }

        // Wait for flashlight overlay to mount (exits Suspense boundary)
        if (faceId === "back") {
          const overlayWaitStart = Date.now();
          await new Promise<void>((resolve) => {
            const check = () => {
              const overlay = iframeDoc.querySelector('.fixed.inset-0.pointer-events-none, .absolute.inset-0.pointer-events-none');
              if (overlay || Date.now() - overlayWaitStart > 3000) {
                resolve();
              } else {
                setTimeout(check, 50);
              }
            };
            check();
          });
          await new Promise((r) => requestAnimationFrame(r));
        }

        // contentWidth = page's rendered width (= vw, natural mobile/desktop layout)
        // squareSize = the square side length for the texture (max of vw and vh)
        const contentWidth = iframe.clientWidth;
        if (contentWidth === 0) return;
        const squareSize = Math.max(contentWidth, window.innerHeight);
        const isPortrait = squareSize > contentWidth;

        // Pass 1: low-res (scale=1, no DPR) — fast, appears immediately
        // console.log(`[tex] ${faceId}: low-res capture...`);
        const capturedLow = await Promise.race([
          html2canvas(iframeDoc.body, {
            width: contentWidth,
            height: squareSize,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            scale: 1,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("html2canvas timed out")), 15_000)
          ),
        ]);
        if (mountToken.current !== token) return;
        // console.log(`[tex] ${faceId}: low-res done ${capturedLow.width}x${capturedLow.height}`);

        // Load music hero image if needed (cached after first fetch)
        const musicHeroImg = isPortrait && faceId === "music" ? await getMusicHeroImage() : null;
        if (mountToken.current !== token) return;

        const lowResCanvas = isPortrait
          ? (faceId === "building"
              ? composeSquareSlanted(capturedLow, squareSize, contentWidth, FACE_COLORS[faceId])
              : faceId === "music"
                ? composeSquareMusicHero(capturedLow, squareSize, contentWidth, musicHeroImg)
                : faceId === "community"
                  ? composeSquareCommunity(capturedLow, squareSize, contentWidth, FACE_COLORS[faceId])
                  : composeSquare(capturedLow, squareSize, contentWidth, FACE_COLORS[faceId]))
          : capturedLow;
        setTexture(faceId, lowResCanvas);

        // Pass 2: hi-res (full DPR) — only worth it above 1x
        const dpr = window.devicePixelRatio || 1;
        if (dpr <= 1) return;

        // console.log(`[tex] ${faceId}: hi-res capture at ${dpr}x...`);
        const capturedHi = await Promise.race([
          html2canvas(iframeDoc.body, {
            width: contentWidth,
            height: squareSize,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            scale: dpr,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("html2canvas hi-res timed out")), 15_000)
          ),
        ]);
        if (mountToken.current !== token) return;
        // console.log(`[tex] ${faceId}: hi-res done ${capturedHi.width}x${capturedHi.height}`);
        const hiResCanvas = isPortrait
          ? (faceId === "building"
              ? composeSquareSlanted(capturedHi, squareSize * dpr, contentWidth * dpr, FACE_COLORS[faceId])
              : faceId === "music"
                ? composeSquareMusicHero(capturedHi, squareSize * dpr, contentWidth * dpr, musicHeroImg)
                : faceId === "community"
                  ? composeSquareCommunity(capturedHi, squareSize * dpr, contentWidth * dpr, FACE_COLORS[faceId])
                  : composeSquare(capturedHi, squareSize * dpr, contentWidth * dpr, FACE_COLORS[faceId]))
          : capturedHi;
        setTexture(faceId, hiResCanvas);
      } catch (err) {
        console.warn(`[dynamic-texture] Failed to capture ${faceId}:`, err);
      }
    },
    [setTexture]
  );

  // Set up the off-screen container on mount
  useEffect(() => {
    if (skip) return;
    const token = ++mountToken.current;
    // console.log(`[tex] effect mount, token=${token}`);

    // Square based on the larger viewport dimension so portrait captures work correctly
    const squareSize = Math.max(window.innerWidth, window.innerHeight);
    const squarePx = `${squareSize}px`;

    const container = document.createElement("div");
    container.style.cssText =
      `position:fixed;left:-9999px;top:-9999px;width:${squarePx};height:${squarePx};overflow:hidden;pointer-events:none;`;
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      // console.log(`[tex] effect cleanup, invalidating token=${token}`);
      mountToken.current = token + 1;
      texturesRef.current.forEach((t) => t?.dispose());
      texturesRef.current = FACE_INDEX_TO_ID.map(() => null);
      container.remove();
      containerRef.current = null;
      iframesRef.current.clear();
      captureStarted.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  // Request capture for a single face (no-op if already started)
  const requestCapture = useCallback(
    (faceId: FaceId) => {
      if (skip) return;
      if (captureStarted.current.has(faceId)) return;
      const container = containerRef.current;
      if (!container) return;

      captureStarted.current.add(faceId);
      const token = mountToken.current;

      const face = FACES.find((f) => f.id === faceId);
      if (!face) return;

      // iframe renders at the natural viewport width (preserves mobile layout),
      // but is tall enough to fill the square capture area
      const vw = window.innerWidth;
      const squareSize = Math.max(vw, window.innerHeight);

      const iframe = document.createElement("iframe");
      iframe.style.cssText = `width:${vw}px;height:${squareSize}px;border:none;`;
      iframe.src = face.route;
      iframe.onload = () => captureIframe(faceId, iframe, token);

      container.appendChild(iframe);
      iframesRef.current.set(faceId, iframe);
      // console.log(`[tex] ${faceId}: iframe created (lazy)`);
    },
    [skip, captureIframe]
  );

  // Request capture for all faces not yet started
  const requestAll = useCallback(() => {
    for (const face of FACES) {
      requestCapture(face.id);
    }
  }, [requestCapture]);

  const getCanvas = useCallback((faceId: FaceId): HTMLCanvasElement | null => {
    return canvasesRef.current.get(faceId) ?? null;
  }, []);

  return {
    textures: state.textures,
    ready: state.ready,
    loadedCount: state.loadedCount,
    totalCount: FACE_INDEX_TO_ID.length,
    getCanvas,
    requestCapture,
    requestAll,
  };
}
