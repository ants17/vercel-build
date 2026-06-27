import { NextResponse } from "next/server";
import { generatePersona } from "@/lib/persona/generate";

export async function POST(req: Request) {
  let brief = "";
  try {
    const body = (await req.json()) as { brief?: string };
    brief = (body.brief ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!brief) {
    return NextResponse.json({ ok: false, error: "A brief is required." }, { status: 400 });
  }

  try {
    const persona = await generatePersona(brief);
    return NextResponse.json({ ok: true, persona });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Generation failed." },
      { status: 400 },
    );
  }
}
