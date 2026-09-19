import Button from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ArticleGrid from "@/components/blog/ArticleGrid";
import ProjectContact from "@/components/projects/ProjectContact";
import Reveal from "@/components/ui/Reveal";
import TextEntrance from "@/components/ui/TextEntrance";
import { getArticleBatch } from "@/lib/blog";
import { heroTitle } from "@/lib/ui";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Blog — Webuilder",
  description:
    "Perspective despre web design, SEO și automatizări. Idei practice pentru o prezență digitală mai bună.",
  alternates: { canonical: "https://webuilder.ro/blog" },
};
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "")
    .trim()
    .slice(0, 100);
  const initial = await getArticleBatch(undefined, query);
  return (
    <PageShell innerPage>
      <section
        className="pt-9 pb-12 sm:pt-12 sm:pb-16 lg:pt-18 lg:pb-20"
        aria-labelledby="blog-title"
      >
        <Reveal>
          <p className="mb-7 flex animate-enter items-center gap-3 text-kicker tracking-kicker text-muted motion-reduce:animate-none">
            <span aria-hidden className="h-px w-6 bg-primary" />
            BLOG / WEBUILDER
          </p>
          <div className="grid items-end gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-12">
            <h1 id="blog-title" className={heroTitle}>
              <TextEntrance delay={120}>Idei clare.</TextEntrance>
              <TextEntrance delay={250}>
                <span className="text-primary">Decizii bune.</span>
              </TextEntrance>
            </h1>
            <p className="max-w-[43ch] animate-enter text-[15px] leading-relaxed text-muted [animation-delay:450ms] motion-reduce:animate-none lg:pb-2">
              Despre design, tehnologie și ce contează pentru afacerea ta în
              online. Explicații clare, cu aplicare în proiecte reale.
            </p>
          </div>
        </Reveal>
      </section>
      <section className="pb-18 sm:pb-section" aria-labelledby="articles-title">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-t border-border pt-5">
          <h2
            id="articles-title"
            className="text-kicker tracking-kicker text-soft"
          >
            ARTICOLE / {String(initial.total).padStart(2, "0")}
          </h2>
          <p className="text-xs text-muted">Perspective de la Webuilder.</p>
        </div>
        <form
          action="/blog"
          role="search"
          className="mb-9 flex flex-wrap items-end gap-3"
        >
          <div className="min-w-0 flex-1 basis-64">
            <label
              htmlFor="blog-search"
              className="mb-2 block text-sm text-muted"
            >
              Caută un articol
            </label>
            <input
              id="blog-search"
              name="q"
              type="search"
              defaultValue={query}
              key={query}
              maxLength={100}
              placeholder="Design, SEO, automatizări…"
              className="min-h-14 w-full rounded-control border border-border bg-surface px-4 text-base text-foreground transition-colors duration-500 outline-none placeholder:text-muted hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit" variant="secondary" arrow={false}>
            Caută
          </Button>
          {query && (
            <Link
              href="/blog"
              className="px-3 py-4 text-sm text-muted transition-colors duration-500 hover:text-primary"
            >
              Șterge căutarea
            </Link>
          )}
        </form>
        {query && (
          <p role="status" className="mb-6 text-sm text-muted">
            {initial.total} rezultate pentru „{query}”
          </p>
        )}
        <ArticleGrid key={query} initial={initial} query={query} />
      </section>
      <ProjectContact />
    </PageShell>
  );
}
