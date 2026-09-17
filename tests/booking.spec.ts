import { expect, test } from "@playwright/test";

// This suite uses the real Next route with a simulated Apps Script upstream.
test.skip(
  !process.env.BOOKING_INTEGRATION_TEST,
  "Run npm run test:booking for the isolated booking integration suite.",
);
test.use({ timezoneId: "America/Los_Angeles" });
const signature = "A".repeat(43);
function futureDay(offset = 2) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  while ([0, 6].includes(date.getUTCDay()))
    date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

for (const width of [320, 390, 768, 1440]) {
  test(`booking and PIN confirmation work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/programare");
    await page.getByLabel("Alege ziua").fill(futureDay());
    await page
      .locator("label")
      .filter({ has: page.getByRole("radio", { name: /\d{2}:00/ }) })
      .first()
      .click();
    await page.getByLabel("Numele tău", { exact: true }).fill("Client Test");
    await page
      .getByLabel("Adresa de e-mail", { exact: true })
      .fill("client@example.test");
    await page
      .getByLabel("Despre ce ai vrea să discutăm?")
      .fill("Un website pentru afacerea mea.");
    await page
      .getByRole("button", { name: "Trimite codul de verificare" })
      .click();
    await expect(page.getByLabel("Codul din e-mail")).toBeFocused();
    await page.getByLabel("Codul din e-mail").fill("111111");
    await page
      .getByRole("button", { name: "Confirmă programarea", exact: true })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "nu este corect",
    );
    await page.getByLabel("Codul din e-mail").fill("123456");
    await page
      .getByRole("button", { name: "Confirmă programarea", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Ne vedem la întâlnire." }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText("client@example.test");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("rescheduling requires a PIN and cancellation requires an explicit click", async ({
  page,
}) => {
  await page.goto(`/reprogramare?id=test-event&signature=${signature}`);
  await expect(page.getByText(/Programarea actuală:/)).toContainText("14:00");
  await page.getByLabel("Alege ziua").fill(futureDay(3));
  await page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name: /\d{2}:00/ }) })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Trimite codul de verificare" })
    .click();
  await page.getByLabel("Codul din e-mail").fill("123456");
  await page
    .getByRole("button", { name: "Confirmă reprogramarea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Noua dată este confirmată." }),
  ).toBeVisible();
  const actions: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/booking"))
      actions.push(request.postDataJSON().action);
  });
  await page.goto(`/anulare?id=test-event&signature=${signature}`);
  await expect(
    page.getByRole("button", { name: "Confirmă anularea" }),
  ).toBeVisible();
  expect(actions).not.toContain("cancelBooking");
  await page.getByRole("button", { name: "Confirmă anularea" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Programarea a fost anulată.",
  );
  expect(actions.filter((action) => action === "cancelBooking")).toHaveLength(
    1,
  );
});

test("invalid links and unavailable slots do not show confirmation", async ({
  page,
}) => {
  await page.goto("/anulare");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "invalid",
  );
  await page.goto(`/reprogramare?id=test-event&signature=${"B".repeat(43)}`);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "nu este valid",
  );
  await page.goto("/programare");
  await page.getByLabel("Alege ziua").fill(futureDay());
  await page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name: /\d{2}:00/ }) })
    .first()
    .click();
  await page.getByLabel("Numele tău", { exact: true }).fill("Client Test");
  await page
    .getByLabel("Adresa de e-mail", { exact: true })
    .fill("taken@example.test");
  await page
    .getByLabel("Despre ce ai vrea să discutăm?")
    .fill("Un website pentru afacerea mea.");
  await page
    .getByRole("button", { name: "Trimite codul de verificare" })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "nu mai este disponibil",
  );
  await expect(page.getByLabel("Codul din e-mail")).toHaveCount(0);
});

test("server validates requests, injects its own secret, and strips upstream data", async ({
  request,
}) => {
  for (const body of [
    { action: "unknown" },
    { action: "availability", date: "2027-02-30" },
    { action: "verify", pin: "123456", token: "short" },
  ]) {
    expect((await request.post("/api/booking", { data: body })).status()).toBe(
      400,
    );
  }
  const response = await request.post("/api/booking", {
    data: {
      action: "availability",
      date: futureDay(),
      secret: "attacker-secret",
    },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const result = await response.json();
  expect(result.slots).toHaveLength(2);
  expect(result).not.toHaveProperty("secret");
  const details = await request.post("/api/booking", {
    data: {
      action: "rescheduleDetails",
      eventId: "different-event",
      signature,
    },
  });
  expect(await details.json()).not.toHaveProperty("rescheduleUrl");
  expect(
    (
      await request.post("/api/booking", {
        data: { action: "availability", date: futureDay() },
        headers: { origin: "https://other.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/booking", {
        data: { action: "sendPin", name: "A".repeat(18000) },
      })
    ).status(),
  ).toBe(413);
  const expired = await request.post("/api/booking", {
    data: { action: "verify", token: "e".repeat(32), pin: "123456" },
  });
  expect((await expired.json()).code).toBe("PIN_EXPIRED");
  const uncertain = await request.post("/api/booking", {
    data: { action: "verify", token: "a".repeat(32), pin: "333333" },
  });
  expect(uncertain.status()).toBe(502);
  expect((await uncertain.json()).code).toBe("UNCERTAIN");
});
