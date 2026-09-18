export const projectCategories = [
  { id: "web-design", label: "Website-uri" },
  { id: "web-app", label: "Aplicații web" },
  { id: "automation", label: "Automatizări" },
] as const;

export type ProjectCategory = (typeof projectCategories)[number]["id"];
export type ProjectImage = {
  asset: { _ref: string };
  alt: string;
  caption?: string;
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
  width?: number;
  height?: number;
  lqip?: string;
};
export type ProjectSummary = {
  _id: string;
  slug: string;
  title: string;
  categoryId: ProjectCategory;
  category: string;
  summary: string;
  isConcept: boolean;
  publishedAt: string;
  cover: ProjectImage | null;
  kind?: "architecture" | "platform";
};
export type Project = ProjectSummary & {
  headline: readonly string[];
  text: string;
  direction: string;
  brief: string;
  decisions: ReadonlyArray<readonly [string, string]>;
  clientName?: string;
  liveUrl?: string;
  gallery: ProjectImage[];
};

export function portfolioHref(
  category = "",
  cursor?: { direction: "after" | "before"; value: string },
) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (cursor) params.set(cursor.direction, cursor.value);
  const query = params.toString();
  return `/proiecte${query ? `?${query}` : ""}`;
}
