"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Languages,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { personaPresets } from "@/lib/persona/presets";
import {
  buildConciergeHandoff,
  type ConciergeHandoff,
  type Persona,
} from "@/lib/persona/schema";

type GeneratePersonaResponse =
  | {
      ok: true;
      persona: Persona;
      handoff: ConciergeHandoff;
      personaRowId: string;
      persisted: true;
    }
  | { ok: false; error?: string };

type SavedPersonasResponse =
  | { ok: true; personas: Persona[] }
  | { ok: false; error?: string };

export default function PersonaStudioPage() {
  const [personas, setPersonas] = useState<Persona[]>(personaPresets);
  const [selectedId, setSelectedId] = useState<string>(personaPresets[0].id);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedRowId, setLastSavedRowId] = useState<string | null>(null);

  const selected = personas.find((p) => p.id === selectedId) ?? personas[0];

  useEffect(() => {
    let cancelled = false;

    async function loadSavedPersonas() {
      try {
        const res = await fetch("/api/persona/saved");
        const data = (await res.json()) as SavedPersonasResponse;
        if (!data.ok) throw new Error(data.error ?? "Saved personas failed to load.");
        if (!cancelled) {
          setPersonas((prev) => mergePersonas([...data.personas, ...prev]));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Saved personas failed to load.");
        }
      } finally {
        if (!cancelled) setSavedLoading(false);
      }
    }

    loadSavedPersonas();

    return () => {
      cancelled = true;
    };
  }, []);

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
      const data = (await res.json()) as GeneratePersonaResponse;
      if (!data.ok) throw new Error(data.error ?? "Generation failed.");

      setPersonas((prev) => mergePersonas([data.persona, ...prev]));
      setSelectedId(data.persona.id);
      setLastSavedRowId(data.personaRowId);
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
          BRIM Persona Studio
        </Badge>
        <h1 className="font-heading text-3xl font-semibold">Develop the shopper</h1>
        <p className="max-w-2xl text-muted-foreground">
          Author the person whose concierge agent arrives first: what they want, how they shop,
          what they can share freely, and what stays private unless BRIM asks naturally.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.25fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate from a brief</CardTitle>
              <CardDescription>
                Create a full hat-shopping persona and persist it for the handoff.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="brief">Brief</FieldLabel>
                  <Textarea
                    id="brief"
                    placeholder="A stylist in Dubai shopping for a wide-brim hat for an outdoor family celebration..."
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={3}
                  />
                  <FieldDescription>
                    Requires AI Gateway and Supabase service-role config.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {lastSavedRowId ? (
                <p className="text-xs text-muted-foreground">Saved persona row: {lastSavedRowId}</p>
              ) : null}
              <Button onClick={generate} disabled={loading || !brief.trim()} className="w-fit">
                {loading ? "Generating..." : "Generate persona"}
                {!loading ? <Sparkles data-icon="inline-end" /> : null}
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground">Personas</span>
            {savedLoading ? (
              <p className="text-sm text-muted-foreground">Loading saved personas...</p>
            ) : null}
            {personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedId(persona.id)}
                className="text-left"
              >
                <Card
                  className={
                    persona.id === selectedId
                      ? "ring-2 ring-primary transition-all"
                      : "transition-all hover:ring-foreground/20"
                  }
                >
                  <CardHeader>
                    <CardTitle>{persona.name}</CardTitle>
                    <CardDescription>
                      {persona.preferences.language.language} / {persona.preferences.language.locale} -
                      {persona.preferences.collectionInterests[0]?.collection}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <PersonaDetail persona={selected} />
      </div>
    </main>
  );
}

function mergePersonas(personas: Persona[]) {
  const seen = new Set<string>();

  return personas.filter((persona) => {
    if (seen.has(persona.id)) return false;
    seen.add(persona.id);
    return true;
  });
}

