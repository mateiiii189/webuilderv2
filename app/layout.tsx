import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/manrope/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webuilder — Idei mari. Execuție pe măsură.",
  description:
    "Studio digital independent din București. Web design, development și automatizări pentru afacerea ta.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
