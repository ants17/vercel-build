"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { personaPresets } from "@/lib/persona/presets";
import type { Persona } from "@/lib/persona/schema";

export default function PersonaStudioPage() {
  const [personas, setPersonas] = useState<Persona[]>(personaPresets);
  const [selectedId, setSelectedId] = useState<string>(personaPresets[0].id);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = personas.find((p) => p.id === selectedId) ?? personas[0];

  async function generate() {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/persona/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Generation failed.");
      const persona: Persona = { ...data.persona, id: crypto.randomUUID() };
      setPersonas((prev) => [persona, ...prev]);
      setSelectedId(persona.id);
      setBrief("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          <Sparkles data-icon="inline-start" />
          Persona Studio
        </Badge>
        <h1 className="font-heading text-3xl font-semibold">Develop the human</h1>
        <p className="max-w-2xl text-muted-foreground">
          Author the persona your agent will represent. It seeds what the agent knows and brings
          to the site when it arrives ahead of you.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: pick or generate */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate from a brief</CardTitle>
              <CardDescription>
                Describe a person in a sentence or two and let the model flesh them out.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="brief">Brief</FieldLabel>
                  <Textarea
                    id="brief"
                    placeholder="A time-pressed CTO comparing observability tools for a 50-person fintech…"
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={3}
                  />
                  <FieldDescription>
                    Requires AI Gateway. Without a key, use a preset below.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button onClick={generate} disabled={loading || !brief.trim()} className="w-fit">
                {loading ? "Generating…" : "Generate persona"}
                {!loading ? <Sparkles data-icon="inline-end" /> : null}
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground">Personas</span>
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className="text-left"
              >
                <Card
                  className={
                    p.id === selectedId
                      ? "ring-2 ring-primary transition-all"
                      : "transition-all hover:ring-foreground/20"
                  }
                >
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.identity.role}</CardDescription>
                  </CardHeader>
                </Card>
              </button>
            ))}
          </div>
        </div>

        {/* Right: selected detail */}
        <PersonaDetail persona={selected} />
      </div>
    </main>
  );
}

function PersonaDetail({ persona }: { persona: Persona }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{persona.name}</CardTitle>
        <CardDescription>
          {persona.identity.role} — {persona.identity.context}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <DetailBlock label="Intent this visit">
          <p className="text-sm">{persona.intent}</p>
        </DetailBlock>

        <DetailBlock label="Preferences">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">tone: {persona.preferences.tone}</Badge>
            <Badge variant="outline">density: {persona.preferences.density}</Badge>
            {persona.preferences.interests.map((i) => (
              <Badge key={i} variant="secondary">
                {i}
              </Badge>
            ))}
          </div>
          {persona.preferences.constraints?.length ? (
            <p className="text-sm text-muted-foreground">
              Constraints: {persona.preferences.constraints.join(", ")}
            </p>
          ) : null}
        </DetailBlock>

        <DetailBlock label="Known facts (the agent may volunteer)">
          <ul className="flex flex-col gap-1 text-sm">
            {persona.knownFacts.map((f, i) => (
              <li key={i} className="text-muted-foreground">
                — {f}
              </li>
            ))}
          </ul>
        </DetailBlock>

        {persona.hiddenPrefs?.length ? (
          <DetailBlock label="Hidden preferences (only revealed if probed)">
            <ul className="flex flex-col gap-1 text-sm">
              {persona.hiddenPrefs.map((f, i) => (
                <li key={i} className="text-muted-foreground">
                  — {f}
                </li>
              ))}
            </ul>
          </DetailBlock>
        ) : null}

        <Separator />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Launching the simulation arrives in M4 (MCP negotiation).
          </p>
          <Button variant="outline" disabled>
            Launch simulation
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
