import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ManageBooking from "@/components/booking/ManageBooking";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Anulează programarea — Webuilder",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const eventId = typeof params.id === "string" ? params.id : "";
  const signature =
    typeof params.signature === "string" ? params.signature : "";
  const valid =
    /^[a-zA-Z0-9_-]{1,256}$/.test(eventId) &&
    /^[a-zA-Z0-9_-]{43}$/.test(signature);
  return (
    <PageShell innerPage>
      <section className="mx-auto max-w-2xl py-10 sm:py-18">
        <p className="mb-5 text-kicker tracking-kicker text-primary">
          WEBUILDER / PROGRAMAREA TA
        </p>
        <h1 className="mb-8 text-section-mobile leading-tight font-medium tracking-heading">
          Anulează programarea
        </h1>
        <div className="booking-interactive rounded-card border border-border bg-surface p-5 sm:p-9">
          {valid ? (
            <ManageBooking mode="cancel" link={{ eventId, signature }} />
          ) : (
            <p role="alert" className="text-sm leading-relaxed text-muted">
              Linkul este incomplet sau invalid. Deschide linkul primit în
              e-mailul de confirmare.
            </p>
          )}
        </div>
        <noscript>
          <style>{`.booking-interactive { display:none; }`}</style>
          <p>
            Activează JavaScript pentru a gestiona programarea sau
            contactează-ne.
          </p>
        </noscript>
        <Button
          href="/contact"
          variant="secondary"
          direction="back"
          className="mt-7"
        >
          Înapoi la contact
        </Button>
      </section>
    </PageShell>
  );
}
