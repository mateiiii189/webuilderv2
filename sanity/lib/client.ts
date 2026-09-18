import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "../env";

export const sanityClient = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      perspective: "published",
      useCdn: false,
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;

export function sanityFetch<T>(
  query: string,
  params: Record<string, string | number | boolean> = {},
) {
  if (!sanityClient) throw new Error("Sanity is not configured.");
  // Next owns the cache; the origin API avoids stacking another stale CDN cache.
  return sanityClient.fetch<T>(query, params, { next: { revalidate: 60 } });
}
