"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { Sculpture } from "@/lib/sculpture";
import Button from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/Brand";
import { textLink } from "@/lib/ui";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

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
          entry.isIntersecting || element.contains(document.activeElement),
        );
      },
      { threshold: 0 },
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
        "Idei mari. Execuție pe măsură.",
      ),
      document.fonts.load('750 16px "Manrope Variable"', "webuilder"),
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
          const { createSculpture } = await import("@/lib/sculpture");

          if (controller.signal.aborted) return;

          const instance = await createSculpture(host!, controller.signal);

          if (controller.signal.aborted) {
            instance.destroy();
            return;
          }

          owned = instance;
          setArtReady(true);
          instance.start();
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error("Webuilder 3D could not initialize:", error);

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

  const entrance =
    "animate-hero group-data-[ready=false]/hero:[animation-play-state:paused] motion-safe:group-data-[hero-visible=false]/copy:animate-none motion-safe:group-data-[hero-visible=false]/copy:opacity-0 motion-reduce:animate-none";
  const titleLine =
    "block w-fit max-w-full wrap-anywhere pr-[0.025em] animate-title group-data-[ready=false]/hero:[animation-play-state:paused] motion-safe:group-data-[hero-visible=false]/copy:animate-none motion-safe:group-data-[hero-visible=false]/copy:opacity-0 motion-reduce:animate-none";

  return (
    <section
      className="group/hero flex flex-col lg:min-h-[calc(100svh-var(--header-height))]"
      data-ready={copyReady}
      data-art-ready={artReady}
      aria-labelledby="hero-title"
    >
      <div className="relative pt-[38px] pb-11 lg:grid lg:min-h-[620px] lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] lg:items-center lg:pt-14 lg:pb-16 2xl:min-h-[740px] lg:[@media(max-height:820px)]:min-h-[560px] lg:[@media(max-height:820px)]:py-10">
        <div
          className="group/copy relative z-2 min-w-0 group-data-[ready=false]/hero:invisible"
          data-hero-copy
          ref={copyHost}
        >
          <div
            data-hero-entrance
            className={`${entrance} mb-7 flex items-center gap-[9px] text-kicker leading-[1.6] tracking-[0.07em] text-muted lg:mb-8 lg:gap-[11px] lg:tracking-[0.13em] lg:[@media(max-height:820px)]:mb-6`}
            style={delay(80)}
          >
            <span
              className="h-px w-[19px] shrink-0 bg-primary lg:w-[22px]"
              aria-hidden="true"
            />
            VIZIUNE. DESIGN. TEHNOLOGIE.
          </div>
          <h1
            id="hero-title"
            className="mb-[26px] -ml-[0.065em] text-hero-mobile leading-[1.065] font-medium tracking-hero lg:mb-7 lg:text-hero lg:leading-[1.07] lg:[@media(max-height:820px)]:text-[clamp(60px,6.3vw,102.4px)]"
          >
            {["Idei mari.", "Execuție", "pe măsură."].map((line, index) => (
              <span
                key={line}
                className="block overflow-hidden px-[0.08em] pt-[0.025em] pb-[0.045em]"
              >
                <span
                  data-hero-entrance
                  className={`${titleLine} ${index === 2 ? "text-primary" : ""}`}
                  style={delay(160 + index * 130)}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            data-hero-entrance
            className={`${entrance} max-w-[42ch] text-base leading-[1.75] tracking-[-0.018em] text-muted lg:max-w-[34ch] lg:text-[clamp(16px,1.25vw,19px)]`}
            style={delay(630)}
          >
            Transformăm viziunea ta în website-uri, aplicații și experiențe
            digitale memorabile.
          </p>
          <div
            data-hero-entrance
            className={`${entrance} mt-[26px] lg:mt-7`}
            style={delay(730)}
          >
            <Button href="/contact">Hai să vorbim</Button>
          </div>
        </div>
        <div
          data-hero-art
          className="relative hidden min-h-[460px] w-full self-stretch select-none lg:block"
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_54%_48%,#d6a72a0a,transparent_65%)]" />
          <div
            ref={canvasHost}
            className="absolute -inset-x-[30%] -inset-y-[18%] opacity-0 transition-opacity duration-[850ms] group-data-[art-ready=true]/hero:opacity-100 motion-reduce:transition-none [&_canvas]:block [&_canvas]:size-full [&_canvas]:outline-none"
          />
          {unavailable && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <BrandMark className="h-auto w-[65%]" />
            </div>
          )}
        </div>
      </div>
      <div className="relative z-2 flex min-h-[65px] items-center justify-between gap-6 border-y border-border lg:min-h-[76px]">
        <div
          className="grid w-full grid-cols-[1fr_1fr_1.1fr] items-center gap-2 py-5 text-kicker leading-normal tracking-[-0.015em] text-soft lg:flex lg:w-auto lg:gap-[18px] lg:text-[13px]"
          aria-label="Serviciile Webuilder"
        >
          <span>Web design</span>
          <span className="border-l border-border pl-3 lg:pl-[18px]">
            Development
          </span>
          <span className="border-l border-border pl-3 lg:pl-[18px]">
            AI &amp; automation
          </span>
        </div>
        <a className={`${textLink} hidden text-xs lg:block`} href="#proiecte">
          Explorează proiectele
          <span className="ml-3" aria-hidden="true">
            ↓
          </span>
        </a>
      </div>
      <noscript>
        <style>{`[data-hero-copy]{visibility:visible!important}[data-hero-entrance]{animation:none!important;opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </section>
  );
}
