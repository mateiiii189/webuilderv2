import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createImageUrlBuilder } from "@sanity/image-url";
import { projectId, dataset } from "@/sanity/env";
import { getArticle } from "@/lib/blog";
import {
  articleDate,
  blockText,
  headingId,
  type BlogTextBlock,
} from "@/lib/blog-types";
import PageShell from "@/components/layout/PageShell";
import ArticleImage from "@/components/blog/ArticleImage";
import ArticleBody from "@/components/blog/ArticleBody";
import ProjectContact from "@/components/projects/ProjectContact";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 60;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  const title = `${article.seoTitle || article.title} — Webuilder`;
  const description = article.seoDescription || article.excerpt;
  const url = `https://webuilder.ro/blog/${article.slug}`;
  const images = article.cover?.asset?._ref
    ? [
        createImageUrlBuilder({ projectId, dataset })
          .image(article.cover)
          .width(1200)
          .height(630)
          .fit("crop")
          .url(),
      ]
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "ro_RO",
      title,
      description,
      url,
      images,
      publishedTime: article.publishedAt,
      modifiedTime: article._updatedAt,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  const blocks = article.body.filter(
    (block): block is BlogTextBlock => block._type === "block",
  );
  const headings = blocks.filter((block) => block.style === "h2");
  const minutes = Math.max(
    1,
    Math.ceil(blocks.map(blockText).join(" ").trim().split(/\s+/).length / 200),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article._updatedAt,
    inLanguage: "ro-RO",
    mainEntityOfPage: `https://webuilder.ro/blog/${article.slug}`,
    author: {
      "@type": "Organization",
      name: "Webuilder",
      url: "https://webuilder.ro",
    },
    publisher: {
      "@type": "Organization",
      name: "Webuilder",
      url: "https://webuilder.ro",
    },
    ...(article.cover?.asset?._ref
      ? {
          image: createImageUrlBuilder({ projectId, dataset })
            .image(article.cover)
            .width(1600)
            .url(),
        }
      : {}),
  };
  return (
    <PageShell innerPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="pt-7 sm:pt-10 lg:pt-12">
        <Button href="/blog" variant="secondary" direction="back">
          Toate articolele
        </Button>
        <Reveal className="mx-auto mt-10 max-w-[1000px] sm:mt-14">
          <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            <span className="text-primary">{article.category}</span>
            <time dateTime={article.publishedAt}>
              {articleDate(article.publishedAt)}
            </time>
            <span>{minutes} min de citit</span>
          </div>
          <h1 className="text-[clamp(36px,5.5vw,76px)] leading-[1.08] font-medium tracking-hero wrap-anywhere">
            <TextEntrance>{article.title}</TextEntrance>
          </h1>
          <p className="mt-6 max-w-[64ch] animate-enter text-base leading-relaxed text-muted [animation-delay:250ms] motion-reduce:animate-none sm:text-lg">
            {article.excerpt}
          </p>
          {article.cover?.asset?._ref && (
            <figure className="mt-8 animate-enter [animation-delay:350ms] motion-reduce:animate-none sm:mt-10">
              <ArticleImage image={article.cover} eager />
              {article.cover.caption && (
                <figcaption className="mt-3 text-xs leading-relaxed text-muted">
                  {article.cover.caption}
                </figcaption>
              )}
            </figure>
          )}
        </Reveal>
        <div
          className={`mx-auto mt-10 grid max-w-[1100px] items-start gap-9 pb-16 sm:mt-14 sm:pb-20 ${headings.length ? "lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16" : ""}`}
        >
          {headings.length > 0 && (
            <aside className="min-w-0 lg:sticky lg:top-32">
              <details open className="border-y border-border py-5">
                <summary className="cursor-pointer text-kicker tracking-kicker text-soft transition-colors duration-300 hover:text-primary">
                  ÎN ACEST ARTICOL
                </summary>
                <nav aria-label="Cuprins articol" className="mt-4 grid gap-1">
                  {headings.map((heading, index) => (
                    <a
                      key={heading._key}
                      href={`#${encodeURIComponent(headingId(heading._key))}`}
                      className="flex gap-3 py-2 text-sm leading-relaxed text-muted transition-colors duration-300 hover:text-primary focus-visible:text-primary"
                    >
                      <span className="shrink-0 text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 wrap-anywhere">
                        {blockText(heading)}
                      </span>
                    </a>
                  ))}
                </nav>
              </details>
            </aside>
          )}
          <div className="mx-auto w-full max-w-[70ch] min-w-0">
            <ArticleBody body={article.body} />
            <div className="mt-10 border-t border-border pt-6">
              <Button href="/blog" variant="secondary" direction="back">
                Înapoi la blog
              </Button>
            </div>
          </div>
        </div>
      </article>
      <ProjectContact />
    </PageShell>
  );
}
