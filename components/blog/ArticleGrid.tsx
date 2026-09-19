"use client";

import { useRef, useState } from "react";
import type { ArticleBatch } from "@/lib/blog-types";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import ArticleCard from "./ArticleCard";

export default function ArticleGrid({ initial }: { initial: ArticleBatch }) {
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
        `/api/blog?after=${encodeURIComponent(next)}`,
      );
      if (!response.ok) throw new Error("Articles unavailable");
      const batch: ArticleBatch = await response.json();
      setBatches((current) => {
        const existing = new Set(current.flat().map((article) => article._id));
        const additions = batch.items.filter(
          (article) => !existing.has(article._id),
        );
        return additions.length ? [...current, additions] : current;
      });
      setNext(batch.next);
      setAnnouncement(
        batch.next
          ? "Au fost încărcate mai multe articole."
          : "Ai văzut toate articolele.",
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
          Primele perspective sunt în pregătire.
        </h3>
        <p className="mt-4 mb-7 max-w-[48ch] text-sm leading-relaxed text-muted">
          Articole despre design, tehnologie și decizii digitale pentru afacerea
          ta. Între timp, putem discuta despre proiectul tău.
        </p>
        <Button href="/contact" variant="secondary">
          Hai să vorbim
        </Button>
      </div>
    );
  }

  return (
    <>
      <div id="article-grid" aria-busy={loading}>
        {batches.map((batch, batchIndex) => (
          <div
            key={batch[0]._id}
            className={`-mx-1 grid grid-rows-[1fr] ${batchIndex > 0 ? "animate-project-expand motion-reduce:animate-none" : ""}`}
          >
            <div className="min-h-0 overflow-hidden px-1">
              <div
                className={`grid items-start gap-9 pb-1 sm:grid-cols-2 sm:gap-6 lg:gap-9 ${batchIndex > 0 ? "pt-8 sm:pt-5 lg:pt-8" : "pt-1"}`}
              >
                {batch.map((article, index) => (
                  <Reveal key={article._id}>
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
                      <ArticleCard article={article} />
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
              Nu am putut încărca articolele. Încearcă din nou.
            </p>
          )}
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="secondary"
            arrow={false}
            aria-controls="article-grid"
          >
            {loading ? "Se încarcă…" : "Arată mai multe"}
          </Button>
        </div>
      )}
    </>
  );
}
