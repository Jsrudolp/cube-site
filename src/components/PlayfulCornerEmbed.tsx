"use client";

/* eslint-disable @next/next/no-img-element */

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { usePersistentCube } from "@/components/cube";

type Corner = "bottom-right" | "bottom-left";

type PlayfulConfig = {
  name: string;
  handle: string;
  avatar: string;
  opener: string;
  bio: string;
  hook: string;
  buttonText: string;
  count: number;
  corner: Corner;
  endpoint: string;
};

type MotionPreset = "soft" | "bloom" | "playful" | "custom";

type MotionSettings = {
  preset: MotionPreset;
  openDuration: number;
  closeDuration: number;
  openStartScale: number;
  openPeakScale: number;
  openStartY: number;
  openPeakY: number;
  closeEndScale: number;
  closeEndY: number;
  backdropDuration: number;
};

const MOTION_PRESETS: Record<Exclude<MotionPreset, "custom">, MotionSettings> = {
  soft: {
    preset: "soft",
    openDuration: 340,
    closeDuration: 190,
    openStartScale: 0.93,
    openPeakScale: 1.018,
    openStartY: 10,
    openPeakY: -2,
    closeEndScale: 0.94,
    closeEndY: 6,
    backdropDuration: 200,
  },
  bloom: {
    preset: "bloom",
    openDuration: 440,
    closeDuration: 240,
    openStartScale: 0.88,
    openPeakScale: 1.032,
    openStartY: 16,
    openPeakY: -3,
    closeEndScale: 0.9,
    closeEndY: 8,
    backdropDuration: 260,
  },
  playful: {
    preset: "playful",
    openDuration: 520,
    closeDuration: 280,
    openStartScale: 0.82,
    openPeakScale: 1.05,
    openStartY: 22,
    openPeakY: -5,
    closeEndScale: 0.86,
    closeEndY: 12,
    backdropDuration: 300,
  },
};

const PLAYFUL_CONFIG: PlayfulConfig = {
  name: "Jake Rudolph",
  handle: "@jakerudolph",
  avatar: "https://www.figma.com/api/mcp/asset/7bd0b6d3-84a8-4d7e-b7d2-76ec10b218a9",
  opener: "I make websites :)",
  bio: "I'm exploring the interactive web, mixed-media, and the art of play.",
  hook: "Subscribe for a new micro-site every week.",
  buttonText: "Subscribe",
  count: 1,
  corner: "bottom-right",
  endpoint: "/api/subscribe",
};

function track(event: "embed_viewed" | "popup_opened" | "subscribe_submitted" | "subscribe_succeeded", payload: Record<string, unknown> = {}) {
  console.log("[playful]", event, payload);
}

function Avatar() {
  if (PLAYFUL_CONFIG.avatar) {
    return <img className="pf-avatar__img" src={PLAYFUL_CONFIG.avatar} alt="" aria-hidden="true" />;
  }

  return <div className="pf-avatar__placeholder" aria-hidden="true" />;
}

