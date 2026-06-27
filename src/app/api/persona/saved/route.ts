import { listSavedPersonas } from "@/lib/persona/generate";

export async function GET() {
  try {
    const personas = await listSavedPersonas();
    return Response.json({ ok: true, personas });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load saved personas.",
      },
      { status: 500 },
    );
  }
}
