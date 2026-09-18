import { decodeProjectCursor, getProjectBatch } from "@/lib/projects";

export async function GET(request: Request) {
  const after = new URL(request.url).searchParams.get("after") ?? undefined;
  if (after !== undefined && !decodeProjectCursor(after)) {
    return Response.json({ error: "Cursor invalid." }, { status: 400 });
  }
  try {
    return Response.json(await getProjectBatch(after));
  } catch {
    return Response.json(
      { error: "Proiectele nu sunt disponibile momentan." },
      { status: 503 },
    );
  }
}