export default function PlayfulCornerEmbed() {
  const pathname = usePathname();
  const { zoomingIn, zoomingOut, isTransitioning, texturesReady } = usePersistentCube();
  const [mounted, setMounted] = useState(false);
  const [isIframe, setIsIframe] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const [motion, setMotion] = useState<MotionSettings>(MOTION_PRESETS.soft);
  const [motionPanelOpen, setMotionPanelOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [viewTracked, setViewTracked] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const dialogId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const previousOverflow = useRef<string>("");
  const isHomePage = pathname === "/";
  const isAnimating = zoomingIn || zoomingOut || isTransitioning;
  const shouldHide = isIframe || isAnimating || (isHomePage && !texturesReady);
  const showMotionTuner = process.env.NODE_ENV !== "production";

  const handleOpen = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setHasOpened(true);
    setModalPhase("opening");
    setIsOpen(true);
    track("popup_opened", {
      creator: PLAYFUL_CONFIG.handle,
    });
  }, []);

  const handleClose = useCallback(() => {
    if (!isOpen || modalPhase === "closing") return;

    setModalPhase("closing");
    setIsOpen(false);
    setError("");

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setModalPhase("closed");
      closeTimerRef.current = null;
    }, 240);
  }, [isOpen, modalPhase]);

  const applyPreset = useCallback((preset: Exclude<MotionPreset, "custom">) => {
    setMotion(MOTION_PRESETS[preset]);
  }, []);

  const updateMotion = useCallback((key: keyof Omit<MotionSettings, "preset">, value: number) => {
    setMotion((prev) => ({ ...prev, preset: "custom", [key]: value }));
  }, []);

  const replayAnimation = useCallback(() => {
    if (modalPhase === "closed") {
      handleOpen();
      return;
    }

    handleClose();
    window.setTimeout(() => {
      handleOpen();
    }, motion.closeDuration + 50);
  }, [handleClose, handleOpen, modalPhase, motion.closeDuration]);

  useEffect(() => {
    setMounted(true);
    if (PLAYFUL_CONFIG.avatar) {
      const img = new Image();
      img.src = PLAYFUL_CONFIG.avatar;
    }
  }, []);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!mounted || viewTracked) return;
    setViewTracked(true);
    track("embed_viewed", {
      creator: PLAYFUL_CONFIG.handle,
      corner: PLAYFUL_CONFIG.corner,
    });
  }, [mounted, viewTracked]);

  useEffect(() => {
    if (modalPhase !== "opening") return;
    const frame = window.requestAnimationFrame(() => {
      setModalPhase("open");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [modalPhase]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    previousOverflow.current = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const timer = window.setTimeout(() => {
      if (submitted) {
        closeButtonRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
      body.style.overflow = previousOverflow.current;
    };
  }, [handleClose, isOpen, submitted]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter an email address.");
      inputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    track("subscribe_submitted", {
      creator: PLAYFUL_CONFIG.handle,
      email: trimmedEmail,
    });

    const payload = JSON.stringify({
      email: trimmedEmail,
      creator: PLAYFUL_CONFIG.handle,
      name: PLAYFUL_CONFIG.name,
      page: pathname,
      site: window.location.origin,
    });

    try {
      if (!PLAYFUL_CONFIG.endpoint) {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      } else {
        const response = await fetch(PLAYFUL_CONFIG.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      setSubmitting(false);
      setSubmitted(true);
      setSuccessEmail(trimmedEmail);
      track("subscribe_succeeded", {
        creator: PLAYFUL_CONFIG.handle,
        email: trimmedEmail,
      });
    } catch {
      setSubmitting(false);
      setError("Something went wrong. Try again.");
    }
  }

  if (!mounted) {
    return null;
  }

  const cornerClass = isHomePage
    ? "pf-embed--top-right"
    : PLAYFUL_CONFIG.corner === "bottom-left"
      ? "pf-embed--bottom-left"
      : "pf-embed--bottom-right";
  const pillBadge = !hasOpened && PLAYFUL_CONFIG.count > 0 ? PLAYFUL_CONFIG.count : null;
  const hiddenClass = shouldHide ? "pf-embed--hidden" : "";
  const isVisible = modalPhase !== "closed";
  const panelStyle = {
    "--pf-open-duration": `${motion.openDuration}ms`,
    "--pf-close-duration": `${motion.closeDuration}ms`,
    "--pf-backdrop-duration": `${motion.backdropDuration}ms`,
    "--pf-open-start-scale": String(motion.openStartScale),
    "--pf-open-peak-scale": String(motion.openPeakScale),
    "--pf-open-start-y": `${motion.openStartY}px`,
    "--pf-open-peak-y": `${motion.openPeakY}px`,
    "--pf-close-end-scale": String(motion.closeEndScale),
    "--pf-close-end-y": `${motion.closeEndY}px`,
  } as CSSProperties;

  return createPortal(
    <>
      <style jsx global>{`
        @keyframes pf-float-in {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pf-pop {
          0% {
            transform: scale(0.92);
          }
          100% {
            transform: scale(1);
          }
        }

        .pf-embed {
          position: fixed;
          inset: 0;
          z-index: 1000;
          pointer-events: none;
        }

        .pf-embed--hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .pf-pill {
          position: fixed;
          z-index: 1002;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: 13px;
          border: 0;
          border-radius: 999px;
          background: #ffffff;
          color: #494949;
          box-shadow:
            0.66px 0.99px 13.15px rgba(0, 0, 0, 0.10),
            inset -0.66px -0.66px 3.29px rgba(0, 0, 0, 0.25),
            inset 0.66px 1.32px 6.58px rgba(255, 255, 255, 1);
          overflow: hidden;
          isolation: isolate;
          cursor: pointer;
          pointer-events: auto;
          transition:
            background 160ms ease,
            opacity 180ms ease;
          animation: pf-pop 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .pf-pill::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .pf-pill--away {
          opacity: 0;
          pointer-events: none;
          visibility: hidden;
        }

        .pf-pill:hover {
          background: #f0f0f0;
        }

        .pf-pill:focus-visible,
        .pf-close:focus-visible,
        .pf-submit:focus-visible,
        .pf-backdrop:focus-visible {
          outline: 2px solid #6f5cff;
          outline-offset: 3px;
        }

        .pf-pill__avatar {
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          border-radius: 999px;
          overflow: hidden;
        }

        .pf-avatar__img,
        .pf-avatar__placeholder {
          width: 100%;
          height: 100%;
          display: block;
        }

        .pf-avatar__img {
          object-fit: cover;
        }

        .pf-pill__label {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1 1 auto;
          min-width: 0;
          font-family: var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.32px;
          white-space: nowrap;
        }

        .pf-pill__name {
          flex: 1 1 auto;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #494949;
          line-height: 1.2;
          padding-left: 1px;
        }

        .pf-pill__badge {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: #ff1515;
          color: #fff;
          font-family: var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          font-size: 13px;
          font-weight: 700;
          line-height: 0;
          box-shadow: none;
        }

        .pf-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          border: 0;
          padding: 0;
          background: rgba(8, 10, 20, 0.34);
          backdrop-filter: blur(8px);
          pointer-events: auto;
          cursor: default;
          opacity: 0;
          transition: opacity var(--pf-backdrop-duration) cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity;
        }

        .pf-backdrop--opening,
        .pf-backdrop--open {
          opacity: 1;
        }

        .pf-backdrop--closing {
          opacity: 0;
        }

        .pf-panel {
          position: fixed;
          z-index: 1001;
          width: min(22.5rem, calc(100vw - 1rem));
          border: 1px solid rgba(20, 20, 20, 0.1);
          border-radius: 1.5rem;
          background: #ffffff;
          box-shadow:
            0 8px 32px rgba(18, 18, 24, 0.12),
            0 2px 8px rgba(18, 18, 24, 0.06);
          pointer-events: auto;
          overflow: hidden;
          backdrop-filter: blur(18px);
          opacity: 0;
          will-change: opacity, transform;
        }

        .pf-panel--opening,
        .pf-panel--open {
          animation: pf-panel-open var(--pf-open-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .pf-panel--closing {
          animation: pf-panel-close var(--pf-close-duration) cubic-bezier(0.55, 0, 0.7, 0.2) both;
        }

        .pf-embed--bottom-right .pf-pill,
        .pf-embed--bottom-right .pf-panel {
          right: 2.5rem;
          bottom: 2.5rem;
        }

        .pf-embed--bottom-left .pf-pill,
        .pf-embed--bottom-left .pf-panel {
          left: 2.5rem;
          bottom: 2.5rem;
        }

        .pf-embed--top-right .pf-pill,
        .pf-embed--top-right .pf-panel {
          right: 2.5rem;
          top: 2.5rem;
        }

        .pf-embed--bottom-right .pf-panel {
          transform-origin: bottom right;
        }

        .pf-embed--top-right .pf-panel {
          transform-origin: top right;
        }

        .pf-embed--bottom-left .pf-panel {
          transform-origin: bottom left;
        }

        @keyframes pf-panel-open {
          0% {
            opacity: 0;
            transform: translate3d(0, var(--pf-open-start-y), 0) scale(var(--pf-open-start-scale));
          }
          25% {
            opacity: 1;
          }
          62% {
            transform: translate3d(0, var(--pf-open-peak-y), 0) scale(var(--pf-open-peak-scale));
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes pf-panel-close {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          35% {
            opacity: 0;
          }
          100% {
            opacity: 0;
            transform: translate3d(0, var(--pf-close-end-y), 0) scale(var(--pf-close-end-scale));
          }
        }

        .pf-panel__shell {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1.1rem;
        }

        .pf-panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .pf-panel__identity {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }

        .pf-panel__avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          overflow: hidden;
          background: linear-gradient(145deg, #a855f7, #4f46e5 54%, #312e81);
          flex: 0 0 auto;
        }

        .pf-panel__name {
          display: block;
          font: 600 0.95rem/1.15 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          letter-spacing: -0.02em;
          color: #111111;
        }

        .pf-panel__handle {
          display: block;
          margin-top: 0.1rem;
          color: rgba(18, 18, 18, 0.45);
          font: 400 0.78rem/1.2 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
        }

        .pf-close {
          width: 1.75rem;
          height: 1.75rem;
          border: 0;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.05);
          color: rgba(17, 17, 17, 0.5);
          font: 400 1.1rem/1 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          cursor: pointer;
          flex: 0 0 auto;
          transition: background 140ms ease, color 140ms ease;
        }

        .pf-close:hover {
          background: rgba(17, 17, 17, 0.09);
          color: rgba(17, 17, 17, 0.75);
        }

        .pf-panel__copy {
          display: grid;
          gap: 0.45rem;
        }

        .pf-panel__opener {
          margin: 0;
          color: #111111;
          font: 600 1rem/1.3 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          letter-spacing: -0.02em;
        }

        .pf-panel__bio,
        .pf-success__body {
          margin: 0;
          color: rgba(18, 18, 18, 0.55);
          font: 400 0.875rem/1.5 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
        }

        .pf-panel__hook {
          margin: 0;
          color: #111111;
          font: 600 0.875rem/1.4 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
        }

        .pf-form {
          display: grid;
          gap: 0.5rem;
        }

        .pf-input {
          width: 100%;
          border: 1px solid rgba(17, 17, 17, 0.14);
          border-radius: 0.6rem;
          background: #fafafa;
          color: #111111;
          padding: 0.75rem 0.875rem;
          font: 400 0.875rem/1.2 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          transition: border-color 140ms ease;
        }

        .pf-input::placeholder {
          color: rgba(18, 18, 18, 0.3);
        }

        .pf-input:focus {
          border-color: rgba(17, 17, 17, 0.4);
          background: #fff;
          outline: none;
        }

        .pf-submit {
          border: 0;
          border-radius: 0.6rem;
          background: #111111;
          color: #fff;
          padding: 0.78rem 1rem;
          font: 600 0.875rem/1 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          cursor: pointer;
          transition: opacity 140ms ease;
        }

        .pf-submit:hover:not(:disabled) {
          opacity: 0.82;
        }

        .pf-submit:disabled,
        .pf-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pf-status {
          min-height: 1.1rem;
          color: #c0392b;
          font: 400 0.78rem/1.3 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
        }

        .pf-success {
          display: grid;
          gap: 0.4rem;
          padding: 0.1rem 0;
        }

        .pf-success__title {
          margin: 0;
          color: #111111;
          font: 600 1rem/1.2 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          letter-spacing: -0.02em;
        }

        .pf-divider {
          border: none;
          border-top: 1px solid rgba(18, 18, 18, 0.07);
          margin: 0;
        }

        .pf-foot {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font: 400 0.68rem/1 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          user-select: none;
        }

        .pf-foot__label {
          color: rgba(18, 18, 18, 0.35);
        }

        .pf-foot__brand {
          color: #6f5cff;
          font-weight: 600;
        }

        .pf-motion {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1004;
          pointer-events: auto;
          font: 600 0.75rem/1 var(--font-inter), Inter, Arial, Helvetica, sans-serif;
          color: #111;
        }

        .pf-motion__toggle {
          border: 1px solid rgba(17, 17, 17, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          color: rgba(17, 17, 17, 0.82);
          padding: 0.45rem 0.75rem;
          box-shadow: 0 10px 22px rgba(18, 18, 24, 0.1);
        }

        .pf-motion__panel {
          margin-top: 0.5rem;
          width: min(18.5rem, calc(100vw - 2rem));
          padding: 0.75rem;
          border: 1px solid rgba(17, 17, 17, 0.1);
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 20px 44px rgba(18, 18, 24, 0.16);
          backdrop-filter: blur(16px);
        }

        .pf-motion__row--preset {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-bottom: 0.65rem;
        }

        .pf-motion__preset {
          border: 1px solid rgba(17, 17, 17, 0.1);
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.04);
          color: rgba(17, 17, 17, 0.78);
          padding: 0.35rem 0.6rem;
          text-transform: capitalize;
        }

        .pf-motion__preset--active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .pf-motion__field {
          display: grid;
          gap: 0.35rem;
          margin-bottom: 0.55rem;
        }

        .pf-motion__field span {
          color: rgba(17, 17, 17, 0.7);
        }

        .pf-motion__field div {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pf-motion__field input[type="range"] {
          flex: 1;
        }

        .pf-motion__field strong {
          min-width: 3.2rem;
          text-align: right;
          color: rgba(17, 17, 17, 0.82);
        }

        @media (max-width: 600px) {
          .pf-pill {
            gap: 7px;
            padding: 10px;
          }

          .pf-pill__label {
            font-size: 15px;
          }

          .pf-pill__name {
            font-size: 15px;
          }

          .pf-pill__avatar {
            width: 26px;
            height: 26px;
          }

          .pf-pill__badge {
            width: 23px;
            height: 23px;
            font-size: 12px;
          }

          .pf-panel {
            width: calc(100vw - 0.75rem);
            left: 0.375rem !important;
            right: 0.375rem !important;
            bottom: 0.375rem !important;
            border-radius: 1.25rem 1.25rem 0 0;
          }

          .pf-embed--top-right .pf-pill {
            top: 1rem;
            right: 1rem;
          }

          .pf-embed--bottom-right .pf-panel,
          .pf-embed--top-right .pf-panel,
          .pf-embed--bottom-left .pf-panel {
            transform-origin: bottom center;
          }

          .pf-panel__shell {
            padding: 0.95rem;
            gap: 0.85rem;
          }

          .pf-motion {
            top: auto;
            left: 0.75rem;
            right: 0.75rem;
            bottom: 0.75rem;
          }

          .pf-motion__panel {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pf-pill,
          .pf-backdrop,
          .pf-panel,
          .pf-close,
          .pf-submit,
          .pf-pill:hover,
          .pf-close:hover,
          .pf-submit:hover:not(:disabled) {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className={`pf-embed ${cornerClass} ${hiddenClass}`}>
        <button
          type="button"
          className={`pf-pill${isOpen ? " pf-pill--away" : ""}`}
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={dialogId}
          tabIndex={isOpen ? -1 : 0}
        >
          <div className="pf-pill__label">
            <div className="pf-pill__avatar">
              <Avatar />
            </div>
            <span className="pf-pill__name">{PLAYFUL_CONFIG.handle.replace(/^@/, "")}</span>
          </div>
          {pillBadge ? <span className="pf-pill__badge">{pillBadge}</span> : null}
        </button>

        {isVisible ? (
          <>
            <button
              type="button"
              className={`pf-backdrop pf-backdrop--${modalPhase}`}
              aria-label="Close subscribe popup"
              onClick={handleClose}
              style={panelStyle}
            />

            <section
              id={dialogId}
              className={`pf-panel pf-panel--${modalPhase}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${dialogId}-title`}
              style={panelStyle}
            >
              <div className="pf-panel__shell">
                <div className="pf-panel__header">
                  <div className="pf-panel__identity">
                    <div className="pf-panel__avatar">
                      <Avatar />
                    </div>
                    <div>
                      <span className="pf-panel__name">{PLAYFUL_CONFIG.name}</span>
                      <span className="pf-panel__handle">{PLAYFUL_CONFIG.handle}</span>
                    </div>
                  </div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    className="pf-close"
                    onClick={handleClose}
                    aria-label="Close popup"
                  >
                    ×
                  </button>
                </div>

                <div className="pf-panel__copy">
                  <p id={`${dialogId}-title`} className="pf-panel__opener">
                    {PLAYFUL_CONFIG.opener}
                  </p>
                  <p className="pf-panel__bio">{PLAYFUL_CONFIG.bio}</p>
                  <p className="pf-panel__hook">{PLAYFUL_CONFIG.hook}</p>
                </div>

                {!submitted ? (
                  <form className="pf-form" onSubmit={handleSubmit}>
                    <input
                      ref={inputRef}
                      className="pf-input"
                      type="email"
                      name="email"
                      placeholder="type your email..."
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={submitting}
                      aria-label="Email address"
                    />
                    <button className="pf-submit" type="submit" disabled={submitting}>
                      {submitting ? "Sending..." : PLAYFUL_CONFIG.buttonText}
                    </button>
                    <div className="pf-status" aria-live="polite">
                      {error}
                    </div>
                  </form>
                ) : (
                  <div className="pf-success" aria-live="polite">
                    <p className="pf-success__title">You&apos;re in.</p>
                    <p className="pf-success__body">
                      We&apos;ll reach {successEmail || "you"} soon with the next update.
                    </p>
                  </div>
                )}

                <hr className="pf-divider" aria-hidden="true" />
                <div className="pf-foot" aria-hidden="true">
                  <span className="pf-foot__label">powered by</span>
                  <span className="pf-foot__brand">Playful</span>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {showMotionTuner ? (
          <div className="pf-motion">
            <button
              type="button"
              className="pf-motion__toggle"
              onClick={() => setMotionPanelOpen((value) => !value)}
            >
              Motion {motion.preset !== "custom" ? `· ${motion.preset}` : "· custom"}
            </button>

            {motionPanelOpen ? (
              <div className="pf-motion__panel">
                <div className="pf-motion__row pf-motion__row--preset">
                  {(["soft", "bloom", "playful"] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`pf-motion__preset ${motion.preset === preset ? "pf-motion__preset--active" : ""}`}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                  <button type="button" className="pf-motion__preset" onClick={replayAnimation}>
                    replay
                  </button>
                </div>

                <label className="pf-motion__field">
                  <span>Open duration</span>
                  <div>
                    <input
                      type="range"
                      min="180"
                      max="700"
                      step="10"
                      value={motion.openDuration}
                      onChange={(event) => updateMotion("openDuration", Number(event.target.value))}
                    />
                    <strong>{motion.openDuration}ms</strong>
                  </div>
                </label>

                <label className="pf-motion__field">
                  <span>Close duration</span>
                  <div>
                    <input
                      type="range"
                      min="160"
                      max="620"
                      step="10"
                      value={motion.closeDuration}
                      onChange={(event) => updateMotion("closeDuration", Number(event.target.value))}
                    />
                    <strong>{motion.closeDuration}ms</strong>
                  </div>
                </label>

                <label className="pf-motion__field">
                  <span>Start scale</span>
                  <div>
                    <input
                      type="range"
                      min="0.72"
                      max="0.98"
                      step="0.01"
                      value={motion.openStartScale}
                      onChange={(event) => updateMotion("openStartScale", Number(event.target.value))}
                    />
                    <strong>{motion.openStartScale.toFixed(2)}</strong>
                  </div>
                </label>

                <label className="pf-motion__field">
                  <span>Peak scale</span>
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="1.14"
                      step="0.01"
                      value={motion.openPeakScale}
                      onChange={(event) => updateMotion("openPeakScale", Number(event.target.value))}
                    />
                    <strong>{motion.openPeakScale.toFixed(2)}</strong>
                  </div>
                </label>

                <label className="pf-motion__field">
                  <span>Start lift</span>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      step="1"
                      value={motion.openStartY}
                      onChange={(event) => updateMotion("openStartY", Number(event.target.value))}
                    />
                    <strong>{motion.openStartY}px</strong>
                  </div>
                </label>

                <label className="pf-motion__field">
                  <span>Close squish</span>
                  <div>
                    <input
                      type="range"
                      min="0.72"
                      max="0.98"
                      step="0.01"
                      value={motion.closeEndScale}
                      onChange={(event) => updateMotion("closeEndScale", Number(event.target.value))}
                    />
                    <strong>{motion.closeEndScale.toFixed(2)}</strong>
                  </div>
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>,
    document.body
  );
}
