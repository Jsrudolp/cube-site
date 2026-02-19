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

export function useDynamicTextures() {
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
  const mountedRef = useRef(true);

  const captureIframe = useCallback(
    async (faceId: FaceId, iframe: HTMLIFrameElement) => {
      if (!mountedRef.current) return;

      try {
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc?.body) return;

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

        // Wait for paint
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (!mountedRef.current) return;

        const size = iframe.clientWidth;

        const canvas = await html2canvas(iframeDoc.body, {
          width: size,
          height: size,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: window.devicePixelRatio || 1,
        });

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

          setState({
            textures: [...texturesRef.current],
            canvases: new Map(canvasesRef.current),
            ready: texturesRef.current.every((t) => t !== null),
          });
        }
      } catch (err) {
        console.warn(`Failed to capture texture for ${faceId}:`, err);
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;

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
        captureIframe(face.id, iframe);
      };

      container.appendChild(iframe);
      iframesRef.current.set(face.id, iframe);
    }

    return () => {
      mountedRef.current = false;
      texturesRef.current.forEach((t) => t?.dispose());
      container.remove();
      iframesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCanvas = useCallback((faceId: FaceId): HTMLCanvasElement | null => {
    return canvasesRef.current.get(faceId) ?? null;
  }, []);

  return {
    textures: state.textures,
    ready: state.ready,
    getCanvas,
  };
}
