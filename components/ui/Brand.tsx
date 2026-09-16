export function BrandMark({
  className = "brand-mark",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 216"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0h51l30 145h5L127 0h47l42 145h6L251 0h49l-51 216h-56L152 69h-4l-40 147H52Z" />
    </svg>
  );
}

export default function Brand() {
  return (
    <a
      className="wordmark"
      href="#top"
      aria-label="Webuilder — începutul paginii"
    >
      <BrandMark />

      <span>
        webuilder
        <span className="wordmark-period">.</span>
      </span>
    </a>
  );
}