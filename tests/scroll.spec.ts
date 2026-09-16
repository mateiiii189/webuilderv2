import { expect, test, type Page } from "@playwright/test";

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // The reported jump happens after load, so an immediate assertion misses it.
  await page.waitForTimeout(1_200);
}

test("uncached reload does not overwrite the saved position after pageshow", async ({
  page,
}) => {
  // Uncached document loading exposed the late native restore in WebKit.
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    await route.fulfill({ response });
  });
  await page.goto("/");
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await page.reload();
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(650);
});

for (const width of [390, 1440]) {
  test(`manual scrolling stays at the top through ten reloads at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("[data-hero-copy]")).toBeVisible();
    if (width < 901) {
      await page.getByRole("button", { name: "Meniu", exact: true }).click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "Proces" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Navigație principală", exact: true })
        .getByRole("link", { name: "Proces", exact: true })
        .click();
    }
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await page.mouse.move(width / 2, 450);
    // Model a manual scroll with successive wheel gestures.
    for (let i = 0; i < 12 && (await page.evaluate(() => scrollY > 0)); i++) {
      await page.mouse.wheel(0, -2_000);
      await page.waitForTimeout(250);
    }
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    // The saved section must be replaced before unloading, too.
    await expect
      .poll(() =>
        page.evaluate(() => sessionStorage.getItem("webuilder:scroll:/")),
      )
      .toBe("0");
    for (let i = 0; i < 10; i++) {
      await page.reload({ waitUntil: "load" });
      await expect(page.locator("[data-hero-copy]")).toBeVisible();
      await settle(page);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      expect(new URL(page.url()).hash).toBe("");
      // Native restoration must not be re-enabled while this reload is active.
      expect(await page.evaluate(() => history.scrollRestoration)).toBe(
        "manual",
      );
    }
    // Reload preserves where the visitor actually stopped, not always the top.
    await page.mouse.wheel(0, 650);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
    await page.reload({ waitUntil: "load" });
    await settle(page);
    expect(await page.evaluate(() => scrollY)).toBe(650);
  });
}

test("full-page Back and Forward restore positions after a reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await page.reload();
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(650);
  await page.goto("/contact");
  await expect(page).toHaveURL(/\/contact$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(400);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(650);
  await page.goForward();
  await expect(page).toHaveURL(/\/contact$/);
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(400);
  await page.reload();
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(400);
});

test("blocked session storage leaves restoration to the browser", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  await page.goto("/");
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await page.reload();
  await settle(page);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  expect(errors).toEqual([]);
});

test("client-side route navigation returns restoration to the browser", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.reload();
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("manual");
  await page
    .locator("header")
    .getByRole("link", { name: "Hai să vorbim" })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-hero-copy]")).toBeVisible();
  await page.reload();
  await settle(page);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
