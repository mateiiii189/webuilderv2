"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native details remains functional without JavaScript; enhance only its height transition. */
export default function AccordionItem({
  title,
  number,
  children,
  defaultOpen = false,
}: {
  title: string;
  number: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const item = ref.current;
    const summary = item?.querySelector("summary");
    if (!item || !summary) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | null = null;
    let expanded = item.open;
    const settle = () => {
      animation?.cancel();
      animation = null;
      item.open = expanded;
      item.style.height = "";
      item.style.overflow = "";
      delete item.dataset.expanded;
    };
    const toggle = (event: MouseEvent) => {
      event.preventDefault();
      const start = item.getBoundingClientRect().height;
      animation?.cancel();
      expanded = !expanded;
      if (reduced.matches) {
        settle();
        return;
      }
      item.style.height = "";
      item.open = false;
      const closed = item.getBoundingClientRect().height;
      item.open = true;
      const opened = item.getBoundingClientRect().height;
      item.dataset.expanded = String(expanded);
      item.style.overflow = "hidden";
      animation = item.animate(
        [
          { height: `${start}px` },
          { height: `${expanded ? opened : closed}px` },
        ],
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
      animation.onfinish = settle;
    };
    summary.addEventListener("click", toggle);
    window.addEventListener("resize", settle);
    reduced.addEventListener("change", settle);
    return () => {
      settle();
      summary.removeEventListener("click", toggle);
      window.removeEventListener("resize", settle);
      reduced.removeEventListener("change", settle);
    };
  }, []);
  return (
    <details
      ref={ref}
      open={defaultOpen}
      className="group/accordion border-b border-border"
    >
      <summary className="group/summary flex items-center gap-3 py-6 sm:gap-[18px] sm:py-[30px]">
        <span className="self-start pt-[5px] text-kicker text-primary">
          {number}
        </span>
        <h3 className="flex-1 text-xl leading-[1.3] font-medium tracking-[-0.035em] transition-colors duration-200 group-hover/summary:text-primary motion-reduce:transition-none sm:text-[clamp(19px,1.8vw,27px)]">
          {title}
        </h3>
        <span className="relative size-[18px] shrink-0" aria-hidden="true">
          <span className="absolute top-2 left-0 h-px w-full bg-current" />
          <span className="absolute top-2 left-0 h-px w-full rotate-90 bg-current transition-transform duration-[650ms] ease-brand group-open/accordion:rotate-0 group-data-[expanded=false]/accordion:rotate-90 motion-reduce:transition-none" />
        </span>
      </summary>
      <div className="pb-6 pl-[27px] text-sm leading-[1.8] text-muted sm:pr-9 sm:pl-[33px] sm:text-[15px]">
        {children}
      </div>
    </details>
  );
}
