import {
  buildVisitorInventory,
  computeVisitorOffer,
  getProductBySlug,
  type BrimCollection,
  type BrimPreferenceInput,
  type BrimSelectedProduct,
  type BrimVisitorOffer,
} from "@/lib/inventory";
import type { PageManifest } from "@/lib/manifest/schema";
import { pageManifestSchema } from "@/lib/manifest/schema";
import type { ProductCard } from "@/lib/manifest/sections";
import { personaPresets } from "@/lib/persona/presets";
import {
  buildConciergeHandoff,
  type ConciergeHandoff,
  type Persona,
} from "@/lib/persona/schema";

export type DemoAgentStep = {
  owner: string;
  title: string;
  detail: string;
};

export type DemoScenario = {
  persona: Persona;
  handoff: ConciergeHandoff;
  manifest: PageManifest;
  steps: DemoAgentStep[];
  storefrontSignals: string[];
};

type PricingContext = {
  currency: CurrencyCode;
  locale: string;
};

type CurrencyCode = "USD" | "JPY" | "AED" | "EUR" | "GBP" | "CAD" | "AUD" | "MXN";
type StorefrontLanguage = Persona["preferences"]["language"]["language"];
type StorefrontCopy = {
  language: StorefrontLanguage;
  primaryCta: string;
  secondaryCta: string;
  matched: string;
  compact: string;
  comfort: string;
  sortByFit: string;
  assortmentEyebrow: string;
  statTitle: string;
  statLanguage: string;
  statFit: string;
  statCurrency: string;
  statDelivery: string;
  testimonialRole: string;
  faqTitle: string;
  faqShareQuestion: string;
  faqShareAnswer: string;
  faqResponseQuestion: string;
  faqResponseAnswer: string;
  faqPrivateQuestion: string;
  ctaEyebrow: string;
  ctaHeadline: string;
  ctaBody: string;
  ctaLabel: string;
  addToBag: string;
  addFreeShip: string;
  materialLabel: string;
  fitLabel: string;
  deliveryLabel: string;
};

const collectionByPersona: Record<string, BrimCollection | undefined> = {
  "preset-maya": "men",
  "preset-lucia": "women",
  "preset-ren": "men",
  "preset-samira": "women",
};

const primaryProductByPersona: Record<string, string> = {
  "preset-maya": "carter-fedora",
  "preset-lucia": "lido-panama",
  "preset-ren": "brooklyn-cap",
  "preset-samira": "mesa-widebrim",
};

const heroByPersona: Record<string, { headline: string; subheadline: string }> = {
  "preset-maya": {
    headline: "Travel-ready hats, narrowed before boarding.",
    subheadline:
      "BRIM prioritizes polished, packable pieces with reliable delivery before Maya's flight.",
  },
  "preset-lucia": {
    headline: "A giftable summer edit with size confidence.",
    subheadline:
      "The store shifts toward exchangeable warm-weather hats, gift packaging, and clear fit guidance.",
  },
  "preset-ren": {
    headline: "Low-profile caps with exact measurements first.",
    subheadline:
      "Ren sees compact comparison, quiet styling, and international delivery details before checkout.",
  },
  "preset-samira": {
    headline: "Event hats tuned for coverage, color, and shape.",
    subheadline:
      "BRIM leads with structured wide brims, protective shipping, and styling context for an outdoor celebration.",
  },
};

export function getDemoScenario(personaId?: string): DemoScenario {
  const persona = personaPresets.find((item) => item.id === personaId) ?? personaPresets[0];
  return buildDemoScenario(persona);
}

export function getDemoScenarios(): DemoScenario[] {
  return personaPresets.map(buildDemoScenario);
}

