"use client";

import { useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import FormField, { Input, Textarea } from "@/components/ui/FormField";
import { textLink } from "@/lib/ui";

const enter = "animate-enter motion-reduce:animate-none";
const kicker =
  "mb-5 flex items-center gap-2.5 text-[10px] tracking-[0.14em] text-muted";
const label = "mb-2.5 block text-[13px] text-label";

const services = [
  "Website",
  "Aplicație web",
  "Automatizare",
  "Discuție online",
];

export default function ContactExperience({ email }: { email: string }) {
  const [service, setService] = useState(services[0]);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  function requestMeeting() {
    setService("Discuție online");
    setMessage(
      (current) =>
        current ||
        "Salut! Aș vrea să discutăm despre proiectul meu într-o întâlnire online de 30 de minute.\n\nPe scurt, ideea mea este: ",
    );
    const target = form.current;
    if (!target) return;
    nameInput.current?.focus({ preventScroll: true });
    const header =
      document.querySelector("[data-site-header]")?.getBoundingClientRect()
        .height ?? 0;
    window.scrollTo({
      top: Math.max(
        0,
        window.scrollY + target.getBoundingClientRect().top - header - 24,
      ),
      behavior: "instant",
    });
  }

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const sender = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const body = [
      `Nume: ${name}`,
      `E-mail: ${sender}`,
      ...(company ? [`Companie: ${company}`] : []),
      `Mă interesează: ${service}`,
      "",
      message.trim(),
    ].join("\n");
    const url = `mailto:${email}?subject=${encodeURIComponent(`${service} — ${name}`)}&body=${encodeURIComponent(body)}`;
    setDraft(url);
    window.location.href = url;
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-9 pt-10 pb-14 [grid-template-areas:'intro'_'meeting'_'form'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-[clamp(40px,6vw,100px)] lg:gap-y-12 lg:pt-[clamp(48px,6vw,100px)] lg:pb-[88px] lg:[grid-template-areas:'intro_form'_'meeting_form']">
        <Reveal className="[grid-area:intro]">
          <div className={enter}>
            <p className="mb-6 flex items-center gap-2 text-[9px] leading-[1.6] tracking-[0.08em] text-muted lg:mb-7 lg:gap-[11px] lg:text-[10px] lg:tracking-[0.13em]">
              <span
                className="h-px w-[22px] shrink-0 bg-primary"
                aria-hidden="true"
              />
              SĂ ÎNCEPEM CU O CONVERSAȚIE
            </p>
            <h1 className="m-0 text-[clamp(48px,12vw,80px)] leading-[1.04] font-medium tracking-[-0.065em] lg:text-[clamp(52px,6.2vw,94px)]">
              Ai o idee?
              <br />
              <span className="text-primary">
                Hai s-o
                <br />
                construim.
              </span>
            </h1>
            <p className="mt-[22px] max-w-[37ch] text-[15px] leading-[1.8] text-muted lg:mt-7 lg:text-base">
              Un website nou, o aplicație sau un mod mai simplu de a lucra.
              Spune-ne unde vrei să ajungi.
            </p>
            {email && (
              <a
                className={`${textLink} mt-[18px] text-sm wrap-anywhere`}
                href={`mailto:${email}`}
              >
                {email}
                <span aria-hidden="true"> →</span>
              </a>
            )}
          </div>
        </Reveal>

        <Reveal className="[grid-area:form]">
          <form
            id="contact-form"
            aria-label="Despre proiectul tău"
            ref={form}
            className={`${enter} rounded-card border border-border bg-surface px-5 py-6 [animation-delay:100ms] sm:p-[clamp(24px,3vw,44px)]`}
            onSubmit={prepareEmail}
            onChange={() => setDraft("")}
          >
            <p className={kicker}>
              <span className="text-primary">01</span>DESPRE PROIECTUL TĂU
            </p>
            <h2 className="text-[clamp(25px,2.4vw,36px)] leading-[1.15] font-medium tracking-heading">
              Cu ce te putem ajuta?
            </h2>
            <p className="mt-3.5 mb-[30px] text-sm leading-[1.75] text-muted">
              Câteva detalii sunt suficiente pentru primul pas.
            </p>

            <fieldset className="mb-7 min-w-0 border-0 p-0">
              <legend className={label}>Mă interesează</legend>
              <div className="flex flex-wrap gap-2">
                {services.map((value) => (
                  <label
                    key={value}
                    className="relative flex-[1_1_calc(50%-8px)] cursor-pointer sm:flex-none"
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="service"
                      value={value}
                      checked={service === value}
                      onChange={() => setService(value)}
                    />
                    <span className="flex min-h-11 items-center justify-center rounded-control border border-field-border px-[9px] py-[9px] text-[11px] text-soft transition-colors duration-200 peer-checked:border-primary/60 peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-primary hover:border-primary/60 hover:text-foreground motion-reduce:transition-none sm:px-3.5 sm:text-xs">
                      {value}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <FormField id="contact-name" label="Numele tău">
                <Input
                  ref={nameInput}
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Cum te numești?"
                  required
                  maxLength={100}
                />
              </FormField>
              <FormField id="contact-email" label="Adresa de e-mail">
                <Input
                  type="email"
                  id="contact-email"
                  name="email"
                  autoComplete="email"
                  placeholder="nume@companie.ro"
                  required
                  maxLength={254}
                />
              </FormField>
            </div>
            <FormField id="contact-company" label="Companie" optional>
              <Input
                id="contact-company"
                name="company"
                autoComplete="organization"
                placeholder="Numele afacerii tale"
                maxLength={100}
              />
            </FormField>
            <FormField id="contact-message" label="Pe scurt, ideea ta">
              <Textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Ce vrei să construim? Care este obiectivul tău?"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                maxLength={1800}
              />
            </FormField>

            <div className="mt-7">
              <Button type="submit" disabled={!email}>
                Continuă în e-mail
              </Button>
              <p className="mt-3.5 text-xs leading-[1.7] text-muted">
                {email
                  ? "Mesajul se deschide în aplicația ta de e-mail."
                  : "Contactul prin e-mail va fi disponibil în curând."}
              </p>
            </div>
            {draft && (
              <p
                className="mt-5 border-t border-border pt-[18px] text-[13px] leading-[1.7] text-muted"
                role="status"
              >
                Mesajul este pregătit, dar nu a fost trimis automat.{" "}
                <a
                  className="text-foreground underline underline-offset-4"
                  href={draft}
                >
                  Deschide din nou e-mailul.
                </a>
              </p>
            )}
          </form>
        </Reveal>

        <Reveal className="[grid-area:meeting]">
          <aside
            className="border-t border-border pt-6 lg:pt-7"
            aria-labelledby="meeting-title"
          >
            <div className="flex items-start justify-between gap-4">
              <p className={kicker}>
                <span className="text-primary">02</span>PREFERI SĂ VORBIM?
              </p>
              <svg
                className="size-6 shrink-0 stroke-current [stroke-width:1.3] text-primary [stroke-linecap:round] [stroke-linejoin:round]"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect x="3" y="6" width="12" height="12" rx="2" />
                <path d="m15 10 6-3v10l-6-3" />
              </svg>
            </div>
            <h2
              id="meeting-title"
              className="text-[28px] leading-[1.2] font-medium tracking-heading lg:text-[clamp(24px,2.4vw,34px)]"
            >
              O idee. 30 de minute.
              <br />O direcție mai clară.
            </h2>
            <p className="my-[18px] max-w-[44ch] text-sm leading-[1.8] text-muted">
              O conversație despre ce ai în minte, ce contează pentru afacerea
              ta și care ar putea fi următorul pas.
            </p>
            <ul className="my-[22px] flex list-none flex-wrap gap-x-[18px] gap-y-2.5 p-0 text-xs text-soft [&>li+li]:border-l [&>li+li]:border-border [&>li+li]:pl-[18px]">
              <li>30 de minute</li>
              <li>Google Meet</li>
              <li>Online</li>
            </ul>
            <Button variant="secondary" onClick={requestMeeting}>
              Solicită o discuție
            </Button>
            <p className="mt-5 text-xs leading-[1.8] text-soft">
              Luni–vineri · 10:00–18:00
              <br />
              <span className="text-muted">
                Ora Bucureștiului · stabilim împreună data.
              </span>
            </p>
          </aside>
        </Reveal>
      </div>

      <section
        className="border-t border-border pt-12 pb-14 lg:pt-16 lg:pb-20"
        aria-labelledby="next-title"
      >
        <Reveal>
          <p className={kicker}>
            <span className="text-primary">MAI DEPARTE</span>FĂRĂ COMPLICAȚII
          </p>
          <h2
            id="next-title"
            className="max-w-[22ch] text-[clamp(28px,3.4vw,46px)] font-medium tracking-heading"
          >
            Primul mesaj e doar începutul.
          </h2>
        </Reveal>
        <div className="mt-7 grid grid-cols-1 gap-7 sm:mt-10 sm:grid-cols-3 sm:gap-9">
          {[
            [
              "01",
              "Ne spui ideea.",
              "Pornim de la ce vrei să construiești și de la obiectivul afacerii tale.",
            ],
            [
              "02",
              "Clarificăm direcția.",
              "Discutăm ce ai nevoie, prioritățile și detaliile care contează.",
            ],
            [
              "03",
              "Stabilim pașii.",
              "Definim ce include proiectul, calendarul și o propunere potrivită.",
            ],
          ].map(([number, title, text]) => (
            <Reveal key={number}>
              <article className="border-t border-border pt-6">
                <span className="text-[11px] text-primary">{number}</span>
                <h3 className="mt-3.5 mb-3 text-[21px] font-medium tracking-[-0.035em] sm:mt-[22px]">
                  {title}
                </h3>
                <p className="max-w-[34ch] text-sm leading-[1.8] text-muted">
                  {text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
