// Test-only Content Lake: evaluate the actual GROQ queries against local documents.
const groq = import("groq-js");
const nativeFetch = globalThis.fetch;
const assetId = `image-${"a".repeat(40)}-1600x1200-png`;
const image = {
  _type: "image",
  asset: { _type: "reference", _ref: assetId },
  alt: "Captură de test",
  caption: "Interfață de test",
};
const previewAssetId = `image-${"b".repeat(40)}-1600x4800-png`;
const homepagePreview = {
  _type: "image",
  asset: { _type: "reference", _ref: previewAssetId },
  alt: "Homepage completă de test",
};
const dataset = [
  {
    _id: previewAssetId,
    _type: "sanity.imageAsset",
    metadata: { dimensions: { width: 1600, height: 4800 } },
  },
  {
    _id: assetId,
    _type: "sanity.imageAsset",
    metadata: { dimensions: { width: 1600, height: 1200 } },
  },
  ...Array.from({ length: 15 }, (_, index) => ({
    _id: `project-${String(index).padStart(2, "0")}`,
    _type: "project",
    title: `Proiect test ${String(index).padStart(2, "0")}`,
    slug: { current: `proiect-test-${index}` },
    categoryId: index < 10 ? "web-design" : "web-app",
    category: "Web design / Development",
    summary: "Un proiect pentru verificarea portofoliului conectat la Sanity.",
    isConcept: false,
    clientName: "Client de test",
    cover: image,
    gallery: [image],
    homepagePreview: [9, 10].includes(index) ? homepagePreview : undefined,
    headline: ["Un proiect.", "O direcție."],
    direction: "Ideea proiectului",
    brief: "Povestea proiectului de test.",
    decisions: [
      {
        title: "Structură clară",
        description: "Informații organizate în jurul utilizatorului.",
      },
    ],
    liveUrl: index === 10 ? undefined : "https://example.test/",
    featured: index < 3,
    featuredOrder: index,
    // Tied dates deliberately exercise the _id pagination tiebreaker.
    publishedAt: "2026-09-18T12:00:00.000Z",
  })),
  {
    _id: "drafts.project-hidden",
    _type: "project",
    title: "Draft secret",
    slug: { current: "draft-secret" },
    publishedAt: "2026-09-19T12:00:00.000Z",
    featured: true,
  },
];
const articleBody = [
  {
    _type: "block",
    _key: "intro",
    style: "normal",
    children: [
      {
        _type: "span",
        _key: "s1",
        text: "Un website bun începe cu întrebările potrivite. ",
        marks: [],
      },
      {
        _type: "span",
        _key: "s2",
        text: "Hai să discutăm.",
        marks: ["contact"],
      },
    ],
    markDefs: [{ _type: "link", _key: "contact", href: "/contact" }],
  },
  {
    _type: "block",
    _key: "goals",
    style: "h2",
    children: [
      { _type: "span", _key: "s", text: "Începe cu obiectivul", marks: [] },
    ],
    markDefs: [],
  },
  {
    _type: "block",
    _key: "p1",
    style: "normal",
    children: [
      {
        _type: "span",
        _key: "s",
        text: "Clarifică obiectivul afacerii și acțiunea pe care o aștepți de la vizitator. ".repeat(
          20,
        ),
        marks: [],
      },
    ],
    markDefs: [],
  },
  {
    _type: "block",
    _key: "measure",
    style: "h2",
    children: [
      { _type: "span", _key: "s", text: "Măsoară ce contează", marks: [] },
    ],
    markDefs: [],
  },
  {
    _type: "block",
    _key: "list1",
    style: "normal",
    listItem: "bullet",
    level: 1,
    children: [
      {
        _type: "span",
        _key: "s",
        text: "Urmărește cererile de ofertă.",
        marks: [],
      },
    ],
    markDefs: [],
  },
  { ...image, _key: "inline-image" },
  {
    _type: "block",
    _key: "unsafe",
    style: "normal",
    children: [
      { _type: "span", _key: "s", text: "Link invalid", marks: ["bad"] },
    ],
    markDefs: [{ _type: "link", _key: "bad", href: "javascript:alert(1)" }],
  },
];
const makeArticle = (index) => ({
  _id: `article-${String(index).padStart(2, "0")}`,
  _type: "article",
  slug: { current: `articol-test-${index}` },
  title:
    index === 8
      ? "Ce face un website să lucreze pentru afacerea ta?"
      : `Perspectiva ${index}: design cu un scop clar`,
  excerpt:
    "De la prima impresie la cererea de ofertă. Cum construiești o experiență digitală care are sens pentru clienții tăi.",
  category: "Web design",
  cover: image,
  publishedAt: "2025-01-01T10:00:00.000Z",
  _updatedAt: "2025-01-02T10:00:00.000Z",
  body: articleBody,
  seoTitle: "Website-uri care ajută afacerea",
  seoDescription: "Ghid Webuilder pentru un website clar și util.",
});
dataset.push(
  ...Array.from({ length: 9 }, (_, i) => makeArticle(i)),
  {
    ...makeArticle(20),
    _id: "drafts.article-hidden",
    slug: { current: "articol-draft" },
  },
  {
    ...makeArticle(21),
    slug: { current: "articol-viitor" },
    publishedAt: "2999-01-01T00:00:00.000Z",
  },
  { ...makeArticle(22), slug: { current: "articol-gol" }, body: [] },
);
globalThis.fetch = async function (input, init) {
  const url = new URL(
    typeof input === "string" ? input : input.url || String(input),
  );
  if (url.hostname.endsWith(".sanity.io") && url.pathname.includes("/data/")) {
    if (
      url.hostname !== "webuildertest.api.sanity.io" ||
      !url.pathname.includes("/query/")
    )
      throw new Error("Live Sanity access blocked in tests");
    if (url.searchParams.get("perspective") !== "published")
      throw new Error("Queries must request published content");
    let query = url.searchParams.get("query");
    let params = {};
    if ((init?.method || "GET") === "POST") {
      const body = JSON.parse(init.body);
      query = body.query;
      params = body.params;
    } else
      for (const [key, value] of url.searchParams)
        if (key.startsWith("$")) params[key.slice(1)] = JSON.parse(value);
    const published = dataset.filter((doc) => !doc._id.startsWith("drafts."));
    const { parse, evaluate } = await groq;
    const result = await (
      await evaluate(parse(query), { dataset: published, params })
    ).get();
    return Response.json({ result, ms: 1 });
  }
  if (url.hostname === "cdn.sanity.io") {
    return new Response(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=",
        "base64",
      ),
      { headers: { "Content-Type": "image/png" } },
    );
  }
  return nativeFetch(input, init);
};
