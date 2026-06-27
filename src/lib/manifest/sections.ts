import { z } from "zod";
import type { ComponentKind } from "./schema";

/**
 * Per-component prop schemas — React-free, zod only.
 * Shared between the registry (render-time validation) and the UI agent
 * (structured-output schema so the model fills real content).
 */

// --- hero ------------------------------------------------------------------
export const heroProps = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  ctaLabel: z.string().optional(),
});

// --- featureGrid -----------------------------------------------------------
export const featureGridProps = z.object({
  title: z.string().optional(),
  features: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .min(1),
});

// --- pricingTable ----------------------------------------------------------
export const pricingTableProps = z.object({
  title: z.string().optional(),
  plans: z
    .array(
      z.object({
        name: z.string(),
        price: z.string(),
        period: z.string().optional(),
        features: z.array(z.string()),
        highlighted: z.boolean().optional(),
      }),
    )
    .min(1),
});

// --- testimonialList -------------------------------------------------------
export const testimonialListProps = z.object({
  title: z.string().optional(),
  testimonials: z
    .array(
      z.object({
        quote: z.string(),
        author: z.string(),
        role: z.string().optional(),
        avatarUrl: z.string().optional(),
      }),
    )
    .min(1),
});

// --- faqAccordion ----------------------------------------------------------
export const faqAccordionProps = z.object({
  title: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
});

// --- ctaBanner -------------------------------------------------------------
export const ctaBannerProps = z.object({
  headline: z.string(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
});

// --- richText --------------------------------------------------------------
export const richTextProps = z.object({
  title: z.string().optional(),
  body: z.string(),
});

// --- statCallout -----------------------------------------------------------
export const statCalloutProps = z.object({
  title: z.string().optional(),
  stats: z
    .array(z.object({ label: z.string(), value: z.string(), sub: z.string().optional() }))
    .min(1),
});

/**
 * Lookup table: ComponentKind → its prop schema.
 * Used at render time by the registry.
 */
export const sectionPropsSchemas: Record<ComponentKind, z.ZodType> = {
  hero: heroProps,
  featureGrid: featureGridProps,
  pricingTable: pricingTableProps,
  testimonialList: testimonialListProps,
  faqAccordion: faqAccordionProps,
  ctaBanner: ctaBannerProps,
  richText: richTextProps,
  statCallout: statCalloutProps,
};

/**
 * Discriminated union of every possible section shape.
 * Used as the structured-output schema for the UI agent so the model is forced
 * to fill real, validated props for whichever component it picks.
 *
 * Variants are listed explicitly (not built via .map) so TypeScript can narrow
 * the discriminated-union type correctly.
 */
export const sectionSchema = z.discriminatedUnion("component", [
  z.object({ component: z.literal("hero"), props: heroProps }),
  z.object({ component: z.literal("featureGrid"), props: featureGridProps }),
  z.object({ component: z.literal("pricingTable"), props: pricingTableProps }),
  z.object({ component: z.literal("testimonialList"), props: testimonialListProps }),
  z.object({ component: z.literal("faqAccordion"), props: faqAccordionProps }),
  z.object({ component: z.literal("ctaBanner"), props: ctaBannerProps }),
  z.object({ component: z.literal("richText"), props: richTextProps }),
  z.object({ component: z.literal("statCallout"), props: statCalloutProps }),
]);

export type SectionPlan = z.infer<typeof sectionSchema>;
