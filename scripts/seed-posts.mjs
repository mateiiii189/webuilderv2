import { createClient } from "@sanity/client";
import { pathToFileURL } from "node:url";
import { createCover } from "./seed-projects.mjs";

// Editorial samples for exercising the blog, not claims about client results.
const topics = [
  [
    "Ce ar trebui să facă homepage-ul afacerii tale",
    "homepage-afacere",
    "Web design",
    "O pagină de început care explică oferta și invită la următorul pas.",
    "Începe cu întrebarea vizitatorului",
    "Prima secțiune trebuie să explice ce oferi, pentru cine și cum poate începe o colaborare. Un slogan poate completa mesajul, dar nu ar trebui să țină locul explicației.",
    "Construiește o ordine firească",
    "După ofertă, arată exemple relevante, explică modul de lucru și oferă o cale clară de contact. Fiecare secțiune ar trebui să răspundă unei întrebări reale.",
  ],
  [
    "Design pe mobil: mai mult decât un ecran mic",
    "design-mobil",
    "Web design",
    "Cum adaptezi conținutul, spațiile și acțiunile pentru telefon.",
    "Stabilește prioritățile",
    "Pe telefon, ordinea conținutului contează mai mult decât păstrarea compoziției de desktop. Titlul, explicația și acțiunea principală trebuie să rămână ușor de găsit.",
    "Testează lățimile intermediare",
    "Verifică și spațiul dintre telefon și laptop. Un titlu poate deveni greu de citit înainte să intre următorul breakpoint; ajustează coloanele în funcție de conținut.",
  ],
  [
    "Cum alegi imaginile pentru un website",
    "alegerea-imaginilor",
    "Conținut",
    "Imagini care completează mesajul, fără să concureze cu el.",
    "Alege imagini cu un rol clar",
    "O imagine de proiect poate explica rezultatul mai bine decât o fotografie generică. Alege materiale care au legătură cu oferta și pe care ai dreptul să le folosești.",
    "Verifică decuparea",
    "O fotografie arată diferit într-un card și într-un hero. Alege punctul de interes și verifică atât varianta îngustă, cât și cea lată înainte de publicare.",
  ],
  [
    "Un formular de contact mai ușor de completat",
    "formular-contact",
    "Experiență utilizator",
    "Cum ceri informațiile necesare fără să complici prima discuție.",
    "Cere doar ce folosești",
    "Numele, o metodă de contact și câteva detalii despre proiect pot fi suficiente pentru prima conversație. Fiecare câmp în plus ar trebui să aibă un motiv concret.",
    "Explică următorul pas",
    "După trimitere, afișează o confirmare clară. Dacă apare o eroare, păstrează informațiile completate și explică ce poate face utilizatorul pentru a continua.",
  ],
  [
    "Ce merită să apară într-un studiu de caz",
    "studiu-de-caz",
    "Portofoliu",
    "Un proiect prezentat prin context, decizii și rezultat.",
    "Oferă context",
    "Explică problema inițială și limitele proiectului. Cititorul are nevoie să înțeleagă scopul înainte să poată evalua soluția vizuală.",
    "Arată deciziile",
    "Selectează câteva alegeri importante și explică de ce au fost făcute. Include rezultate măsurate doar dacă ai date verificabile; imaginile singure nu demonstrează impactul comercial.",
  ],
  [
    "Cum pregătești conținutul înainte de design",
    "continut-inainte-de-design",
    "Conținut",
    "Un punct de pornire pentru texte, imagini și structura paginilor.",
    "Inventariază materialele",
    "Adună descrierea serviciilor, întrebările primite de la clienți, exemplele de lucru și fotografiile disponibile. Separă materialele finale de cele care trebuie actualizate.",
    "Scrie pentru o întrebare",
    "Asociază fiecărei pagini o întrebare principală. Apoi verifică dacă titlul, explicația și acțiunea propusă ajută cititorul să ajungă la un răspuns.",
  ],
  [
    "Un blog util începe cu întrebările clienților",
    "blog-intrebari-clienti",
    "Strategie",
    "Cum alegi teme relevante pentru oamenii care îți caută serviciile.",
    "Pornește de la conversații",
    "Notează întrebările care reapar în discuțiile cu potențiali clienți. Ele pot deveni articole despre proces, criterii de alegere sau pregătirea unui proiect.",
    "Preferă răspunsurile concrete",
    "Un articol util explică un subiect precis și oferă exemple. Evită promisiunile generale și publicarea unor texte foarte asemănătoare doar pentru a umple blogul.",
  ],
  [
    "Navigație simplă pentru un website de prezentare",
    "navigatie-simpla",
    "Experiență utilizator",
    "Etichete și trasee care ajută vizitatorul să găsească informația.",
    "Folosește nume previzibile",
    "Etichete precum Servicii, Proiecte și Contact sunt mai ușor de interpretat decât denumiri inventate. Meniul trebuie să ajute orientarea fără explicații suplimentare.",
    "Păstrează traseele scurte",
    "Verifică dacă fiecare pagină importantă poate fi găsită din meniu și dacă există o cale de întoarcere. Pe mobil, meniul trebuie să poată fi închis ușor.",
  ],
  [
    "Animații discrete, cu un scop clar",
    "animatii-discrete",
    "Web design",
    "Mișcare care explică schimbările și păstrează interfața calmă.",
    "Animează schimbarea",
    "Un feedback la apăsare sau apariția unei secțiuni poate clarifica ce s-a întâmplat. Mișcarea ar trebui să susțină interacțiunea, fără să amâne accesul la conținut.",
    "Respectă preferințele vizitatorului",
    "Oferă o variantă cu mișcare redusă și nu ascunde informații esențiale în spatele unei animații. Verifică și utilizarea cu tastatura, nu doar cu mouse-ul.",
  ],
  [
    "De la cerere de ofertă la discuție online",
    "cerere-discutie-online",
    "Automatizări",
    "Un flux clar pentru alegerea orei și confirmarea întâlnirii.",
    "Fă disponibilitatea explicită",
    "Afișează fusul orar și durata discuției lângă intervalele disponibile. Vizitatorul trebuie să știe exact ce rezervă înainte de a confirma.",
    "Gândește și schimbările",
    "O programare are nevoie și de anulare sau reprogramare. Explică aceste opțiuni în confirmare și tratează situația în care un interval nu mai este disponibil.",
  ],
  [
    "Ce să verifici înainte de lansarea unui site",
    "verificari-lansare",
    "Development",
    "O revizie practică a conținutului și a interacțiunilor principale.",
    "Parcurge traseul unui client",
    "Deschide paginile importante, citește oferta și trimite o cerere de test într-un mediu controlat. Verifică destinația butoanelor și mesajele de confirmare.",
    "Revizuiește detaliile",
    "Caută texte provizorii, imagini lipsă și adrese greșite. Verifică titlurile paginilor, lizibilitatea și comportamentul la lățimi diferite.",
  ],
  [
    "Cum organizezi un portofoliu în creștere",
    "portofoliu-in-crestere",
    "Portofoliu",
    "Selecție, ordine și încărcare treptată pentru mai multe proiecte.",
    "Începe cu selecția",
    "Primele proiecte ar trebui să reprezinte tipul de colaborare pe care vrei să îl atragi. O selecție relevantă este mai utilă decât afișarea tuturor lucrărilor deodată.",
    "Încarcă treptat",
    "Un buton de afișare a următoarelor proiecte poate păstra pagina aerisită. Păstrează poziția cititorului și arată clar când nu mai există alte rezultate.",
  ],
  [
    "Un sistem de butoane consecvent",
    "sistem-butoane",
    "Web design",
    "Aceleași reguli pentru acțiuni principale, secundare și întoarcere.",
    "Definește rolurile",
    "Folosește un stil principal pentru acțiunea importantă și unul mai discret pentru alternative. Textele trebuie să descrie rezultatul apăsării, nu doar să spună Click aici.",
    "Păstrează feedbackul coerent",
    "Hover, focus și starea dezactivată au nevoie de reguli comune. O săgeată de întoarcere trebuie să comunice direcția fără să modifice poziția textului.",
  ],
  [
    "Ce înseamnă o predare bună a website-ului",
    "predare-website",
    "Colaborare",
    "Acces, instrucțiuni și responsabilități după lansare.",
    "Clarifică accesul",
    "Stabilește cine administrează domeniul, găzduirea și conținutul. Accesul ar trebui acordat prin conturi proprii, cu roluri potrivite pentru fiecare persoană.",
    "Documentează operațiile frecvente",
    "Arată cum se publică un articol, cum se schimbă o imagine și unde ajung cererile de contact. Include și un punct de contact pentru problemele tehnice.",
  ],
  [
    "Cum alegi prima automatizare pentru afacerea ta",
    "prima-automatizare",
    "Automatizări",
    "Începe cu un proces repetitiv, simplu și ușor de verificat.",
    "Observă munca repetitivă",
    "Identifică o sarcină care se repetă și are reguli clare, precum centralizarea cererilor. Notează intrările, rezultatul așteptat și excepțiile înainte de implementare.",
    "Păstrează controlul",
    "Începe cu un volum mic și verifică rezultatele. Definește ce se întâmplă la eroare și cum poate interveni o persoană atunci când procesul nu poate continua automat.",
  ],
];

