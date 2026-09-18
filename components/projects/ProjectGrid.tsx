"use client";

import { useRef, useState } from "react";
import type { ProjectBatch } from "@/lib/project-types";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ initial }: { initial: ProjectBatch }) {
  const [projects, setProjects] = useState(initial.items);
  const [next, setNext] = useState(initial.next);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const inFlight = useRef(false);

  async function loadMore() {
    if (!next || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/projects?after=${encodeURIComponent(next)}`,
      );
      if (!response.ok) throw new Error("Projects unavailable");
      const batch: ProjectBatch = await response.json();
      setProjects((current) => {
        const existing = new Set(current.map((project) => project._id));
        return [
          ...current,
          ...batch.items.filter((project) => !existing.has(project._id)),
        ];
      });
      setNext(batch.next);
      setAnnouncement(
        batch.next
          ? "Au fost încărcate mai multe proiecte."
          : "Ai văzut toate proiectele.",
      );
    } catch {
      setError(true);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  if (!projects.length) {
    return (
      <div className="rounded-card border border-border px-6 py-12 sm:px-9">
        <h3 className="text-2xl font-medium tracking-heading">
          Momentan, niciun proiect aici.
        </h3>
        <p className="mt-4 mb-7 max-w-[48ch] text-sm leading-relaxed text-muted">
          Pregătim proiectele pentru portofoliu. Între timp, putem vorbi despre
          ideea ta.
        </p>
        <Button href="/contact" variant="secondary">
          Hai să vorbim
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        id="project-grid"
        aria-busy={loading}
        className="grid items-start gap-9 sm:grid-cols-2 sm:gap-6 lg:gap-9"
      >
        {projects.map((project, index) => (
          <Reveal key={project._id}>
            <div
              className={
                index >= initial.items.length
                  ? "animate-enter motion-reduce:animate-none"
                  : undefined
              }
            >
              <ProjectCard project={project} />
            </div>
          </Reveal>
        ))}
      </div>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      {next && (
        <div className="mt-10 flex flex-col items-center gap-4">
          {error && (
            <p role="alert" className="text-center text-sm text-muted">
              Nu am putut încărca proiectele. Încearcă din nou.
            </p>
          )}
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="secondary"
            arrow={false}
            aria-controls="project-grid"
          >
            {loading ? "Se încarcă…" : "Arată mai multe"}
          </Button>
        </div>
      )}
    </>
  );
}
