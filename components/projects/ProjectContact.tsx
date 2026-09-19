import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { sectionSpacing, sectionTitle } from "@/lib/ui";

export default function ProjectContact() {
  return (
    <section
      className={`${sectionSpacing} border-t border-border`}
      aria-labelledby="project-contact-title"
    >
      <Reveal className="grid items-start gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
        <div>
          <p className="mb-6 text-kicker tracking-kicker text-muted">
            URMĂTORUL PAS
          </p>
          <h2 id="project-contact-title" className={sectionTitle}>
            O idee de-a ta.
            <br />
            <span className="text-primary">O direcție a noastră.</span>
          </h2>
        </div>
        <div>
          <p className="mb-7 max-w-[40ch] text-base leading-relaxed text-muted">
            Pornim de la afacerea ta și construim în jurul ei. Spune-ne ce ai în
            minte.
          </p>
          <Button href="/contact">Hai să vorbim</Button>
        </div>
      </Reveal>
    </section>
  );
}