export function buildDemoScenario(persona: Persona): DemoScenario {
  const handoff = buildConciergeHandoff(persona);
  const preferences = getInventoryPreferences(persona, handoff);
  const generatedInventory = buildVisitorInventory(preferences, {
    collection: collectionByPersona[persona.id],
    limit: 4,
  });
  const inventory = {
    ...generatedInventory,
    products: prioritizePrimaryProduct(
      generatedInventory.products,
      primaryProductByPersona[persona.id],
      preferences,
      4,
    ),
  };
  const shopping = handoff.publicContext.shopping;
  const direction = shopping.language.language === "AR" ? "rtl" : "ltr";
  const hero = heroByPersona[persona.id] ?? {
    headline: "A BRIM store configured for this shopper.",
    subheadline: persona.intent,
  };
  const primaryCollection = shopping.collectionInterests[0]?.collection ?? "BRIM picks";
  const pricing = getPricingContext(shopping.shipping.country, shopping.language.locale);
  const localizedTargetRange = localizeTargetRange(
    shopping.priceSensitivity.targetRange,
    pricing,
  );
  const localizedFit = localizeFit(shopping.sizeFit.fit, shopping.language.language);
  const localizedShippingSummary = localizeShippingSummary(
    shopping.shipping,
    shopping.language.language,
  );
  const localizedColorway = localizeThemeColorway(
    inventory.theme.colorway,
    shopping.language.language,
  );
  const copy = getStorefrontCopy(shopping.language.language, {
    persona,
    primaryCollection,
    themeColorway: localizedColorway,
    density: localizeDensity(shopping.density, shopping.language.language),
    locale: shopping.language.locale,
    fit: localizedFit,
    shippingSummary: localizedShippingSummary,
  });
  const heroCopy = getHeroCopy(persona, shopping.language.language, hero);
  const productCards = inventory.products.map((selection) =>
    toProductCard(selection, selection.offer, pricing, copy),
  );
  const heroCard = productCards.find((card) => card.state !== "skeleton");
  const visibleSignals = [
    shopping.language.locale,
    shopping.density,
    localizedTargetRange,
    pricing.currency,
    primaryCollection,
    inventory.theme.colorway,
  ];

  const manifest = pageManifestSchema.parse({
    version: 1,
    sessionId: `showcase-${persona.id}`,
    status: "ready",
    theme: {
      preset: inventory.theme.preset,
      accent: inventory.theme.preset,
      accentColor: inventory.theme.accentColor,
      density: shopping.density,
      direction,
    },
    sections: [
      {
        id: "hero",
        component: "hero",
        order: 0,
        props: {
          eyebrow: `${shopping.language.language} / ${shopping.language.locale} - ${localizedColorway}`,
          headline: heroCopy.headline,
          subheadline: heroCopy.subheadline,
          primaryCta: { label: copy.primaryCta, href: "#collection" },
          secondaryCta: { label: copy.secondaryCta, href: "#handoff" },
          imageUrl: heroCard?.imageUrl,
          imageAlt: heroCard?.imageAlt,
        },
      },
      {
        id: "filters",
        component: "filterBar",
        order: 1,
        props: {
          active: "matched",
          resultLabel: getResultLabel(shopping.language.language, productCards.length, inventory.canonicalCount),
          sortLabel: copy.sortByFit,
          categories: [
            { label: copy.matched, value: "matched", count: productCards.length },
            { label: shopping.density === "compact" ? copy.compact : copy.comfort, value: "density" },
            { label: pricing.currency, value: "price" },
            { label: direction === "rtl" ? "RTL" : shopping.language.language, value: "locale" },
          ],
        },
      },
      {
        id: "collection",
          component: "productList",
          order: 2,
          props: {
            eyebrow: copy.assortmentEyebrow,
            title: primaryCollection,
          summary: `${localizedTargetRange} / ${shopping.sizeFit.hatSize ?? "fit ready"}`,
          layout: shopping.density === "compact" ? "list" : "grid",
          density: shopping.density,
          products: productCards,
        },
      },
      {
        id: "stats",
        component: "statCallout",
        order: 3,
        props: {
          title: copy.statTitle,
          tone: direction === "rtl" ? "light" : "dark",
          stats: [
            { label: copy.statLanguage, value: shopping.language.language, sub: shopping.language.locale },
            { label: copy.statFit, value: shopping.sizeFit.hatSize ?? "Known", sub: localizeFit(shopping.sizeFit.fit, shopping.language.language) },
            { label: copy.statCurrency, value: pricing.currency, sub: localizedTargetRange },
            {
              label: copy.statDelivery,
              value: localizeEta(inventory.products[0]?.offer.shipping.eta ?? "Ready", shopping.language.language),
              sub: localizedShippingSummary,
            },
          ],
        },
      },
      {
        id: "testimonial",
        component: "testimonial",
        order: 4,
        props: {
          quote:
            localizePrivateSignal(persona, shopping.language.language, 0) ??
            persona.hiddenPrefs?.[0] ??
            persona.knownFacts[0] ??
            persona.intent,
          author: persona.name.split(" - ")[0],
          role: copy.testimonialRole,
          place: [
            shopping.shipping.city,
            shopping.shipping.region,
            shopping.shipping.country,
          ]
            .filter(Boolean)
            .join(", "),
        },
      },
      {
        id: "faq",
        component: "faqAccordion",
        order: 5,
        props: {
          title: copy.faqTitle,
          openIndex: 0,
          items: [
            {
              question: copy.faqShareQuestion,
              answer: copy.faqShareAnswer,
            },
            {
              question: copy.faqResponseQuestion,
              answer: copy.faqResponseAnswer,
            },
            {
              question: copy.faqPrivateQuestion,
              answer:
                localizePrivateSignal(persona, shopping.language.language, 1) ??
                handoff.privateContext.hiddenPrefs[1] ??
                handoff.privateContext.revealPolicy,
            },
          ],
        },
      },
      {
        id: "cta",
        component: "ctaBanner",
        order: 6,
        props: {
          eyebrow: copy.ctaEyebrow,
          headline: copy.ctaHeadline,
          body: copy.ctaBody,
          cta: { label: copy.ctaLabel, href: "#personas" },
        },
      },
    ],
  });

  return {
    persona,
    handoff,
    manifest,
    steps: buildAgentSteps(persona, handoff, manifest),
    storefrontSignals: visibleSignals,
  };
}

