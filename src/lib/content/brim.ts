import { z } from "zod";
import type { ContentRef } from "@/lib/manifest/schema";

export const supportedLanguageSchema = z.enum(["en", "es", "ja", "ar"]);
export type SupportedLanguage = z.infer<typeof supportedLanguageSchema>;

export const textDirectionSchema = z.enum(["ltr", "rtl"]);
export type TextDirection = z.infer<typeof textDirectionSchema>;

export const toneModeSchema = z.enum(["minimal", "balanced", "warm-storytelling"]);
export type ToneMode = z.infer<typeof toneModeSchema>;

const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  en: "en",
  eng: "en",
  english: "en",
  es: "es",
  espanol: "es",
  "español": "es",
  spanish: "es",
  ja: "ja",
  jp: "ja",
  japanese: "ja",
  "日本語": "ja",
  ar: "ar",
  arabic: "ar",
  "العربية": "ar",
};

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Spanish",
  ja: "Japanese",
  ar: "Arabic",
};

export function normalizeLanguage(language?: string | null): SupportedLanguage {
  if (!language) return "en";
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? "en";
}

export function getTextDirection(language: SupportedLanguage): TextDirection {
  return language === "ar" ? "rtl" : "ltr";
}

export function normalizeToneMode(tone?: string | null): ToneMode {
  if (!tone) return "balanced";
  const normalized = tone.trim().toLowerCase();

  if (
    normalized.includes("minimal") ||
    normalized.includes("compact") ||
    normalized.includes("formal") ||
    normalized.includes("direct")
  ) {
    return "minimal";
  }

  if (
    normalized.includes("warm") ||
    normalized.includes("story") ||
    normalized.includes("playful") ||
    normalized.includes("expressive")
  ) {
    return "warm-storytelling";
  }

  return "balanced";
}

export const BRIM_STATIC_CONTENT_REFS: ContentRef[] = [
  {
    kind: "static",
    ref: "brim:brand",
    resolved: {
      title: "BRIM brand promise",
      body:
        "BRIM is a personalized headwear shop that helps shoppers choose hats by fit, weather, use case, packability, and style. The concierge should narrow choices quickly while keeping the experience tailored.",
      citations: ["static:brim:brand"],
    },
  },
  {
    kind: "static",
    ref: "brim:assortment",
    resolved: {
      title: "BRIM assortment cues",
      body:
        "Demo-ready product directions include packable straw travelers, structured canvas caps, wide-brim sun hats, wool watch caps, and refined felt hats. Copy should describe why each hat fits the shopper's plans.",
      citations: ["static:brim:assortment"],
    },
  },
  {
    kind: "static",
    ref: "brim:concierge",
    resolved: {
      title: "BRIM concierge behavior",
      body:
        "The store should feel like a concierge already understood the shopper: match tone, language, density, and occasion; avoid generic catalog copy; make the next action obvious.",
      citations: ["static:brim:concierge"],
    },
  },
  {
    kind: "static",
    ref: "brim:voice",
    resolved: {
      title: "BRIM tone range",
      body:
        "Minimal BRIM copy is spare, practical, and spec-led. Warm storytelling copy adds occasion, texture, and a sense of being outfitted for a real moment.",
      citations: ["static:brim:voice"],
    },
  },
];

const FALLBACK_LOCALIZED_COPY: Record<
  SupportedLanguage,
  {
    title: string;
    body: string;
    ctaLabel: string;
    bullets: string[];
  }
> = {
  en: {
    title: "Hats selected around your plans",
    body:
      "BRIM narrows the rack by fit, weather, and the way you want to show up, then brings forward the pieces that make sense first.",
    ctaLabel: "Find my fit",
    bullets: ["Packable options", "Weather-aware materials", "Fit-first recommendations"],
  },
  es: {
    title: "Sombreros elegidos para tus planes",
    body:
      "BRIM filtra por ajuste, clima y la forma en que quieres presentarte, y muestra primero las piezas que tienen más sentido.",
    ctaLabel: "Encontrar mi ajuste",
    bullets: ["Opciones empacables", "Materiales según el clima", "Recomendaciones por ajuste"],
  },
  ja: {
    title: "予定に合わせて選ぶ帽子",
    body:
      "BRIMはフィット感、天気、見せたい雰囲気に合わせて候補を絞り、いま選ぶべき帽子から提案します。",
    ctaLabel: "自分に合う帽子を探す",
    bullets: ["持ち運びやすい選択肢", "天候に合う素材", "フィット重視の提案"],
  },
  ar: {
    title: "قبعات مختارة بحسب خططك",
    body:
      "تختصر BRIM الاختيارات بحسب المقاس والطقس والطابع الذي تريده، ثم تعرض القطع الأنسب أولا.",
    ctaLabel: "اعثر على المقاس المناسب",
    bullets: ["خيارات سهلة الحمل", "خامات مناسبة للطقس", "توصيات تبدأ بالمقاس"],
  },
};

export function getFallbackLocalizedCopy(language: SupportedLanguage) {
  return FALLBACK_LOCALIZED_COPY[language];
}

export function getStaticBrimContentRefs(query?: string, topK = 4): ContentRef[] {
  const terms = tokenize(query);

  if (terms.length === 0) {
    return BRIM_STATIC_CONTENT_REFS.slice(0, topK);
  }

  return BRIM_STATIC_CONTENT_REFS.map((ref) => ({
    ref,
    score: scoreContentRef(ref, terms),
  }))
    .sort((a, b) => b.score - a.score)
    .map(({ ref }) => ref)
    .slice(0, topK);
}

function tokenize(value?: string): string[] {
  if (!value) return [];
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);
}

function scoreContentRef(ref: ContentRef, terms: string[]): number {
  const haystack = [ref.ref, ref.resolved?.title, ref.resolved?.body]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}
