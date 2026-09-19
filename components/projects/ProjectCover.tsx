import Image from "next/image";
import { createImageUrlBuilder } from "@sanity/image-url";
import ProjectPreview from "@/components/home/ProjectPreview";
import { dataset, projectId } from "@/sanity/env";
import type { ProjectImage, ProjectSummary } from "@/lib/project-types";

type Presentation = "card" | "featured" | "detail";

export function ProjectGalleryImage({
  image,
  presentation = "detail",
  tone = "warm",
}: {
  image: ProjectImage;
  presentation?: Presentation;
  tone?: "warm" | "cool";
}) {
  const builder = createImageUrlBuilder({ projectId, dataset })
    .image(image)
    .auto("format")
    .quality(85);
  // Thumbnails fill their frame; detail views preserve the complete composition.
  const src =
    presentation === "card"
      ? builder.width(1400).height(875).fit("crop").url()
      : presentation === "featured"
        ? builder.width(1400).height(1050).fit("crop").url()
        : builder.image(image.asset).width(2000).fit("max").url();
  const placeholder = image.lqip ? "blur" : "empty";

  if (presentation === "featured") {
    return (
      <div
        className={`relative grid aspect-[1.25] max-h-[520px] w-full place-items-center overflow-hidden p-[clamp(16px,3vw,48px)] sm:aspect-[4/3] ${tone === "warm" ? "bg-[#343b31]" : "bg-[#202e3b]"}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,#ffffff12,transparent_70%)]"
        />
        <div
          className={`relative w-[84%] max-w-[520px] overflow-hidden rounded-[6px] border border-[#ffffff26] shadow-[0_20px_50px_#0005] transition-transform duration-700 ease-entrance motion-safe:group-hover/preview:rotate-0 motion-safe:group-focus-visible/preview:rotate-0 motion-reduce:transition-none ${tone === "warm" ? "-rotate-3 bg-[#e9e6db]" : "rotate-3 bg-[#e8ecef]"}`}
        >
          <div
            aria-hidden="true"
            className="flex h-6 items-center gap-1.5 border-b border-[#0000001a] px-3 sm:h-8 [&>i]:size-1.5 [&>i]:shrink-0 [&>i]:rounded-full sm:[&>i]:size-2"
          >
            <i className="bg-[#ff5f57]" />
            <i className="bg-[#febc2e]" />
            <i className="bg-[#28c840]" />
            <span className="mx-auto h-1 w-1/3 rounded-full bg-[#0000001a]" />
          </div>
          <div className="relative aspect-[4/3] bg-[#0d0d0c]">
            <Image
              src={src}
              alt={image.alt || ""}
              fill
              sizes="(max-width: 600px) 75vw, (max-width: 1920px) 38vw, 700px"
              placeholder={placeholder}
              blurDataURL={image.lqip}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  if (presentation === "card") {
    return (
      <div className="relative aspect-[16/10] max-h-[380px] w-full overflow-hidden bg-surface">
        <Image
          src={src}
          alt={image.alt || ""}
          fill
          sizes="(max-width: 600px) 90vw, (max-width: 1920px) 45vw, 840px"
          placeholder={placeholder}
          blurDataURL={image.lqip}
          className="object-cover transition-transform duration-700 ease-entrance motion-safe:group-hover/preview:scale-[1.035] motion-safe:group-focus-visible/preview:scale-[1.035] motion-reduce:transition-none"
        />
      </div>
    );
  }

  return (
    <a
      href={builder.image(image.asset).url()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Deschide ${image.alt || "imaginea proiectului"} — în mărime completă (filă nouă)`}
      className="group/image relative mx-auto block w-fit max-w-full overflow-hidden rounded-control focus-visible:-outline-offset-4"
    >
      <Image
        src={src}
        alt={image.alt || ""}
        width={image.width || 1600}
        height={image.height || 1000}
        sizes="(max-width: 1100px) 85vw, 1000px"
        placeholder={placeholder}
        blurDataURL={image.lqip}
        className="block h-auto max-h-[min(560px,72svh)] w-auto max-w-full object-contain"
      />
      <span
        className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-control bg-[#050505b3] text-foreground backdrop-blur-sm transition-colors duration-500 group-hover/image:bg-primary group-hover/image:text-background group-focus-visible/image:bg-primary group-focus-visible/image:text-background motion-reduce:transition-none"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
        </svg>
      </span>
    </a>
  );
}

export default function ProjectCover({
  project,
  presentation = "card",
  tone = "warm",
}: {
  project: ProjectSummary;
  presentation?: Presentation;
  tone?: "warm" | "cool";
}) {
  if (project.cover?.asset?._ref)
    return (
      <ProjectGalleryImage
        image={project.cover}
        presentation={presentation}
        tone={tone}
      />
    );
  if (project.kind)
    return (
      <ProjectPreview kind={project.kind} wide={presentation === "detail"} />
    );
  return (
    <div className="grid aspect-[16/10] place-items-center bg-surface p-8 text-center text-xl tracking-heading text-muted">
      {project.title}
    </div>
  );
}
