import Image from "next/image";

interface CompanyLinkProps {
  href: string;
  logo: string;
  name: string;
  bgColor?: string;
  verticalMargin?: string;
}

export default function CompanyLink({ href, logo, name, bgColor = "#e5e5e5", verticalMargin = "-0.125rem" }: CompanyLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="company-pill inline-flex items-center gap-1.5 px-4 py-1 rounded-full transition-opacity hover:opacity-80 align-middle"
      style={{ backgroundColor: bgColor, marginTop: verticalMargin, marginBottom: verticalMargin }}
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        width={16}
        height={16}
        className="inline-block rounded"
      />
      <span className="font-medium text-[0.9em]">{name}</span>
    </a>
  );
}
