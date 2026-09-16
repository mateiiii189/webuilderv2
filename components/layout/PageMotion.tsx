"use client";

import { useEffect } from "react";

export default function PageMotion() {
  // Section navigation without changing the URL.
  useEffect(() => {
    let frame = 0;

    const cleanAddress = () => {
      if (location.hash) {
        history.replaceState(
          history.state,
          "",
          location.pathname + location.search,
        );
      }
    };

    cleanAddress();

    const navigate = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null;

      if (!link || link.target || link.hasAttribute("download")) {
        return;
      }

      let id: string;

      try {
        id = decodeURIComponent(link.hash.slice(1));
      } catch {
        return;
      }

      const target = document.getElementById(id);

      if (!target) return;

      event.preventDefault();
      cleanAddress();
      cancelAnimationFrame(frame);

      const moveFocus =
        event.detail === 0 || link.hasAttribute("data-skip-link");

      // Allow the mobile menu to close first.
      frame = requestAnimationFrame(() => {
        const headerHeight =
          document.querySelector("[data-site-header]")?.getBoundingClientRect()
            .height ?? 0;

        const top =
          id === "top"
            ? 0
            : Math.max(
                0,
                window.scrollY +
                  target.getBoundingClientRect().top -
                  headerHeight -
                  24,
              );

        // Move focus only for keyboard navigation.
        if (moveFocus) {
          const hadTabIndex = target.hasAttribute("tabindex");

          if (!hadTabIndex) {
            target.setAttribute("tabindex", "-1");
          }

          target.focus({ preventScroll: true });

          if (!hadTabIndex) {
            target.addEventListener(
              "blur",
              () => target.removeAttribute("tabindex"),
              { once: true },
            );
          }
        }

        window.scrollTo({
          top,
          behavior: "instant",
        });
      });
    };

    document.addEventListener("click", navigate, true);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", navigate, true);
    };
  }, []);

  return null;
}
