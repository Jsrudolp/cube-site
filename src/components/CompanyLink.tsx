import Image from "next/image";

interface CompanyLinkProps {
  href: string;
  logo: string;
  name: string;
}

export default function CompanyLink({ href, logo, name }: CompanyLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground/60 transition-colors"
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        width={16}
        height={16}
        className="inline-block rounded-sm"
      />
      {name}
    </a>
  );
}