function getInventoryPreferences(
  persona: Persona,
  handoff: ConciergeHandoff,
): BrimPreferenceInput {
  const shopping = handoff.publicContext.shopping;
  const country = shopping.shipping.country.toLowerCase();
  const domesticCountry = country === "united states" || country === "us" || country === "usa";
  const shippingSignals = [
    shopping.shipping.timeframe,
    shopping.shipping.destinationType,
    shopping.shipping.notes,
    domesticCountry ? undefined : "international",
  ].filter((item): item is string => Boolean(item));

  return {
    intent: handoff.publicContext.intent,
    interests: [
      ...shopping.interests,
      ...shopping.collectionInterests.map((interest) => interest.collection),
      ...shopping.collectionInterests.map((interest) => interest.reason),
      ...shopping.style.aesthetics,
      ...shopping.style.colors,
      ...shopping.style.materials,
      ...shopping.style.occasions,
      ...shippingSignals,
      shopping.priceSensitivity.level,
      shopping.priceSensitivity.targetRange,
      ...(shopping.priceSensitivity.dealSignals ?? []),
    ],
    constraints: shopping.constraints,
    hiddenPrefs: persona.hiddenPrefs ?? [],
    knownFacts: persona.knownFacts,
    tone: shopping.tone,
    density: shopping.density,
    accessibility: shopping.accessibility,
  };
}

function toProductCard(
  selection: BrimSelectedProduct,
  offer: BrimVisitorOffer,
  pricing: PricingContext,
  copy: StorefrontCopy,
): ProductCard {
  const { product } = selection;
  const description = [
    `${copy.materialLabel}: ${localizeMaterial(product.materials[0], copy.language)}`,
    `${copy.fitLabel}: ${localizeSizes(product.fit.sizes, copy.language)}`,
    `${copy.deliveryLabel}: ${localizeEta(offer.shipping.eta, copy.language)}`,
  ]
    .filter(Boolean)
    .join(" / ");

  return {
    state: "ready",
    id: product.slug,
    name: product.name,
    price: formatLocalizedPrice(offer.pricing.finalCents, pricing),
    description,
    imageUrl: product.imagePath,
    imageAlt: product.name,
    badge: localizeBadge(product.badges[0], copy.language),
    sizes: localizeSizes(product.fit.sizes, copy.language),
    colors: product.colors.colorways.slice(0, 4).map((colorway) => ({
      name: colorway.name,
      value: colorway.hex,
    })),
    ctaLabel: offer.shipping.display === "Free" ? copy.addFreeShip : copy.addToBag,
  };
}

