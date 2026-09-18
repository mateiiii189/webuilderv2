import { expect, test } from "@playwright/test";

test.skip(
  !process.env.SANITY_INTEGRATION_TEST,
  "Uses a local Content Lake fixture, never live credentials.",
);
async function followPage(page: import("@playwright/test").Page, name: string) {
  const link = page.getByRole("link", { name, exact: true });
  const destination = new URL((await link.getAttribute("href"))!, page.url())
    .href;
  await link.click();
  await expect(page).toHaveURL(destination);
}

const cards = (page: import("@playwright/test").Page) =>
  page.locator('main a[href^="/proiecte/proiect-test-"]');

test("bounded cursor pages have no duplicates and navigate backwards", async ({
  page,
}) => {
  await page.goto("/proiecte");
  await expect(cards(page)).toHaveCount(6);
  const first = await cards(page).evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  await followPage(page, "Următoarele");
  await expect(cards(page)).toHaveCount(6);
  const second = await cards(page).evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  expect(second.some((href) => first.includes(href))).toBe(false);
  await followPage(page, "Următoarele");
  await expect(cards(page)).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: "Următoarele", exact: true }),
  ).toHaveCount(0);
  await followPage(page, "Anterioarele");
  await expect(cards(page)).toHaveCount(6);
  expect(
    await cards(page).evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    ),
  ).toEqual(second);
});

test("category changes reset pagination, empty filters and bad cursors are usable", async ({
  page,
}) => {
  await page.goto("/proiecte");
  await followPage(page, "Următoarele");
  await page
    .getByRole("navigation", { name: "Categorii proiecte" })
    .getByRole("link", { name: "Aplicații web" })
    .click();
  await expect(page).toHaveURL(/\/proiecte\?category=web-app$/);
  await expect(cards(page)).toHaveCount(5);
  await page
    .getByRole("navigation", { name: "Categorii proiecte" })
    .getByRole("link", { name: "Automatizări" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Momentan, niciun proiect aici." }),
  ).toBeVisible();
  await page.goto("/proiecte?after=invalid&category=unknown");
  await expect(cards(page)).toHaveCount(6);
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
