import Link from "next/link";
import ProjectCover from "./ProjectCover";
import type { ProjectSummary } from "@/lib/project-types";

export default function ProjectCard({
  project,
  home = false,
}: {
  project: ProjectSummary;
  home?: boolean;
}) {
  const Heading = home ? "h3" : "h2";
  return (
    <Link
      href={`/proiecte/${project.slug}`}
      className="group/preview block overflow-hidden rounded-card border border-border bg-surface transition-[border-color,translate] duration-500 ease-in-out hover:border-primary focus-visible:border-primary focus-visible:outline-offset-5 motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
    >
      <ProjectCover project={project} />
      <div className="p-5 sm:p-7">
        {project.isConcept && (
          <p className="mb-2 text-kicker tracking-wide text-primary">
            CONCEPT DEMONSTRATIV
          </p>
        )}
        <p className="text-kicker tracking-wide text-muted">
          {project.category}
        </p>
        <Heading className="mt-3 text-[clamp(22px,2.2vw,34px)] leading-tight font-medium tracking-heading">
          {project.title}
        </Heading>
        <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
        <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-5 text-sm">
          <span>
            {project.isConcept ? "Explorează conceptul" : "Vezi proiectul"}
          </span>
          <svg
            className="size-6 shrink-0 text-primary transition-transform duration-500 ease-in-out motion-safe:group-hover/preview:translate-x-1 motion-safe:group-focus-visible/preview:translate-x-1 motion-reduce:transition-none"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12h16m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
