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
const dataset = [
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
    headline: ["Un proiect.", "O direcție."],
    direction: "Ideea proiectului",
    brief: "Povestea proiectului de test.",
    decisions: [
      {
        title: "Structură clară",
        description: "Informații organizate în jurul utilizatorului.",
      },
    ],
    liveUrl: "https://example.test/",
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
