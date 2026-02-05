interface AlternatingSectionProps {
  id: string;
  index: number;
  title: string;
  titleHighlight?: "yellow" | "none";
  metadata?: string;
  description: string;
  tags?: { discipline: string; labels: string[] }[];
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  children?: React.ReactNode;
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
  imageAlt,
  imageWidth,
  imageHeight,
  children,
}: AlternatingSectionProps) {
  const isOdd = index % 2 === 0; // 0-indexed: first item has text on left

  const titleElement = (
    <h2 className="text-2xl font-bold mb-7">
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

  const textBlock = (
    <div className="flex-1 min-w-0">
      {titleElement}
      {metadata && (
        <p className="text-sm text-foreground/50 mb-3">{metadata}</p>
      )}
      <div className="leading-relaxed space-y-3">
        {description.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
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
  );

  const imageBlock = (
    <div className="flex-1 min-w-0 flex items-center justify-center">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt || title}
          width={imageWidth}
          height={imageHeight}
          className="max-w-full h-auto"
          style={imageWidth ? { width: imageWidth, maxWidth: "100%" } : undefined}
        />
      ) : children ? (
        children
      ) : (
        <div className="w-full max-w-md aspect-[4/3] rounded-lg bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
          <span className="text-sm text-foreground/30">Diagram / Image</span>
        </div>
      )}
    </div>
  );

  return (
    <section
      id={id}
      className="flex flex-col md:flex-row gap-8 md:gap-12 items-start py-12"
    >
      {isOdd ? (
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </section>
  );
}
