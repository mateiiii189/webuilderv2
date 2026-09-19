import { booking, bucharestDate, type BookingRequest } from "@/lib/booking";

export const runtime = "nodejs";
export const maxDuration = 120;

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
};
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers });
const fail = (error: string, status: number, code = "INVALID_REQUEST") =>
  json({ success: false, error, code }, status);
const invalid = () => {
  throw new Error("INVALID_REQUEST");
};

function parsePayload(input: unknown): BookingRequest {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return invalid();
  const data = input as Record<string, unknown>;
  const text = (key: string, min: number, max: number, pattern?: RegExp) => {
    const value = data[key];
    if (
      typeof value !== "string" ||
      value.trim().length < min ||
      value.length > max ||
      /\u0000/.test(value) ||
      (pattern && !pattern.test(value.trim()))
    )
      return invalid();
    return value.trim();
  };
  const date = () => {
    const value = text("date", 10, 10, /^\d{4}-\d{2}-\d{2}$/);
    const parsed = new Date(`${value}T12:00:00Z`);
    const maximum = bucharestDate(
      new Date(Date.now() + booking.maximumDays * 86400000),
    );
    if (
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value ||
      value < bucharestDate() ||
      value > maximum ||
      [0, 6].includes(parsed.getUTCDay())
    )
      return invalid();
    return value;
  };
  const start = () => {
    const value = text(
      "startIso",
      20,
      30,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00(?:\.000)?Z$/,
    );
    const parsed = new Date(value);
    if (
      !Number.isFinite(parsed.getTime()) ||
      parsed.getTime() < Date.now() + booking.minimumNoticeHours * 3600000
    )
      return invalid();
    // Never construct booking times in the visitor's local time zone.
    const key = bucharestDate(parsed);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: booking.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(parsed);
    if (
      key >
        bucharestDate(new Date(Date.now() + booking.maximumDays * 86400000)) ||
      [0, 6].includes(new Date(`${key}T12:00:00Z`).getUTCDay()) ||
      !/^(10|11|12|13|14|15|16|17):00$/.test(parts)
    )
      return invalid();
    return parsed.toISOString();
  };
  const link = () => ({
    eventId: text("eventId", 1, 256, /^[a-zA-Z0-9_-]+$/),
    signature: text("signature", 43, 43, /^[a-zA-Z0-9_-]+$/),
  });
  switch (data.action) {
    case "availability":
      return { action: data.action, date: date() };
    case "sendPin":
      return {
        action: data.action,
        name: text("name", 2, 100),
        email: text(
          "email",
          3,
          254,
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        ).toLowerCase(),
        project: text("project", 10, 2000),
        startIso: start(),
      };
    case "verify":
    case "verifyReschedulePin":
      return {
        action: data.action,
        token: text("token", 20, 128, /^[a-zA-Z0-9]+$/),
        pin: text("pin", 6, 6, /^\d{6}$/),
      };
    case "cancellationDetails":
    case "cancelBooking":
    case "rescheduleDetails":
      return { action: data.action, ...link() };
    case "rescheduleAvailability":
      return { action: data.action, ...link(), date: date() };
    case "sendReschedulePin":
      return { action: data.action, ...link(), startIso: start() };
    default:
      return invalid();
  }
}

function upstreamFailure(action: BookingRequest["action"]) {
  const readOnly = [
    "availability",
    "rescheduleAvailability",
    "cancellationDetails",
    "rescheduleDetails",
  ].includes(action);
  return readOnly
    ? fail(
        "Calendarul nu este disponibil momentan. Încearcă din nou mai târziu.",
        503,
        "UNAVAILABLE",
      )
    : fail(
        "Nu am putut confirma rezultatul. Verifică e-mailul înainte să reîncerci sau contactează-ne.",
        502,
        "UNCERTAIN",
      );
}

