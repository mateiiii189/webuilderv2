/* Test-only preload: production code still calls the real fetch API and validates a Google URL. */
const nativeFetch = globalThis.fetch;
const testUrl = "https://script.google.com/macros/s/webuilder-test/exec";
const secret = "booking-test-secret-no-live-access";
let cancelled = false;
globalThis.fetch = async function (input, init) {
  if (String(input) !== testUrl) return nativeFetch(input, init);
  const data = JSON.parse(init.body);
  const reply = (body) => Response.json({ ...body, secret }); // The route must strip unexpected fields.
  if (data.secret !== secret) return reply({ success: false, error: "Cererea nu este autorizată." });
  if (data.signature?.startsWith("B")) return reply({ success: false, code: "INVALID_LINK" });
  if (data.eventId === "cancelled" || (cancelled && data.eventId === "test-event" && data.action === "cancellationDetails")) return reply({ success: false, code: "NOT_FOUND" });
  switch (data.action) {
    case "availability": case "rescheduleAvailability": {
      const slots = [12, 13].map(hour => {
        const startIso = `${data.date}T${hour}:00:00.000Z`;
        return { startIso, endIso: `${data.date}T${hour + 1}:00:00.000Z`, label: new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit" }).format(new Date(startIso)) };
      });
      return reply({ success: true, slots });
    }
    case "sendPin":
      if (data.email === "taken@example.test") return reply({ success: false, error: "Intervalul tocmai a fost rezervat. Alege o altă oră." });
      return reply({ success: true, token: "a".repeat(32) });
    case "sendReschedulePin": return reply({ success: true, token: "b".repeat(32) });
    case "verify": case "verifyReschedulePin":
      if (data.pin === "333333") throw new Error("Simulated lost response after mutation");
      if (data.token.startsWith("e")) return reply({ success: false, error: "Codul a expirat. Reia programarea pentru a primi unul nou." });
      if (data.pin !== "123456") return reply({ success: false, error: "Codul introdus nu este corect." });
      return reply({ success: true });
    case "rescheduleDetails": case "cancellationDetails": return reply({ success: true, date: "20.10.2026", time: "14:00", name: "Client Test", email: "client@example.test", eventId: data.eventId, rescheduleUrl: "https://untrusted.example/" });
    case "cancelBooking": cancelled = true; return reply({ success: true });
    default: return reply({ success: false, error: "Acțiune necunoscută." });
  }
};
