import type { CSSProperties, ReactNode } from "react";

/** Uses the same masked entrance and timing as the homepage hero. */
export default function TextEntrance({
  children,
  delay = 100,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
      <span
        className="block animate-title motion-reduce:animate-none"
        style={{ "--delay": `${delay}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}
