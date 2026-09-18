import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ContactExperience from "@/components/contact/ContactExperience";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Webuilder",
  description:
    "Ai o idee? Hai să o construim. Povestește-ne despre proiectul tău sau solicită o discuție online de 60 de minute.",
};

export default function ContactPage() {
  return (
    <PageShell innerPage>
      <ContactExperience email={site.email} phone={site.phone} />
    </PageShell>
  );
}
