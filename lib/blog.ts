import "server-only";
import { cache } from "react";
import { sanityClient, sanityFetch } from "@/sanity/lib/client";
import type { Article, ArticleBatch, ArticleSummary } from "./blog-types";

export const ARTICLES_PER_PAGE = 4;
const published = `_type == "article" && defined(slug.current) && defined(title) && defined(publishedAt) && dateTime(publishedAt) <= dateTime(now()) && count(body) > 0`;
const imageFields = `asset, crop, hotspot, alt, caption,
  "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip`;
const summary = `_id, title, "slug": slug.current, publishedAt,
  "excerpt": coalesce(excerpt, ""), "category": coalesce(category, "Perspective"),
  cover{${imageFields}}`;
export function decodeArticleCursor(
  value?: string,
): { date: string; id: string } | null {
  if (!value || value.length > 500) return null;
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof cursor?.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(cursor.date) ||
      Number.isNaN(Date.parse(cursor.date)) ||
      typeof cursor.id !== "string" ||
      !/^[a-zA-Z0-9_.-]{1,200}$/.test(cursor.id)
    )
      return null;
    return { date: cursor.date, id: cursor.id };
  } catch {
    return null;
  }
}
export async function getArticleBatch(
  after?: string,
  query = "",
): Promise<ArticleBatch> {
  if (!sanityClient) return { items: [], total: 0, next: null };
  const search = query
    .trim()
    .slice(0, 100)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim();
  const articleFilter =
    published +
    (search
      ? " && (title match $search || excerpt match $search || category match $search || pt::text(body) match $search)"
      : query.trim()
        ? " && false"
        : "");
  const cursor = decodeArticleCursor(after);
  const filter = cursor
    ? " && (publishedAt < $date || (publishedAt == $date && _id < $id))"
    : "";
  const result = await sanityFetch<{ items: ArticleSummary[]; total: number }>(
    `{
    "total": count(*[${articleFilter}]),
    "items": *[${articleFilter}${filter}] | order(publishedAt desc, _id desc)[0...${ARTICLES_PER_PAGE + 1}]{${summary}}
  }`,
    {
      date: cursor?.date ?? "",
      id: cursor?.id ?? "",
      search: search ? `${search}*` : "",
    },
  );
  const items = result.items.slice(0, ARTICLES_PER_PAGE);
  const last = items.at(-1);
  return {
    items,
    total: result.total,
    next:
      result.items.length > ARTICLES_PER_PAGE && last
        ? Buffer.from(
            JSON.stringify({ date: last.publishedAt, id: last._id }),
          ).toString("base64url")
        : null,
  };
}
export const getArticle = cache(
  async (slug: string): Promise<Article | null> => {
    if (
      !sanityClient ||
      slug.length > 96 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    )
      return null;
    return sanityFetch<Article | null>(
      `*[${published} && slug.current == $slug][0]{
    ${summary}, _updatedAt, seoTitle, seoDescription,
    "body": coalesce(body[]{..., _type == "image" => {${imageFields}}}, [])
  }`,
      { slug },
    );
  },
);
export async function getArticleSitemapEntries() {
  if (!sanityClient) return [];
  return sanityFetch<{ slug: string; updatedAt: string }[]>(
    `*[${published}] | order(publishedAt desc){"slug": slug.current, "updatedAt": _updatedAt}`,
  );
}
