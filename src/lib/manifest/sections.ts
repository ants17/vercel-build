import { z } from "zod";
import type { ComponentKind } from "./schema";

/**
 * Per-component prop schemas — React-free, zod only.
 * Shared between the registry (render-time validation) and agent/tool structured
 * output. The shape stays framework-neutral so Eve tools can emit the same
 * manifest payload without adding custom orchestration to the storefront.
 */

const actionSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
});

const productSwatchSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
});

const productSkeletonProps = z.object({
  state: z.literal("skeleton"),
  id: z.string().optional(),
  imageTone: z.string().optional(),
});

const productPartialProps = z.object({
  state: z.literal("partial"),
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  price: z.string().optional(),
  badge: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.array(productSwatchSchema).optional(),
});

const productReadyProps = z.object({
  state: z.literal("ready"),
  id: z.string().optional(),
  name: z.string(),
  price: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  badge: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.array(productSwatchSchema).optional(),
  ctaLabel: z.string().optional(),
});

export const productCardProps = z.discriminatedUnion("state", [
  productSkeletonProps,
  productPartialProps,
  productReadyProps,
]);

// --- hero ------------------------------------------------------------------
export const heroProps = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  primaryCta: actionSchema.optional(),
  secondaryCta: actionSchema.optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
});

// --- filterBar -------------------------------------------------------------
export const filterBarProps = z.object({
  categories: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        count: z.number().int().nonnegative().optional(),
      }),
    )
    .min(1),
  active: z.string().optional(),
  resultLabel: z.string().optional(),
  sortLabel: z.string().optional(),
});

// --- productList -----------------------------------------------------------
export const productListProps = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
  layout: z.enum(["grid", "list"]).default("grid"),
  density: z.enum(["compact", "comfortable"]).optional(),
  products: z.array(productCardProps).min(1),
});

// --- statCallout -----------------------------------------------------------
export const statCalloutProps = z.object({
  title: z.string().optional(),
  tone: z.enum(["dark", "light"]).default("dark"),
  stats: z
    .array(z.object({ label: z.string(), value: z.string(), sub: z.string().optional() }))
    .min(1)
    .max(4),
});

// --- testimonial -----------------------------------------------------------
export const testimonialProps = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  place: z.string().optional(),
});

// --- faqAccordion ----------------------------------------------------------
export const faqAccordionProps = z.object({
  title: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
  openIndex: z.number().int().nonnegative().default(0),
});

// --- ctaBanner -------------------------------------------------------------
export const ctaBannerProps = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  body: z.string().optional(),
  cta: actionSchema.optional(),
});

/**
 * Lookup table: ComponentKind -> its prop schema.
 * Used at render time by the registry.
 */
export const sectionPropsSchemas: Record<ComponentKind, z.ZodType> = {
  hero: heroProps,
  filterBar: filterBarProps,
  productList: productListProps,
  statCallout: statCalloutProps,
  testimonial: testimonialProps,
  faqAccordion: faqAccordionProps,
  ctaBanner: ctaBannerProps,
};

/**
 * Discriminated union of every possible section shape.
 * Used as the structured-output schema so an agent/tool must fill real props
 * for whichever component it picks.
 */
export const sectionSchema = z.discriminatedUnion("component", [
  z.object({ component: z.literal("hero"), props: heroProps }),
  z.object({ component: z.literal("filterBar"), props: filterBarProps }),
  z.object({ component: z.literal("productList"), props: productListProps }),
  z.object({ component: z.literal("statCallout"), props: statCalloutProps }),
  z.object({ component: z.literal("testimonial"), props: testimonialProps }),
  z.object({ component: z.literal("faqAccordion"), props: faqAccordionProps }),
  z.object({ component: z.literal("ctaBanner"), props: ctaBannerProps }),
]);

export type ProductCard = z.infer<typeof productCardProps>;
export type SectionPlan = z.infer<typeof sectionSchema>;
