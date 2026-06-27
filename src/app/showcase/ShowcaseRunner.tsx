"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCircle2, Globe2, Play, RotateCcw, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ManifestRenderer } from "@/lib/manifest/renderer";
import type { PageManifest } from "@/lib/manifest/schema";
import type { PrototypeEvent } from "@/lib/demo/runtime";
import { cn } from "@/lib/utils";

export type ShowcaseScenarioCard = {
  id: string;
  name: string;
  role: string;
  language: string;
  locale: string;
  signals: string[];
};

type ShowcaseRunnerProps = {
  initialPersonaId: string;
  scenarios: ShowcaseScenarioCard[];
};

export function ShowcaseRunner({ initialPersonaId, scenarios }: ShowcaseRunnerProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(initialPersonaId);
  const [events, setEvents] = useState<PrototypeEvent[]>([]);
  const [manifest, setManifest] = useState<PageManifest | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0],
    [activeId, scenarios],
  );
  const accentColor = manifest?.theme.accentColor ?? "#7B2D3A";
  const hasRun = events.length > 0 || Boolean(manifest);

  function selectPersona(personaId: string) {
    if (running) return;
    setActiveId(personaId);
    setEvents([]);
    setManifest(null);
    setError(null);
    router.push(`/showcase?persona=${personaId}`);
  }

  async function runHandshake() {
    setRunning(true);
    setEvents([]);
    setManifest(null);
    setError(null);

    try {
      const response = await fetch("/api/showcase/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: active.id }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Run failed with HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const event = parseServerSentEvent(frame);
          if (!event) continue;

          setEvents((prev) => [...prev, event]);
          if (event.type === "manifest.ready" && event.manifest) {
            setManifest(event.manifest);
          }
          if (event.type === "run.failed") {
            setError(event.body);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prototype flow failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--b-paper)] text-[var(--b-ink)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
        <header className="grid gap-6 border-b border-[var(--b-line)] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex max-w-3xl flex-col gap-4">
            <Badge variant="secondary" className="w-fit">
              <Bot data-icon="inline-start" />
              Agent Concierge demo
            </Badge>
            <div className="flex flex-col gap-3">
              <h1 className="font-heading text-4xl leading-tight font-black text-balance md:text-5xl">
                Become the shopper, then watch the agents build BRIM
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--b-muted)]">
                The store below starts empty. Click the run button to send the persona handoff,
                stream the agent-to-agent exchange, and mount the generated storefront manifest.
              </p>
            </div>
          </div>
          <Link
            href="/persona"
            className="inline-flex h-11 w-fit items-center gap-2 rounded-[var(--b-radius)] border border-[var(--b-line)] bg-white px-4 text-sm font-semibold hover:border-[var(--b-muted)]"
          >
            <UserRound className="size-4" />
            Persona Studio
          </Link>
        </header>

        <section id="personas" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {scenarios.map((scenario) => {
            const selected = scenario.id === active.id;

            return (
              <button
                key={scenario.id}
                type="button"
                disabled={running}
                onClick={() => selectPersona(scenario.id)}
                className={cn(
                  "flex min-h-40 flex-col justify-between rounded-[var(--b-radius)] border bg-white p-4 text-left transition-colors hover:border-[var(--b-muted)] disabled:cursor-not-allowed disabled:opacity-70",
                  selected ? "border-[var(--brim-accent)] shadow-sm" : "border-[var(--b-line)]",
                )}
                style={selected ? { ["--brim-accent" as string]: accentColor } : undefined}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold tracking-wide text-[var(--b-muted)] uppercase">
                      {scenario.language} / {scenario.locale}
                    </span>
                    {selected ? <CheckCircle2 className="size-4" style={{ color: accentColor }} /> : null}
                  </div>
                  <h2 className="font-heading text-xl leading-tight font-black">
                    {scenario.name.split(" - ")[0]}
                  </h2>
                  <p className="text-sm leading-5 text-[var(--b-muted)]">{scenario.role}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {scenario.signals.slice(0, 3).map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full border border-[var(--b-line)] bg-[var(--b-paper)] px-2 py-1"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </section>

        <section
          id="handoff"
          className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
          style={{ ["--brim-accent" as string]: accentColor }}
        >
          <div className="rounded-[var(--b-radius)] border border-[var(--b-line)] bg-white p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-wide text-[var(--b-muted)] uppercase">
                  Active human-side agent
                </span>
                <h2 className="mt-1 font-heading text-2xl font-black">{active.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--b-muted)]">{active.role}</p>
              </div>
              <Globe2 className="size-5 shrink-0" style={{ color: accentColor }} />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {active.signals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-[var(--b-line)] bg-[var(--b-paper)] px-2 py-1"
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runHandshake}
                disabled={running}
                className="inline-flex h-11 items-center gap-2 rounded-[var(--b-radius)] border border-[var(--brim-accent)] bg-[var(--brim-accent)] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
              >
                <Play className="size-4" />
                {running ? "Running handoff..." : `Become ${active.name.split(" ")[0]}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvents([]);
                  setManifest(null);
                  setError(null);
                }}
                disabled={running || !hasRun}
                className="inline-flex h-11 items-center gap-2 rounded-[var(--b-radius)] border border-[var(--b-line)] bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="size-4" />
                Reset run
              </button>
            </div>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="rounded-[var(--b-radius)] border border-[var(--b-line)] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="size-5" style={{ color: accentColor }} />
              <h2 className="font-heading text-2xl font-black">Live handshake transcript</h2>
            </div>

            {events.length ? (
              <ol className="flex max-h-[540px] flex-col gap-3 overflow-auto pr-1">
                {events.map((event, index) => (
                  <li
                    key={`${event.type}-${event.at}-${index}`}
                    className="rounded-[var(--b-radius)] border border-[var(--b-line)] bg-[var(--b-paper)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--b-muted)] uppercase">
                        {String(index + 1).padStart(2, "0")} / {event.owner}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--b-muted)]">
                        {new Date(event.at).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="mt-2 font-heading text-xl font-black">{event.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--b-muted)]">{event.body}</p>
                    {event.payload ? (
                      <details className="mt-3 rounded-[var(--b-radius)] border border-[var(--b-line)] bg-white p-3">
                        <summary className="cursor-pointer text-xs font-semibold tracking-wide text-[var(--b-muted)] uppercase">
                          Payload
                        </summary>
                        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex min-h-64 flex-col justify-center rounded-[var(--b-radius)] border border-dashed border-[var(--b-line)] bg-[var(--b-paper)] p-6">
                <span className="text-xs font-semibold tracking-wide text-[var(--b-muted)] uppercase">
                  Waiting for agent traffic
                </span>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--b-muted)]">
                  The transcript will show the human concierge payload, the BRIM shop agent
                  response, subagent outputs, and the sandbox generation status.
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="storefront" className="rounded-[var(--b-radius-lg)] bg-white p-3 md:p-5">
          {manifest ? (
            <ManifestRenderer manifest={manifest} />
          ) : (
            <div className="grid min-h-[460px] place-items-center rounded-[var(--b-radius)] border border-dashed border-[var(--b-line)] bg-[var(--b-paper)] p-8 text-center">
              <div className="max-w-md">
                <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--b-muted)] uppercase">
                  Generated storefront
                </span>
                <h2 className="mt-3 font-heading text-3xl font-black">No site generated yet</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--b-muted)]">
                  Run the handoff to generate and mount a fresh BRIM PageManifest for this
                  persona.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function parseServerSentEvent(frame: string): PrototypeEvent | null {
  const data = frame
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data) return null;

  return JSON.parse(data) as PrototypeEvent;
}
