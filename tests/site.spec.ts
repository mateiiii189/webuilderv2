import { expect, test } from "@playwright/test";

for (const width of [320, 390, 600, 768, 900, 901, 1440, 1920]) {
  test(`Home and Contact fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/", "/contact"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("main")).toHaveCount(1);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      if (width <= 900 || route === "/contact")
        await expect(page.locator("canvas")).toHaveCount(0);
      if (route === "/") {
        const title = await page.locator("h1").boundingBox();
        expect(title!.x).toBeGreaterThanOrEqual(0);
        expect(title!.x + title!.width).toBeLessThanOrEqual(width);
        const spans = page.locator("h1 [data-hero-entrance]");
        for (const line of await spans.all()) {
          const box = await line.boundingBox();
          expect(box!.height).toBeLessThan(160); // Each phrase stays on one line.
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

test("section links jump immediately, replay reveals, and keep the URL clean", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  const nav = page.getByRole("navigation", {
    name: "Navigație principală",
    exact: true,
  });
  await nav.getByRole("link", { name: "Servicii", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("#servicii")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(116);
  expect(new URL(page.url()).hash).toBe("");
  expect(
    await page
      .locator("#servicii")
      .evaluate((el) => el === document.activeElement),
  ).toBe(false);
  await expect(page.locator("[data-hero-copy]")).toHaveAttribute(
    "data-hero-visible",
    "false",
  );
  await expect(
    page.locator("#servicii > [data-reveal]").first(),
  ).toHaveAttribute("data-reveal", "visible");
  await page
    .locator("header")
    .getByRole("link", { name: "Webuilder — pagina principală" })
    .click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator("[data-hero-copy]")).toHaveAttribute(
    "data-hero-visible",
    "true",
  );
  await expect(
    page.locator("#servicii > [data-reveal]").first(),
  ).toHaveAttribute("data-reveal", "pending");
  for (let i = 0; i < 2; i++) {
    await page.reload();
    await expect(page.locator("[data-hero-copy]")).toBeVisible();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  }
});

test("mobile menu closes, restores scrolling, and navigates without a hash", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Meniu", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: "Meniu", exact: true }).click();
  await dialog.getByRole("link", { name: "Servicii" }).click();
  await expect(dialog).not.toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("#servicii")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(100);
  expect(new URL(page.url()).hash).toBe("");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("service accordion animates its height and can reverse mid-transition", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#servicii details[open]")).toHaveCount(0);
  const item = page.locator("#servicii details").first();
  const summary = item.locator("summary");
  await summary.click();
  await expect(item).toHaveAttribute("data-expanded", "true");
  const duration = await item.evaluate(
    (el) => el.getAnimations()[0]?.effect?.getTiming().duration,
  );
  expect(duration).toBe(650);
  await summary.click();
  await expect(item).not.toHaveAttribute("open");
  await expect(item).not.toHaveAttribute("style", /height:/);
  await summary.click();
  await expect(item).toHaveAttribute("open");
  await expect(item).not.toHaveAttribute("data-expanded");
});

test("logo stays stationary; button arrows move in the correct direction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const logo = page.locator("header a").first();
  const before = await logo.locator("svg").boundingBox();
  await logo.hover();
  const after = await logo.locator("svg").boundingBox();
  expect(after).toEqual(before);
  const button = page
    .locator("header")
    .getByRole("link", { name: "Contactează-ne" });
  const buttonBefore = await button.boundingBox();
  await button.hover();
  await expect(button.locator("svg")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 4, 0)",
  );
  expect(await button.boundingBox()).toEqual(buttonBefore);
  await expect(button.locator(":scope > span")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, -2)",
  );
  // Hover the original bottom edge: the lifted surface must not lose hover.
  await button.hover({ position: { x: 10, y: buttonBefore!.height - 1 } });
  await expect(button.locator(":scope > span")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, -2)",
  );
  await page.mouse.move(0, 0);
  await expect(button.locator("svg")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, 0)",
  );
  expect(await button.boundingBox()).toEqual(buttonBefore);
  await page.goto("/missing-page");
  const back = page.getByRole("link", { name: "Înapoi la început" });
  await back.hover();
  await expect(back.locator("svg")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, -4, 0)",
  );
});

test("Contact validates project enquiries and preserves notes when switching to booking", async ({
  page,
}) => {
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Despre proiectul tău" });
  await form.getByRole("button", { name: "Continuă în e-mail" }).click();
  await expect(form.getByRole("status")).toHaveCount(0);
  await form
    .getByLabel("Pe scurt, ideea ta", { exact: true })
    .fill("Un proiect de test & o idee nouă.");
  await form.getByText("Automatizare", { exact: true }).click();
  await page.getByText("Discuție online", { exact: true }).click();
  await expect(page.getByLabel("Alege ziua")).toBeVisible();
  await page.getByText("Despre proiect", { exact: true }).click();
  await expect(
    form.getByLabel("Pe scurt, ideea ta", { exact: true }),
  ).toHaveValue("Un proiect de test & o idee nouă.");
  await expect(form.getByRole("radio", { name: "Automatizare" })).toBeChecked();
  await form.getByLabel("Numele tău", { exact: true }).fill("Matei Test");
  await form
    .getByLabel("Adresa de e-mail", { exact: true })
    .fill("matei@example.test");
  await form.getByRole("button", { name: "Continuă în e-mail" }).click();
  await expect(form.getByRole("status")).toContainText(
    "nu a fost trimis automat",
  );
  const href = await form
    .getByRole("link", { name: "Deschide din nou e-mailul." })
    .getAttribute("href");
  expect(href).toContain("mailto:studio@example.test?");
  expect(decodeURIComponent(href!)).toContain(
    "Un proiect de test & o idee nouă.",
  );
  expect(decodeURIComponent(href!)).toContain("Automatizare");
  await form.getByLabel("Numele tău", { exact: true }).fill("Matei Updated");
  await expect(form.getByRole("status")).toHaveCount(0);
});

test("Contact navigation returns to a home section and consumes its query", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/contact");
  await page
    .getByRole("navigation", { name: "Navigație principală", exact: true })
    .getByRole("link", { name: "Proces", exact: true })
    .click();
  await expect
    .poll(
      () =>
        new URL(page.url()).pathname +
        new URL(page.url()).search +
        new URL(page.url()).hash,
    )
    .toBe("/");
  await expect
    .poll(() =>
      page
        .locator("#proces")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(116);
});

test("keyboard skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Sari la conținut" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect(new URL(page.url()).hash).toBe("");
});

test("reduced motion leaves content visible and disables entrance animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  await expect(page.locator("h1 [data-hero-entrance]").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator("#servicii > [data-reveal]").first()).toHaveCSS(
    "opacity",
    "1",
  );
});

test("homepage remains readable and native accordions work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navigație mobilă fără JavaScript" }),
  ).toBeVisible();
  const item = page.locator("#servicii details").nth(1);
  await item.locator("summary").click();
  await expect(item).toHaveAttribute("open");
  await context.close();
});
