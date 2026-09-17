import ContactForm from "./ContactForm";
import AccordionItem from "@/components/ui/AccordionItem";
import Reveal from "@/components/ui/Reveal";
import { textLink } from "@/lib/ui";

const kicker = "text-kicker tracking-kicker text-muted";

const questions = [
  {
    title: "Am nevoie de un brief complet?",
    answer:
      "Nu. Spune-ne ce face afacerea ta, ce ai vrea să schimbi și ce rezultat urmărești. Clarificăm împreună ce merită construit.",
  },
  {
    title: "Ce discutăm în cele 60 de minute?",
    answer:
      "Ideea ta, publicul căruia te adresezi și ce ai deja. Discutăm prioritățile și întrebările tale, apoi stabilim dacă și cum putem continua.",
  },
  {
    title: "Cum stabilim costul și calendarul?",
    answer:
      "După ce înțelegem proiectul, definim ce include, etapele și termenul de livrare. Primești o propunere pe care o discutăm înainte să începem lucrul.",
  },
];

export default function ContactExperience({ email }: { email: string }) {
  return (
    <>
      <div className="grid items-start gap-x-[clamp(40px,7vw,120px)] gap-y-9 pt-9 pb-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-y-12 lg:pt-18 lg:pb-24">
        <Reveal>
          <p className={`${kicker} mb-6 flex items-center gap-3`}>
            <span className="h-px w-6 bg-primary" aria-hidden="true" />
            CONTACT / WEBUILDER
          </p>
          <h1 className="text-[clamp(46px,11vw,76px)] leading-[1.06] font-medium tracking-hero lg:text-[clamp(58px,5.9vw,96px)]">
            Ai o idee?
            <br />
            Hai s-o
            <br />
            <span className="text-primary">construim.</span>
          </h1>
          <p className="mt-6 max-w-[36ch] text-[15px] leading-relaxed text-muted sm:text-base lg:mt-8">
            Un website, o aplicație sau un mod mai simplu de a lucra. Începem cu
            ce contează pentru afacerea ta.
          </p>
          {email && (
            <a
              href={`mailto:${email}`}
              className={`${textLink} mt-5 inline-flex items-center gap-4 text-sm wrap-anywhere`}
            >
              {email}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </Reveal>

        <Reveal className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ContactForm email={email} />
          <noscript>
            <style>{`.contact-form { display: none; }`}</style>
            <p className="border-t border-border py-8 text-sm text-muted">
              {email ? (
                <>
                  Scrie-ne direct la{" "}
                  <a
                    className="text-foreground underline"
                    href={`mailto:${email}`}
                  >
                    {email}
                  </a>
                  .
                </>
              ) : (
                "Contactul prin e-mail va fi disponibil în curând."
              )}
            </p>
          </noscript>
        </Reveal>

        <Reveal className="lg:col-start-1">
          <aside
            className="border-t border-border pt-7"
            aria-labelledby="meeting-title"
          >
            <p className={kicker}>MAI SIMPLU, FAȚĂ ÎN FAȚĂ.</p>
            <div className="mt-5 flex items-start gap-5">
              <span
                className="text-[56px] leading-none font-medium tracking-heading text-primary sm:text-[72px]"
                aria-hidden="true"
              >
                60<span className="ml-1 text-xl">′</span>
              </span>
              <div>
                <h2
                  id="meeting-title"
                  className="text-xl font-medium tracking-heading sm:text-2xl"
                >
                  O conversație.
                  <br />O direcție mai clară.
                </h2>
                <p className="mt-3 max-w-[31ch] text-sm leading-relaxed text-muted">
                  Alege „Discuție online”, selectează ora disponibilă și
                  confirmă întâlnirea prin codul primit pe e-mail.
                </p>
              </div>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border pt-5 text-xs leading-relaxed">
              <div>
                <dt className="text-muted">Unde</dt>
                <dd className="mt-1 text-soft">Online, prin Google Meet</dd>
              </div>
              <div>
                <dt className="text-muted">Când</dt>
                <dd className="mt-1 text-soft">
                  Luni–vineri · 10:00–18:00
                  <br />
                  Ora Bucureștiului
                </dd>
              </div>
            </dl>
          </aside>
        </Reveal>
      </div>

      <section
        className="grid gap-7 border-t border-border py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-x-[clamp(40px,7vw,120px)] lg:py-20"
        aria-labelledby="contact-questions"
      >
        <Reveal>
          <p className={`${kicker} mb-5`}>ÎNAINTE DE PRIMUL MESAJ</p>
          <h2
            id="contact-questions"
            className="max-w-[17ch] text-[clamp(30px,3.4vw,48px)] leading-[1.15] font-medium tracking-heading"
          >
            Câteva lucruri
            <br />
            bune de știut.
          </h2>
          <p className="mt-5 max-w-[32ch] text-sm leading-relaxed text-muted">
            Nu trebuie să ai toate răspunsurile. Le găsim împreună, pas cu pas.
          </p>
        </Reveal>
        <Reveal>
          {questions.map(({ title, answer }, index) => (
            <AccordionItem key={title} title={title} number={`0${index + 1}`}>
              <p>{answer}</p>
            </AccordionItem>
          ))}
        </Reveal>
      </section>
    </>
  );
}
