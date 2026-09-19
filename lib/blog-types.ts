import type { ProjectImage } from "./project-types";

export type BlogTextBlock = {
  _type: "block";
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children: { _type: "span"; _key: string; text: string; marks?: string[] }[];
  markDefs?: { _type: string; _key: string; href?: string }[];
};
export type BlogImageBlock = ProjectImage & { _type: "image"; _key: string };
export type BlogBlock = BlogTextBlock | BlogImageBlock;
export type ArticleSummary = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  cover: ProjectImage | null;
};
export type Article = ArticleSummary & {
  _updatedAt: string;
  body: BlogBlock[];
  seoTitle?: string;
  seoDescription?: string;
};
export type ArticleBatch = {
  items: ArticleSummary[];
  total: number;
  next: string | null;
};
export const articleDate = (date: string) =>
  new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(new Date(date));
export const blockText = (block: BlogTextBlock) =>
  block.children.map((span) => span.text).join("");
export const headingId = (key: string) => `section-${key}`;
