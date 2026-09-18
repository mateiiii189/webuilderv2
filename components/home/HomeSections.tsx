import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import SectionHeading, { Kicker } from "@/components/ui/SectionHeading";
import AccordionItem from "@/components/ui/AccordionItem";
import ProjectCard from "@/components/projects/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";
import { services, processSteps } from "@/lib/home-content";
import { site } from "@/lib/site";
import { sectionSpacing, sectionDescription, textLink } from "@/lib/ui";

export default async function HomeSections() {
  const projects = await getFeaturedProjects();
  return (
    <>
      <section
        id="proiecte"
        className={sectionSpacing}
        aria-labelledby="projects-title"
      >
        <Reveal>
          <SectionHeading
            number="01"
            label="PORTOFOLIU"
            id="projects-title"
            description="Fiecare afacere are propria poveste. Designul și tehnologia îi dau forma potrivită."
          >
            Design cu direcție.
            <br />
            Detalii cu sens.
          </SectionHeading>
        </Reveal>
        <div className="grid items-start gap-7 sm:grid-cols-[1.1fr_0.9fr] sm:[&>div:nth-child(2)]:mt-18">
          {projects.map((project) => (
            <Reveal key={project._id}>
              <ProjectCard project={project} home />
            </Reveal>
          ))}
        </div>
        <div className="mt-8 sm:mt-10">
          <Button href="/proiecte" variant="secondary">
            Toate proiectele
          </Button>
        </div>
      </section>
      <section
        id="servicii"
        className={`${sectionSpacing} grid gap-9 border-t border-border lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 xl:gap-[clamp(40px,7vw,120px)]`}
        aria-labelledby="services-title"
      >
        <Reveal>
          <SectionHeading number="02" label="CE FACEM" id="services-title">
            De la idee,
            <br />
            la experiență.
          </SectionHeading>
          <p className={sectionDescription}>
            Design, dezvoltare și automatizare, cu aceeași atenție pentru
            imaginea de ansamblu și pentru fiecare detaliu.
          </p>
        </Reveal>
        <Reveal>
          <div className="border-t border-border">
            {services.map((service, index) => (
              <AccordionItem
                key={service.title}
                title={service.title}
                number={`0${index + 1}`}
                defaultOpen={index === 0}
              >
                <p className="mb-5">{service.text}</p>
                <span className="block text-kicker text-soft">
                  {service.tags}
                </span>
                <a className={`${textLink} mt-3.5 text-[13px]`} href="/contact">
                  Hai să discutăm →
                </a>
              </AccordionItem>
            ))}
          </div>
        </Reveal>
      </section>
      <section
        id="proces"
        className={`${sectionSpacing} border-t border-border`}
        aria-labelledby="process-title"
      >
        <Reveal>
          <SectionHeading
            number="03"
            label="CUM LUCRĂM"
            id="process-title"
            description="Ai vizibilitate asupra fiecărui pas. De la prima discuție până când proiectul ajunge în fața publicului tău."
          >
            O direcție comună.
            <br />
            Patru pași clari.
          </SectionHeading>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-[30px] sm:gap-8 lg:grid-cols-4 lg:gap-[30px]">
          {processSteps.map(([title, text], index) => (
            <Reveal key={title}>
              <article className="border-t border-border pt-6">
                <span className="text-xs text-primary">0{index + 1}</span>
                <h3 className="mt-6 mb-4 text-[21px] font-medium tracking-[-0.04em] sm:mt-9 sm:text-[25px]">
                  {title}
                </h3>
                <p className="max-w-[29ch] text-[13px] leading-[1.8] text-muted sm:text-sm">
                  {text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section
        id="contact"
        className={`${sectionSpacing} border-t border-border`}
        aria-labelledby="contact-title"
      >
        <Reveal>
          <Kicker number="04">URMĂTORUL PAS</Kicker>
          <div className="grid items-center gap-[30px] lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 xl:grid-cols-[1.4fr_0.6fr]">
            <h2
              id="contact-title"
              className="text-[clamp(42px,8vw,72px)] leading-[1.08] font-medium tracking-heading lg:text-[clamp(46px,6vw,96px)]"
            >
              Următorul proiect?
              <br />
              <span className="text-primary">Al tău.</span>
            </h2>
            <div>
              <p className="mb-[25px] max-w-[42ch] text-base leading-[1.8] text-muted lg:max-w-[31ch]">
                Spune-ne ce ai în minte. Împreună îi dăm o direcție și stabilim
                primul pas.
              </p>
              <Button href="/contact">Hai să vorbim</Button>
              {site.email && (
                <a
                  className={`${textLink} mt-[18px] block text-[13px] wrap-anywhere`}
                  href={`mailto:${site.email}`}
                >
                  {site.email}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
