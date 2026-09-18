import type { MetadataRoute } from "next";
import { getArticleSitemapEntries } from "@/lib/blog";
import { sanityClient, sanityFetch } from "@/sanity/lib/client";
import { getInitialProjectSlugs } from "@/lib/projects";
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, projects] = await Promise.all([
    getArticleSitemapEntries(),
    sanityClient
      ? sanityFetch<{ slug: string; updatedAt?: string }[]>(
          `*[_type == "project" && defined(slug.current) && defined(title) && defined(publishedAt)]{"slug": slug.current, "updatedAt": _updatedAt}`,
        )
      : Promise.resolve(getInitialProjectSlugs()),
  ]);
  return [
    ...["", "/contact", "/proiecte", "/blog"].map((path) => ({
      url: `https://webuilder.ro${path}`,
    })),
    ...projects.map((project) => ({
      url: `https://webuilder.ro/proiecte/${project.slug}`,
    })),
    ...articles.map((article) => ({
      url: `https://webuilder.ro/blog/${article.slug}`,
      lastModified: article.updatedAt,
    })),
  ];
}
