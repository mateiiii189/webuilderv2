import { expect, test } from "@playwright/test";
const connected = Boolean(process.env.SANITY_INTEGRATION_TEST);
const cards = (page: import("@playwright/test").Page) =>
  page.locator('#article-grid a[href^="/blog/"]');

test("unconfigured blog is empty and unknown articles return 404", async ({
  page,
}) => {
  test.skip(connected);
  await page.goto("/blog");
  await expect(
    page.getByText("Primele perspective sunt în pregătire."),
  ).toBeVisible();
  expect((await page.goto("/blog/inexistent"))?.status()).toBe(404);
});

test.describe("Sanity blog", () => {
  test.skip(!connected);
  test("loads four at a time, retries failures, and omits drafts and future posts", async ({
    page,
    request,
  }) => {
    await page.goto("/blog");
    await expect(cards(page)).toHaveCount(4);
    await expect(
      page.getByRole("heading", { name: "ARTICOLE / 09" }),
    ).toBeVisible();
    await page.route(
      "**/api/blog?*",
      (route) => route.fulfill({ status: 503, body: "{}" }),
      { times: 1 },
    );
    await page.getByRole("button", { name: "Arată mai multe" }).click();
    await expect(page.locator("main").getByRole("alert")).toBeVisible();
    await expect(cards(page)).toHaveCount(4);
    await page.getByRole("button", { name: "Arată mai multe" }).click();
    await expect(cards(page)).toHaveCount(8);
    await page.getByRole("button", { name: "Arată mai multe" }).click();
    await expect(cards(page)).toHaveCount(9);
    await expect(
      page.getByRole("button", { name: "Arată mai multe" }),
    ).toHaveCount(0);
    expect(
      new Set(
        await cards(page).evaluateAll((els) =>
          els.map((el) => el.getAttribute("href")),
        ),
      ).size,
    ).toBe(9);
    expect((await request.get("/api/blog?after=invalid")).status()).toBe(400);
    for (const slug of [
      "articol-draft",
      "articol-viitor",
      "articol-gol",
      "missing",
    ])
      expect((await page.goto(`/blog/${slug}`))?.status()).toBe(404);
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/blog/articol-test-0");
    expect(xml).not.toContain("articol-viitor");
    expect(xml).not.toContain("articol-draft");
  });
  test("article renders rich text, safe links, metadata and working contents", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/articol-test-8");
    await expect(page).toHaveTitle(
      "Website-uri care ajută afacerea — Webuilder",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://webuilder.ro/blog/articol-test-8",
    );
    const structured = JSON.parse(
      (await page
        .locator('script[type="application/ld+json"]')
        .textContent()) || "{}",
    );
    expect(structured["@type"]).toBe("BlogPosting");
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(page.locator("article ul")).toContainText(
      "Urmărește cererile de ofertă.",
    );
    await expect(page.locator("article img")).toHaveCount(2);
    const more = page.getByRole("region", { name: "Citește mai multe" });
    await expect(more.locator('a[href^="/blog/"]')).toHaveCount(3);
    await expect(more.locator('a[href="/blog/articol-test-8"]')).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Înapoi la blog", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "Cuprins articol" })
      .getByRole("link", { name: /Măsoară/ })
      .click();
    await expect
      .poll(() =>
        page
          .locator("#section-measure")
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBe(116);
    await expect(
      page.locator("article").getByRole("link", { name: "Hai să discutăm." }),
    ).toHaveAttribute("href", "/contact");
  });
  test("blog layouts and navigation fit all breakpoints", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const width of [320, 390, 600, 601, 768, 900, 901, 1100, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/blog", "/blog/articol-test-8"]) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
    for (const width of [390, 768, 1100]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/blog/articol-test-8");
      const trigger = page.locator("details summary");
      await expect(trigger).toHaveText(/Cuprins/);
      await trigger.click();
      const menu = page.locator("details");
      await expect(menu).toHaveAttribute("open", "");
      const panel = menu.locator("nav");
      const bounds = await panel.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open");
      await expect(trigger).toBeFocused();
      await trigger.click();
      await panel.getByRole("link", { name: /Măsoară/ }).click();
      await expect(menu).not.toHaveAttribute("open");
      await expect
        .poll(() =>
          page
            .locator("#section-measure")
            .evaluate((el) => el.getBoundingClientRect().top),
        )
        .toBeLessThan(150);
      await expect(trigger).toBeInViewport();
      await trigger.click();
      await page.locator("#section-measure").click();
      await expect(menu).not.toHaveAttribute("open");
    }
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.goto("/blog/articol-test-8");
    const articleWidth = await page
      .locator("article")
      .evaluate((el) => el.getBoundingClientRect().width);
    const headingWidth = await page
      .locator("h1")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(headingWidth).toBeLessThan(articleWidth * 0.6);
    const cover = await page.locator("article figure").first().boundingBox();
    const heading = await page.locator("h1").boundingBox();
    expect(cover!.x + cover!.width).toBeLessThan(heading!.x);
    expect(cover!.height).toBeLessThan(600);
    await expect(page.locator("details summary")).not.toBeVisible();
    await page.setViewportSize({ width: 390, height: 900 });
    await page.getByRole("button", { name: "Meniu", exact: true }).click();
    const nav = page.getByRole("dialog");
    await expect(nav.getByRole("link", { name: /Proces/ })).toHaveCount(0);
    await nav.getByRole("link", { name: /Blog/ }).click();
    await expect(page).toHaveURL(/\/blog$/);
    expect(errors).toEqual([]);
  });
});