/** Only pass known user-facing messages through; never expose Google exceptions. */
function scriptFailure(
  data: Record<string, unknown>,
  action: BookingRequest["action"],
) {
  const message = typeof data.error === "string" ? data.error : "";
  if (data.code === "INVALID_LINK" || data.code === "NOT_FOUND")
    return fail(
      "Linkul nu este valid sau programarea nu mai este activă.",
      400,
      String(data.code),
    );
  if (
    data.code === "BUSY" ||
    message.startsWith("Programarea este procesată") ||
    message.startsWith("Reprogramarea este procesată")
  )
    return fail(
      "Cererea este deja procesată. Așteaptă câteva secunde.",
      409,
      "BUSY",
    );
  if (/^Codul a expirat|^Ai introdus prea multe/.test(message))
    return fail(
      "Codul a expirat sau limita de încercări a fost atinsă. Solicită un cod nou.",
      400,
      "PIN_EXPIRED",
    );
  if (message === "Codul introdus nu este corect.")
    return fail(message, 400, "INVALID_PIN");
  if (message.startsWith("Un cod a fost deja trimis"))
    return fail(
      "Așteaptă un minut înainte să soliciți un alt cod.",
      429,
      "RATE_LIMITED",
    );
  if (message.startsWith("Intervalul tocmai"))
    return fail(
      "Intervalul nu mai este disponibil. Alege o altă oră.",
      409,
      "SLOT_TAKEN",
    );
  if (message.startsWith("Există deja o programare viitoare"))
    return fail(
      "Ai deja o programare activă. Folosește linkul de reprogramare din e-mailul de confirmare.",
      409,
      "EXISTING_BOOKING",
    );
  if (
    message.startsWith("Alege o dată sau o oră diferită") ||
    message.startsWith("Programarea este deja setată")
  )
    return fail("Alege un interval diferit de programarea actuală.", 400);
  if (
    /^Data |^Ora selectată|^Intervalul selectat|^Programările sunt|^Programarea trebuie/.test(
      message,
    )
  )
    return fail(
      "Alege un interval disponibil, cu minimum 4 ore înainte, de luni până vineri.",
      400,
      "SLOT_TAKEN",
    );
  return upstreamFailure(action);
}

function publicResult(
  action: BookingRequest["action"],
  data: Record<string, unknown>,
) {
  const string = (key: string, max = 254) => {
    if (typeof data[key] !== "string" || (data[key] as string).length > max)
      throw new Error("UPSTREAM_RESPONSE");
    return data[key] as string;
  };
  if (action === "availability" || action === "rescheduleAvailability") {
    if (!Array.isArray(data.slots) || data.slots.length > 48)
      throw new Error("UPSTREAM_RESPONSE");
    const slots = data.slots.map((slot: Record<string, unknown>) => {
      if (
        !slot ||
        typeof slot !== "object" ||
        typeof slot.startIso !== "string" ||
        typeof slot.endIso !== "string" ||
        typeof slot.label !== "string" ||
        !/^\d{2}:\d{2}$/.test(slot.label) ||
        !Number.isFinite(Date.parse(slot.startIso)) ||
        Date.parse(slot.endIso) - Date.parse(slot.startIso) !==
          booking.duration * 60000
      )
        throw new Error("UPSTREAM_RESPONSE");
      return {
        startIso: slot.startIso,
        endIso: slot.endIso,
        label: slot.label,
      };
    });
    return { success: true, slots };
  }
  if (action === "sendPin" || action === "sendReschedulePin") {
    const token = string("token", 128);
    if (!/^[a-zA-Z0-9]{20,128}$/.test(token))
      throw new Error("UPSTREAM_RESPONSE");
    return { success: true, token };
  }
  if (action === "cancellationDetails" || action === "rescheduleDetails") {
    return {
      success: true,
      date: string("date", 20),
      time: string("time", 10),
      ...(action === "rescheduleDetails"
        ? { name: string("name", 100), email: string("email") }
        : {}),
    };
  }
  return { success: true };
}

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return fail("Cerere nepermisă.", 403);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      // Next may construct request.url with its internal hostname behind a proxy.
      const source = new URL(origin);
      if (
        !/^https?:$/.test(source.protocol) ||
        source.host !== request.headers.get("host")
      )
        return fail("Cerere nepermisă.", 403);
    } catch {
      return fail("Cerere nepermisă.", 403);
    }
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return fail("Cerere invalidă.", 415);
  let payload: BookingRequest;
  try {
    // Bound the actual body, including clients that omit Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return fail("Cerere invalidă.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return fail("Cerere prea mare.", 413);
      }
      chunks.push(value);
    }
    payload = parsePayload(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    return fail("Verifică datele introduse și intervalul selectat.", 400);
  }

  const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  const secret = process.env.BOOKING_API_SECRET;
  if (
    !url ||
    !secret ||
    !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      url,
    )
  )
    return fail(
      "Programările online nu sunt disponibile momentan. Scrie-ne prin pagina de contact.",
      503,
      "UNAVAILABLE",
    );
  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret }),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(90000),
    });
    if (!upstream.ok) throw new Error("UPSTREAM_RESPONSE");
    const data = await upstream.json();
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error("UPSTREAM_RESPONSE");
    if (data.success !== true) return scriptFailure(data, payload.action);
    return json(publicResult(payload.action, data));
  } catch {
    // Mutations can complete even when the response is lost. Never auto-retry.
    return upstreamFailure(payload.action);
  }
}
