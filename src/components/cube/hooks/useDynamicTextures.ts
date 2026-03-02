"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas-pro";
import * as THREE from "three";
import { FaceId, FACES } from "@/lib/faces";
import { FACE_INDEX_TO_ID } from "@/lib/cube-config";

interface DynamicTextureState {
  textures: (THREE.CanvasTexture | null)[];
  canvases: Map<FaceId, HTMLCanvasElement>;
  ready: boolean;
}

export function useDynamicTextures(skip = false) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframesRef = useRef<Map<FaceId, HTMLIFrameElement>>(new Map());
  const captureStarted = useRef<Set<FaceId>>(new Set());
  const [state, setState] = useState<DynamicTextureState>({
    textures: FACE_INDEX_TO_ID.map(() => null),
    canvases: new Map(),
    ready: false,
  });
  const texturesRef = useRef<(THREE.CanvasTexture | null)[]>(
    FACE_INDEX_TO_ID.map(() => null)
  );
  const canvasesRef = useRef<Map<FaceId, HTMLCanvasElement>>(new Map());
  const mountToken = useRef(0);

  const setTexture = useCallback((faceId: FaceId, canvas: HTMLCanvasElement) => {
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
      setState({
        textures: [...texturesRef.current],
        canvases: new Map(canvasesRef.current),
        ready: texturesRef.current.every((t) => t !== null),
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
        const pollInterval = 200;
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

        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (mountToken.current !== token) return;

        const size = iframe.clientWidth;
        if (size === 0) return;

        // Pass 1: low-res (scale=1, no DPR) — fast, appears immediately
        // console.log(`[tex] ${faceId}: low-res capture...`);
        const lowResCanvas = await Promise.race([
          html2canvas(iframeDoc.body, {
            width: size,
            height: size,
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
        // console.log(`[tex] ${faceId}: low-res done ${lowResCanvas.width}x${lowResCanvas.height}`);
        setTexture(faceId, lowResCanvas);

        // Pass 2: hi-res (full DPR) — only worth it above 1x
        const dpr = window.devicePixelRatio || 1;
        if (dpr <= 1) return;

        // console.log(`[tex] ${faceId}: hi-res capture at ${dpr}x...`);
        const hiResCanvas = await Promise.race([
          html2canvas(iframeDoc.body, {
            width: size,
            height: size,
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
        // console.log(`[tex] ${faceId}: hi-res done ${hiResCanvas.width}x${hiResCanvas.height}`);
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

    const size = window.innerWidth;
    const sizePx = `${size}px`;

    const container = document.createElement("div");
    container.style.cssText =
      `position:fixed;left:-9999px;top:-9999px;width:${sizePx};height:${sizePx};overflow:hidden;pointer-events:none;`;
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

      const size = window.innerWidth;
      const sizePx = `${size}px`;

      const iframe = document.createElement("iframe");
      iframe.style.cssText = `width:${sizePx};height:${sizePx};border:none;`;
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
    getCanvas,
    requestCapture,
    requestAll,
  };
}
