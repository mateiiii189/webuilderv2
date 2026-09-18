import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectContact from "@/components/projects/ProjectContact";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getProjectPage, usingDemoProjects } from "@/lib/projects";
import { portfolioHref, projectCategories } from "@/lib/project-types";

export const metadata: Metadata = {
  title: "Proiecte — Webuilder",
  description:
    "Explorează proiectele Webuilder: website-uri, aplicații web și automatizări, cu design clar și atenție la detalii.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedCategory =
    typeof params.category === "string" &&
    projectCategories.some(({ id }) => id === params.category)
      ? params.category
      : "";
  const page = await getProjectPage(
    selectedCategory,
    typeof params.after === "string" ? params.after : undefined,
    typeof params.before === "string" ? params.before : undefined,
  );
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
              PROIECTE / {String(page.total).padStart(2, "0")}
            </h2>
            <p className="max-w-[49ch] text-xs leading-relaxed text-muted">
              {usingDemoProjects
                ? "Concepte demonstrative create de Webuilder, fără un client asociat."
                : "Website-uri, aplicații și idei puse în practică."}
            </p>
          </div>
        </Reveal>
        <nav
          aria-label="Categorii proiecte"
          className="mb-8 flex flex-wrap gap-2"
        >
          {[{ id: "", label: "Toate" }, ...projectCategories].map(
            ({ id, label }) => (
              <Link
                key={id}
                href={portfolioHref(id)}
                prefetch={false}
                aria-current={selectedCategory === id ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-control border px-4 py-2 text-sm transition-colors duration-500 ease-in-out hover:border-primary hover:text-primary motion-reduce:transition-none ${selectedCategory === id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted"}`}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        {page.items.length ? (
          <div className="grid items-start gap-9 sm:grid-cols-2 sm:gap-6 lg:gap-9">
            {page.items.map((project) => (
              <Reveal key={project._id}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-border px-6 py-12 sm:px-9">
            <h3 className="text-2xl font-medium tracking-heading">
              Momentan, niciun proiect aici.
            </h3>
            <p className="mt-4 mb-7 max-w-[48ch] text-sm leading-relaxed text-muted">
              {selectedCategory || params.after || params.before
                ? "Explorează toate proiectele sau spune-ne ce ai vrea să construim."
                : "Pregătim proiectele pentru portofoliu. Între timp, putem vorbi despre ideea ta."}
            </p>
            <Button
              href={
                selectedCategory || params.after || params.before
                  ? "/proiecte"
                  : "/contact"
              }
              variant="secondary"
            >
              {selectedCategory || params.after || params.before
                ? "Toate proiectele"
                : "Hai să vorbim"}
            </Button>
          </div>
        )}
        {(page.previous || page.next) && (
          <nav
            aria-label="Paginare proiecte"
            className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
          >
            {page.previous ? (
              <Button
                href={portfolioHref(selectedCategory, {
                  direction: "before",
                  value: page.previous,
                })}
                direction="back"
                variant="secondary"
              >
                Anterioarele
              </Button>
            ) : (
              <span />
            )}
            {page.next && (
              <Button
                href={portfolioHref(selectedCategory, {
                  direction: "after",
                  value: page.next,
                })}
                variant="secondary"
              >
                Următoarele
              </Button>
            )}
          </nav>
        )}
      </section>
      <ProjectContact />
    </PageShell>
  );
}
