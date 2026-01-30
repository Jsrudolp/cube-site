"use client";

interface SvgArtifactProps {
  src: string;
  alt: string;
  className?: string;
}

export default function SvgArtifact({ src, alt, className = "" }: SvgArtifactProps) {
  return (
    <div
      className={`inline-block flex-shrink-0 transition-transform duration-300 hover:scale-110 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-20 h-20 object-contain"
        loading="lazy"
      />
    </div>
  );
}
