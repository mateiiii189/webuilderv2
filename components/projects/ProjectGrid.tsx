"use client";

import { useRef, useState } from "react";
import type { ProjectBatch } from "@/lib/project-types";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ initial }: { initial: ProjectBatch }) {
  const [batches, setBatches] = useState([initial.items]);
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
      setBatches((current) => {
        const existing = new Set(current.flat().map((project) => project._id));
        const additions = batch.items.filter(
          (project) => !existing.has(project._id),
        );
        return additions.length ? [...current, additions] : current;
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

  if (!batches[0].length) {
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
      <div id="project-grid" aria-busy={loading}>
        {batches.map((batch, batchIndex) => (
          <div
            key={batch[0]._id}
            className={`-mx-1 grid grid-rows-[1fr] ${batchIndex > 0 ? "animate-project-expand motion-reduce:animate-none" : ""}`}
          >
            <div className="min-h-0 overflow-hidden px-1">
              <div
                className={`grid items-start gap-9 pb-1 sm:grid-cols-2 sm:gap-6 lg:gap-9 ${batchIndex > 0 ? "pt-8 sm:pt-5 lg:pt-8" : "pt-1"}`}
              >
                {batch.map((project, index) => (
                  <Reveal key={project._id}>
                    <div
                      className={
                        batchIndex > 0
                          ? "animate-project-enter motion-reduce:animate-none"
                          : "animate-enter motion-reduce:animate-none"
                      }
                      style={{
                        animationDelay: `${(batchIndex > 0 ? 0 : 250) + index * 120}ms`,
                      }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
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
