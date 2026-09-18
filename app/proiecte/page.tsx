import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectContact from "@/components/projects/ProjectContact";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";
import { projects } from "@/lib/home-content";

export const metadata: Metadata = {
  title: "Proiecte — Webuilder",
  description:
    "Explorează conceptele Webuilder: website-uri de prezentare și interfețe pentru aplicații web, cu design clar și atenție la detalii.",
};

export default function ProjectsPage() {
  return (
    <PageShell innerPage>
      <section
        className="pt-9 pb-12 sm:pt-12 sm:pb-16 lg:pt-18 lg:pb-20"
        aria-labelledby="portfolio-title"
      >
        <Reveal>
          <p className="mb-7 flex items-center gap-3 text-kicker tracking-kicker text-muted">
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
            <p className="max-w-[43ch] animate-enter text-[15px] leading-relaxed text-muted [animation-delay:350ms] motion-reduce:animate-none lg:pb-2">
              De la imaginea unui brand la felul în care lucrează o echipă.
              Explorăm experiențe digitale în care fiecare detaliu are un rost.
            </p>
          </div>
        </Reveal>
      </section>
      <section className="pb-18 sm:pb-section" aria-labelledby="concepts-title">
        <Reveal>
          <div className="mb-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <h2
              id="concepts-title"
              className="text-kicker tracking-kicker text-soft"
            >
              EXPLORĂRI DIGITALE / 0{projects.length}
            </h2>
            <p className="max-w-[49ch] text-xs leading-relaxed text-muted">
              Concepte demonstrative create de Webuilder, fără un client
              asociat.
            </p>
          </div>
        </Reveal>
        <div className="grid items-start gap-9 sm:grid-cols-2 sm:gap-6 lg:gap-9">
          {projects.map((project, index) => (
            <Reveal
              key={project.slug}
              className={index % 2 ? "sm:mt-16 lg:mt-24" : ""}
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </section>
      <ProjectContact />
    </PageShell>
  );
}
