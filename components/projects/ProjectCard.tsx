import Link from "next/link";
import ProjectPreview from "@/components/home/ProjectPreview";
import { projects } from "@/lib/home-content";

export default function ProjectCard({
  project,
}: {
  project: (typeof projects)[number];
}) {
  return (
    <Link
      href={`/proiecte/${project.slug}`}
      className="group/preview block overflow-hidden rounded-card border border-border bg-surface transition-[border-color,translate] duration-500 ease-in-out hover:border-primary focus-visible:border-primary focus-visible:outline-offset-5 motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
    >
      <ProjectPreview kind={project.kind} />
      <div className="p-5 sm:p-7">
        <p className="text-kicker tracking-wide text-muted">
          {project.category}
        </p>
        <h2 className="mt-3 text-[clamp(22px,2.2vw,34px)] leading-tight font-medium tracking-heading">
          {project.title}
        </h2>
        <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
        <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-5 text-sm">
          <span>Explorează conceptul</span>
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
