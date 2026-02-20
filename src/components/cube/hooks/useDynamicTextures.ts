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
  const iframesRef = useRef<Map<FaceId, HTMLIFrameElement>>(new Map());
  const [state, setState] = useState<DynamicTextureState>({
    textures: FACE_INDEX_TO_ID.map(() => null),
    canvases: new Map(),
    ready: false,
  });
  const texturesRef = useRef<(THREE.CanvasTexture | null)[]>(
    FACE_INDEX_TO_ID.map(() => null)
  );
  const canvasesRef = useRef<Map<FaceId, HTMLCanvasElement>>(new Map());

  // Use a numeric token instead of a boolean so each mount cycle gets its own
  // identity. The cleanup increments the token, instantly invalidating any
  // in-flight async work from the previous mount.
  const mountToken = useRef(0);

  const captureIframe = useCallback(
    async (faceId: FaceId, iframe: HTMLIFrameElement, token: number) => {
      console.log(`[tex] ${faceId}: onload fired, token=${token}, current=${mountToken.current}`);
      if (mountToken.current !== token) { console.log(`[tex] ${faceId}: stale token, skipping`); return; }

      try {
        // Wait for Next.js to hydrate — poll until the iframe has meaningful
        // content (at least one child element beyond empty wrappers).
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
        if (mountToken.current !== token) { console.log(`[tex] ${faceId}: stale after poll`); return; }

        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc?.body) { console.log(`[tex] ${faceId}: no contentDocument`); return; }
        console.log(`[tex] ${faceId}: content ready, capturing...`);

        // Inject real viewport height so vh units match the actual browser
        // viewport, not the square iframe dimensions
        const realVh = window.innerHeight;
        const style = iframeDoc.createElement('style');
        const realVhUnit = realVh / 100;
        style.textContent = `
          .h-screen { height: ${realVh}px !important; }
          * { --real-vh: ${realVhUnit}px; }
          .pb-\\[calc\\(8vh\\+64px\\)\\] { padding-bottom: calc(${realVhUnit * 8}px + 64px) !important; }
        `;
        iframeDoc.head.appendChild(style);

        // Force all lazy images to load eagerly (offscreen iframes won't
        // trigger lazy loading) and wait for them to complete.
        const images = Array.from(iframeDoc.querySelectorAll("img"));
        for (const img of images) {
          if (img.loading === "lazy") img.loading = "eager";
        }
        await Promise.all(
          images.map(
            (img) =>
              img.complete
                ? Promise.resolve()
                : new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                    // Safety timeout per image
                    setTimeout(resolve, 8_000);
                  })
          )
        );

        // Wait for paint after images are loaded
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (mountToken.current !== token) return;

        const size = iframe.clientWidth;
        if (size === 0) { console.log(`[tex] ${faceId}: iframe has 0 width`); return; }

        console.log(`[tex] ${faceId}: calling html2canvas, size=${size}`);
        const canvas = await Promise.race([
          html2canvas(iframeDoc.body, {
            width: size,
            height: size,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            scale: window.devicePixelRatio || 1,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("html2canvas timed out")), 15_000)
          ),
        ]);

        if (mountToken.current !== token) { console.log(`[tex] ${faceId}: stale after html2canvas`); return; }
        console.log(`[tex] ${faceId}: captured ${canvas.width}x${canvas.height}`);

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
      } catch (err) {
        console.warn(`[dynamic-texture] Failed to capture ${faceId}:`, err);
      }
    },
    []
  );

  useEffect(() => {
    if (skip) return;
    const token = ++mountToken.current;
    console.log(`[tex] effect mount, token=${token}`);

    const size = window.innerWidth;
    const sizePx = `${size}px`;

    const container = document.createElement("div");
    container.style.cssText =
      `position:fixed;left:-9999px;top:-9999px;width:${sizePx};height:${sizePx};overflow:hidden;pointer-events:none;`;
    document.body.appendChild(container);

    for (const face of FACES) {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `width:${sizePx};height:${sizePx};border:none;`;
      iframe.src = face.route;

      iframe.onload = () => {
        captureIframe(face.id, iframe, token);
      };

      container.appendChild(iframe);
      iframesRef.current.set(face.id, iframe);
    }

    return () => {
      // Incrementing the token invalidates all in-flight captures from this cycle
      console.log(`[tex] effect cleanup, invalidating token=${token}`);
      mountToken.current = token + 1;
      texturesRef.current.forEach((t) => t?.dispose());
      texturesRef.current = FACE_INDEX_TO_ID.map(() => null);
      container.remove();
      iframesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  const getCanvas = useCallback((faceId: FaceId): HTMLCanvasElement | null => {
    return canvasesRef.current.get(faceId) ?? null;
  }, []);

  return {
    textures: state.textures,
    ready: state.ready,
    getCanvas,
  };
}