function getHeroCopy(
  persona: Persona,
  language: StorefrontLanguage,
  fallback: { headline: string; subheadline: string },
) {
  if (persona.id === "preset-ren") {
    return {
      headline: "寸法から選ぶ、低めのキャップ。",
      subheadline:
        "Ren の55cmのフィット、控えめな見た目、国際配送の条件に合わせて、BRIM が候補を絞り込みました。",
    };
  }

  if (persona.id === "preset-lucia") {
    return {
      headline: "Un regalo de verano con ajuste claro.",
      subheadline:
        "BRIM prioriza sombreros cálidos, cambios sencillos, empaque de regalo y confianza en la talla.",
    };
  }

  if (persona.id === "preset-samira") {
    return {
      headline: "قبعات للمناسبة، مضبوطة للون والتغطية والشكل.",
      subheadline:
        "BRIM يقدّم قبعات عريضة ومنظمة مع إرشاد للتنسيق وتغليف يحمي الحافة أثناء الشحن.",
    };
  }

  if (language === "JA") {
    return {
      headline: "この買い物のために組み立てた BRIM ストア。",
      subheadline: persona.intent,
    };
  }

  if (language === "ES") {
    return {
      headline: "Una tienda BRIM configurada para esta persona.",
      subheadline: persona.intent,
    };
  }

  if (language === "AR") {
    return {
      headline: "متجر BRIM تم تكوينه لهذه الشخصية.",
      subheadline: persona.intent,
    };
  }

  return fallback;
}

