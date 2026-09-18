# Sanity portfolio setup

Use Node.js **22.12 or newer** (Node 24 LTS is suitable). Run `npm install` after pulling this change.

## Connect your account

1. Open https://www.sanity.io/manage and create or select the Webuilder project.
2. Create a **public** dataset named `production`. Public content can be read by anyone; keep project copy and images suitable for public display. Editing still requires your Sanity account and project membership.
3. Copy the project ID from project settings. Add these to `.env.local`:

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

4. In the project's API settings, add these **CORS origins with credentials enabled**:
   - `http://localhost:3000` (or your actual development origin)
   - Your production origin, such as `https://webuilder.ro`
   - `https://www.webuilder.ro` if that origin also serves the site
5. Restart `npm run dev`. Open `/studio` and sign in with a member of this Sanity project.
6. Put the same environment variables in your deployment settings and redeploy once to connect the Studio. Subsequent content publishing does not need a deployment.

Project ID and dataset are public identifiers. **Do not place API tokens in NEXT_PUBLIC variables.** Public datasets require no API token. For a private dataset, add a Viewer token as server-only `SANITY_API_READ_TOKEN`; Studio authentication still uses your Sanity login.

## Add a project

In Studio, create a **Proiect** and fill the four tabs:

- **Prezentare:** name, generated slug, category, disciplines, summary, client, and whether this is a concept.
- **Studiu de caz:** one or two short headline lines, introduction, and up to eight design/implementation decisions.
- **Imagini:** required cover with alternative text, optional caption, hotspot/crop, and up to twelve gallery images. Prefer optimized WebP/JPEG/PNG exports, not original multi-megabyte source files. Reorder gallery items by dragging.
- **Publicare:** optional HTTPS live-site URL, homepage selection/order, and project date. Press **Publish** when ready. Save alone leaves a draft.

Only published documents are read by the website. Once Sanity is configured, the local demonstration concepts are no longer used. An empty dataset therefore produces an empty portfolio until you publish projects. A service error produces a retry state instead of showing unrelated concepts.

The portfolio sorts by date, newest first, with document ID as a stable tiebreaker. Avoid changing dates unnecessarily while visitors browse. Keep published slugs stable; changing a slug changes the URL and requires a redirect if the old URL is already shared or indexed.

## Lots of projects

- Four cards on the initial page, then **Arată mai multe** appends four more per click. Existing cards stay visible and the URL does not change. The button disappears after the last batch; failed requests can be retried. Server queries use date-and-ID cursors, not large query offsets.
- Categories stay in Studio for organization, with no category filters on the public portfolio. Current choices live in `lib/project-types.ts` and can be expanded later without changing this layout.
- Only the two highest-priority **Afișează pe homepage** projects appear on the homepage. Lower `Ordine pe homepage` numbers come first; nothing is automatically featured.
- Listing queries fetch card fields only. Full stories and galleries are fetched on their detail page.
- Images use Sanity transformations and Next image optimization, responsive sizes, and lazy loading.
- New detail pages are generated on demand. A large portfolio does not require building every project in advance.

## Cache behavior

Published-content reads use a 60-second Next.js cache and the Sanity origin API. When the cache expires, a subsequent visit triggers revalidation, so an edit can take a little longer than one minute to appear. New project URLs are available on demand; do not expect every already-open browser tab to update automatically. No revalidation webhook or exposed write credential is required.

## Verification

```bash
npx playwright test tests/projects.spec.ts
npm run test:sanity
```

The first command checks the local demonstration flow. The second evaluates the actual GROQ queries against a local 15-project fixture, including equal timestamps, four-at-a-time loading, retries, duplicate-click protection, featured limits, galleries, and draft exclusion. Test builds override CMS credentials and never write to Sanity. These checks do not verify your actual account, CORS settings, or dataset; perform a publish-and-view check after connecting them.
