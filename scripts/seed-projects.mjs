import { createClient } from "@sanity/client";
import { deflateSync } from "node:zlib";
import { pathToFileURL } from "node:url";

const concepts = [
  [
    "Atelier de arhitectură",
    "atelier-arhitectura",
    "web-design",
    "Un portofoliu editorial pentru prezentarea spațiilor și a materialelor.",
  ],
  [
    "Hotel boutique",
    "hotel-boutique",
    "web-design",
    "O experiență de explorare a camerelor, facilităților și destinației.",
  ],
  [
    "Restaurant contemporan",
    "restaurant-contemporan",
    "web-design",
    "Un website care pune meniul și atmosfera restaurantului în prim-plan.",
  ],
  [
    "Studio de interior",
    "studio-interior",
    "web-design",
    "O galerie de amenajări cu prezentări clare pentru fiecare spațiu.",
  ],
  [
    "Colecție de mobilier",
    "colectie-mobilier",
    "web-design",
    "Un catalog digital axat pe forme, materiale și detaliile produselor.",
  ],
  [
    "Galerie de artă",
    "galerie-arta",
    "web-design",
    "Un spațiu digital pentru expoziții, artiști și lucrările lor.",
  ],
  [
    "Portofoliu fotografic",
    "portofoliu-fotografic",
    "web-design",
    "O selecție de serii fotografice organizată într-o interfață discretă.",
  ],
  [
    "Brand de cafea",
    "brand-cafea",
    "web-design",
    "O prezentare a originii, sortimentelor și poveștii unui brand imaginar.",
  ],
  [
    "Management de proiecte",
    "management-proiecte",
    "web-app",
    "Un dashboard pentru organizarea sarcinilor, etapelor și echipei.",
  ],
  [
    "Portal pentru clienți",
    "portal-clienti",
    "web-app",
    "Un punct de acces pentru documente, mesaje și stadiul colaborării.",
  ],
  [
    "Platformă de cursuri",
    "platforma-cursuri",
    "web-app",
    "O bibliotecă de lecții cu navigare simplă și urmărirea progresului.",
  ],
  [
    "Sistem de rezervări",
    "sistem-rezervari",
    "web-app",
    "Un flux de selectare a serviciului, datei și intervalului disponibil.",
  ],
  [
    "Automatizare cereri",
    "automatizare-cereri",
    "automation",
    "Un concept pentru centralizarea și distribuirea cererilor de ofertă.",
  ],
  [
    "Rapoarte automate",
    "rapoarte-automate",
    "automation",
    "Un concept pentru agregarea datelor într-un raport periodic lizibil.",
  ],
  [
    "Onboarding digital",
    "onboarding-digital",
    "automation",
    "Un flux demonstrativ pentru colectarea informațiilor la începutul colaborării.",
  ],
];

export function buildProjects(now = Date.now()) {
  return concepts.map(([title, slug, categoryId, summary], index) => ({
    _id: `webuilder-demo-${String(index + 1).padStart(2, "0")}`,
    _type: "project",
    title,
    slug: { _type: "slug", current: `demo-${slug}` },
    categoryId,
    category:
      categoryId === "web-design"
        ? "Web design / Development"
        : categoryId === "web-app"
          ? "UI design / Aplicații web"
          : "Procese / Automatizări",
    summary,
    isConcept: true,
    headline: [title + ".", "Un concept Webuilder."],
    direction: "O idee, explorată în detaliu.",
    brief: `${summary}\n\nAcesta este un proiect demonstrativ pentru testarea portofoliului Webuilder. Nu reprezintă o colaborare cu un client real. Coperta este o ilustrație de interfață, nu o captură a unui produs livrat.`,
    decisions: [
      {
        _key: "structure",
        _type: "decision",
        title: "Structură clară",
        description:
          "Conținut organizat în jurul acțiunii principale și al informațiilor de care vizitatorul are nevoie.",
      },
      {
        _key: "responsive",
        _type: "decision",
        title: "Adaptare pe orice ecran",
        description:
          "O direcție vizuală cu ierarhie tipografică simplă, spațiere consecventă și controale ușor de folosit.",
      },
    ],
    gallery: [],
    featured: false,
    featuredOrder: index,
    publishedAt: new Date(now - index * 86400000).toISOString(),
  }));
}

// Generate deterministic PNG interface illustrations locally, with no image service
// or extra package. Sanity can resize these covers like any other uploaded PNG.
function pngChunk(type, data) {
  const payload = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of payload) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, payload, checksum]);
}

