import { z } from "zod";

/**
 * The engine→site contract. The UI agent emits a PageManifest; the live page
 * renders it through a whitelisted component registry. No generated code runs
 * on the render path — every section is validated by zod before it renders.
 */

export const COMPONENT_KINDS = [
  "hero",
  "filterBar",
  "productList",
  "faqAccordion",
  "ctaBanner",
  "statCallout",
  "testimonial",
] as const;

export const componentKindSchema = z.enum(COMPONENT_KINDS);
export type ComponentKind = z.infer<typeof componentKindSchema>;

export const BRIM_ACCENTS = ["heritage", "coastal", "field", "mono", "sun"] as const;

export const BRIM_ACCENT_COLORS = {
  heritage: "#7B2D3A",
  coastal: "#1E3A5F",
  field: "#3E5236",
  mono: "#111111",
  sun: "#C8841C",
} as const satisfies Record<(typeof BRIM_ACCENTS)[number], string>;

export const THEME_PRESETS = BRIM_ACCENTS;

export const themeSchema = z.object({
  preset: z.enum(THEME_PRESETS).default("heritage"),
  accent: z.enum(BRIM_ACCENTS).optional(),
  accentColor: z.string().optional(),
  density: z.enum(["compact", "comfortable"]).default("comfortable"),
  direction: z.enum(["ltr", "rtl"]).default("ltr"),
});
export type Theme = z.infer<typeof themeSchema>;

export const contentRefSchema = z.object({
  kind: z.enum(["rag", "generated", "static"]),
  ref: z.string(),
  resolved: z
    .object({
      title: z.string().optional(),
      body: z.string().optional(),
      citations: z.array(z.string()).optional(),
    })
    .optional(),
});
export type ContentRef = z.infer<typeof contentRefSchema>;

export const sectionSchema = z.object({
  id: z.string(),
  component: componentKindSchema,
  /** Validated at render time by the per-component schema in the registry. */
  props: z.record(z.string(), z.unknown()).default({}),
  contentRefs: z.array(contentRefSchema).optional(),
  order: z.number().int(),
});
export type Section = z.infer<typeof sectionSchema>;

export const MANIFEST_STATUS = ["configuring", "partial", "ready"] as const;

export const pageManifestSchema = z.object({
  version: z.number().int().default(1),
  sessionId: z.string(),
  status: z.enum(MANIFEST_STATUS).default("configuring"),
  theme: themeSchema,
  sections: z.array(sectionSchema).default([]),
});
export type PageManifest = z.infer<typeof pageManifestSchema>;
