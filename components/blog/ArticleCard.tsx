import Link from "next/link";
import { articleDate, type ArticleSummary } from "@/lib/blog-types";
import { ProjectGalleryImage } from "@/components/projects/ProjectCover";

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group/preview block overflow-hidden rounded-card border border-border bg-surface transition-[border-color,translate] duration-500 ease-in-out hover:border-primary focus-visible:border-primary focus-visible:outline-offset-5 motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
    >
      {article.cover?.asset?._ref ? (
        <ProjectGalleryImage image={article.cover} presentation="card" />
      ) : (
        <div
          aria-hidden
          className="grid aspect-[16/10] place-items-center rounded-card border border-border bg-surface text-kicker tracking-kicker text-primary"
        >
          WEBUILDER / PERSPECTIVE
        </div>
      )}
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="text-primary">{article.category}</span>
          <time dateTime={article.publishedAt}>
            {articleDate(article.publishedAt)}
          </time>
        </div>
        <h3 className="mt-3 text-[clamp(22px,2.2vw,34px)] leading-tight font-medium tracking-heading wrap-anywhere transition-colors duration-500 motion-reduce:transition-none">
          {article.title}
        </h3>
        <p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-muted">
          {article.excerpt}
        </p>
        <span className="mt-7 flex items-center justify-between border-t border-border pt-5 text-sm text-soft transition-colors duration-500 motion-reduce:transition-none">
          Citește articolul
          <svg
            aria-hidden
            className="size-6 shrink-0 text-primary transition-transform duration-500 ease-in-out motion-safe:group-hover/preview:translate-x-1 motion-safe:group-focus-visible/preview:translate-x-1 motion-reduce:transition-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 12h16m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