function getStorefrontCopy(
  language: StorefrontLanguage,
  context: {
    persona: Persona;
    primaryCollection: string;
    themeColorway: string;
    density: string;
    locale: string;
    fit: string;
    shippingSummary: string;
  },
): StorefrontCopy {
  const { persona, primaryCollection, themeColorway, density, locale, fit, shippingSummary } =
    context;

  switch (language) {
    case "JA":
      return {
        language,
        primaryCta: "おすすめを見る",
        secondaryCta: "ハンドオフを見る",
        matched: "一致",
        compact: "コンパクト",
        comfort: "ゆったり",
        sortByFit: "エージェント適合順",
        assortmentEyebrow: "エージェントが選んだ商品",
        statTitle: "このストアが変わった理由",
        statLanguage: "言語",
        statFit: "フィット",
        statCurrency: "通貨",
        statDelivery: "配送",
        testimonialRole: "買い物エージェントからの非公開シグナル",
        faqTitle: "エージェントが解決した質問",
        faqShareQuestion: "人間側のコンシェルジュは何を共有しましたか?",
        faqShareAnswer: `${persona.name} の目的、サイズ、価格帯、ロケール、配送条件、スタイルシグナルを共有しました。非公開の好みは、BRIM が自然に質問した場合だけ使われます。`,
        faqResponseQuestion: "BRIM はどう反応しましたか?",
        faqResponseAnswer: `ショップエージェントは ${primaryCollection} を選び、${themeColorway} を適用し、レイアウトを ${density} にしました。`,
        faqPrivateQuestion: "まだ非公開の情報は?",
        ctaEyebrow: "ハンドオフ完了",
        ctaHeadline: "ペルソナを受け取り、ストアを構成しました。",
        ctaBody: `このセッションは ${locale}、${fit}、${shippingSummary} に合わせて準備されています。`,
        ctaLabel: "ペルソナを切り替える",
        addToBag: "バッグに追加",
        addFreeShip: "送料無料で追加",
        materialLabel: "素材",
        fitLabel: "サイズ",
        deliveryLabel: "配送",
      };
    case "ES":
      return {
        language,
        primaryCta: "Ver recomendaciones",
        secondaryCta: "Ver traspaso",
        matched: "Seleccionados",
        compact: "Compacto",
        comfort: "Cómodo",
        sortByFit: "Ordenar por ajuste",
        assortmentEyebrow: "Selección del agente",
        statTitle: "Por qué cambió esta tienda",
        statLanguage: "idioma",
        statFit: "ajuste",
        statCurrency: "moneda",
        statDelivery: "entrega",
        testimonialRole: "señal privada del agente de compra",
        faqTitle: "Preguntas resueltas por el agente",
        faqShareQuestion: "¿Qué compartió el concierge humano?",
        faqShareAnswer: `${persona.name} compartió intención, ajuste, precio, idioma, entrega y señales de estilo. Las preferencias privadas se usan solo si BRIM pregunta de forma natural.`,
        faqResponseQuestion: "¿Cómo respondió BRIM?",
        faqResponseAnswer: `El agente de tienda eligió ${primaryCollection}, aplicó ${themeColorway} y ajustó la densidad a ${density}.`,
        faqPrivateQuestion: "¿Qué queda privado?",
        ctaEyebrow: "Traspaso listo",
        ctaHeadline: "Persona aceptada. Tienda configurada.",
        ctaBody: `La sesión está lista para ${locale}, ${fit} y ${shippingSummary}.`,
        ctaLabel: "Cambiar persona",
        addToBag: "Agregar a la bolsa",
        addFreeShip: "Agregar con envío gratis",
        materialLabel: "Material",
        fitLabel: "Talla",
        deliveryLabel: "Entrega",
      };
    case "AR":
      return {
        language,
        primaryCta: "عرض الترشيحات",
        secondaryCta: "عرض التسليم",
        matched: "مطابق",
        compact: "مختصر",
        comfort: "مريح",
        sortByFit: "ترتيب حسب الملاءمة",
        assortmentEyebrow: "اختيار الوكيل",
        statTitle: "لماذا تغيّر هذا المتجر",
        statLanguage: "اللغة",
        statFit: "المقاس",
        statCurrency: "العملة",
        statDelivery: "التوصيل",
        testimonialRole: "إشارة خاصة من وكيل الشراء",
        faqTitle: "أسئلة حلها الوكيل",
        faqShareQuestion: "ماذا شارك وكيل العميل؟",
        faqShareAnswer: `${persona.name} شارك الهدف والمقاس والسعر واللغة والتوصيل وإشارات الأسلوب. التفضيلات الخاصة تبقى محمية إلا إذا طرح BRIM سؤالا طبيعيا.`,
        faqResponseQuestion: "كيف استجاب BRIM؟",
        faqResponseAnswer: `اختار وكيل المتجر ${primaryCollection} وطبّق ${themeColorway} وضبط الكثافة على ${density}.`,
        faqPrivateQuestion: "ما الذي يبقى خاصا؟",
        ctaEyebrow: "التسليم جاهز",
        ctaHeadline: "تم قبول الشخصية. تم تكوين المتجر.",
        ctaBody: `الجلسة جاهزة لـ ${locale} و ${fit} و ${shippingSummary}.`,
        ctaLabel: "تبديل الشخصية",
        addToBag: "إضافة إلى الحقيبة",
        addFreeShip: "إضافة مع شحن مجاني",
        materialLabel: "الخامة",
        fitLabel: "المقاس",
        deliveryLabel: "التوصيل",
      };
    case "EN":
    default:
      return {
        language,
        primaryCta: "Review matched hats",
        secondaryCta: "See handoff",
        matched: "Matched",
        compact: "Compact",
        comfort: "Comfort",
        sortByFit: "Sort by agent fit",
        assortmentEyebrow: "Agent-curated assortment",
        statTitle: "Why this storefront changed",
        statLanguage: "language",
        statFit: "fit signal",
        statCurrency: "currency",
        statDelivery: "delivery",
        testimonialRole: "private shopper-agent signal",
        faqTitle: "Agent-resolved questions",
        faqShareQuestion: "What did the human concierge share?",
        faqShareAnswer: `${persona.name} arrived with intent, fit, price, locale, delivery, and style signals. Private preferences stay gated until the store asks naturally.`,
        faqResponseQuestion: "How did BRIM respond?",
        faqResponseAnswer: `The shop agent selected ${primaryCollection}, applied ${themeColorway}, and moved the layout to ${density} density.`,
        faqPrivateQuestion: "What remains private?",
        ctaEyebrow: "Demo-ready handoff",
        ctaHeadline: "Persona accepted. Store configured.",
        ctaBody: `The session is ready for ${locale}, ${fit}, and ${shippingSummary}.`,
        ctaLabel: "Switch persona",
        addToBag: "Add to bag",
        addFreeShip: "Add - free ship",
        materialLabel: "Material",
        fitLabel: "Size",
        deliveryLabel: "Delivery",
      };
  }
}

