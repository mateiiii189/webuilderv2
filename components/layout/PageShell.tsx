import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageMotion from "./PageMotion";

export default function PageShell({
  children,
  innerPage = false,
}: {
  children: ReactNode;
  innerPage?: boolean;
}) {
  return (
    <div
      id="top"
      className="isolate mx-auto flex min-h-svh max-w-site flex-col overflow-clip px-gutter"
    >
      <PageMotion />
      <a
        data-skip-link
        href="#main-content"
        className="absolute top-2.5 left-gutter z-50 -translate-y-[180%] rounded-control bg-primary px-[18px] py-3 text-background focus:translate-y-0"
      >
        Sari la conținut
      </a>
      <Header innerPage={innerPage} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer innerPage={innerPage} />
    </div>
  );
}
