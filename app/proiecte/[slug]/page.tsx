import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ProjectCover, {
  ProjectGalleryImage,
} from "@/components/projects/ProjectCover";
import ProjectContact from "@/components/projects/ProjectContact";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";
import {
  getProject,
  getNextProject,
  getInitialProjectSlugs,
} from "@/lib/projects";
import { sectionSpacing, sectionTitle } from "@/lib/ui";

export const revalidate = 60;

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getInitialProjectSlugs();
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return {
    title: `${project.title} — ${project.isConcept ? "Concept " : ""}Webuilder`,
    description: project.text,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const nextProject = await getNextProject(slug);

  return (
    <PageShell key={project._id} innerPage>
      <section
        className="pt-7 pb-10 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-18"
        aria-labelledby="project-title"
      >
        <Button
          href="/proiecte"
          variant="secondary"
          direction="back"
          className="animate-enter motion-reduce:animate-none"
        >
          Toate proiectele
        </Button>
        <Reveal className="mt-10 lg:mt-14">
          <p className="mb-6 animate-enter text-kicker tracking-kicker text-muted motion-reduce:animate-none">
            {project.isConcept ? "CONCEPT DEMONSTRATIV" : "PROIECT / WEBUILDER"}
          </p>
          <h1
            id="project-title"
            className="text-[clamp(36px,10vw,40px)] leading-[1.08] font-medium tracking-hero sm:text-[clamp(44px,7.3vw,112px)]"
          >
            {project.headline.map((line, index) => (
              <TextEntrance key={index} delay={120 + index * 130}>
                <span
                  className={`block wrap-anywhere ${index ? "text-primary" : ""}`}
                >
                  {line}
                </span>
              </TextEntrance>
            ))}
          </h1>
          <div className="mt-8 grid animate-enter gap-7 border-t border-border pt-6 [animation-delay:450ms] motion-reduce:animate-none lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <p className="max-w-[48ch] text-base leading-relaxed text-muted">
              {project.summary}
            </p>
            <dl className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <dt className="mb-2 text-kicker tracking-kicker text-muted">
                  DISCIPLINE
                </dt>
                <dd className="leading-relaxed text-soft">
                  {project.category}
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-kicker tracking-kicker text-muted">
                  STATUT
                </dt>
                <dd className="leading-relaxed text-soft">
                  {project.isConcept ? (
                    <>
                      Explorare de design
                      <br />
                      Fără client asociat
                    </>
                  ) : (
                    project.clientName || "Proiect Webuilder"
                  )}
                </dd>
              </div>
            </dl>
          </div>
          {project.liveUrl && /^https:\/\//.test(project.liveUrl) && (
            <div className="mt-7 animate-enter [animation-delay:550ms] motion-reduce:animate-none">
              <Button
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                Vezi website-ul
              </Button>
            </div>
          )}
        </Reveal>
      </section>
      <Reveal>
        <figure className="animate-enter overflow-hidden rounded-card border border-border [animation-delay:250ms] motion-reduce:animate-none">
          <ProjectCover project={project} wide />
          <figcaption className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted sm:px-7">
            {project.cover?.caption ||
              (project.isConcept
                ? `${project.title} — interfață demonstrativă. Datele și elementele vizuale sunt ilustrative.`
                : project.title)}
          </figcaption>
        </figure>
      </Reveal>
      <section
        className={`${sectionSpacing} grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16`}
        aria-labelledby="direction-title"
      >
        <Reveal>
          <p className="mb-5 text-kicker tracking-kicker text-muted">
            IDEEA DIN SPATE
          </p>
          <h2 id="direction-title" className={`${sectionTitle} max-w-[18ch]`}>
            {project.direction}
          </h2>
          <p className="mt-6 max-w-[43ch] text-base leading-relaxed whitespace-pre-line text-muted">
            {project.brief}
          </p>
        </Reveal>
        <Reveal>
          <ol>
            {project.decisions.map(([title, description], decisionIndex) => (
              <li
                key={title}
                className="grid grid-cols-[24px_1fr] gap-4 border-t border-border py-6 sm:gap-6"
              >
                <span className="pt-1 text-kicker text-primary">
                  0{decisionIndex + 1}
                </span>
                <div>
                  <h3 className="text-xl font-medium tracking-heading">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-[43ch] text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>
      {project.gallery.length > 0 && (
        <section
          className="grid gap-8 pb-16 sm:gap-12 sm:pb-section"
          aria-label="Galerie proiect"
        >
          {project.gallery
            .filter((image) => image.asset?._ref)
            .map((image, index) => (
              <Reveal key={index}>
                <figure className="overflow-hidden rounded-card border border-border bg-surface">
                  <ProjectGalleryImage image={image} />
                  {image.caption && (
                    <figcaption className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
        </section>
      )}
      {nextProject && (
        <Reveal>
          <div className="flex flex-col items-start gap-6 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="mb-2 text-kicker tracking-kicker text-muted">
                MAI DEPARTE
              </p>
              <p className="text-xl font-medium tracking-heading">
                {nextProject.title}
              </p>
            </div>
            <Button href={`/proiecte/${nextProject.slug}`} variant="secondary">
              {nextProject.isConcept
                ? "Următorul concept"
                : "Următorul proiect"}
            </Button>
          </div>
        </Reveal>
      )}
      <ProjectContact />
    </PageShell>
  );
}
