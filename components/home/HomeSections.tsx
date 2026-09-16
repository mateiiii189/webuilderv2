import type { ReactNode } from "react";

import Brand from "@/components/ui/Brand";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { navigation, site } from "@/lib/site";

const services = [
  {
    title: "Web design & identitate digitală",
    text:
      "O prezență care pornește de la identitatea afacerii tale. " +
      "Structură clară, design atent și o experiență coerentă " +
      "pe telefon, tabletă și desktop.",
    tags:
      "UI / UX · Design responsive · Website-uri de prezentare",
  },
  {
    title: "Development & aplicații web",
    text:
      "Transformăm designul în experiențe care funcționează. " +
      "De la un website rapid la o platformă cu funcționalități " +
      "construite în jurul modului tău de lucru.",
    tags:
      "Next.js · React · Integrări · Platforme personalizate",
  },
  {
    title: "AI & automatizări",
    text:
      "Identificăm pașii repetitivi și conectăm instrumentele potrivite. " +
      "Automatizări utile pentru cereri, programări și fluxurile " +
      "de lucru ale afacerii tale.",
    tags:
      "Fluxuri de lucru · Integrări API · Asistenți AI",
  },
];

const process = [
  [
    "Descoperim.",
    "Înțelegem afacerea, publicul și obiectivul. " +
      "Stabilim împreună ce construim și de ce.",
  ],
  [
    "Proiectăm.",
    "Definim structura și direcția vizuală. " +
      "Vezi experiența înainte să înceapă dezvoltarea.",
  ],
  [
    "Construim.",
    "Dezvoltăm, conectăm și testăm. " +
      "Urmărim detaliile pe ecrane și dispozitive diferite.",
  ],
  [
    "Lansăm.",
    "Pregătim publicarea și îți arătăm cum să administrezi " +
      "conținutul. Discutăm pașii următori.",
  ],
];

const projects = [
  {
    kind: "architecture",
    title: "Website de arhitectură",
    category: "Web design / Development",
    text:
      "Concept vizual pentru un studio de arhitectură: " +
      "o compoziție editorială, spațiu pentru proiecte și navigație simplă. " +
      "Exemplu demonstrativ, fără un client asociat.",
  },
  {
    kind: "platform",
    title: "Platformă de management",
    category: "UI / UX / Aplicație web",
    text:
      "Concept de interfață pentru organizarea activității: " +
      "proiecte, progres și informații într-un singur loc. " +
      "Datele și grafica sunt demonstrative, fără un client asociat.",
  },
] as const;

function Heading({
  number,
  label,
  id,
  children,
  description,
}: {
  number: string;
  label: string;
  id: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-kicker">
          <span>{number}</span>
          {label}
        </p>

        <h2 id={id}>{children}</h2>
      </div>

      {description && (
        <p className="section-description">
          {description}
        </p>
      )}
    </div>
  );
}

