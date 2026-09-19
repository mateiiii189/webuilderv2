"use client";

import { useEffect, useRef } from "react";

export default function SectionArrival() {
  const requestedSection = useRef<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section") || requestedSection.current;
    if (!section || !["proiecte", "servicii", "proces"].includes(section))
      return;
    requestedSection.current = section;
    params.delete("section");
    const query = params.toString();
    history.replaceState(
      history.state,
      "",
      location.pathname + (query ? `?${query}` : ""),
    );
    let cancelled = false;
    let frame = 0;
    const cancel = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("keydown", cancel);
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(section);
        if (!target || cancelled) return;
        const header =
          document.querySelector("[data-site-header]")?.getBoundingClientRect()
            .height ?? 0;
        window.scrollTo({
          top: Math.max(
            0,
            window.scrollY + target.getBoundingClientRect().top - header - 24,
          ),
          behavior: "instant",
        });
      });
    });
    return () => {
      cancel();
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, []);
  return null;
}
