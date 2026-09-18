import Link from "next/link";
import { articleDate, type ArticleSummary } from "@/lib/blog-types";
import ArticleImage from "./ArticleImage";

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group/article block rounded-card focus-visible:outline-offset-6"
    >
      {article.cover?.asset?._ref ? (
        <ArticleImage image={article.cover} />
      ) : (
        <div
          aria-hidden
          className="grid aspect-[16/9] place-items-center rounded-card border border-border bg-surface text-kicker tracking-kicker text-primary"
        >
          WEBUILDER / PERSPECTIVE
        </div>
      )}
      <div className="pt-5 sm:pt-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="text-primary">{article.category}</span>
          <time dateTime={article.publishedAt}>
            {articleDate(article.publishedAt)}
          </time>
        </div>
        <h3 className="mt-3 text-[clamp(24px,2.3vw,36px)] leading-tight font-medium tracking-heading wrap-anywhere transition-colors duration-500 group-hover/article:text-primary group-focus-visible/article:text-primary motion-reduce:transition-none">
          {article.title}
        </h3>
        <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted">
          {article.excerpt}
        </p>
        <span className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-soft transition-colors duration-500 group-hover/article:text-primary motion-reduce:transition-none">
          Citește articolul
          <svg
            aria-hidden
            className="size-5 transition-transform duration-500 ease-in-out motion-safe:group-hover/article:translate-x-1 motion-reduce:transition-none"
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
