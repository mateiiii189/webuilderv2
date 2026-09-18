import Image from "next/image";
import { createImageUrlBuilder } from "@sanity/image-url";
import ProjectPreview from "@/components/home/ProjectPreview";
import { dataset, projectId } from "@/sanity/env";
import type { ProjectImage, ProjectSummary } from "@/lib/project-types";

export function ProjectGalleryImage({
  image,
  cover = false,
}: {
  image: ProjectImage;
  cover?: boolean;
}) {
  const builder = createImageUrlBuilder({ projectId, dataset })
    .image(image)
    .auto("format")
    .quality(85);
  const src = builder
    .width(cover ? 1600 : 2400)
    .fit("max")
    .url();
  const width = Math.max(
    1,
    Math.round(
      (image.width || 1600) *
        (1 - (image.crop?.left || 0) - (image.crop?.right || 0)),
    ),
  );
  const height = Math.max(
    1,
    Math.round(
      (image.height || 1200) *
        (1 - (image.crop?.top || 0) - (image.crop?.bottom || 0)),
    ),
  );
  return (
    <div className={cover ? "relative aspect-video max-h-80 w-full" : "w-full"}>
      <Image
        src={src}
        alt={image.alt || ""}
        fill={cover}
        width={cover ? undefined : width}
        height={cover ? undefined : height}
        sizes={
          cover
            ? "(max-width: 600px) 90vw, (max-width: 1920px) 45vw, 840px"
            : "(max-width: 1920px) 90vw, 1700px"
        }
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
        className={
          cover
            ? "object-contain transition-transform duration-500 ease-in-out motion-safe:group-hover/preview:scale-[1.025] motion-reduce:transition-none"
            : "block h-auto w-full"
        }
      />
    </div>
  );
}

export default function ProjectCover({
  project,
  wide = false,
}: {
  project: ProjectSummary;
  wide?: boolean;
}) {
  if (project.cover?.asset?._ref)
    return (
      <div className="overflow-hidden bg-surface">
        <ProjectGalleryImage image={project.cover} cover={!wide} />
      </div>
    );
  if (project.kind) return <ProjectPreview kind={project.kind} wide={wide} />;
  return (
    <div className="grid aspect-video max-h-80 place-items-center bg-surface p-8 text-center text-xl tracking-heading text-muted">
      {project.title}
    </div>
  );
}
