"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { Sculpture } from "@/lib/sculpture";
import Button from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/Brand";

const delay = (ms: number) =>
  ({ "--delay": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  const canvasHost = useRef<HTMLDivElement>(null);
  const copyHost = useRef<HTMLDivElement>(null);
  const [copyReady, setCopyReady] = useState(false);
  const [artReady, setArtReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
  const element = copyHost.current;

  if (!element || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      element.dataset.heroVisible = String(
        entry.isIntersecting ||
        element.contains(document.activeElement)
      );
    },
    { threshold: 0 }
  );

  // Keep keyboard-focused content visible.
  const showOnFocus = () => {
    element.dataset.heroVisible = "true";
  };

  observer.observe(element);
  element.addEventListener("focusin", showOnFocus);

  return () => {
    observer.disconnect();
    element.removeEventListener("focusin", showOnFocus);
    delete element.dataset.heroVisible;
  };
}, []);

  useEffect(() => {
    let disposed = false;

    const fontTimeout = window.setTimeout(() => {
      if (!disposed) setCopyReady(true);
    }, 1800);

    void Promise.all([
      document.fonts.load(
        '550 16px "Manrope Variable"',
        "Idei mari. Execuție pe măsură."
      ),
      document.fonts.load(
        '750 16px "Manrope Variable"',
        "webuilder"
      ),
    ])
      .catch(() => undefined)
      .then(() => {
        window.clearTimeout(fontTimeout);

        if (!disposed) setCopyReady(true);
      });

    return () => {
      disposed = true;
      window.clearTimeout(fontTimeout);
    };
  }, []);

  useEffect(() => {
    const host = canvasHost.current;

    if (!host) return;

    const desktop = window.matchMedia("(min-width: 901px)");
    let stopScene = () => {};

    function syncScene() {
      stopScene();
      setArtReady(false);
      setUnavailable(false);

      if (!desktop.matches) return;

      const controller = new AbortController();
      let owned: Sculpture | null = null;

      stopScene = () => {
        controller.abort();
        owned?.destroy();
        owned = null;
      };

      async function prepare() {
        try {
          const { createSculpture } = await import(
            "@/lib/sculpture"
          );

          if (controller.signal.aborted) return;

          const instance = await createSculpture(
            host!,
            controller.signal
          );

          if (controller.signal.aborted) {
            instance.destroy();
            return;
          }

          owned = instance;
          setArtReady(true);
          instance.start();
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error(
              "Webuilder 3D could not initialize:",
              error
            );

            setUnavailable(true);
          }
        }
      }

      void prepare();
    }

    syncScene();
    desktop.addEventListener("change", syncScene);

    return () => {
      desktop.removeEventListener("change", syncScene);
      stopScene();
    };
  }, []);

  return (
    <section
      className="home-intro"
      data-ready={copyReady}
      data-art-ready={artReady}
      aria-labelledby="hero-title"
    >
      <div className="hero">
        <div className="hero-copy" ref={copyHost}>
          <div
            className="eyebrow reveal"
            style={delay(80)}
          >
            <span
              className="eyebrow-line"
              aria-hidden="true"
            />

            VIZIUNE. DESIGN. TEHNOLOGIE.
          </div>

          <h1 id="hero-title" className="hero-title">
            <span className="line-mask">
              <span
                className="title-line"
                style={delay(160)}
              >
                Idei mari.
              </span>
            </span>

            <span className="line-mask">
              <span
                className="title-line"
                style={delay(290)}
              >
                Execuție
              </span>
            </span>

            <span className="line-mask">
              <span
                className="title-line title-gold"
                style={delay(420)}
              >
                pe măsură.
              </span>
            </span>
          </h1>

          <p
            className="hero-description reveal"
            style={delay(630)}
          >
            Transformăm viziunea ta în website-uri,
            aplicații și experiențe digitale memorabile.
          </p>

          <div
            className="hero-actions reveal"
            style={delay(730)}
          >
            <Button href="#contact">
              Hai să vorbim
            </Button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-light" />

          <div
            className="sculpture-host"
            ref={canvasHost}
          />

          {unavailable && (
            <div className="sculpture-fallback">
              <BrandMark />
            </div>
          )}
        </div>
      </div>

      <div className="hero-bottom">
        <div
          className="disciplines"
          aria-label="Serviciile Webuilder"
        >
          <span>Web design</span>
          <span>Development</span>
          <span>AI &amp; automation</span>
        </div>

        <a
          className="text-link explore-link"
          href="#proiecte"
        >
          Explorează proiectele
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <noscript>
        <style>{`
          .home-intro .hero-copy {
            visibility: visible !important;
          }

          .home-intro .title-line,
          .home-intro .reveal,
          .home-intro .hero-bottom {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>
    </section>
  );
}