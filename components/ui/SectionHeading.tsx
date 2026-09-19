import type { ReactNode } from "react";
import { sectionDescription, sectionTitle } from "@/lib/ui";

export function Kicker({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <p className="mb-5 flex items-center gap-4 text-kicker tracking-kicker text-muted sm:mb-6">
      <span className="tracking-normal text-primary">{number}</span>
      {children}
    </p>
  );
}

export default function SectionHeading({
  number,
  label,
  id,
  children,
  description,
}: {
  number: string;
  label: string;
  id: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-8 lg:mb-12 lg:flex lg:items-end lg:justify-between lg:gap-10">
      <div>
        <Kicker number={number}>{label}</Kicker>
        <h2 id={id} className={sectionTitle}>
          {children}
        </h2>
      </div>
      {description && (
        <p className={`${sectionDescription} mt-6 max-lg:max-w-[45ch] lg:mt-0`}>
          {description}
        </p>
      )}
    </div>
  );
}