function localizeThemeColorway(value: string, language: StorefrontLanguage): string {
  if (language === "JA") {
    const map: Record<string, string> = {
      "city navy": "シティネイビー",
      "heritage neutrals": "ヘリテージニュートラル",
      "coastal straw": "コースタルストロー",
      "BRIM neutral": "BRIM ニュートラル",
      "playful brights": "明るいアクセント",
    };
    return map[value] ?? value;
  }

  if (language === "ES") {
    const map: Record<string, string> = {
      "city navy": "azul urbano",
      "heritage neutrals": "neutros clásicos",
      "coastal straw": "paja costera",
      "BRIM neutral": "neutro BRIM",
      "playful brights": "colores vivos",
    };
    return map[value] ?? value;
  }

  if (language === "AR") {
    const map: Record<string, string> = {
      "city navy": "كحلي حضري",
      "heritage neutrals": "ألوان تراثية هادئة",
      "coastal straw": "قش ساحلي",
      "BRIM neutral": "حيادي من BRIM",
      "playful brights": "ألوان مشرقة",
    };
    return map[value] ?? value;
  }

  return value;
}

function localizeDensity(value: string, language: StorefrontLanguage): string {
  if (language === "JA") return value === "compact" ? "コンパクト" : "ゆったり";
  if (language === "ES") return value === "compact" ? "compacta" : "cómoda";
  if (language === "AR") return value === "compact" ? "مختصر" : "مريح";
  return value;
}

function localizeFit(value: string, language: StorefrontLanguage): string {
  if (language === "JA" && value === "low-profile and close to the head") {
    return "低めで頭に沿うフィット";
  }

  if (language === "ES") {
    return value
      .replace("forgiving fit because this is a gift", "ajuste flexible porque es un regalo")
      .replace("secure but not tight", "seguro sin apretar");
  }

  if (language === "AR") {
    return value
      .replace("comfortable for several hours", "مريح لعدة ساعات")
      .replace("secure but not tight", "ثابت من دون ضغط");
  }

  return value;
}

function localizePrivateSignal(
  persona: Persona,
  language: StorefrontLanguage,
  index: number,
): string | undefined {
  const signals: Record<string, Partial<Record<StorefrontLanguage, string[]>>> = {
    "preset-ren": {
      JA: [
        "サイズ確認中に追加販売を強く勧められるのを嫌がります。",
        "横から見た商品写真がある場合だけ購入に進みます。",
      ],
    },
    "preset-lucia": {
      ES: [
        "La talla le preocupa, así que necesita una política de cambio clara.",
        "Pagará más si el empaque se siente especial al abrirlo.",
      ],
    },
    "preset-samira": {
      AR: [
        "تريد قبعة تبدو فاخرة من دون أن تطغى على العائلة.",
        "تقلق من وصول الحافة مثنية أثناء الشحن.",
      ],
    },
  };

  return signals[persona.id]?.[language]?.[index];
}

function localizeMaterial(value: string, language: StorefrontLanguage): string {
  const maps: Partial<Record<StorefrontLanguage, Record<string, string>>> = {
    JA: {
      "cotton twill": "コットンツイル",
      "brushed metal slider": "メタルアジャスター",
      "wool tweed": "ウールツイード",
      "cotton lining": "コットン裏地",
      "waxed cotton": "ワックスドコットン",
      "poly mesh": "ポリメッシュ",
      "foam front": "フォームフロント",
      "wool felt": "ウールフェルト",
      "toquilla straw": "トキヤ草",
      "merino wool": "メリノウール",
    },
    ES: {
      "toquilla straw": "paja toquilla",
      "cotton lining": "forro de algodón",
      "waxed cotton": "algodón encerado",
      "paper straw": "paja de papel",
      "wool felt": "fieltro de lana",
    },
    AR: {
      "wool felt": "لباد صوف",
      "leather band": "حزام جلدي",
      "toquilla straw": "قش توكيلا",
      "grosgrain ribbon": "شريط غروغران",
      "braided straw": "قش مضفر",
    },
  };

  return maps[language]?.[value] ?? value;
}

function localizeSizes(values: readonly string[], language: StorefrontLanguage): string {
  if (language === "JA") {
    return values
      .map((value) => (value === "Adjustable" ? "調整可" : value === "One size" ? "ワンサイズ" : value))
      .join(", ");
  }

  if (language === "ES") {
    return values
      .map((value) => (value === "Adjustable" ? "ajustable" : value === "One size" ? "talla única" : value))
      .join(", ");
  }

  if (language === "AR") {
    return values
      .map((value) => (value === "Adjustable" ? "قابل للتعديل" : value === "One size" ? "مقاس واحد" : value))
      .join(", ");
  }

  return values.join(", ");
}

