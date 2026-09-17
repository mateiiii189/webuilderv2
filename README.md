# Webuilder

Next.js App Router, React, TypeScript, Tailwind CSS v4, and Three.js. The existing black/gold design is retained; page and component styles now use Tailwind throughout.

## Run locally

Use Node.js 22 LTS or newer supported LTS and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Set `CONTACT_EMAIL` in `.env.local` to your real business address and restart the server. In production, set it before building. It is a public contact address, not a secret.

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
npm start
```

## What is implemented

- Homepage: animated desktop W, mobile typography without the W, demonstration projects, services, process, and Contact CTA.
- Contact page: project/meeting enquiry selector, direct email, meeting hours, and three common questions. The layout puts the form immediately after the introduction on mobile.
- Shared header, accessible native mobile dialog, footer, and 404 page.
- Shared primary/secondary buttons with forward/back arrows, form fields, headings, accordion, and replayable reveals.
- Instant section navigation followed by reveal animations. Normal clicks do not add URL hashes. Keyboard navigation moves focus appropriately; mouse clicks do not focus whole sections. Reload and Back/Forward scroll restoration use the browser's default behavior.
- Desktop 3D loads dynamically, pauses outside the viewport and in hidden tabs, and becomes static with reduced motion. Mobile does not initialize or load the scene.

Project examples remain labelled as demonstrations; they are not presented as client work.

## Design system

`app/globals.css` contains Tailwind theme tokens, global base styles, and keyframes. No page layouts, custom button stylesheet, or accumulating override blocks.

| Rule                                                    | Source                             |
| ------------------------------------------------------- | ---------------------------------- |
| Colors, typography, radii, breakpoints, spacing, easing | `app/globals.css`                  |
| Buttons and arrow direction                             | `components/ui/Button.tsx`         |
| Text inputs, textareas, labels                          | `components/ui/FormField.tsx`      |
| Section titles and numbered labels                      | `components/ui/SectionHeading.tsx` |
| Scroll reveals                                          | `components/ui/Reveal.tsx`         |
| Expand/collapse motion                                  | `components/ui/AccordionItem.tsx`  |
| Reused text-link/section recipes                        | `lib/ui.ts`                        |

Use theme utilities such as `bg-primary`, `text-muted`, `rounded-control`, `px-gutter`, and `py-section`. Use the shared components instead of copying their utility lists into new pages. Arbitrary values are reserved for the existing bespoke hero composition and decorative project illustrations.

Breakpoints are `sm: 601px`, `lg: 901px`, `xl: 1101px`, and `2xl: 1600px`. JavaScript's desktop media queries use the same 901px boundary. Buttons have 8px corners and a minimum height of 52px. Buttons and arrows use 500ms hover transitions; the logo and wordmark fade together over the same duration without shifting position. Reduced motion disables entrances and hover movement.

The design's primary color remains the repository's `#f6c700`, with `#ffda28` on hover. Change the tokens once to change all UI accents. The sculpture has separate physical materials in `lib/sculpture.ts` so lighting and metal appearance remain independently controlled.

## Project structure

- `app/`: routes, metadata, and global theme.
- `components/layout/`: shared page shell, navigation, footer, and section navigation behavior.
- `components/home/`: hero, homepage sections, and decorative project previews.
- `components/contact/`: Contact page interactions.
- `components/ui/`: shared presentation/interaction components.
- `lib/home-content.ts`: current project examples, services, and process copy.
- `lib/site.ts`: public email and navigation configuration.
- `lib/sculpture.ts`, `lib/frame-loop.ts`: the existing 3D scene and frame lifecycle.
- `tests/`: browser regression coverage.

Content and layouts stay server-rendered where possible. Client components are used for interaction, media queries, and animation. No new animation engine, state manager, UI framework, or separate backend has been added.

## Contact and meetings

Project enquiries prepare an email draft; they do not send email automatically. Set `CONTACT_EMAIL` before building.

Meeting bookings use the existing Google Apps Script: fresh calendar availability → email PIN → Calendar/Meet creation. Meetings match the supplied script: **60 minutes**, weekdays 10:00–18:00 in Bucharest, at least four hours ahead, up to 60 days out. The same booking form is available on `/contact` and `/programare`.

Signed `/anulare` and `/reprogramare` routes support the links generated by the script. Opening a cancellation link only displays the appointment; the visitor must confirm cancellation. Rescheduling requires a new email PIN.

Set server-only `GOOGLE_APPS_SCRIPT_URL` and `BOOKING_API_SECRET` to enable the integration. No real Google deployment or credentials are included in the repository. See [booking setup, contract, and existing script limitations](docs/booking.md).

Sanity is the selected next step for editable portfolio projects and blog posts. It is not installed or connected in this migration, and no fake blog routes or CMS connection are included. Content currently lives in `lib/home-content.ts` so it can later be replaced with validated CMS data.

## Browser checks

Install the test browsers once:

```bash
npx playwright install chromium
npm run test:e2e
```

The tests build and run a production server on port 3100 with a reserved `.test` email address. No email is sent. Coverage includes responsive layout, mobile menu, navigation/reload regressions, reveal replay, accordion reversal, button direction, keyboard access, contact validation, reduced motion, and no-JavaScript homepage behavior.

The suite checks widths from 320px to 1920px in Chromium. Test real Safari/iOS and GPU appearance before launch. Run `npm run build` with your real production environment after testing, because the test build contains the test email address.

## Deployment

Deploy as a Next.js project on Vercel. Set `CONTACT_EMAIL` before the production build. Presentation pages are statically prerendered; signed booking-management pages render per request. Booking API responses and upstream requests use `no-store`. The booking route allows up to 120 seconds of server execution for the existing script’s Meet provisioning; confirm your deployment supports that duration. CMS content can use targeted revalidation when that integration is implemented.
