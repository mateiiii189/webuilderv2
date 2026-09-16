import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`block shrink-0 text-primary ${className}`}
      viewBox="0 0 300 216"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0h51l30 145h5L127 0h47l42 145h6L251 0h49l-51 216h-56L152 69h-4l-40 147H52Z" />
    </svg>
  );
}

export default function Brand({ href = "#top" }: { href?: string }) {
  return (
    <Link
      className="inline-flex shrink-0 items-center gap-2 text-[22px] font-brand tracking-heading transition-opacity duration-200 hover:opacity-80 motion-reduce:transition-none lg:gap-2.5 lg:text-[26px]"
      href={href}
      aria-label="Webuilder — pagina principală"
    >
      <BrandMark className="h-5 w-[22px] lg:h-[22px] lg:w-7" />

      <span>
        webuilder
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
