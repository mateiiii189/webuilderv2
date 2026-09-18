import { expect, test } from "@playwright/test";

const routes = [
  "/proiecte",
  "/proiecte/website-arhitectura",
  "/proiecte/platforma-management",
];

test("portfolio pages fit narrow, intermediate, and desktop widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 768, 901, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const line of await page.locator("h1 .animate-title").all()) {
        const fits = await line.evaluate((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return (
            range.getBoundingClientRect().width <= element.clientWidth + 1 &&
            element.getBoundingClientRect().height <=
              parseFloat(getComputedStyle(element).lineHeight) + 1
          );
        });
        expect(fits).toBe(true);
      }
    }
  }
});

test("portfolio links lead to concepts, the next concept, and contact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Navigație principală", exact: true })
    .getByRole("link", { name: "Proiecte", exact: true })
    .click();
  await expect(page).toHaveURL(/\/proiecte$/);
  await page.getByRole("link", { name: /Website de arhitectură/ }).click();
  await expect(page).toHaveURL(/\/proiecte\/website-arhitectura$/);
  await expect(page.locator("main")).toContainText("Fără client asociat");
  await page.getByRole("link", { name: "Următorul concept" }).click();
  await expect(page).toHaveURL(/\/proiecte\/platforma-management$/);
  await page.getByRole("link", { name: "Toate proiectele" }).click();
  await expect(page).toHaveURL(/\/proiecte$/);
  await page.locator("header").getByRole("link", { name: "Scrie-ne" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("#contact-form")).toBeAttached();
});

test("mobile portfolio menu reaches Contact and missing projects return 404", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/proiecte");
  await page.getByRole("button", { name: "Meniu", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Contact$/ })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  const response = await page.goto("/proiecte/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "O adresă fără destinație." }),
  ).toBeVisible();
});
