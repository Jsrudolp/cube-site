"use client";

interface PolaroidProps {
  src: string;
  alt: string;
  rotation?: number;
  wide?: boolean;
}

export default function Polaroid({ src, alt, rotation = 0, wide = false }: PolaroidProps) {
  return (
    <div
      className="inline-block flex-shrink-0 bg-white p-2 pb-8"
      style={{
        boxShadow: `
          1px 1px 3px rgba(0, 0, 0, 0.06),
          3px 3px 5px rgba(0, 0, 0, 0.05),
          6px 7px 7px rgba(0, 0, 0, 0.03),
          12px 13px 9px rgba(0, 0, 0, 0.01)
        `,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div
        className={`bg-foreground/10 overflow-hidden ${
          wide ? "w-56 h-36" : "w-36 h-36"
        }`}
      >
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
