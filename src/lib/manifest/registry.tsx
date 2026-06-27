import * as React from "react";
import { z } from "zod";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComponentKind } from "./schema";
import {
  heroProps,
  featureGridProps,
  pricingTableProps,
  testimonialListProps,
  faqAccordionProps,
  ctaBannerProps,
  richTextProps,
  statCalloutProps,
} from "./sections";

/**
 * The whitelist. Each ComponentKind maps to a zod props schema (validated at
 * render time) and the shadcn-composed component that renders it. The renderer
 * never trusts agent output blindly — a section only renders if its props pass
 * the schema, otherwise the renderer shows a skeleton.
 */

type RegistryEntry = {
  propsSchema: z.ZodType;
  // Component is invoked with already-validated props.
  Component: React.ComponentType<Record<string, unknown>>;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

// --- hero ------------------------------------------------------------------
function Hero(p: z.infer<typeof heroProps>) {
  return (
    <section className="flex flex-col items-start gap-4 py-8">
      {p.eyebrow ? (
        <Badge variant="secondary" style={{ color: "var(--accent)" }}>
          {p.eyebrow}
        </Badge>
      ) : null}
      <h1 className="font-heading text-4xl leading-tight font-semibold text-balance md:text-5xl">
        {p.headline}
      </h1>
      {p.subheadline ? (
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          {p.subheadline}
        </p>
      ) : null}
      {p.ctaLabel ? (
        <Button className="mt-2" style={{ backgroundColor: "var(--accent)" }}>
          {p.ctaLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      ) : null}
    </section>
  );
}

// --- featureGrid -----------------------------------------------------------
function FeatureGrid(p: z.infer<typeof featureGridProps>) {
  return (
    <section className="flex flex-col gap-6">
      {p.title ? (
        <h2 className="font-heading text-2xl font-semibold">{p.title}</h2>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {p.features.map((f, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

// --- pricingTable ----------------------------------------------------------
function PricingTable(p: z.infer<typeof pricingTableProps>) {
  return (
    <section className="flex flex-col gap-6">
      {p.title ? (
        <h2 className="font-heading text-2xl font-semibold">{p.title}</h2>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {p.plans.map((plan, i) => (
          <Card
            key={i}
            className={cn(plan.highlighted && "ring-2")}
            style={plan.highlighted ? { ["--tw-ring-color" as string]: "var(--accent)" } : undefined}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.highlighted ? <Badge>Popular</Badge> : null}
              </CardTitle>
              <CardDescription className="text-foreground">
                <span className="text-2xl font-semibold">{plan.price}</span>
                {plan.period ? (
                  <span className="text-muted-foreground"> /{plan.period}</span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-muted-foreground" />
                    {feat}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// --- testimonialList -------------------------------------------------------
function TestimonialList(p: z.infer<typeof testimonialListProps>) {
  return (
    <section className="flex flex-col gap-6">
      {p.title ? (
        <h2 className="font-heading text-2xl font-semibold">{p.title}</h2>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {p.testimonials.map((t, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-4">
              <p className="text-base text-pretty">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  {t.avatarUrl ? <AvatarImage src={t.avatarUrl} /> : null}
                  <AvatarFallback>{initials(t.author)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.author}</span>
                  {t.role ? (
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// --- faqAccordion ----------------------------------------------------------
function FaqAccordion(p: z.infer<typeof faqAccordionProps>) {
  return (
    <section className="flex flex-col gap-6">
      {p.title ? (
        <h2 className="font-heading text-2xl font-semibold">{p.title}</h2>
      ) : null}
      <Accordion>
        {p.items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

// --- ctaBanner -------------------------------------------------------------
function CtaBanner(p: z.infer<typeof ctaBannerProps>) {
  return (
    <section
      className="flex flex-col items-start gap-4 rounded-xl p-8 text-primary-foreground"
      style={{ backgroundColor: "var(--accent)" }}
    >
      <h2 className="font-heading text-2xl font-semibold">{p.headline}</h2>
      {p.body ? <p className="max-w-2xl opacity-90">{p.body}</p> : null}
      {p.ctaLabel ? (
        <Button variant="secondary">
          {p.ctaLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      ) : null}
    </section>
  );
}

// --- richText --------------------------------------------------------------
function RichText(p: z.infer<typeof richTextProps>) {
  return (
    <section className="flex flex-col gap-4">
      {p.title ? (
        <h2 className="font-heading text-2xl font-semibold">{p.title}</h2>
      ) : null}
      <div className="flex flex-col gap-4 text-base text-muted-foreground">
        {p.body.split("\n\n").map((para, i) => (
          <p key={i} className="text-pretty">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}

// --- statCallout -----------------------------------------------------------
function StatCallout(p: z.infer<typeof statCalloutProps>) {
  return (
    <section className="flex flex-col gap-6">
      {p.title ? (
        <h2 className="font-heading text-2xl font-semibold">{p.title}</h2>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {p.stats.map((s, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{s.label}</TableCell>
              <TableCell>
                <span className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
                  {s.value}
                </span>
                {s.sub ? (
                  <span className="ml-2 text-xs text-muted-foreground">{s.sub}</span>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

export const registry: Record<ComponentKind, RegistryEntry> = {
  hero: { propsSchema: heroProps, Component: Hero as RegistryEntry["Component"] },
  featureGrid: { propsSchema: featureGridProps, Component: FeatureGrid as RegistryEntry["Component"] },
  pricingTable: { propsSchema: pricingTableProps, Component: PricingTable as RegistryEntry["Component"] },
  testimonialList: { propsSchema: testimonialListProps, Component: TestimonialList as RegistryEntry["Component"] },
  faqAccordion: { propsSchema: faqAccordionProps, Component: FaqAccordion as RegistryEntry["Component"] },
  ctaBanner: { propsSchema: ctaBannerProps, Component: CtaBanner as RegistryEntry["Component"] },
  richText: { propsSchema: richTextProps, Component: RichText as RegistryEntry["Component"] },
  statCallout: { propsSchema: statCalloutProps, Component: StatCallout as RegistryEntry["Component"] },
};
