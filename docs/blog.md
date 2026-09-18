# Blog

The blog uses the existing Sanity project and credentials; no new package, database, or account is required.

## Publish an article

1. Run the website and open `/studio`.
2. Create an **Articol**. Fill in the title, generate its slug, add the short introduction and theme (for example, Web design or SEO).
3. Upload the cover, write its alt description, and optionally add a caption. Use the hotspot control to choose the crop focus.
4. Write the article. Use **Titlu secțiune** (H2) for sections that should appear in the table of contents, **Subtitlu** (H3) for subsections. Paragraphs, bold, italic, code, quotations, links, numbered/bulleted lists and inline images are supported.
5. Optionally complete the **SEO** tab. Otherwise, the title and introduction supply the search metadata.
6. Choose the publication date and click **Publish**. A future date keeps the article hidden until that time; drafts and articles with no body are excluded.

The listing at `/blog` starts with four articles, newest first. **Arată mai multe** appends four, with the existing reveal animation. Each article has its own `/blog/[slug]` page, reading-time estimate, table of contents and contact CTA. With no published articles, the listing shows an honest empty state rather than sample content.

Header and footer navigation now show **Blog** in place of **Proces**. The existing process explanation remains a homepage section.

Published content uses the existing 60-second Next cache; after expiry, a visit triggers revalidation, so updates can take a little longer than a minute. An already-open page needs refreshing. Scheduled dates follow the same cache behavior.

Article pages render on the server with canonical URLs, Open Graph/Twitter metadata and escaped BlogPosting JSON-LD. `/sitemap.xml` includes all published articles, including those beyond the first four, plus public static pages and portfolio projects. Canonical URLs target `https://webuilder.ro`.

## Local verification

`SANITY_INTEGRATION_TEST=1 npx playwright test tests/blog.spec.ts` uses only local CMS fixtures, including draft/future exclusions, pagination, rich text, navigation and mobile/tablet layouts. It does not publish to the real dataset. Run without that flag to check the unconfigured empty state.
