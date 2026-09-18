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
  const src = cover
    ? builder.width(1600).height(1200).fit("crop").url()
    : builder.width(1800).fit("max").url();
  return (
    <Image
      src={src}
      alt={image.alt || ""}
      width={cover ? 1600 : image.width || 1600}
      height={cover ? 1200 : image.height || 1200}
      sizes={
        cover
          ? "(max-width: 600px) 90vw, (max-width: 1920px) 45vw, 840px"
          : "(max-width: 1920px) 90vw, 1700px"
      }
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip}
      className={
        cover
          ? "aspect-[4/3] w-full object-cover transition-transform duration-500 ease-in-out motion-safe:group-hover/preview:scale-[1.025] motion-reduce:transition-none"
          : "h-auto max-h-[1100px] w-full object-contain"
      }
    />
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
    <div className="grid aspect-[4/3] place-items-center bg-surface p-8 text-center text-xl tracking-heading text-muted">
      {project.title}
    </div>
  );
}
