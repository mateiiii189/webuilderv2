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
        location.pathname + location.search
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
      event.detail === 0 ||
      link.classList.contains("skip-link");

    // Allow the mobile menu to close first.
    frame = requestAnimationFrame(() => {
      const headerHeight =
        document
          .querySelector(".site-header")
          ?.getBoundingClientRect().height ?? 0;

      const top =
        id === "top"
          ? 0
          : Math.max(
              0,
              window.scrollY +
                target.getBoundingClientRect().top -
                headerHeight -
                24
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
            { once: true }
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

  // Smooth service accordions.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const disposers = Array.from(
      document.querySelectorAll<HTMLDetailsElement>(".service-item")
    ).map((item) => {
      const summary = item.querySelector("summary");

      if (!summary) return () => {};

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
          }
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
    });

    return () => {
      disposers.forEach((dispose) => dispose());
    };
  }, []);

  return null;
}