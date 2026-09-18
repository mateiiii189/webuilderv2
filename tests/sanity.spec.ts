import { expect, test } from "@playwright/test";

test.skip(
  !process.env.SANITY_INTEGRATION_TEST,
  "Uses a local Content Lake fixture, never live credentials.",
);
const cards = (page: import("@playwright/test").Page) =>
  page.locator('main a[href^="/proiecte/proiect-test-"]');

test("load more appends four at a time without replacing cards or changing the URL", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/proiecte");
  await expect(cards(page)).toHaveCount(4);
  await expect(
    page.getByRole("navigation", { name: "Categorii proiecte" }),
  ).toHaveCount(0);
  const first = await cards(page).evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  const button = page.getByRole("button", {
    name: "Arată mai multe",
    exact: true,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await button.hover();
  await expect
    .poll(() =>
      button
        .locator(":scope > span")
        .evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
        ),
    )
    .toBe(-2);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      button
        .locator(":scope > span")
        .evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
        ),
    )
    .toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const count of [8, 12, 15]) {
    await button.click();
    await expect(cards(page)).toHaveCount(count);
    await expect(page).toHaveURL(/\/proiecte$/);
    const links = await cards(page).evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    );
    expect(links.slice(0, 4)).toEqual(first);
    expect(new Set(links).size).toBe(count);
  }
  await expect(button).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText(
    "Ai văzut toate proiectele.",
  );
});

test("failed loads keep existing projects and retry without duplicate requests", async ({
  page,
}) => {
  await page.goto("/proiecte");
  const button = page.getByRole("button", {
    name: "Arată mai multe",
    exact: true,
  });
  await page.route(
    "**/api/projects?*",
    (route) => route.fulfill({ status: 503, body: "{}" }),
    { times: 1 },
  );
  await button.click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Încearcă din nou",
  );
  await expect(cards(page)).toHaveCount(4);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route("**/api/projects?*", async (route) => {
    requests++;
    await gate;
    await route.continue();
  });
  await button.evaluate((element) => {
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
  });
  const loading = page.getByRole("button", { name: "Se încarcă…" });
  await expect(loading).toBeDisabled();
  await expect.poll(() => requests).toBe(1);
  release();
  await expect(cards(page)).toHaveCount(8);
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  expect(requests).toBe(1);
});

test("batch API is bounded and rejects malformed cursors", async ({
  request,
}) => {
  const response = await request.get("/api/projects");
  expect(response.status()).toBe(200);
  const first = await response.json();
  expect(first.items).toHaveLength(4);
  expect(first.total).toBe(15);
  expect(first.next).toBeTruthy();
  const invalid = await request.get("/api/projects?after=invalid");
  expect(invalid.status()).toBe(400);
  const end = Buffer.from(
    JSON.stringify({ date: "2000-01-01T00:00:00.000Z", id: "last" }),
  ).toString("base64url");
  const exhausted = await (
    await request.get(`/api/projects?after=${end}`)
  ).json();
  expect(exhausted.items).toEqual([]);
  expect(exhausted.next).toBeNull();
});

test("featured selection, CMS case studies, images, and unpublished pages", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator('#proiecte a[href^="/proiecte/proiect-test-"]'),
  ).toHaveCount(2);
  await expect(
    page.locator('#proiecte a[href="/proiecte/proiect-test-0"]'),
  ).toBeAttached();
  await expect(
    page.locator('#proiecte a[href="/proiecte/proiect-test-1"]'),
  ).toBeAttached();
  await page.goto("/proiecte/proiect-test-8");
  await expect(page.locator("h1")).toContainText("Un proiect.");
  await expect(page.locator("main")).toContainText("Client de test");
  await expect(page.locator("main")).not.toContainText("Fără client asociat");
  await expect(
    page.getByRole("link", { name: "Vezi website-ul" }),
  ).toHaveAttribute("href", "https://example.test/");
  await expect(page.locator('main img[alt="Captură de test"]')).toHaveCount(2);
  const response = await page.goto("/proiecte/draft-secret");
  expect(response?.status()).toBe(404);
});

test("populated portfolio and controls fit mobile and tablet widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 600, 768, 901, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/proiecte", "/proiecte/proiect-test-8"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      if (route === "/proiecte") {
        await page.getByRole("button", { name: "Arată mai multe" }).click();
        await expect(cards(page)).toHaveCount(8);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