function localizeEta(value: string, language: StorefrontLanguage): string {
  const maps: Partial<Record<StorefrontLanguage, Record<string, string>>> = {
    JA: {
      "2 business days": "2営業日",
      "3-5 business days": "3〜5営業日",
      "4-6 business days": "4〜6営業日",
      "7-12 business days": "7〜12営業日",
    },
    ES: {
      "2 business days": "2 días hábiles",
      "3-5 business days": "3 a 5 días hábiles",
      "4-6 business days": "4 a 6 días hábiles",
      "7-12 business days": "7 a 12 días hábiles",
    },
    AR: {
      "2 business days": "يومان عمل",
      "3-5 business days": "3 إلى 5 أيام عمل",
      "4-6 business days": "4 إلى 6 أيام عمل",
      "7-12 business days": "7 إلى 12 يوم عمل",
    },
  };

  return maps[language]?.[value] ?? value;
}

function localizeShippingSummary(
  shipping: Persona["preferences"]["shipping"],
  language: StorefrontLanguage,
): string {
  const place = [shipping.city, shipping.region, localizeCountry(shipping.country, language)]
    .filter(Boolean)
    .join(language === "JA" ? "、" : ", ");
  const timeframe = localizeTimeframe(shipping.timeframe, language);

  if (language === "AR") return `${place}، ${timeframe}`;
  return `${place}${language === "JA" ? "、" : ", "}${timeframe}`;
}

function localizeCountry(country: string, language: StorefrontLanguage): string {
  const normalized = country.toLowerCase().replace(/[^a-z]/g, "");
  if (language === "JA") {
    const map: Record<string, string> = {
      japan: "日本",
      unitedstates: "米国",
      us: "米国",
      usa: "米国",
      unitedarabemirates: "アラブ首長国連邦",
    };
    return map[normalized] ?? country;
  }
  if (language === "ES") {
    const map: Record<string, string> = {
      unitedstates: "Estados Unidos",
      us: "Estados Unidos",
      usa: "Estados Unidos",
    };
    return map[normalized] ?? country;
  }
  if (language === "AR") {
    const map: Record<string, string> = {
      unitedarabemirates: "الإمارات العربية المتحدة",
      japan: "اليابان",
      unitedstates: "الولايات المتحدة",
      us: "الولايات المتحدة",
      usa: "الولايات المتحدة",
    };
    return map[normalized] ?? country;
  }
  return country;
}

function localizeTimeframe(value: string, language: StorefrontLanguage): string {
  if (language === "JA") {
    return value
      .replace("standard international shipping is acceptable", "標準国際配送で可")
      .replace("arrives before Monday", "月曜日までに到着")
      .replace("within 5 days", "5日以内")
      .replace("delivery within 10 days", "10日以内に配送")
      .replace("2–3 business days", "2〜3営業日")
      .replace("2-3 business days", "2〜3営業日");
  }
  if (language === "ES") {
    return value
      .replace("within 5 days", "en 5 días")
      .replace("arrives before Monday", "llega antes del lunes");
  }
  if (language === "AR") {
    return value
      .replace("delivery within 10 days", "التوصيل خلال 10 أيام")
      .replace("standard international shipping is acceptable", "الشحن الدولي العادي مناسب");
  }
  return value;
}

function localizeBadge(value: string | undefined, language: StorefrontLanguage): string | undefined {
  if (!value) return undefined;

  const maps: Partial<Record<StorefrontLanguage, Record<string, string>>> = {
    JA: {
      Everyday: "日常使い",
      "Under $50": "手頃な価格",
      "Weather ready": "天候対応",
      "Cold weather": "防寒",
      Heritage: "ヘリテージ",
      Signature: "シグネチャー",
      "Summer edit": "夏向け",
    },
    ES: {
      "Summer edit": "edición de verano",
      "Weather ready": "listo para clima",
      Polished: "refinado",
    },
    AR: {
      "Editor's pick": "اختيار المحرر",
      "Summer edit": "اختيار صيفي",
      Statement: "لافت",
    },
  };

  return maps[language]?.[value] ?? value;
}

