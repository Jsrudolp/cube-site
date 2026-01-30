"use client";

interface PolaroidProps {
  src: string;
  alt: string;
  rotation?: number;
}

export default function Polaroid({ src, alt, rotation = 0 }: PolaroidProps) {
  return (
    <div
      className="inline-block flex-shrink-0 bg-white p-2 pb-8 shadow-md"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="w-36 h-36 bg-foreground/10 overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
