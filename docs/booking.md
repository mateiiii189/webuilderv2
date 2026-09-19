# Google Apps Script booking

The website uses the supplied `Code.gs` contract. It does not replace the Google script or its scheduled trigger.

## Enable the connection

Set these variables in `.env.local` and in your deployment environment:

```dotenv
CONTACT_EMAIL=admin@webuilder.ro
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
BOOKING_API_SECRET=YOUR_EXISTING_SCRIPT_PROPERTY_VALUE
```

Copy the value of `BOOKING_API_SECRET` from Apps Script → Project Settings → Script properties. Do not prefix it with `NEXT_PUBLIC_`, commit it, or include it in a browser request. Restart the development server after editing the environment.

In Apps Script:

1. Set the project time zone to `Europe/Bucharest`. The supplied `createLocalDate_` uses the project time zone, while other functions explicitly use `CONFIG.TIME_ZONE`; these must match.
2. Keep `SLOT_MINUTES: 60`, weekdays 10:00–18:00, four hours' notice, and a 60-day booking window. The website matches those settings. If you change them, also update `lib/booking.ts`, route validation, and the displayed copy.
3. Retain the Advanced Calendar service, Meet API permissions, and configured Gmail sender alias required by the existing script.
4. Deploy the script as a Web App that executes as its owner and allows unauthenticated requests. `doPost` still authenticates each call using the server-held secret. Use the deployment's `/exec` URL. Update the deployment to the intended script version.
5. Keep `WEB_APP_URL` and `BOOKING_API_SECRET` in Script properties. Run the existing `setup()` after verifying these settings to configure the five-minute trigger. This operates on your Google account; it has not been run from this repository.
6. `CONFIG.WEBSITE_URL` determines where existing emails send visitors. Keep it pointed at the website that serves `/programare`, `/anulare`, and `/reprogramare`. Changing it affects newly generated emails; old emails retain their original domain.

Google's Content service redirects responses to `script.googleusercontent.com`; the server request follows redirects. Reference: https://developers.google.com/apps-script/guides/content#redirects

## Website routes

- `/contact`: project enquiries remain email drafts; “Discuție online” opens the real booking flow.
- `/programare`: standalone booking page, also used by the script's cancellation emails.
- `/anulare?id=...&signature=...`: loads booking details; cancellation occurs only after pressing the confirmation button.
- `/reprogramare?id=...&signature=...`: loads the signed booking, checks availability, sends a new PIN, and confirms the move.
- `POST /api/booking`: validates a fixed set of actions and fields, adds the secret on the server, calls Apps Script, and returns only the fields the UI uses.

Availability and booking responses are not cached. Dates and times are displayed in Bucharest time regardless of the visitor's location. PINs and verification tokens stay in component memory, never in URLs or browser storage. Management pages use no-index and no-referrer metadata. Signed management links are bearer links and should remain private.

The Google script remains responsible for calendar conflict checks, PIN expiration and attempt limits, the one-active-booking rule, reminder scheduling, email delivery, Meet restrictions, and manual reschedule notifications. The UI does not invent slots, confirm before a successful response, or automatically retry mutations. A lost response can mean a booking succeeded, so an uncertain-result message asks the visitor to check their email before retrying.

## Existing script issues to address before live use

These are present in the supplied script; they cannot be corrected by the Next.js frontend:

- **Free/busy errors are currently treated as an empty calendar.** In `getAvailability_` and `assertSlotAvailable_`, require `calendarData` to exist, reject a nonempty `calendarData.errors`, and require `busy` to be an array before using it. Otherwise a Google Calendar error can be interpreted as an available slot.
- **A notification error can occur after a calendar mutation has succeeded.** Creation, cancellation, and rescheduling can return `success: false` after changing the calendar if a client email fails. Make mutation results durable/idempotent and handle notification retries separately. The website reports an uncertain result and does not automatically retry it.
- **PIN cache reads and failed-attempt increments happen outside the lock.** Concurrent requests can lose attempt increments; reschedule verification can read an already-consumed token before waiting for the lock. Re-read and consume the token, and update attempts, under the same lock as verification. The per-email send cooldown is also a check-then-write operation outside a lock.

For the free/busy issue, add this helper to Apps Script:

```js
function requireBusyIntervals_(response) {
  const calendar = response.calendars && response.calendars[CONFIG.CALENDAR_ID];
  if (!calendar || (calendar.errors && calendar.errors.length) || !Array.isArray(calendar.busy)) {
    throw new Error("Nu am putut verifica disponibilitatea. Încearcă din nou mai târziu.");
  }
  return calendar.busy;
}
```

In `getAvailability_`, replace the `calendarData` and `busyIntervals` declarations with:

```js
const busyIntervals = requireBusyIntervals_(freeBusy);
```

In `assertSlotAvailable_`, replace the `calendarData` and `busy` declarations with:

```js
const busy = requireBusyIntervals_(result);
```

Save and update the Web App deployment after changing the Google script. These snippets have not been applied to your Google account.

Do not run `testAllBookingEmails`, `testNextWebuilderReminder`, or other email/calendar test functions unless you intend their real side effects. No real email, booking, cancellation, or Google configuration change was made while implementing this website.

## Verify locally without touching Google

```bash
npm run test:booking
```

This runs the production website with `tests/fixtures/apps-script.cjs` preloaded in the test server. The fixture intercepts only a reserved test Apps Script URL. Test configuration overwrites inherited URL and secret settings, so these checks cannot use the live credentials. The application route itself has no mock endpoint or test bypass.

The tests cover booking, incorrect/expired PINs, signed-link errors, cancellation confirmation, rescheduling, request validation, cross-origin rejection, secret isolation, and responsive layouts. This validates the website against the supplied contract, not the deployed Google permissions or actual mail delivery. After configuring the connection, a deliberate end-to-end booking on your account is still required.

For public launch, apply deployment-level abuse protection to the booking endpoint. The supplied script's per-email cooldown does not limit requests across different email addresses; an in-memory Next.js counter would not enforce a global limit across server instances.
