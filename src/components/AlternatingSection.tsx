function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : part));
}

export interface TunerStyles {
  gap?: number;
  titleSize?: number;
  textSize?: number;
  lineHeight?: number;
  imageScale?: number;
  imageOffsetY?: number;
  sectionPadding?: number;
  textWidth?: number;
  mobileCenterText?: boolean;
}

interface AlternatingSectionProps {
  id: string;
  index: number;
  title: string;
  titleHighlight?: "yellow" | "none";
  metadata?: string;
  description: string;
  tags?: { discipline: string; labels: string[] }[];
  imageSrc?: string;
  imageMobileSrc?: string;
  imageMobileWidth?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  children?: React.ReactNode;
  tunerStyles?: TunerStyles;
}

export default function AlternatingSection({
  id,
  index,
  title,
  titleHighlight = "none",
  metadata,
  description,
  tags,
  imageSrc,
  imageMobileSrc,
  imageMobileWidth,
  imageAlt,
  imageWidth,
  imageHeight,
  children,
  tunerStyles: ts,
}: AlternatingSectionProps) {
  const isOdd = index % 2 === 0; // 0-indexed: first item has text on left

  const titleElement = (
    <h2 className="text-[22px] md:text-[28px] font-normal mb-7 font-[family-name:var(--font-merriweather)]">
      {titleHighlight === "yellow" ? (
        <span className="relative inline-block ml-3">
          <span
            className="absolute inset-0 -z-0"
            style={{
              backgroundColor: "rgba(255, 241, 0, 0.5)",
              transform: "skewX(-8deg)",
              margin: "-4px -12px",
              padding: "4px 12px",
              width: "calc(100% + 24px)",
              height: "calc(100% + 8px)",
            }}
            aria-hidden
          />
          <span className="relative z-10">{title}</span>
        </span>
      ) : (
        title
      )}
    </h2>
  );

  const scaledWidth = imageWidth && ts?.imageScale ? imageWidth * (ts.imageScale / 100) : imageWidth;

  const imageContent = imageSrc ? (
    <picture>
      {imageMobileSrc && <source media="(max-width: 767px)" srcSet={imageMobileSrc} />}
      <img
        src={imageSrc}
        alt={imageAlt || title}
        width={scaledWidth}
        height={imageHeight}
        className={`max-w-full h-auto${imageMobileWidth ? " [width:var(--img-mobile-w)] md:[width:var(--img-w,auto)]" : ""}`}
        style={{
          ...(scaledWidth ? { '--img-w': `${scaledWidth}px`, maxWidth: "100%" } : {}),
          ...(imageMobileWidth ? { '--img-mobile-w': imageMobileWidth } : scaledWidth ? { width: scaledWidth } : {}),
        } as React.CSSProperties}
      />
    </picture>
  ) : children ? (
    children
  ) : (
    <div className="w-full max-w-md aspect-[4/3] rounded-lg bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
      <span className="text-sm text-foreground/30">Diagram / Image</span>
    </div>
  );

  // Mobile: title → image → text (three stacked items).
  // Desktop: two-column alternating layout with title above text in the text column.
  return (
    <section
      id={id}
      className="flex flex-col md:flex-row gap-8 md:[gap:var(--section-gap,3rem)] items-start py-8 md:[padding-top:var(--section-py,3rem)] md:[padding-bottom:var(--section-py,3rem)]"
      style={{
        ...(ts?.gap ? { '--section-gap': `${ts.gap}px` } as React.CSSProperties : {}),
        ...(ts?.sectionPadding ? { '--section-py': `${ts.sectionPadding}px` } as React.CSSProperties : {}),
      }}
    >
      {/* Title — visible on mobile only (above image) */}
      <div className="md:hidden w-full text-center">{titleElement}</div>

      {/* Desktop image: with vertical offset for two-column visual alignment */}
      <div
        className={`hidden md:flex flex-1 min-w-0 items-center justify-center ${isOdd ? "order-last" : ""}`}
        style={ts?.imageOffsetY ? { transform: `translateY(${ts.imageOffsetY}px)` } : undefined}
      >
        {imageContent}
      </div>

      {/* Mobile image: stacked, no vertical offset */}
      <div className="md:hidden w-full flex justify-center mb-3">
        {imageContent}
      </div>

      <div className={`flex-1 min-w-0 ${isOdd ? "md:order-first" : ""}`} style={ts?.textWidth ? { flex: `0 0 ${ts.textWidth}%` } : undefined}>
        {/* Title — visible on desktop only (inside text column) */}
        <div className="hidden md:block">{titleElement}</div>
        {metadata && (
          <p className="text-sm text-foreground/50 mb-3">{metadata}</p>
        )}
        <div className={`leading-relaxed space-y-3 text-[16px] md:text-[20px]${ts?.mobileCenterText ? " text-center md:text-left" : ""}`} style={ts?.lineHeight ? { lineHeight: ts.lineHeight } : undefined}>
          {description.split("\n\n").map((paragraph, i) => (
            <p key={i}>{renderInline(paragraph)}</p>
          ))}
        </div>
        {tags && tags.length > 0 && (
          <div className="mt-4 space-y-2">
            {tags.map((group) => (
              <div key={group.discipline} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wide">
                  {group.discipline}
                </span>
                {group.labels.map((label, i) => (
                  <span
                    key={`${label}-${i}`}
                    className="text-xs px-2 py-0.5 rounded-full border border-foreground/20 bg-foreground/5"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
