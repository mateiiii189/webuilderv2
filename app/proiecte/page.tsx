import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ProjectGrid from "@/components/projects/ProjectGrid";
import ProjectContact from "@/components/projects/ProjectContact";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";
import { getProjectBatch, usingDemoProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Proiecte — Webuilder",
  description:
    "Explorează proiectele Webuilder: website-uri, aplicații web și automatizări, cu design clar și atenție la detalii.",
};

export default async function ProjectsPage() {
  const page = await getProjectBatch();
  return (
    <PageShell innerPage>
      <section
        className="pt-9 pb-12 sm:pt-12 sm:pb-16 lg:pt-18 lg:pb-20"
        aria-labelledby="portfolio-title"
      >
        <Reveal>
          <p className="mb-7 flex animate-enter items-center gap-3 text-kicker tracking-kicker text-muted motion-reduce:animate-none">
            <span className="h-px w-6 bg-primary" aria-hidden="true" />
            PROIECTE / WEBUILDER
          </p>
          <div className="grid items-end gap-7 lg:grid-cols-[1.4fr_0.6fr] lg:gap-12">
            <h1
              id="portfolio-title"
              className="text-[clamp(36px,10vw,40px)] leading-[1.08] font-medium tracking-hero sm:text-[clamp(44px,7.3vw,112px)]"
            >
              <TextEntrance delay={120}>Design cu direcție.</TextEntrance>
              <TextEntrance delay={250}>
                <span className="text-primary">Detalii cu sens.</span>
              </TextEntrance>
            </h1>
            <p className="max-w-[43ch] animate-enter text-[15px] leading-relaxed text-muted [animation-delay:450ms] motion-reduce:animate-none lg:pb-2">
              De la imaginea unui brand la felul în care lucrează o echipă.
              Explorăm experiențe digitale în care fiecare detaliu are un rost.
            </p>
          </div>
        </Reveal>
      </section>
      <section className="pb-18 sm:pb-section" aria-labelledby="concepts-title">
        <Reveal>
          <div className="mb-8 flex animate-enter flex-col gap-3 border-t border-border pt-5 [animation-delay:550ms] motion-reduce:animate-none sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <h2
              id="concepts-title"
              className="text-kicker tracking-kicker text-soft"
            >
              PROIECTE / {String(page.total).padStart(2, "0")}
            </h2>
            <p className="max-w-[49ch] text-xs leading-relaxed text-muted">
              {usingDemoProjects
                ? "Concepte demonstrative create de Webuilder, fără un client asociat."
                : "Website-uri, aplicații și idei puse în practică."}
            </p>
          </div>
        </Reveal>
        <ProjectGrid initial={page} />
      </section>
      <ProjectContact />
    </PageShell>
  );
}
