import Image from "next/image";
import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";
import type { ProjectImage } from "@/lib/project-types";

export default function ArticleImage({
  image,
  inline = false,
  eager = false,
}: {
  image: ProjectImage;
  inline?: boolean;
  eager?: boolean;
}) {
  const builder = createImageUrlBuilder({ projectId, dataset })
    .image(image)
    .auto("format")
    .quality(85);
  if (inline)
    return (
      <Image
        src={builder.image(image.asset).width(1600).fit("max").url()}
        alt={image.alt || ""}
        width={image.width || 1600}
        height={image.height || 1000}
        sizes="(max-width: 900px) 90vw, 760px"
        className="h-auto w-full rounded-control"
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
      />
    );
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-surface">
      <Image
        src={builder.width(1600).height(900).fit("crop").url()}
        alt={image.alt || ""}
        fill
        sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 1000px"
        loading={eager ? "eager" : "lazy"}
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
        className="object-cover transition-transform duration-700 ease-brand motion-safe:group-hover/article:scale-[1.025] motion-reduce:transition-none"
      />
    </div>
  );
}
