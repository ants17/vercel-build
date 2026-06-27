import { runPrototypeFlow, type PrototypeEvent } from "@/lib/demo/runtime";

export const runtime = "nodejs";
export const maxDuration = 120;

type RunRequest = {
  personaId?: string;
};

export async function POST(req: Request) {
  let body: RunRequest = {};

  try {
    body = (await req.json()) as RunRequest;
  } catch {
    body = {};
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runPrototypeFlow(body.personaId)) {
          controller.enqueue(encoder.encode(toServerSentEvent(event)));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            toServerSentEvent({
              type: "run.failed",
              at: new Date().toISOString(),
              owner: "Demo Orchestrator",
              title: "Run failed",
              body: error instanceof Error ? error.message : "Prototype flow failed.",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}

function toServerSentEvent(event: PrototypeEvent) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}
