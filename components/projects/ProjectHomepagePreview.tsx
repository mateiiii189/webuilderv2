import Image from "next/image";
import { createImageUrlBuilder } from "@sanity/image-url";
import Button from "@/components/ui/Button";
import { dataset, projectId } from "@/sanity/env";
import type { ProjectImage } from "@/lib/project-types";

export default function ProjectHomepagePreview({
  image,
  title,
  liveUrl,
}: {
  image: ProjectImage;
  title: string;
  liveUrl?: string;
}) {
  let website: URL | undefined;
  try {
    const parsed = new URL(liveUrl || "");
    if (parsed.protocol === "https:") website = parsed;
  } catch {
    // Concepts can have a preview without a public website.
  }
  // Preserve the whole screenshot, including long pages, without hotspot cropping.
  const src = createImageUrlBuilder({ projectId, dataset })
    .image(image.asset)
    .width(1800)
    .fit("max")
    .auto("format")
    .quality(90)
    .url();

  return (
    <figure className="mx-auto max-w-[1200px] animate-enter overflow-hidden rounded-card border border-border bg-surface [animation-delay:250ms] motion-reduce:animate-none">
      <div className="flex flex-col items-start justify-between gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:px-5 sm:py-4">
        <div className="flex max-w-full min-w-0 flex-1 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex shrink-0 gap-1.5 [&>i]:size-2 [&>i]:rounded-full"
          >
            <i className="bg-[#ff5f57]" />
            <i className="bg-[#febc2e]" />
            <i className="bg-[#28c840]" />
          </span>
          <span className="min-w-0 truncate text-xs text-muted">
            {website
              ? website.hostname.replace(/^www\./, "")
              : "Previzualizare homepage"}
          </span>
        </div>
        {website && (
          <Button
            href={website.href}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deschide website-ul
          </Button>
        )}
      </div>
      <div
        role="region"
        aria-label={`Previzualizare homepage — ${title}`}
        tabIndex={0}
        className="max-h-[min(560px,65svh)] overflow-y-auto focus-visible:-outline-offset-4"
      >
        <Image
          src={src}
          alt={image.alt || `Pagina principală — ${title}`}
          width={image.width || 1600}
          height={image.height || 1000}
          sizes="(max-width: 1340px) 90vw, 1200px"
          placeholder={image.lqip ? "blur" : "empty"}
          blurDataURL={image.lqip}
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted">
        {image.caption ||
          "Captură a paginii principale. Derulează în fereastră pentru a vedea mai mult."}
      </figcaption>
    </figure>
  );
}
