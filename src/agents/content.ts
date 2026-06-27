import { generateObject } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/ai/models";
import { sectionPropsSchemas } from "@/lib/manifest/sections";
import type { ComponentKind, ContentRef } from "@/lib/manifest/schema";
import {
  getFallbackLocalizedCopy,
  getTextDirection,
  LANGUAGE_LABELS,
  normalizeLanguage,
  normalizeToneMode,
  supportedLanguageSchema,
  textDirectionSchema,
  type SupportedLanguage,
  type TextDirection,
  type ToneMode,
} from "@/lib/content/brim";
import type { Prefs } from "@/agents/front";

export interface SectionCopyInput {
  kind: ComponentKind;
  prefs: Prefs;
  refs: ContentRef[];
  /** Shopper language. Defaults to English. Supported: en, es, ja, ar. */
  language?: SupportedLanguage | string;
  /** BRIM copy mode from minimal to warm storytelling. */
  toneMode?: ToneMode | string;
  /** Whether to include optional product-card copy in the response. */
  includeProducts?: boolean;
  /** Maximum product blurbs to generate when includeProducts is true. */
  productCount?: number;
}

export interface ProductCopy {
  name: string;
  headline: string;
  description: string;
  fitNotes: string[];
  ctaLabel?: string;
}

export interface LocalizedSectionCopy {
  component: ComponentKind;
  language: SupportedLanguage;
  dir: TextDirection;
  props: Record<string, unknown>;
  products: ProductCopy[];
  citations: string[];
}

export interface SectionCopy {
  title?: string;
  body: string;
  citations?: string[];
  language?: SupportedLanguage;
  dir?: TextDirection;
  products?: ProductCopy[];
}

const productCopySchema = z.object({
  name: z.string(),
  headline: z.string(),
  description: z.string(),
  fitNotes: z.array(z.string()).default([]),
  ctaLabel: z.string().optional(),
});

/**
 * Write localized, manifest-ready section props plus optional product copy.
 *
 * This is the helper Eve agents should wrap as a tool: it has no custom agent
 * runtime and returns structured data validated by the existing manifest prop
 * schemas for the requested component kind.
 */
export async function writeLocalizedSectionCopy(
  input: SectionCopyInput,
): Promise<LocalizedSectionCopy> {
  const language = normalizeLanguage(input.language);
  const dir = getTextDirection(language);
  const toneMode = normalizeToneMode(input.toneMode ?? input.prefs.tone);
  const maxProducts = input.includeProducts ? Math.max(0, input.productCount ?? 3) : 0;
  const propsSchema = sectionPropsSchemas[input.kind] as z.ZodType<Record<string, unknown>>;
  const outputSchema = z.object({
    language: supportedLanguageSchema,
    dir: textDirectionSchema,
    props: propsSchema,
    products: z.array(productCopySchema).max(maxProducts).default([]),
    citations: z.array(z.string()).default([]),
  });

  try {
    const { object } = await generateObject({
      model: MODELS.worker,
      schema: outputSchema,
      schemaName: "LocalizedBrimSectionCopy",
      schemaDescription:
        "Localized BRIM section props, optional product copy, and citations.",
      instructions: `You write BRIM storefront copy for personalized hat shopping.
Return structured data only through the provided schema.

Rules:
- All user-visible copy must be in ${LANGUAGE_LABELS[language]}.
- Keep the brand name BRIM unchanged.
- Set dir to "${dir}". Arabic must be RTL-aware and natural for right-to-left display.
- Match the shopper's requested tone, then adapt it to BRIM's range: ${toneMode}.
- Ground claims in the provided content references. Do not invent hard product specs.
- Write concise section props that satisfy the requested component schema.`,
      prompt: `Component kind: ${input.kind}
Language: ${LANGUAGE_LABELS[language]} (${language})
Text direction: ${dir}
Tone mode: ${toneMode}
Visitor intent: ${input.prefs.intent}
Interests: ${input.prefs.interests.join(", ")}
Preferred density: ${input.prefs.density}
Shopper tone signal: ${input.prefs.tone}
Notes: ${input.prefs.notes ?? "(none)"}
Optional product blurbs requested: ${maxProducts}

Content references:
${formatGroundingBlock(input.refs)}

Write localized BRIM copy for this section.`,
    });

    return {
      component: input.kind,
      language: object.language,
      dir: object.dir,
      props: object.props,
      products: object.products,
      citations: object.citations,
    };
  } catch {
    return fallbackLocalizedSectionCopy(input, language, dir, toneMode);
  }
}

/**
 * Compatibility helper for existing callers that expect a title/body shape.
 * New Eve tools should prefer `writeLocalizedSectionCopy`.
 */
export async function writeSectionCopy(input: SectionCopyInput): Promise<SectionCopy> {
  const localized = await writeLocalizedSectionCopy(input);
  return sectionCopyFromLocalized(localized);
}