function ProjectPreview({
  kind,
}: {
  kind: "architecture" | "platform";
}) {
  return (
    <div
      className={`project-preview preview-${kind}`}
      aria-hidden="true"
    >
      <span className="concept-label">
        CONCEPT DEMONSTRATIV
      </span>

      {kind === "architecture" ? (
        <div className="architecture-screen">
          <div className="preview-toolbar">
            <span>ARHITECTURĂ / DESIGN</span>
            <span>01 — 03</span>
          </div>

          <div className="architecture-layout">
            <div className="architecture-copy">
              <span>SPAȚIU. LUMINĂ. ECHILIBRU.</span>

              <strong>
                Locuri cu
                <br />
                perspectivă.
              </strong>

              <span className="preview-rule" />
            </div>

            <div className="architecture-art">
              <div className="building building-back" />
              <div className="building building-front" />
              <div className="building-shadow" />
            </div>
          </div>

          <div className="preview-toolbar">
            <span>
              O altă perspectivă asupra spațiului.
            </span>
            <span>↗</span>
          </div>
        </div>
      ) : (
        <div className="platform-screen">
          <div className="platform-sidebar">
            <span className="platform-symbol">+</span>
            <i />
            <i />
            <i />
          </div>

          <div className="platform-main">
            <div className="preview-toolbar">
              <span>WORKSPACE</span>
              <span>●</span>
            </div>

            <strong>Totul, în perspectivă.</strong>

            <p>
              Un spațiu pentru ideile care prind formă.
            </p>

            <div className="dashboard-grid">
              <div className="dashboard-chart">
                <span>Activitate</span>

                <div className="chart-bars">
                  {[32, 48, 39, 66, 58, 82, 72, 96].map(
                    (height, index) => (
                      <i
                        key={index}
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="dashboard-list">
                <span>În lucru</span>
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="dashboard-bottom">
              <span>Design</span>
              <span>Development</span>
              <span>Lansare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeSections() {
  return (
    <>
      <section
        id="proiecte"
        className="content-section"
        aria-labelledby="projects-title"
      >
        <Reveal>
          <Heading
            number="01"
            label="PORTOFOLIU"
            id="projects-title"
            description="Fiecare afacere are propria poveste. Designul și tehnologia îi dau forma potrivită."
          >
            Design cu direcție.
            <br />
            Detalii cu sens.
          </Heading>
        </Reveal>

        <div className="projects-grid">
          {projects.map((project) => (
            <Reveal key={project.kind}>
              <details className="project-card interactive-card">
                <summary>
                  <span className="sr-only">
                    Concept demonstrativ.{" "}
                  </span>

                  <ProjectPreview kind={project.kind} />

                  <div className="project-meta">
                    <div>
                      <p>{project.category}</p>
                      <h3>{project.title}</h3>
                    </div>

                    <span className="project-open">
                      Despre concept
                      <span aria-hidden="true">+</span>
                    </span>
                  </div>
                </summary>

                <div className="project-detail">
                  <p>{project.text}</p>

                  <a className="text-link" href="#contact">
                    Discută un proiect similar →
                  </a>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        id="servicii"
        className="content-section services-section"
        aria-labelledby="services-title"
      >
        <Reveal>
          <Heading
            number="02"
            label="CE FACEM"
            id="services-title"
          >
            De la idee,
            <br />
            la experiență.
          </Heading>

          <p className="section-description">
            Design, dezvoltare și automatizare, cu aceeași
            atenție pentru imaginea de ansamblu și pentru
            fiecare detaliu.
          </p>
        </Reveal>

        <Reveal>
          <div className="services-list">
            {services.map((service, index) => (
              <details
                className="service-item"
                key={service.title}
                open={index === 0}
              >
                <summary>
                  <span className="service-number">
                    0{index + 1}
                  </span>

                  <h3>{service.title}</h3>

                  <span
                    className="disclosure-icon"
                    aria-hidden="true"
                  />
                </summary>

                <div className="service-content">
                  <p>{service.text}</p>
                  <span>{service.tags}</span>

                  <a className="text-link" href="#contact">
                    Hai să discutăm →
                  </a>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <section
        id="proces"
        className="content-section"
        aria-labelledby="process-title"
      >
        <Reveal>
          <Heading
            number="03"
            label="CUM LUCRĂM"
            id="process-title"
            description="Ai vizibilitate asupra fiecărui pas. De la prima discuție până când proiectul ajunge în fața publicului tău."
          >
            O direcție comună.
            <br />
            Patru pași clari.
          </Heading>
        </Reveal>

        <div className="process-grid">
          {process.map(([title, text], index) => (
            <Reveal key={title}>
              <article className="process-step">
                <span className="step-number">
                  0{index + 1}
                </span>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="content-section contact-section"
        aria-labelledby="contact-title"
      >
        <Reveal>
          <p className="section-kicker">
            <span>04</span>
            URMĂTORUL PAS
          </p>

          <div className="contact-layout">
            <h2 id="contact-title">
              Următorul proiect?
              <br />
              <span>Al tău.</span>
            </h2>

            <div className="contact-copy">
              <p>
                Spune-ne ce ai în minte. Împreună îi dăm
                o direcție și stabilim primul pas.
              </p>

              {site.email ? (
                <Button
                  href={`mailto:${site.email}?subject=${encodeURIComponent(
                    "Un proiect nou pentru Webuilder",
                  )}`}
                >
                  Scrie-ne
                </Button>
              ) : (
                <Button disabled>Scrie-ne</Button>
              )}

              <span className="contact-address">
                {site.email || "[Adresa ta de e-mail]"}
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export function Footer() {
  const footerNavigation = [
    ...navigation,
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />

          <p>Din București. Oriunde în lume.</p>
        </div>

        <nav aria-label="Navigație subsol">
          {footerNavigation.map((item) => (
            <a
              className="text-link"
              key={item.href}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Webuilder.
        </span>

        <span>Viziune. Design. Tehnologie.</span>

        <a className="text-link" href="#top">
          Înapoi sus ↑
        </a>
      </div>
    </footer>
  );
}