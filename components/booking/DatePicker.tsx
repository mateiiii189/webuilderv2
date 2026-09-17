"use client";

import { useId, useRef, useState } from "react";
import { booking, bucharestDate } from "@/lib/booking";

const days = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const fullDays = [
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
  "Duminică",
];
const dateFromKey = (key: string) => new Date(`${key}T12:00:00Z`);
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const label = (key: string) =>
  dateFromKey(key).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const monthKey = (key: string) => `${key.slice(0, 7)}-01`;
function moveMonth(key: string, offset: number) {
  const date = dateFromKey(key);
  date.setUTCMonth(date.getUTCMonth() + offset, 1);
  return dateKey(date);
}

export default function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const calendar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [bounds, setBounds] = useState({ min: "", max: "" });

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const now = new Date();
    const min = bucharestDate(now);
    const max = bucharestDate(
      new Date(now.getTime() + booking.maximumDays * 86400000),
    );
    setBounds({ min, max });
    setMonth(monthKey(value >= min && value <= max ? value : min));
    setOpen(true);
  }
  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  function available(key: string) {
    const day = dateFromKey(key).getUTCDay();
    return key >= bounds.min && key <= bounds.max && day !== 0 && day !== 6;
  }

  const first = month ? dateFromKey(month) : null;
  const offset = first ? (first.getUTCDay() + 6) % 7 : 0;
  const count = first
    ? new Date(
        Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
      ).getUTCDate()
    : 0;
  const cells = Array.from(
    { length: Math.ceil((offset + count) / 7) * 7 },
    (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= count
        ? `${month.slice(0, 7)}-${String(day).padStart(2, "0")}`
        : null;
    },
  );

  return (
    <div className="mb-6">
      <label htmlFor={id} className="mb-3 block text-[13px] text-label">
        Alege ziua
      </label>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        aria-describedby={`${id}-hours`}
        onClick={toggle}
        className="flex min-h-14 w-full items-center justify-between gap-3 rounded-control border border-field-border bg-background px-4 text-left text-sm text-soft transition-colors duration-500 hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
      >
        <span>{value ? label(value) : "Selectează o dată"}</span>
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="shrink-0 text-primary"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3v4m10-4v4M3 11h18m-13 4h3m3 0h3" />
        </svg>
      </button>
      {open && first && (
        <div
          ref={calendar}
          id={`${id}-calendar`}
          role="group"
          aria-label="Calendar programări"
          className="mt-3 min-w-0 animate-enter rounded-control border border-primary/20 bg-background p-2 motion-reduce:animate-none sm:p-5"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
              return;
            }
            const target = event.target as HTMLButtonElement;
            const key = target.dataset.date;
            const movement: Record<string, number> = {
              ArrowLeft: -1,
              ArrowRight: 1,
              ArrowUp: -7,
              ArrowDown: 7,
            };
            if (!key || !(event.key in movement)) return;
            event.preventDefault();
            const date = dateFromKey(key);
            const step = movement[event.key];
            date.setUTCDate(date.getUTCDate() + step);
            // Skip closed days while keeping keyboard navigation within the booking window.
            while (
              dateKey(date) >= bounds.min &&
              dateKey(date) <= bounds.max &&
              !available(dateKey(date))
            ) {
              date.setUTCDate(date.getUTCDate() + (step > 0 ? 1 : -1));
            }
            const next = dateKey(date);
            if (!available(next)) return;
            setMonth(monthKey(next));
            requestAnimationFrame(() =>
              calendar.current
                ?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)
                ?.focus({ preventScroll: true }),
            );
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-1">
            <button
              type="button"
              aria-label="Luna precedentă"
              disabled={month <= monthKey(bounds.min)}
              onClick={() => setMonth(moveMonth(month, -1))}
              className="size-11 shrink-0 rounded-control text-xl text-soft transition-colors duration-300 hover:bg-primary/10 disabled:opacity-20"
            >
              ←
            </button>
            <p
              aria-live="polite"
              className="text-center text-sm font-medium text-foreground capitalize sm:text-base"
            >
              {first.toLocaleDateString("ro-RO", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
            <button
              type="button"
              aria-label="Luna următoare"
              disabled={month >= monthKey(bounds.max)}
              onClick={() => setMonth(moveMonth(month, 1))}
              className="size-11 shrink-0 rounded-control text-xl text-soft transition-colors duration-300 hover:bg-primary/10 disabled:opacity-20"
            >
              →
            </button>
          </div>
          <table
            className="w-full table-fixed border-separate border-spacing-0.5 text-center"
            aria-label="Zile disponibile"
          >
            <thead>
              <tr>
                {days.map((day, index) => (
                  <th
                    key={day}
                    scope="col"
                    className="pb-3 text-[11px] font-normal text-muted"
                  >
                    <abbr className="no-underline" title={fullDays[index]}>
                      {day}
                    </abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: cells.length / 7 }, (_, week) => (
                <tr key={week}>
                  {cells.slice(week * 7, week * 7 + 7).map((key, index) => (
                    <td key={key ?? `empty-${index}`} className="p-0">
                      {key && (
                        <button
                          type="button"
                          data-date={key}
                          aria-label={label(key)}
                          aria-pressed={value === key}
                          aria-current={key === bounds.min ? "date" : undefined}
                          disabled={!available(key)}
                          onClick={() => {
                            onChange(key);
                            close();
                          }}
                          className="relative flex min-h-11 w-full items-center justify-center rounded-control text-sm text-soft transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-primary enabled:hover:bg-primary/10 enabled:hover:text-primary disabled:text-muted/30 aria-pressed:bg-primary aria-pressed:text-background aria-[current=date]:ring-1 aria-[current=date]:ring-primary/40 aria-[current=date]:ring-inset motion-reduce:transition-none sm:min-h-12"
                        >
                          {Number(key.slice(-2))}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 border-t border-border pt-3 text-center text-[11px] leading-relaxed text-muted">
            Alege ziua, apoi intervalul potrivit.
          </p>
        </div>
      )}
      <p id={`${id}-hours`} className="mt-3 text-xs leading-relaxed text-muted">
        Luni–vineri · 10:00–18:00 · ora Bucureștiului. Minimum 4 ore înainte.
      </p>
    </div>
  );
}