function PersonaDetail({ persona }: { persona: Persona }) {
  const handoff = buildConciergeHandoff(persona);
  const shopping = handoff.publicContext.shopping;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{persona.name}</CardTitle>
        <CardDescription>
          {persona.identity.role} - {persona.identity.context}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <DetailBlock label="Intent">
          <p className="text-sm">{persona.intent}</p>
        </DetailBlock>

        <DetailBlock label="Shopping profile">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SummaryTile
              icon={<ShoppingBag />}
              label="Collections"
              value={shopping.collectionInterests
                .map((interest) => `${interest.collection} (${interest.priority})`)
                .join(", ")}
            />
            <SummaryTile
              icon={<Ruler />}
              label="Size and fit"
              value={[
                shopping.sizeFit.hatSize,
                shopping.sizeFit.headMeasurement,
                shopping.sizeFit.fit,
              ]
                .filter(Boolean)
                .join(" / ")}
            />
            <SummaryTile
              icon={<Truck />}
              label="Shipping"
              value={handoff.negotiationContext.m5Inputs.shippingSummary}
            />
            <SummaryTile
              icon={<Languages />}
              label="Language"
              value={`${shopping.language.language} / ${shopping.language.locale}`}
            />
          </div>
        </DetailBlock>

        <DetailBlock label="Preferences">
          <PillList values={shopping.interests} />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">tone: {shopping.tone}</Badge>
            <Badge variant="outline">density: {shopping.density}</Badge>
            <Badge variant="outline">price: {shopping.priceSensitivity.targetRange}</Badge>
            <Badge variant="outline">level: {shopping.priceSensitivity.level}</Badge>
          </div>
          {shopping.constraints.length ? (
            <p className="text-sm text-muted-foreground">
              Constraints: {shopping.constraints.join(", ")}
            </p>
          ) : null}
        </DetailBlock>

        <DetailBlock label="Style">
          <PillList values={handoff.negotiationContext.m5Inputs.styleSignals} />
          <p className="text-sm text-muted-foreground">
            Occasions: {shopping.style.occasions.join(", ")}
          </p>
          {shopping.style.avoids?.length ? (
            <p className="text-sm text-muted-foreground">
              Avoids: {shopping.style.avoids.join(", ")}
            </p>
          ) : null}
        </DetailBlock>

        <DetailBlock label="Known facts">
          <TextList values={persona.knownFacts} />
        </DetailBlock>

        <DetailBlock label="Private preferences">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{handoff.privateContext.revealPolicy}</p>
              <TextList values={handoff.privateContext.hiddenPrefs} />
            </div>
          </div>
        </DetailBlock>

        <DetailBlock label="M4 / M5 handoff">
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm">
            <div>
              <span className="font-medium">M4 prefs:</span>{" "}
              <span className="text-muted-foreground">{handoff.negotiationContext.m4Prefs.notes}</span>
            </div>
            <div>
              <span className="font-medium">M5 inputs:</span>{" "}
              <span className="text-muted-foreground">
                {handoff.negotiationContext.m5Inputs.collections.join(", ")}
              </span>
            </div>
          </div>
        </DetailBlock>

        <Separator />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Launch the deterministic demo handoff for this persona.
          </p>
          <Button variant="outline" render={<Link href={`/showcase?persona=${persona.id}`} />}>
            Launch showcase
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

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-20 gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="mt-0.5 text-muted-foreground [&>svg]:size-4">{icon}</div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
        <span className="text-sm leading-snug">{value}</span>
      </div>
    </div>
  );
}

function PillList({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value} variant="secondary">
          {value}
        </Badge>
      ))}
    </div>
  );
}

function TextList({ values }: { values: string[] }) {
  if (!values.length) {
    return <p className="text-sm text-muted-foreground">None recorded.</p>;
  }

  return (
    <ul className="flex flex-col gap-1 text-sm">
      {values.map((value) => (
        <li key={value} className="text-muted-foreground">
          - {value}
        </li>
      ))}
    </ul>
  );
}
