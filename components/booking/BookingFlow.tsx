"use client";

import { useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import FormField, { Input, Textarea } from "@/components/ui/FormField";
import SlotPicker from "./SlotPicker";
import {
  BookingError,
  describeSlot,
  requestBooking,
  type BookingDetails,
  type BookingLink,
  type BookingRequest,
  type Slot,
} from "@/lib/booking";

type PinRequest = Extract<
  BookingRequest,
  { action: "sendPin" | "sendReschedulePin" }
>;

export default function BookingFlow({
  link,
  details,
}: {
  link?: BookingLink;
  details?: BookingDetails;
}) {
  const [step, setStep] = useState<"details" | "pin" | "done">("details");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [recipient, setRecipient] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<BookingError | null>(null);
  const [pinRequest, setPinRequest] = useState<PinRequest | null>(null);
  const busy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const pinInput = useRef<HTMLInputElement>(null);

  async function run(task: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await task();
    } catch (error) {
      setError(
        error instanceof BookingError
          ? error
          : new BookingError("Cererea nu a putut fi procesată."),
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function sendPin(payload: PinRequest) {
    const result = await requestBooking(payload);
    setPinRequest(payload);
    setToken(result.token!);
    setPin("");
    setStep("pin");
    requestAnimationFrame(() =>
      pinInput.current?.focus({ preventScroll: true }),
    );
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? details?.email ?? "").trim();
    setRecipient(email);
    const payload: PinRequest = link
      ? { action: "sendReschedulePin", ...link, startIso: slot.startIso }
      : {
          action: "sendPin",
          name: String(data.get("name") ?? "").trim(),
          email,
          project: String(data.get("project") ?? "").trim(),
          startIso: slot.startIso,
        };
    void run(() => sendPin(payload));
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      await requestBooking({
        action: link ? "verifyReschedulePin" : "verify",
        token,
        pin,
      });
      setToken("");
      setPin("");
      setStep("done");
      requestAnimationFrame(() =>
        heading.current?.focus({ preventScroll: true }),
      );
    });
  }

  const errorMessage = error && (
    <div
      role="alert"
      className="my-5 rounded-control border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-soft"
    >
      <p>{error.message}</p>
      {error.code === "UNCERTAIN" && (
        <a
          href="/contact"
          className="mt-2 inline-block underline underline-offset-4"
        >
          Contactează Webuilder
        </a>
      )}
    </div>
  );

  if (step === "done")
    return (
      <div role="status" className="py-5">
        <span
          aria-hidden="true"
          className="mb-6 flex size-12 items-center justify-center rounded-control border border-primary/40 text-2xl text-primary"
        >
          ✓
        </span>
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-3xl font-medium tracking-heading outline-none"
        >
          {link ? "Noua dată este confirmată." : "Ne vedem la întâlnire."}
        </h2>
        <p className="mt-5 text-lg text-foreground">
          {slot && describeSlot(slot.startIso)}
        </p>
        <p className="mt-2 text-sm text-muted">
          60 de minute · ora Bucureștiului · Google Meet
        </p>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Confirmarea și linkul Google Meet au fost trimise la{" "}
          <span className="wrap-anywhere text-foreground">{recipient}</span>. În
          același e-mail găsești linkurile pentru anulare și reprogramare.
        </p>
        <Button href="/" className="mt-7" variant="secondary" direction="back">
          Înapoi la website
        </Button>
      </div>
    );

  return (
    <div aria-busy={pending}>
      <p className="mb-4 text-kicker tracking-kicker text-primary">
        {step === "pin"
          ? "02 / CONFIRMAREA PRIN E-MAIL"
          : "01 / DATA ȘI DETALIILE"}
      </p>
      <h2 className="mb-3 text-[clamp(25px,2.4vw,34px)] leading-tight font-medium tracking-heading">
        {step === "pin"
          ? "Verifică-ți e-mailul."
          : link
            ? "Alege noul interval."
            : "Hai să ne cunoaștem."}
      </h2>
      <p className="mb-7 text-sm leading-relaxed text-muted">
        {step === "pin"
          ? `Am trimis un cod de 6 cifre la ${recipient}. Codul este valabil 10 minute.`
          : "Alege un interval disponibil. Confirmi programarea cu un cod primit prin e-mail."}
      </p>
      {errorMessage}
      <form onSubmit={submitDetails} hidden={step !== "details"}>
        <fieldset disabled={pending} className="min-w-0 disabled:opacity-70">
          {details && (
            <p className="mb-5 text-sm leading-relaxed text-muted">
              Programarea actuală: {details.date}, {details.time} · ora
              Bucureștiului
            </p>
          )}
          <SlotPicker
            value={slot}
            onChange={(value) => {
              setSlot(value);
              setError(null);
            }}
            link={link}
          />
          {!link && (
            <>
              <FormField id="booking-name" label="Numele tău">
                <Input
                  id="booking-name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  pattern=".*\S.{1,}"
                  placeholder="Cum te numești?"
                />
              </FormField>
              <FormField id="booking-email" label="Adresa de e-mail">
                <Input
                  id="booking-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="nume@companie.ro"
                />
              </FormField>
              <FormField
                id="booking-project"
                label="Despre ce ai vrea să discutăm?"
              >
                <Textarea
                  id="booking-project"
                  name="project"
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="Descrie pe scurt ideea sau proiectul tău."
                />
              </FormField>
            </>
          )}
          <Button type="submit" disabled={!slot || pending}>
            {pending ? "Trimitem codul…" : "Trimite codul de verificare"}
          </Button>
        </fieldset>
      </form>
      {step === "pin" && (
        <form onSubmit={verify}>
          <p className="mb-6 border-y border-border py-4 text-sm leading-relaxed text-soft">
            {slot && describeSlot(slot.startIso)}
            <br />
            Ora Bucureștiului · 60 de minute
          </p>
          <fieldset disabled={pending} className="min-w-0 disabled:opacity-70">
            <FormField id="booking-pin" label="Codul din e-mail">
              <Input
                ref={pinInput}
                id="booking-pin"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                required
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, ""))
                }
                className="tracking-[0.35em]"
                placeholder="000000"
              />
            </FormField>
            <Button
              type="submit"
              disabled={
                pending ||
                pin.length !== 6 ||
                error?.code === "PIN_EXPIRED" ||
                error?.code === "UNCERTAIN"
              }
            >
              {pending
                ? "Procesăm cererea…"
                : link
                  ? "Confirmă reprogramarea"
                  : "Confirmă programarea"}
            </Button>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted">
              <button
                type="button"
                className="min-h-11 underline underline-offset-4 transition-colors duration-500 hover:text-foreground"
                onClick={() => {
                  setStep("details");
                  setToken("");
                  setPin("");
                  setError(null);
                }}
              >
                Modifică detaliile
              </button>
              <button
                type="button"
                className="min-h-11 underline underline-offset-4 transition-colors duration-500 hover:text-foreground"
                disabled={!pinRequest || error?.code === "UNCERTAIN"}
                onClick={() =>
                  pinRequest && void run(() => sendPin(pinRequest))
                }
              >
                Trimite un cod nou
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Verifică și folderul Spam. Poți solicita un alt cod după un minut.
            </p>
          </fieldset>
        </form>
      )}
    </div>
  );
}
