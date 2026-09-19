"use client";

import { useEffect, useRef } from "react";

type Heading = { id: string; title: string };

export default function ArticleContents({ headings }: { headings: Heading[] }) {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menu.current?.contains(event.target)
      ) {
        menu.current?.removeAttribute("open");
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus({ preventScroll: true });
      }
    };
    const desktop = window.matchMedia("(min-width: 1101px)");
    const close = () => {
      if (menu.current) menu.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", close);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", close);
    };
  }, []);

  const links = (mobile = false) => (
    <nav aria-label="Cuprins articol" className="grid gap-1">
      {headings.map((heading, index) => (
        <a
          key={heading.id}
          href={`#${encodeURIComponent(heading.id)}`}
          onClick={
            mobile
              ? () => {
                  if (menu.current) menu.current.open = false;
                }
              : undefined
          }
          className="flex min-h-11 items-start gap-3 rounded py-2.5 text-sm leading-relaxed text-muted transition-colors duration-500 hover:text-primary focus-visible:text-primary motion-reduce:transition-none"
        >
          <span className="shrink-0 text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 wrap-anywhere">{heading.title}</span>
        </a>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="hidden min-w-0 border-y border-border py-5 xl:sticky xl:top-32 xl:block xl:max-h-[calc(100svh-160px)] xl:overflow-y-auto">
        <p className="mb-4 text-kicker tracking-kicker text-soft">
          ÎN ACEST ARTICOL
        </p>
        {links()}
      </aside>
      <details
        ref={menu}
        className="group fixed right-gutter bottom-[max(20px,env(safe-area-inset-bottom))] z-40 xl:hidden"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-control border border-primary/30 bg-background px-4 py-3 text-sm text-foreground shadow-xl transition-colors duration-500 hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" />
          </svg>
          Cuprins
          <svg
            className="transition-transform duration-500 group-open:rotate-180 motion-reduce:transition-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m6 14 6-6 6 6" />
          </svg>
        </summary>
        <div className="absolute right-0 bottom-[calc(100%+12px)] max-h-[min(60svh,440px)] w-[min(340px,calc(100vw-2*var(--spacing-gutter)))] overflow-y-auto overscroll-contain rounded-card border border-border bg-background p-5 shadow-2xl">
          <p className="mb-3 text-kicker tracking-kicker text-soft">
            ÎN ACEST ARTICOL
          </p>
          {links(true)}
        </div>
      </details>
    </>
  );
}