function localizeTargetRange(value: string, pricing: PricingContext): string {
  if (pricing.currency === "USD") return value;

  const numbers = [...value.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  if (!numbers.length) return value;

  return numbers.map((amount) => formatLocalizedPrice(amount * 100, pricing)).join("-");
}

function getResultLabel(language: StorefrontLanguage, count: number, total: number): string {
  switch (language) {
    case "JA":
      return `${total}点中${count}点を選定`;
    case "ES":
      return `${count} de ${total} seleccionados`;
    case "AR":
      return `${count} من ${total} مطابق`;
    case "EN":
    default:
      return `${count} matched from ${total}`;
  }
}

function getPricingContext(country: string, locale: string): PricingContext {
  return {
    currency: getCurrencyForCountry(country),
    locale,
  };
}

function getCurrencyForCountry(country: string): CurrencyCode {
  const normalized = country.toLowerCase().replace(/[^a-z]/g, "");

  if (["unitedstates", "us", "usa"].includes(normalized)) return "USD";
  if (["japan", "jp"].includes(normalized)) return "JPY";
  if (["unitedarabemirates", "uae", "ae", "emirates"].includes(normalized)) return "AED";
  if (["unitedkingdom", "uk", "greatbritain", "england", "scotland", "wales"].includes(normalized)) return "GBP";
  if (["canada", "ca"].includes(normalized)) return "CAD";
  if (["australia", "au"].includes(normalized)) return "AUD";
  if (["mexico", "mx"].includes(normalized)) return "MXN";
  if (["spain", "france", "germany", "italy", "ireland", "netherlands", "portugal"].includes(normalized)) return "EUR";

  return "USD";
}

function formatLocalizedPrice(usdCents: number, pricing: PricingContext): string {
  const rates: Record<CurrencyCode, number> = {
    USD: 1,
    JPY: 157,
    AED: 3.67,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.37,
    AUD: 1.52,
    MXN: 18.2,
  };
  const amount = (usdCents / 100) * rates[pricing.currency];

  return new Intl.NumberFormat(pricing.locale, {
    style: "currency",
    currency: pricing.currency,
    maximumFractionDigits: pricing.currency === "JPY" ? 0 : 2,
  }).format(amount);
}

function prioritizePrimaryProduct(
  products: readonly (BrimSelectedProduct & { offer: BrimVisitorOffer })[],
  primarySlug: string | undefined,
  preferences: BrimPreferenceInput,
  limit: number,
): readonly (BrimSelectedProduct & { offer: BrimVisitorOffer })[] {
  if (!primarySlug) return products;

  const existing = products.find((selection) => selection.product.slug === primarySlug);
  const primary =
    existing ??
    (() => {
      const product = getProductBySlug(primarySlug);
      if (!product) return undefined;

      return {
        product,
        score: 100,
        matchedSignals: ["primary handoff collection"],
        reason: "Primary collection requested by the human concierge.",
        offer: computeVisitorOffer(product, preferences),
      };
    })();

  if (!primary) return products;

  return [
    primary,
    ...products.filter((selection) => selection.product.slug !== primary.product.slug),
  ].slice(0, limit);
}

function buildAgentSteps(
  persona: Persona,
  handoff: ConciergeHandoff,
  manifest: PageManifest,
): DemoAgentStep[] {
  const shopping = handoff.publicContext.shopping;

  return [
    {
      owner: "Human Concierge",
      title: "Persona package",
      detail: `${persona.name} shares intent, known facts, fit, locale, price, and delivery context.`,
    },
    {
      owner: "BRIM Shop Agent",
      title: "Handoff accepted",
      detail: `${handoff.negotiationContext.m5Inputs.collections.join(", ")} become the starting assortment.`,
    },
    {
      owner: "Inventory Agent",
      title: "Products and offers",
      detail: `${manifest.sections.find((section) => section.id === "collection")?.props.summary ?? "Matched products"} with personalized pricing and shipping copy.`,
    },
    {
      owner: "UI Agent",
      title: "Storefront configured",
      detail: `${manifest.theme.preset} accent, ${shopping.density} density, ${manifest.theme.direction} direction.`,
    },
  ];
}
