import { decodeArticleCursor, getArticleBatch } from "@/lib/blog";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const after = params.get("after") ?? undefined;
  const query = params.get("q")?.trim() || "";
  if (query.length > 100)
    return Response.json(
      { error: "Căutarea este prea lungă." },
      { status: 400 },
    );
  if (after !== undefined && !decodeArticleCursor(after))
    return Response.json({ error: "Cursor invalid." }, { status: 400 });
  try {
    return Response.json(await getArticleBatch(after, query));
  } catch {
    return Response.json(
      { error: "Articolele nu sunt disponibile momentan." },
      { status: 503 },
    );
  }
}
