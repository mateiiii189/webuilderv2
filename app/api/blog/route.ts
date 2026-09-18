import { decodeArticleCursor, getArticleBatch } from "@/lib/blog";
export async function GET(request: Request) {
  const after = new URL(request.url).searchParams.get("after") ?? undefined;
  if (after !== undefined && !decodeArticleCursor(after))
    return Response.json({ error: "Cursor invalid." }, { status: 400 });
  try {
    return Response.json(await getArticleBatch(after));
  } catch {
    return Response.json(
      { error: "Articolele nu sunt disponibile momentan." },
      { status: 503 },
    );
  }
}
