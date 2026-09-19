/** Matches the supplied Apps Script CONFIG. Google remains the booking authority. */
export const booking = {
  timeZone: "Europe/Bucharest",
  duration: 60,
  maximumDays: 60,
  minimumNoticeHours: 4,
} as const;

export type Slot = { startIso: string; endIso: string; label: string };
export type BookingLink = { eventId: string; signature: string };
export type BookingDetails = {
  date: string;
  time: string;
  name?: string;
  email?: string;
};
export type BookingRequest =
  | { action: "availability"; date: string }
  | {
      action: "sendPin";
      name: string;
      email: string;
      project: string;
      startIso: string;
    }
  | { action: "verify" | "verifyReschedulePin"; token: string; pin: string }
  | ({
      action: "cancellationDetails" | "cancelBooking" | "rescheduleDetails";
    } & BookingLink)
  | ({ action: "rescheduleAvailability"; date: string } & BookingLink)
  | ({ action: "sendReschedulePin"; startIso: string } & BookingLink);
export type BookingResponse = {
  success: true;
  slots?: Slot[];
  token?: string;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
};

export function bucharestDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: booking.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function describeSlot(startIso: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: booking.timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startIso));
}

export class BookingError extends Error {
  constructor(
    message: string,
    public code = "REQUEST_FAILED",
  ) {
    super(message);
  }
}

export async function requestBooking(
  payload: BookingRequest,
  signal?: AbortSignal,
): Promise<BookingResponse> {
  let response: Response;
  try {
    response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new BookingError(
      "Conexiunea s-a întrerupt. Dacă ai confirmat deja, verifică e-mailul înainte să reîncerci.",
      "UNCERTAIN",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true) {
    throw new BookingError(
      data?.error ||
        "Nu am putut procesa cererea. Încearcă din nou mai târziu.",
      data?.code,
    );
  }
  return data;
}
