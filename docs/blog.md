# Blog

The blog uses the existing Sanity project and credentials; no new package, database, or account is required.

## Publish an article

1. Run the website and open `/studio`.
2. Create an **Articol**. Fill in the title, generate its slug, add the short introduction and theme (for example, Web design or SEO).
3. Upload the cover, write its alt description, and optionally add a caption. Use the hotspot control to choose the crop focus.
4. Write the article. Use **Titlu secțiune** (H2) for sections that should appear in the table of contents, **Subtitlu** (H3) for subsections. Paragraphs, bold, italic, code, quotations, links, numbered/bulleted lists and inline images are supported.
5. Optionally complete the **SEO** tab. Otherwise, the title and introduction supply the search metadata.
6. Choose the publication date and click **Publish**. A future date keeps the article hidden until that time; drafts and articles with no body are excluded.

The listing at `/blog` starts with four articles, newest first. **Arată mai multe** appends four, with the existing reveal animation. Each article has its own `/blog/[slug]` page, reading-time estimate, table of contents and contact CTA. Article pages use the full site content width. At 1101px and above, the contents list stays in a sticky left column. Below that width, a fixed bottom-right **Cuprins** menu opens the section links without taking space above the article. It closes on selection, outside click or Escape; Escape returns focus to the control.

With no published articles, the listing shows an honest empty state rather than sample content.

Header and footer navigation now show **Blog** in place of **Proces**. The existing process explanation remains a homepage section.

Published content uses the existing 60-second Next cache; after expiry, a visit triggers revalidation, so updates can take a little longer than a minute. An already-open page needs refreshing. Scheduled dates follow the same cache behavior.

Article pages render on the server with canonical URLs, Open Graph/Twitter metadata and escaped BlogPosting JSON-LD. `/sitemap.xml` includes all published articles, including those beyond the first four, plus public static pages and portfolio projects. Canonical URLs target `https://webuilder.ro`.

## Local verification

`SANITY_INTEGRATION_TEST=1 npx playwright test tests/blog.spec.ts` uses only local CMS fixtures, including draft/future exclusions, pagination, rich text, navigation and mobile/tablet layouts. It does not publish to the real dataset. Run without that flag to check the unconfigured empty state.

## Create 15 demo posts

Run `npm run seed:posts -- --dry-run` to preview the 15 Romanian articles without contacting Sanity.

To create them, use the existing `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` settings in `.env.local`, plus `SANITY_API_WRITE_TOKEN` with Editor permissions (the same token used by `seed:projects`). Never prefix the write token with `NEXT_PUBLIC_` or commit it.

Run `npm run seed:posts`. This creates **published demo articles** with generated PNG covers, excerpts, themes, publication dates, SEO fields and Portable Text bodies. They appear in `/studio` as Articol documents and in `/blog` after the cache updates. An empty blog paginates 4 → 8 → 12 → 15. The content is explicitly marked as demonstration copy; edit it before using it as final editorial content.

Stable IDs (`webuilder-demo-article-01` through `webuilder-demo-article-15`) and `demo-` slugs make reruns safe. Existing documents, drafts and matching slugs are skipped, preserving Studio edits. A failed upload does not publish a partial batch; previously uploaded image assets may remain and are reusable on retry. No other articles or projects are modified. Remove/revoke the local write token when no longer needed.

Local checks: `node --test tests/seed-posts.test.mjs`. Tests use an in-memory client and never contact Sanity.
