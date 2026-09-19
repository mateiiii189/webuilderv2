export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
export const apiVersion = "2026-09-18";
export const sanityConfigured = Boolean(projectId);
