import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createImageUrlBuilder } from "@sanity/image-url";
import { projectId, dataset } from "@/sanity/env";
import { getArticle, getArticleBatch } from "@/lib/blog";
import {
  articleDate,
  blockText,
  headingId,
  type BlogTextBlock,
} from "@/lib/blog-types";
import PageShell from "@/components/layout/PageShell";
import ArticleImage from "@/components/blog/ArticleImage";
import ArticleCard from "@/components/blog/ArticleCard";
import ArticleBody from "@/components/blog/ArticleBody";
import ArticleContents from "@/components/blog/ArticleContents";
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
  const { items } = await getArticleBatch();
  const moreArticles = items
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);
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
        <Reveal
          className={`mt-8 grid w-full items-center gap-7 sm:mt-10 ${article.cover?.asset?._ref ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-[clamp(28px,4vw,72px)]" : ""}`}
        >
          <div
            className={`min-w-0 ${article.cover?.asset?._ref ? "lg:col-start-2 lg:row-start-1" : ""}`}
          >
            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span className="text-primary">{article.category}</span>
              <time dateTime={article.publishedAt}>
                {articleDate(article.publishedAt)}
              </time>
              <span>{minutes} min de citit</span>
            </div>
            <h1 className="text-[clamp(36px,5.5vw,60px)] leading-[1.08] font-medium tracking-hero wrap-anywhere lg:text-[clamp(34px,3.5vw,64px)]">
              <TextEntrance>{article.title}</TextEntrance>
            </h1>
            <p className="mt-6 max-w-[64ch] animate-enter text-base leading-relaxed text-muted [animation-delay:250ms] motion-reduce:animate-none sm:text-lg">
              {article.excerpt}
            </p>
          </div>
          {article.cover?.asset?._ref && (
            <figure className="min-w-0 animate-enter [animation-delay:350ms] motion-reduce:animate-none lg:col-start-1 lg:row-start-1">
              <ArticleImage
                image={article.cover}
                eager
                sizes="(max-width: 900px) 90vw, (max-width: 1920px) 49vw, 920px"
              />
              {article.cover.caption && (
                <figcaption className="mt-3 text-xs leading-relaxed text-muted">
                  {article.cover.caption}
                </figcaption>
              )}
            </figure>
          )}
        </Reveal>
        <div
          className={`mt-10 grid w-full items-start gap-9 border-t border-border pt-8 pb-24 sm:mt-14 sm:pt-10 ${headings.length ? "xl:grid-cols-[minmax(0,1fr)_minmax(200px,0.25fr)] xl:gap-[clamp(32px,5vw,96px)]" : ""}`}
        >
          {headings.length > 0 && (
            <ArticleContents
              headings={headings.map((heading) => ({
                id: headingId(heading._key),
                title: blockText(heading),
              }))}
            />
          )}
          <div className="w-full min-w-0">
            <ArticleBody body={article.body} />
          </div>
        </div>
      </article>
      {moreArticles.length > 0 && (
        <section
          aria-labelledby="read-more-title"
          className="border-t border-border py-12 sm:py-16"
        >
          <Reveal>
            <p className="text-kicker tracking-kicker text-muted">
              MAI DEPARTE PE BLOG
            </p>
            <h2
              id="read-more-title"
              className="mt-4 text-[clamp(32px,4vw,56px)] leading-tight font-medium tracking-heading"
            >
              Citește mai multe
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {moreArticles.map((item) => (
              <Reveal key={item._id}>
                <ArticleCard article={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
      <ProjectContact />
    </PageShell>
  );
}