function block(key, text, style = "normal", listItem) {
  return {
    _type: "block",
    _key: key,
    style,
    markDefs: [],
    ...(listItem ? { listItem, level: 1 } : {}),
    children: [{ _type: "span", _key: `${key}-text`, text, marks: [] }],
  };
}

export function buildPosts(now = Date.now()) {
  return topics.map(
    (
      [
        title,
        slug,
        category,
        excerpt,
        heading1,
        paragraph1,
        heading2,
        paragraph2,
      ],
      index,
    ) => ({
      _id: `webuilder-demo-article-${String(index + 1).padStart(2, "0")}`,
      _type: "article",
      title,
      slug: { _type: "slug", current: `demo-${slug}` },
      category,
      excerpt,
      publishedAt: new Date(now - (index + 1) * 86400000).toISOString(),
      seoTitle: title,
      seoDescription: excerpt,
      body: [
        block(
          "demo-note",
          "Articol demonstrativ pentru testarea blogului Webuilder. Revizuiește și adaptează conținutul înainte de utilizarea editorială.",
        ),
        block("intro", excerpt),
        block("first-heading", heading1, "h2"),
        block("first-paragraph", paragraph1),
        block("second-heading", heading2, "h2"),
        block("second-paragraph", paragraph2),
        block("check-heading", "Un exercițiu pentru proiectul tău", "h2"),
        block(
          "check-one",
          `Analizează pagina sau procesul actual pornind de la tema: ${title.toLocaleLowerCase("ro-RO")}.`,
          "normal",
          "bullet",
        ),
        block(
          "check-two",
          "Notează un lucru care este clar și unul care provoacă întrebări. Alege o singură îmbunătățire pentru următoarea iterație.",
          "normal",
          "bullet",
        ),
        block(
          "closing",
          "Verifică schimbarea cu o persoană care nu cunoaște deja proiectul. Observațiile ei pot arăta unde explicațiile sau pașii trebuie simplificați.",
        ),
      ],
    }),
  );
}

