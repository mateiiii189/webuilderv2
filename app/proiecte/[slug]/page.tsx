import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ProjectPreview from "@/components/home/ProjectPreview";
import ProjectContact from "@/components/projects/ProjectContact";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";
import { projects } from "@/lib/home-content";
import { sectionSpacing, sectionTitle } from "@/lib/ui";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return {
    title: `${project.title} — Concept Webuilder`,
    description: project.text,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const nextProject = projects[(index + 1) % projects.length];

  return (
    <PageShell innerPage>
      <section
        className="pt-7 pb-10 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-18"
        aria-labelledby="project-title"
      >
        <Button href="/proiecte" variant="secondary" direction="back">
          Toate proiectele
        </Button>
        <Reveal className="mt-10 lg:mt-14">
          <p className="mb-6 text-kicker tracking-kicker text-muted">
            CONCEPT DEMONSTRATIV / 0{index + 1}
          </p>
          <h1
            id="project-title"
            className="text-[clamp(36px,10vw,40px)] leading-[1.08] font-medium tracking-hero sm:text-[clamp(44px,7.3vw,112px)]"
          >
            <TextEntrance delay={120}>{project.headline[0]}</TextEntrance>
            <TextEntrance delay={250}>
              <span className="text-primary">{project.headline[1]}</span>
            </TextEntrance>
          </h1>
          <div className="mt-8 grid gap-7 border-t border-border pt-6 lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
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
                  Explorare de design
                  <br />
                  Fără client asociat
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </section>
      <Reveal>
        <figure className="overflow-hidden rounded-card border border-border">
          <ProjectPreview kind={project.kind} wide />
          <figcaption className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted sm:px-7">
            {project.title} — interfață demonstrativă. Datele și elementele
            vizuale sunt ilustrative.
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
          <p className="mt-6 max-w-[43ch] text-base leading-relaxed text-muted">
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
            Următorul concept
          </Button>
        </div>
      </Reveal>
      <ProjectContact />
    </PageShell>
  );
}
