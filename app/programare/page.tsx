import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import BookingFlow from "@/components/booking/BookingFlow";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Programare online — Webuilder",
  description:
    "Programează o discuție de 60 de minute prin Google Meet. Alege data și confirmă prin e-mail.",
};

export default function BookingPage() {
  return (
    <PageShell innerPage>
      <section className="mx-auto max-w-2xl py-10 sm:py-18">
        <p className="mb-5 text-kicker tracking-kicker text-primary">
          WEBUILDER / GOOGLE MEET
        </p>
        <h1 className="mb-5 text-section-mobile leading-tight font-medium tracking-heading sm:text-section">
          O idee. O conversație.
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          60 de minute pentru a discuta despre proiectul tău. Luni–vineri, între
          10:00 și 18:00, ora Bucureștiului.
        </p>
        <div className="booking-interactive rounded-card border border-border bg-surface p-5 sm:p-9">
          <BookingFlow />
        </div>
        <noscript>
          <style>{`.booking-interactive { display:none; }`}</style>
          <p>
            Activează JavaScript pentru programări sau scrie-ne prin pagina de
            contact.
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