export function createCover(index) {
  const width = 800,
    height = 600;
  const pixels = Buffer.alloc(height * (1 + width * 3));
  const accent = [
    [190, 157, 103],
    [153, 170, 149],
    [177, 145, 123],
  ][index % 3];
  function rectangle(x, y, w, h, color) {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        const offset = row * (1 + width * 3) + 1 + col * 3;
        pixels.set(color, offset);
      }
    }
  }
  rectangle(0, 0, width, height, [14, 15, 15]);
  rectangle(56, 62, 688, 476, [25, 26, 25]);
  rectangle(82, 88, 72, 9, accent);
  for (let item = 0; item < 3; item++)
    rectangle(532 + item * 62, 90, 36, 5, [108, 110, 105]);
  rectangle(82, 120, 636, 1, [52, 53, 50]);
  if (index % 3 === 0) {
    rectangle(82, 188, 222, 22, [225, 223, 214]);
    rectangle(82, 226, 176, 22, accent);
    for (let row = 0; row < 3; row++)
      rectangle(82, 293 + row * 16, 206 - row * 26, 5, [116, 117, 109]);
    rectangle(82, 370, 110, 31, accent);
    rectangle(374, 158, 344, 318, [42, 44, 41]);
    rectangle(414, 232, 96, 244, accent);
    rectangle(522, 192, 132, 284, [102, 106, 94]);
  } else {
    rectangle(82, 162, 264, 18, [225, 223, 214]);
    rectangle(82, 196, 190, 5, [116, 117, 109]);
    for (let item = 0; item < 3; item++) {
      const x = 82 + item * 216;
      rectangle(x, 248, 204, 216, [
        35 + item * 4,
        37 + item * 4,
        34 + item * 4,
      ]);
      rectangle(
        x + 16,
        268,
        172,
        120,
        item === index % 3 ? accent : [73, 78, 68],
      );
      rectangle(x + 16, 412, 115, 7, [199, 199, 186]);
      rectangle(x + 16, 436, 76, 4, [116, 117, 109]);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(pixels)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

export async function seedProjects(client, log = console.log) {
  const projects = buildProjects();
  const existing = await client.fetch(
    '*[_id in $ids || (_type == "project" && slug.current in $slugs)]{_id, "slug": slug.current}',
    {
      ids: projects.flatMap((project) => [
        project._id,
        `drafts.${project._id}`,
      ]),
      slugs: projects.map((project) => project.slug.current),
    },
  );
  const pending = projects.filter(
    (project) =>
      !existing.some(
        (doc) =>
          doc._id === project._id ||
          doc._id === `drafts.${project._id}` ||
          doc.slug === project.slug.current,
      ),
  );
  if (!pending.length) {
    log("Toate cele 15 proiecte demo există deja. Nu am modificat nimic.");
    return { created: 0, skipped: projects.length };
  }
  const transaction = client.transaction();
  for (const project of pending) {
    const index = projects.indexOf(project);
    const asset = await client.assets.upload("image", createCover(index), {
      filename: `${project._id}.png`,
      contentType: "image/png",
    });
    transaction.createIfNotExists({
      ...project,
      cover: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: `Ilustrație demonstrativă pentru ${project.title}`,
        caption: "Concept demonstrativ Webuilder — ilustrație de interfață.",
      },
    });
    log(`Pregătit: ${project.title}`);
  }
  await transaction.commit();
  log(
    `Seed finalizat: ${pending.length} proiecte procesate, ${existing.length ? projects.length - pending.length : 0} omise. Deschide /proiecte.`,
  );
  return { created: pending.length, skipped: projects.length - pending.length };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--dry-run"))
    throw new Error("Folosește npm run seed:projects sau adaugă -- --dry-run.");
  if (args.includes("--dry-run")) {
    console.table(
      buildProjects().map((project) => ({
        id: project._id,
        title: project.title,
        slug: project.slug.current,
      })),
    );
    console.log(
      "Previzualizare locală: 15 concepte. Nicio cerere către Sanity.",
    );
    return;
  }
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (!projectId || !token)
    throw new Error(
      "Adaugă NEXT_PUBLIC_SANITY_PROJECT_ID și SANITY_API_WRITE_TOKEN în .env.local. Tokenul trebuie să permită scrierea (Editor).",
    );
  console.log(
    `Sanity: ${projectId} / ${dataset}. Adaugă 15 concepte publicate; proiectele existente sunt păstrate.`,
  );
  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2026-09-18",
    useCdn: false,
    perspective: "raw",
  });
  await seedProjects(client);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(
      error.statusCode
        ? `Sanity a refuzat cererea (HTTP ${error.statusCode}). Verifică proiectul, datasetul și permisiunile tokenului.`
        : "Seed eșuat. " +
            (error.response || error.request
              ? "Verifică conexiunea și configurarea Sanity, apoi rulează din nou."
              : error.message),
    );
    process.exitCode = 1;
  });
}