function formatGroundingBlock(refs: ContentRef[]): string {
  if (refs.length === 0) {
    return "(no retrieved content; use BRIM fallback positioning only)";
  }

  return refs
    .map((ref, index) => {
      const resolved = ref.resolved;
      if (!resolved) return `[${index + 1}] ref: ${ref.ref}`;
      return [
        `[${index + 1}] ${resolved.title ?? ref.ref}`,
        resolved.body ? `  ${resolved.body}` : "",
        resolved.citations?.length ? `  citations: ${resolved.citations.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function fallbackLocalizedSectionCopy(
  input: SectionCopyInput,
  language: SupportedLanguage,
  dir: TextDirection,
  toneMode: ToneMode,
): LocalizedSectionCopy {
  const copy = getFallbackLocalizedCopy(language);
  const props = fallbackProps(input.kind, copy, language, toneMode);

  return {
    component: input.kind,
    language,
    dir,
    props,
    products: input.includeProducts
      ? fallbackProducts(language, toneMode).slice(0, Math.max(0, input.productCount ?? 3))
      : [],
    citations: ["static:brim:fallback"],
  };
}

function fallbackProps(
  kind: ComponentKind,
  copy: ReturnType<typeof getFallbackLocalizedCopy>,
  language: SupportedLanguage,
  toneMode: ToneMode,
): Record<string, unknown> {
  switch (kind) {
    case "hero":
      return {
        eyebrow: "BRIM",
        headline: copy.title,
        subheadline: copy.body,
        primaryCta: { label: copy.ctaLabel },
      };
    case "filterBar":
      return {
        categories: copy.bullets.map((bullet) => ({
          label: bullet,
          value: slugify(bullet),
        })),
        active: slugify(copy.bullets[0] ?? "brim"),
        resultLabel: copy.title,
      };
    case "productList":
      return {
        title: copy.title,
        summary: copy.body,
        layout: "grid",
        products: fallbackProducts(language, toneMode).map((product) => ({
          state: "ready",
          name: product.name,
          price: "$86",
          description: product.description,
          badge: product.headline,
          ctaLabel: product.ctaLabel,
        })),
      };
    case "testimonial":
      return {
        quote: copy.body,
        author: "BRIM",
      };
    case "faqAccordion":
      return {
        title: copy.title,
        items: [
          {
            question: copy.title,
            answer: copy.body,
          },
        ],
        openIndex: 0,
      };
    case "ctaBanner":
      return {
        headline: copy.title,
        body: copy.body,
        cta: { label: copy.ctaLabel },
      };
    case "statCallout":
      return {
        title: copy.title,
        tone: "dark",
        stats: copy.bullets.map((bullet, index) => ({
          label: bullet,
          value: index === 0 ? "1:1" : "BRIM",
        })),
      };
  }

  return {
    headline: copy.title,
    body: copy.body,
    cta: { label: copy.ctaLabel },
  };
}

function fallbackProducts(language: SupportedLanguage, toneMode: ToneMode): ProductCopy[] {
  const products: Record<SupportedLanguage, ProductCopy[]> = {
    en: [
      {
        name: "Packable Traveler",
        headline: toneMode === "minimal" ? "Light, foldable, ready." : "A brim that goes where the day goes.",
        description: "A travel-minded hat for sun, transit, and quick changes in plan.",
        fitNotes: ["Packable", "Sun-ready", "Easy to style"],
        ctaLabel: "View traveler",
      },
    ],
    es: [
      {
        name: "Traveler plegable",
        headline: toneMode === "minimal" ? "Ligero, plegable, listo." : "Un ala que sigue el ritmo del día.",
        description: "Un sombrero pensado para sol, trayectos y cambios rápidos de plan.",
        fitNotes: ["Plegable", "Listo para el sol", "Fácil de combinar"],
        ctaLabel: "Ver traveler",
      },
    ],
    ja: [
      {
        name: "パッカブル トラベラー",
        headline: toneMode === "minimal" ? "軽く、畳めて、すぐ使える。" : "一日の流れについてくるブリム。",
        description: "日差し、移動、予定変更に合わせやすい旅向けの帽子です。",
        fitNotes: ["畳める", "日差しに対応", "合わせやすい"],
        ctaLabel: "見る",
      },
    ],
    ar: [
      {
        name: "ترافلر قابل للطي",
        headline: toneMode === "minimal" ? "خفيف، قابل للطي، وجاهز." : "حافة ترافق يومك أينما اتجه.",
        description: "قبعة مناسبة للسفر والشمس وتغييرات الخطة السريعة.",
        fitNotes: ["قابلة للطي", "مناسبة للشمس", "سهلة التنسيق"],
        ctaLabel: "عرض القبعة",
      },
    ],
  };

  return products[language];
}

function sectionCopyFromLocalized(localized: LocalizedSectionCopy): SectionCopy {
  const title =
    firstString(localized.props, ["title", "headline", "eyebrow"]) ??
    localized.products[0]?.headline;
  const body =
    firstString(localized.props, ["body", "subheadline"]) ??
    featureSummary(localized.props) ??
    localized.products[0]?.description ??
    title ??
    "";

  return {
    title,
    body,
    citations: localized.citations,
    language: localized.language,
    dir: localized.dir,
    products: localized.products,
  };
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function featureSummary(record: Record<string, unknown>): string | undefined {
  const summary = record.summary;
  if (typeof summary === "string" && summary.trim()) return summary;

  const quote = record.quote;
  if (typeof quote === "string" && quote.trim()) return quote;

  const features = record.features;
  if (Array.isArray(features)) {
    return features
      .map((feature) => {
        if (!feature || typeof feature !== "object") return null;
        const item = feature as Record<string, unknown>;
        return firstString(item, ["body", "title"]);
      })
      .filter((value): value is string => Boolean(value))
      .join(" ");
  }

  const stats = record.stats;
  if (Array.isArray(stats)) {
    return stats
      .map((stat) => {
        if (!stat || typeof stat !== "object") return null;
        const item = stat as Record<string, unknown>;
        return firstString(item, ["label", "value"]);
      })
      .filter((value): value is string => Boolean(value))
      .join(" ");
  }

  return undefined;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "brim";
}
