"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import BookingFlow from "./BookingFlow";
import {
  BookingError,
  requestBooking,
  type BookingDetails,
  type BookingLink,
} from "@/lib/booking";

export default function ManageBooking({
  mode,
  link,
}: {
  mode: "cancel" | "reschedule";
  link: BookingLink;
}) {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<BookingError | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const { eventId, signature } = link;

  useEffect(() => {
    const controller = new AbortController();
    requestBooking(
      {
        action: mode === "cancel" ? "cancellationDetails" : "rescheduleDetails",
        eventId,
        signature,
      },
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted)
          setDetails({
            date: result.date!,
            time: result.time!,
            name: result.name,
            email: result.email,
          });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof BookingError
              ? error
              : new BookingError("Nu am putut încărca programarea."),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [eventId, signature, mode, reload]);

  async function cancel() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await requestBooking({ action: "cancelBooking", eventId, signature });
      setCancelled(true);
    } catch (error) {
      setError(
        error instanceof BookingError
          ? error
          : new BookingError("Nu am putut confirma anularea."),
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (loading)
    return (
      <p role="status" className="py-10 text-muted">
        Încărcăm programarea…
      </p>
    );
  if (cancelled)
    return (
      <div role="status">
        <h2 className="text-3xl font-medium tracking-heading">
          Programarea a fost anulată.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Întâlnirea din {details?.date}, ora {details?.time}, a fost anulată.
          Confirmarea a fost trimisă prin e-mail.
        </p>
        <Button href="/programare" className="mt-7">
          Alege o altă dată
        </Button>
      </div>
    );

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-control border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-soft"
        >
          <p>{error.message}</p>
          <a
            href="/contact"
            className="mt-3 inline-block underline underline-offset-4"
          >
            Contactează Webuilder
          </a>
        </div>
      )}
      {!details && (
        <Button
          variant="secondary"
          onClick={() => {
            setError(null);
            setLoading(true);
            setReload((value) => value + 1);
          }}
        >
          Reîncarcă programarea
        </Button>
      )}
      {details && (
        <>
          {mode === "cancel" && (
            <p className="mb-7 border-b border-border pb-6 text-sm leading-relaxed text-muted">
              PROGRAMAREA ACTUALĂ
              <br />
              <strong className="mt-2 inline-block text-lg font-medium text-foreground">
                {details.date} · {details.time}
              </strong>
              <br />
              Ora Bucureștiului · Google Meet
            </p>
          )}
          {mode === "reschedule" ? (
            <BookingFlow link={link} details={details} />
          ) : (
            <>
              <h2 className="text-2xl font-medium tracking-heading">
                Anulezi această întâlnire?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Confirmă mai jos pentru a elibera intervalul. Dacă închizi
                pagina, programarea rămâne activă.
              </p>
              <Button
                className="mt-7"
                onClick={() => void cancel()}
                disabled={pending || error?.code === "UNCERTAIN"}
              >
                {pending ? "Anulăm programarea…" : "Confirmă anularea"}
              </Button>
              <div className="mt-4">
                <Button href="/" variant="secondary" direction="back">
                  Păstrează programarea
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
