"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import { navigationFor } from "@/lib/site";
import { textLink } from "@/lib/ui";

const toggleClass =
  "inline-flex min-h-11 items-center justify-center gap-3 py-2 pl-3 text-[13px] transition-colors duration-200 hover:text-primary motion-reduce:transition-none";

export default function Header({ innerPage = false }: { innerPage?: boolean }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigation = navigationFor(innerPage);
  const pathname = usePathname();
  const contactHref = pathname === "/contact" ? "#contact-form" : "/contact";

  useEffect(() => {
    if (!open || !dialog.current) return;
    const menu = dialog.current;
    const previousOverflow = document.body.style.overflow;
    menu.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      menu.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const mobileNavigation = [
    ...navigation,
    { label: "Contact", href: contactHref },
  ];
  return (
    <header
      data-site-header
      className="sticky top-0 z-20 flex h-header shrink-0 items-center justify-between gap-6 border-b border-border bg-background/95 backdrop-blur-lg"
    >
      <Brand href={innerPage ? "/" : "#top"} />
      <nav
        className="hidden items-center gap-[clamp(20px,2.6vw,42px)] text-[13px] lg:flex"
        aria-label="Navigație principală"
      >
        {navigation.map((item) => (
          <a className={textLink} key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
        <Button href={contactHref}>Contactează-ne</Button>
      </nav>
      <button
        data-menu-toggle
        type="button"
        className={`${toggleClass} lg:hidden`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        Meniu
        <span className="grid w-5 gap-1.5" aria-hidden="true">
          <i className="h-px bg-current" />
          <i className="h-px bg-current" />
        </span>
      </button>
      <dialog
        ref={dialog}
        id="mobile-menu"
        aria-label="Meniu principal"
        onCancel={() => setOpen(false)}
        className="m-0 h-dvh max-h-dvh w-full max-w-none flex-col border-0 bg-background px-gutter pb-8 text-foreground backdrop:bg-background/80 open:flex motion-safe:open:animate-menu motion-reduce:animate-none"
      >
        <div className="flex min-h-header shrink-0 items-center justify-between gap-5 border-b border-border">
          <span className="text-xs tracking-[0.12em] text-primary">
            WEBUILDER.
          </span>
          <button
            type="button"
            className={toggleClass}
            onClick={() => setOpen(false)}
          >
            Închide
            <span className="text-[28px] leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
        <nav className="grid py-8" aria-label="Navigație mobilă">
          {mobileNavigation.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-6 border-b border-border py-4 text-[clamp(32px,9vw,58px)] tracking-[-0.045em] transition-colors duration-200 hover:text-primary motion-reduce:transition-none"
            >
              <span className="text-kicker tracking-normal text-primary">
                0{index + 1}
              </span>
              {item.label}
            </a>
          ))}
        </nav>
        <p className="mt-auto text-[13px] text-muted">
          Din București. Oriunde în lume.
        </p>
      </dialog>
      <noscript>
        <style>{`[data-site-header]{height:auto;min-height:var(--header-height);flex-wrap:wrap;padding-block:14px}[data-menu-toggle]{display:none}`}</style>
        <nav
          className="flex flex-wrap gap-3 text-xs lg:hidden"
          aria-label="Navigație mobilă fără JavaScript"
        >
          {mobileNavigation.map((item) => (
            <a className={textLink} key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </noscript>
    </header>
  );
}
