import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { sanityConfigured } from "@/sanity/env";
import Button from "@/components/ui/Button";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-3xl font-medium tracking-heading">
          Conectează Sanity
        </h1>
        <p className="text-muted">
          Adaugă NEXT_PUBLIC_SANITY_PROJECT_ID și NEXT_PUBLIC_SANITY_DATASET în
          .env.local, apoi repornește serverul. Pașii de configurare sunt în
          README.
        </p>
        <Button href="/" variant="secondary" direction="back">
          Înapoi la website
        </Button>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
