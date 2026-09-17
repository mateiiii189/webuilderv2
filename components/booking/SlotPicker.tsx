"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import FormField, { Input } from "@/components/ui/FormField";
import {
  booking,
  bucharestDate,
  requestBooking,
  type BookingLink,
  type Slot,
} from "@/lib/booking";

export default function SlotPicker({
  value,
  onChange,
  link,
}: {
  value: Slot | null;
  onChange: (slot: Slot | null) => void;
  link?: BookingLink;
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function load(value: string) {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setDate(value);
    onChange(null);
    setSlots([]);
    setError("");
    if (!value) {
      setStatus("idle");
      return;
    }
    if ([0, 6].includes(new Date(`${value}T12:00:00Z`).getUTCDay())) {
      setStatus("idle");
      setError("Alege o zi de luni până vineri.");
      return;
    }
    setStatus("loading");
    try {
      const result = await requestBooking(
        link
          ? { action: "rescheduleAvailability", ...link, date: value }
          : { action: "availability", date: value },
        active.signal,
      );
      if (active.signal.aborted) return;
      setSlots(result.slots ?? []);
      setStatus("loaded");
    } catch (error) {
      if (active.signal.aborted) return;
      setError(
        error instanceof Error ? error.message : "Nu am putut încărca orele.",
      );
      setStatus("error");
    }
  }

  return (
    <div className="mb-7">
      <FormField id="booking-date" label="Alege ziua">
        <Input
          id="booking-date"
          type="date"
          value={date}
          onFocus={(event) => {
            event.currentTarget.min = bucharestDate();
            event.currentTarget.max = bucharestDate(
              new Date(Date.now() + booking.maximumDays * 86400000),
            );
          }}
          onChange={(event) => void load(event.target.value)}
          required
          aria-describedby="booking-hours"
        />
        <p
          id="booking-hours"
          className="mt-2 text-xs leading-relaxed text-muted"
        >
          Luni–vineri · 10:00–18:00 · ora Bucureștiului. Minimum 4 ore înainte.
        </p>
      </FormField>
      {status === "loading" && (
        <p role="status" className="text-sm text-muted">
          Verificăm calendarul…
        </p>
      )}
      {error && (
        <div role="alert" className="text-sm leading-relaxed text-soft">
          <p>{error}</p>
          {status === "error" && (
            <Button
              className="mt-3"
              variant="secondary"
              onClick={() => void load(date)}
            >
              Reîncearcă
            </Button>
          )}
        </div>
      )}
      {status === "loaded" &&
        (slots.length ? (
          <fieldset className="min-w-0">
            <legend className="mb-3 text-[13px] text-label">Alege ora</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <label key={slot.startIso} className="relative cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="booking-slot"
                    value={slot.startIso}
                    checked={value?.startIso === slot.startIso}
                    onChange={() => onChange(slot)}
                    required
                  />
                  <span className="flex min-h-12 items-center justify-center rounded-control border border-field-border text-sm text-soft transition-colors duration-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary hover:border-primary/60 motion-reduce:transition-none">
                    {slot.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              60 de minute · Google Meet. Ora este rezervată după verificarea
              codului.
            </p>
          </fieldset>
        ) : (
          <p role="status" className="text-sm leading-relaxed text-muted">
            Nu mai sunt intervale disponibile în această zi. Alege o altă zi.
          </p>
        ))}
    </div>
  );
}
