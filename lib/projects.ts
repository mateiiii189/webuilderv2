import "server-only";
import { cache } from "react";
import { projects as concepts } from "./home-content";
import { sanityClient, sanityFetch } from "@/sanity/lib/client";
import type { Project, ProjectBatch, ProjectSummary } from "./project-types";

export const PROJECTS_PER_PAGE = 4;
export const usingDemoProjects = !sanityClient;

type Cursor = { date: string; id: string };
export function decodeProjectCursor(value?: string): Cursor | null {
  if (!value || value.length > 500) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof parsed.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(parsed.date) ||
      Number.isNaN(Date.parse(parsed.date))
    )
      return null;
    if (
      typeof parsed.id !== "string" ||
      !/^[a-zA-Z0-9_.-]{1,200}$/.test(parsed.id)
    )
      return null;
    return { date: parsed.date, id: parsed.id };
  } catch {
    return null;
  }
}
function encodeCursor(project: ProjectSummary) {
  return Buffer.from(
    JSON.stringify({ date: project.publishedAt, id: project._id }),
  ).toString("base64url");
}

const demoProjects: Project[] = concepts.map((project, index) => ({
  ...project,
  _id: `concept-${index}`,
  categoryId: project.kind === "architecture" ? "web-design" : "web-app",
  isConcept: true,
  publishedAt: `2026-01-0${2 - index}T12:00:00.000Z`,
  cover: null,
  gallery: [],
}));

const published = `_type == "project" && defined(slug.current) && defined(title) && defined(publishedAt)`;
const imageFields = `asset, crop, hotspot, alt, caption,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip`;
const summaryFields = `_id, title, "slug": slug.current, publishedAt, categoryId,
  "category": coalesce(category, ""), "summary": coalesce(summary, ""),
  "isConcept": coalesce(isConcept, false), cover { ${imageFields} }`;
const detailFields = `${summaryFields}, "text": coalesce(summary, ""),
  "headline": coalesce(headline, [title]), "direction": coalesce(direction, title),
  "brief": coalesce(brief, ""), "decisions": coalesce(decisions[]{title, description}, []),
  clientName, liveUrl, "gallery": coalesce(gallery[]{${imageFields}}, [])`;
type RawProject = Omit<Project, "decisions"> & {
  decisions: { title: string; description: string }[];
};
function toProject(raw: RawProject): Project {
  return {
    ...raw,
    decisions: raw.decisions.map(
      ({ title, description }) => [title, description] as const,
    ),
  };
}

export async function getProjectBatch(after?: string): Promise<ProjectBatch> {
  const cursor = decodeProjectCursor(after);
  let items: ProjectSummary[];
  let total: number;

  if (!sanityClient) {
    total = demoProjects.length;
    items = demoProjects
      .filter(
        (item) =>
          !cursor ||
          item.publishedAt < cursor.date ||
          (item.publishedAt === cursor.date && item._id < cursor.id),
      )
      .slice(0, PROJECTS_PER_PAGE + 1);
  } else {
    const cursorFilter = cursor
      ? " && (publishedAt < $date || (publishedAt == $date && _id < $id))"
      : "";
    const result = await sanityFetch<{
      total: number;
      items: ProjectSummary[];
    }>(
      `{
        "total": count(*[${published}]),
        "items": *[${published}${cursorFilter}]
          | order(publishedAt desc, _id desc)[0...${PROJECTS_PER_PAGE + 1}]{${summaryFields}}
      }`,
      { date: cursor?.date ?? "", id: cursor?.id ?? "" },
    );
    items = result.items;
    total = result.total;
  }
  const more = items.length > PROJECTS_PER_PAGE;
  items = items.slice(0, PROJECTS_PER_PAGE);
  return {
    items,
    total,
    next: more ? encodeCursor(items[items.length - 1]) : null,
  };
}

export async function getFeaturedProjects(): Promise<ProjectSummary[]> {
  if (!sanityClient) return demoProjects;
  return sanityFetch<ProjectSummary[]>(`*[${published} && featured == true]
    | order(featuredOrder asc, publishedAt desc, _id desc)[0...2]{${summaryFields}}`);
}

export const getProject = cache(
  async (slug: string): Promise<Project | null> => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 96)
      return null;
    if (!sanityClient)
      return demoProjects.find((project) => project.slug === slug) ?? null;
    const result = await sanityFetch<RawProject | null>(
      `*[${published} && slug.current == $slug][0]{${detailFields}}`,
      { slug },
    );
    return result ? toProject(result) : null;
  },
);

export async function getNextProject(
  slug: string,
): Promise<ProjectSummary | null> {
  if (!sanityClient)
    return demoProjects.find((project) => project.slug !== slug) ?? null;
  return sanityFetch<ProjectSummary | null>(
    `*[${published} && slug.current != $slug]
    | order(publishedAt desc, _id desc)[0]{${summaryFields}}`,
    { slug },
  );
}

export function getInitialProjectSlugs() {
  return sanityClient ? [] : demoProjects.map(({ slug }) => ({ slug }));
}