export async function seedPosts(client, log = console.log) {
  const posts = buildPosts();
  const existing = await client.fetch(
    '*[_id in $ids || (_type == "article" && slug.current in $slugs)]{_id, "slug": slug.current}',
    {
      ids: posts.flatMap((p) => [p._id, `drafts.${p._id}`]),
      slugs: posts.map((p) => p.slug.current),
    },
  );
  const pending = posts.filter(
    (p) =>
      !existing.some(
        (doc) =>
          doc._id === p._id ||
          doc._id === `drafts.${p._id}` ||
          doc.slug === p.slug.current,
      ),
  );
  if (!pending.length) {
    log("Toate cele 15 articole demo există deja. Nu am modificat nimic.");
    return { created: 0, skipped: posts.length };
  }
  const transaction = client.transaction();
  for (const post of pending) {
    const asset = await client.assets.upload(
      "image",
      createCover(posts.indexOf(post)),
      {
        filename: `${post._id}.png`,
        contentType: "image/png",
      },
    );
    transaction.createIfNotExists({
      ...post,
      cover: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: `Ilustrație de interfață pentru articolul: ${post.title}`,
        caption: "Ilustrație demonstrativă Webuilder.",
      },
    });
    log(`Pregătit: ${post.title}`);
  }
  await transaction.commit();
  log(
    `Finalizat: ${pending.length} articole procesate, ${posts.length - pending.length} omise. Deschide /blog după actualizarea cache-ului.`,
  );
  return { created: pending.length, skipped: posts.length - pending.length };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--dry-run"))
    throw new Error("Folosește npm run seed:posts sau adaugă -- --dry-run.");
  if (args.includes("--dry-run")) {
    console.table(
      buildPosts().map(({ _id, title, slug }) => ({
        id: _id,
        title,
        slug: slug.current,
      })),
    );
    console.log("15 articole demo. Nicio cerere către Sanity.");
    return;
  }
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (!projectId || !token)
    throw new Error(
      "Adaugă NEXT_PUBLIC_SANITY_PROJECT_ID și SANITY_API_WRITE_TOKEN (Editor) în .env.local.",
    );
  console.log(
    `Sanity: ${projectId} / ${dataset}. Creează 15 articole demo PUBLICATE; articolele existente sunt păstrate.`,
  );
  await seedPosts(
    createClient({
      projectId,
      dataset,
      token,
      apiVersion: "2026-09-18",
      useCdn: false,
      perspective: "raw",
    }),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(
      error.statusCode
        ? `Sanity a refuzat cererea (HTTP ${error.statusCode}). Verifică permisiunile tokenului.`
        : error.response || error.request
          ? "Seed eșuat. Verifică conexiunea și configurarea Sanity."
          : error.message,
    );
    process.exitCode = 1;
  });
}
