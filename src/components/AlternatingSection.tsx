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
  children,
}: AlternatingSectionProps) {
  const isOdd = index % 2 === 0; // 0-indexed: first item has text on left

  const titleElement = (
    <h2 className="text-2xl font-bold mb-2">
      {titleHighlight === "yellow" ? (
        <span className="relative inline-block">
          <span className="relative z-10">{title}</span>
          <span
            className="absolute left-0 bottom-0 w-full h-[40%] bg-yellow-200/70 -z-0 -rotate-[0.5deg]"
            aria-hidden
          />
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
      <p className="leading-relaxed">{description}</p>
      {tags && tags.length > 0 && (
        <div className="mt-4 space-y-2">
          {tags.map((group) => (
            <div key={group.discipline} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide">
                {group.discipline}
              </span>
              {group.labels.map((label) => (
                <span
                  key={label}
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
          className="w-full max-w-md rounded-lg"
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
