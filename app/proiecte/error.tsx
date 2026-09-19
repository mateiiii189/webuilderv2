"use client";
import Button from "@/components/ui/Button";

export default function ProjectsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-site flex-col items-start justify-center gap-6 px-gutter py-16">
      <h1 className="text-section-mobile font-medium tracking-heading">
        Proiectele nu sunt disponibile momentan.
      </h1>
      <p className="max-w-[42ch] text-muted">
        Încearcă din nou sau scrie-ne despre ideea ta.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button onClick={reset}>Încearcă din nou</Button>
        <Button href="/contact" variant="secondary">
          Contact
        </Button>
      </div>
    </main>
  );
}
