"use client";

import { useState, type FormEvent } from "react";
import BookingFlow from "@/components/booking/BookingFlow";
import Button from "@/components/ui/Button";
import FormField, { Input, Textarea } from "@/components/ui/FormField";

const services = ["Website", "Aplicație web", "Automatizare", "Încă explorez"];

export default function ContactForm({ email }: { email: string }) {
  const [mode, setMode] = useState("project");
  const [draft, setDraft] = useState("");
  const meeting = mode === "meeting";

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const subject = value("service");
    const body = [
      `Nume: ${value("name")}`,
      `E-mail: ${value("email")}`,
      ...(value("company") ? [`Companie: ${value("company")}`] : []),
      `Mă interesează: ${subject}`,
      "",
      value("message"),
    ].join("\n");
    const url = `mailto:${email}?subject=${encodeURIComponent(`${subject} — ${value("name")}`)}&body=${encodeURIComponent(body)}`;
    setDraft(url);
    window.location.href = url;
  }

  return (
    <div className="contact-form rounded-card border border-border bg-surface p-5 sm:p-8 xl:p-10">
      <fieldset className="min-w-0">
        <legend className="mb-4 text-kicker tracking-kicker text-muted">
          CUM ÎNCEPEM?
        </legend>
        <div className="grid grid-cols-2 gap-1 rounded-control border border-border bg-background p-1">
          {[
            ["project", "Despre proiect"],
            ["meeting", "Discuție online"],
          ].map(([value, title]) => (
            <label key={value} className="min-w-0 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="contact-mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span className="flex min-h-12 items-center justify-center rounded-[5px] px-2 py-3 text-center text-xs text-muted transition-colors duration-500 peer-checked:bg-surface peer-checked:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary hover:text-foreground motion-reduce:transition-none sm:text-sm">
                {title}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <form
        id="contact-form"
        className="animate-enter motion-reduce:animate-none"
        aria-label="Despre proiectul tău"
        hidden={meeting}
        onSubmit={prepareEmail}
        onChange={() => setDraft("")}
      >
        <div className="mt-7 mb-7" aria-live="polite">
          <h2 className="text-[clamp(24px,2.3vw,34px)] leading-tight font-medium tracking-heading">
            Ce ai vrea să construim?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Câteva detalii sunt suficiente. Nu ai nevoie de un brief perfect.
          </p>
        </div>

        <fieldset hidden={meeting} disabled={meeting} className="mb-7 min-w-0">
          <legend className="mb-3 text-[13px] text-label">
            Mă interesează
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {services.map((service, index) => (
              <label key={service} className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="service"
                  value={service}
                  defaultChecked={index === 0}
                />
                <span className="flex min-h-11 items-center justify-center rounded-control border border-field-border px-2 py-2.5 text-xs text-soft transition-colors duration-500 peer-checked:border-primary/60 peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary hover:border-primary/60 hover:text-foreground motion-reduce:transition-none">
                  {service}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <FormField id="contact-name" label="Numele tău">
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              placeholder="Cum te numești?"
              required
              pattern=".*\S.*"
              maxLength={100}
            />
          </FormField>
          <FormField id="contact-email" label="Adresa de e-mail">
            <Input
              id="contact-email"
              name="email"
              type="email"
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
            rows={4}
            placeholder="Ce face afacerea ta și ce ai vrea să schimbăm?"
            required
            maxLength={1800}
            onChange={(event) =>
              event.currentTarget.setCustomValidity(
                event.currentTarget.value.trim()
                  ? ""
                  : "Spune-ne câteva cuvinte despre idee.",
              )
            }
          />
        </FormField>
        <div className="border-t border-border pt-6">
          <Button type="submit" disabled={!email}>
            Continuă în e-mail
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            {email
              ? "Se deschide un mesaj pregătit în aplicația ta de e-mail. Îl verifici și îl trimiți tu."
              : "Contactul prin e-mail va fi disponibil în curând."}
          </p>
        </div>
        {draft && (
          <p
            role="status"
            className="mt-5 rounded-control border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-soft"
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
      <div hidden={!meeting} className="mt-7">
        <BookingFlow />
      </div>
    </div>
  );
}
