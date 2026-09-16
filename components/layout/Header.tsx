"use client";

import { useEffect, useRef, useState } from "react";
import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import { navigation } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

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

    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  const mobileNavigation = [
    ...navigation,
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="site-header">
      <Brand />

      <nav
        className="desktop-nav"
        aria-label="Navigație principală"
      >
        {navigation.map((item) => (
          <a
            className="text-link"
            key={item.href}
            href={item.href}
          >
            {item.label}
          </a>
        ))}

        <Button href="#contact">Hai să vorbim</Button>
      </nav>

      <button
        className="menu-toggle"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        Meniu

        <span className="menu-lines" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      <dialog
        ref={dialog}
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Meniu principal"
        onCancel={() => setOpen(false)}
      >
        <div className="mobile-menu-top">
          <span className="menu-caption">WEBUILDER.</span>

          <button
            className="menu-toggle"
            type="button"
            onClick={() => setOpen(false)}
          >
            Închide
            <span className="close-mark" aria-hidden="true">
              ×
            </span>
          </button>
        </div>

        <nav aria-label="Navigație mobilă">
          {mobileNavigation.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <span className="menu-index">
                0{index + 1}
              </span>

              {item.label}
            </a>
          ))}
        </nav>

        <p className="menu-location">
          Din București. Oriunde în lume.
        </p>
      </dialog>

      <noscript>
        <style>{`
          .site-header {
            height: auto;
            min-height: var(--header-height);
            flex-wrap: wrap;
            padding-block: 14px;
          }

          .site-header > .menu-toggle {
            display: none;
          }
        `}</style>

        <nav
          className="no-js-nav"
          aria-label="Navigație mobilă"
        >
          {mobileNavigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </noscript>
    </header>
  );
}