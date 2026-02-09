"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface CommunityRowProps {
  children: ReactNode;
}

export default function CommunityRow({ children }: CommunityRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(maxScroll > 1 && scrollLeft < maxScroll - 1);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Full-width line */}
      <div className="absolute top-[14px] left-0 right-0 h-[2px] bg-foreground/30" />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 pt-2 px-6 scrollbar-hide"
      >
        <div className="flex gap-10 items-start w-fit mx-auto">
          {children}
        </div>
      </div>

      {/* Left arrow */}
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm border border-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground/80 hover:bg-white/80 transition-all shadow-sm cursor-pointer ${
          canScrollLeft
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm border border-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground/80 hover:bg-white/80 transition-all shadow-sm cursor-pointer ${
          canScrollRight
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
