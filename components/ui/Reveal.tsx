"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export default function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const rect = element.getBoundingClientRect();

      const outside = rect.bottom <= 0 || rect.top >= window.innerHeight;

      if (motion.matches || element.contains(document.activeElement)) {
        element.dataset.reveal = "visible";
      } else if (outside) {
        element.dataset.reveal = "pending";
      } else {
        element.dataset.reveal = "visible";
      }
    };

    const observer = new IntersectionObserver(update, {
      threshold: 0,
    });

    update();
    observer.observe(element);

    element.addEventListener("focusin", update);
    motion.addEventListener("change", update);

    return () => {
      observer.disconnect();
      element.removeEventListener("focusin", update);
      motion.removeEventListener("change", update);
      delete element.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`min-w-0 transition-[opacity,transform] duration-[900ms] ease-brand focus-within:translate-y-0 focus-within:opacity-100 motion-safe:data-[reveal=pending]:translate-y-6 motion-safe:data-[reveal=pending]:opacity-0 motion-safe:data-[reveal=pending]:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}
