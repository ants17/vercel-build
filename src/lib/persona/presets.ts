import type { Persona } from "./schema";

/**
 * Seed personas. These double as the "rehearsed personas" that keep the live
 * demo deterministic — known-good preference paths the human agent can run.
 */
export const personaPresets: Persona[] = [
  {
    id: "preset-maya",
    name: "Maya Chen - travel-light founder",
    identity: {
      role: "Founder shopping between investor meetings",
      context: "Needs one polished hat that works across flights, meetings, and dinners.",
    },
    intent: "Find a packable, structured BRIM hat that looks refined and can arrive before a Monday trip.",
    preferences: {
      interests: ["travel-ready hats", "structured fedoras", "fast shipping"],
      collectionInterests: [
        {
          collection: "The Carter Fedora",
          priority: "primary",
          reason: "Looks sharp enough for meetings without feeling formal.",
        },
        {
          collection: "The Lido Panama",
          priority: "secondary",
          reason: "Lightweight option if the trip weather is warm.",
        },
      ],
      sizeFit: {
        hatSize: "Medium",
        headMeasurement: "57 cm",
        fit: "secure but not tight",
        brim: "medium brim that will not block eye contact",
        crown: "structured crown",
        adjustability: "prefers an internal band or subtle adjuster",
        notes: ["Packable shape matters", "Avoids hats that sit too high"],
      },
      priceSensitivity: {
        level: "value",
        targetRange: "$120-$220",
        dealSignals: ["bundle discount", "free expedited shipping"],
        notes: "Will pay more for durability and fast delivery.",
      },
      shipping: {
        country: "United States",
        region: "CA",
        city: "San Francisco",
        timeframe: "arrives before Monday",
        destinationType: "home",
        notes: "Needs reliable delivery before a flight.",
      },
      language: {
        language: "EN",
        locale: "en-US",
      },
      tone: "casual",
      density: "compact",
      accessibility: ["clear size guidance", "low-clutter comparison"],
      constraints: ["limited browsing time", "needs delivery confidence"],
      style: {
        aesthetics: ["polished", "minimal", "travel-ready"],
        colors: ["black", "deep navy", "warm gray"],
        materials: ["wool felt", "packable straw", "structured cotton"],
        occasions: ["business travel", "client dinner", "airport"],
        avoids: ["oversized logos", "wide floppy brims"],
      },
    },
    knownFacts: [
      "Usually buys one versatile accessory instead of several trend pieces.",
      "Has a Monday morning flight.",
      "Prefers neutral colors that work with black and navy outfits.",
    ],
    hiddenPrefs: [
      "Will abandon the cart if expedited shipping looks uncertain.",
      "Secretly wants a hat that photographs well for conference hallway shots.",
    ],
  },
  {
    id: "preset-lucia",
    name: "Lucia Rivera - gift buyer",
    identity: {
      role: "Design director buying a birthday gift",
      context: "Shopping for a partner who likes sunny weekend trips and understated style.",
    },
    intent: "Choose a BRIM summer hat as a gift, with confidence on fit, returns, and presentation.",
    preferences: {
      interests: ["giftable hats", "summer collections", "returns"],
      collectionInterests: [
        {
          collection: "The Lido Panama",
          priority: "primary",
          reason: "Classic warm-weather shape that feels gift-worthy.",
        },
        {
          collection: "The Harbor Bucket",
          priority: "secondary",
          reason: "More casual option for beach weekends.",
        },
      ],
      sizeFit: {
        hatSize: "Large",
        headMeasurement: "59 cm estimate",
        fit: "forgiving fit because this is a gift",
        brim: "sun-protective but not dramatic",
        crown: "natural, breathable crown",
        adjustability: "adjustable band strongly preferred",
        notes: ["Needs easy exchange if sizing is wrong"],
      },
      priceSensitivity: {
        level: "flexible",
        targetRange: "$90-$180",
        dealSignals: ["gift packaging included", "easy return window"],
      },
      shipping: {
        country: "United States",
        region: "NY",
        city: "Brooklyn",
        timeframe: "within 5 days",
        destinationType: "gift",
        notes: "Gift note and clean packaging matter.",
      },
      language: {
        language: "ES",
        locale: "es-US",
      },
      tone: "formal",
      density: "comfortable",
      accessibility: ["plain sizing language", "Spanish-language summary"],
      constraints: ["must be exchangeable", "should not reveal price on packing slip"],
      style: {
        aesthetics: ["classic", "sunny", "quiet luxury"],
        colors: ["natural straw", "cream", "olive"],
        materials: ["toquilla straw", "raffia", "cotton lining"],
        occasions: ["birthday gift", "summer travel", "weekend brunch"],
        avoids: ["flashy bands", "stiff formal styles"],
      },
    },
    knownFacts: [
      "The recipient has a larger head size than most adjustable caps fit.",
      "The gift is for next weekend.",
      "Lucia prefers clear exchange policies over heavy product copy.",
    ],
    hiddenPrefs: [
      "She is anxious about getting the size wrong.",
      "She will spend more if the package feels premium when opened.",
    ],
  },
  {
    id: "preset-ren",
    name: "Ren Sato - precise commuter",
    identity: {
      role: "Product manager replacing a daily cap",
      context: "Wants a clean everyday hat for transit, errands, and weekend coffee.",
    },
    intent: "Find a low-profile BRIM cap with exact fit guidance and minimal visual noise.",
    preferences: {
      interests: ["low-profile caps", "fit precision", "minimal styling"],
      collectionInterests: [
        {
          collection: "The Brooklyn Cap",
          priority: "primary",
          reason: "Everyday shape with a compact profile.",
        },
        {
          collection: "The Carrick Flat Cap",
          priority: "secondary",
          reason: "More refined silhouette for weekend dinners.",
        },
      ],
      sizeFit: {
        hatSize: "Small",
        headMeasurement: "55 cm",
        fit: "low-profile and close to the head",
        brim: "short brim",
        crown: "shallow crown",
        adjustability: "hidden adjuster only",
        notes: ["Strong preference for exact measurements"],
      },
      priceSensitivity: {
        level: "budget",
        targetRange: "$45-$95",
        dealSignals: ["first-order discount", "free returns"],
        notes: "Will not pay premium pricing for visible branding.",
      },
      shipping: {
        country: "Japan",
        region: "Tokyo",
        city: "Setagaya",
        timeframe: "standard international shipping is acceptable",
        destinationType: "home",
        notes: "Duties and delivery estimates should be clear.",
      },
      language: {
        language: "JA",
        locale: "ja-JP",
      },
      tone: "playful",
      density: "compact",
      accessibility: ["measurement table", "no autoplay motion"],
      constraints: ["international shipping clarity", "low-profile shape"],
      style: {
        aesthetics: ["minimal", "urban", "precise"],
        colors: ["charcoal", "ink", "stone"],
        materials: ["cotton twill", "brushed canvas", "linen blend"],
        occasions: ["train commute", "coffee run", "casual office"],
        avoids: ["large logos", "tall crowns", "loud color blocking"],
      },
    },
    knownFacts: [
      "Ren compares measurements before buying apparel online.",
      "They prefer concise product information.",
      "International shipping fees affect the final decision.",
    ],
    hiddenPrefs: [
      "They dislike being upsold while checking sizing details.",
      "They will only buy if the product photos show the cap from the side.",
    ],
  },
  {
    id: "preset-samira",
    name: "Samira Haddad - event stylist",
    identity: {
      role: "Stylist shopping for a family celebration",
      context: "Needs a statement hat that is elegant, modest, and camera-ready.",
    },
    intent: "Find a BRIM wide-brim hat for an outdoor celebration, with color and coverage guidance.",
    preferences: {
      interests: ["wide-brim hats", "event styling", "modest sun coverage"],
      collectionInterests: [
        {
          collection: "The Mesa Wide-Brim",
          priority: "primary",
          reason: "Statement silhouette with practical sun coverage.",
        },
        {
          collection: "The Lido Panama",
          priority: "secondary",
          reason: "Lighter option if the main event day is very hot.",
        },
      ],
      sizeFit: {
        hatSize: "Medium/Large",
        headMeasurement: "58 cm",
        fit: "comfortable for several hours",
        brim: "wide brim with stable structure",
        crown: "moderate crown that works with pinned hair",
        adjustability: "internal sizing tape preferred",
        notes: ["Must work with styled hair", "Needs enough coverage for sun"],
      },
      priceSensitivity: {
        level: "premium",
        targetRange: "$160-$320",
        dealSignals: ["premium materials", "styling guidance"],
        notes: "Quality and event fit matter more than discounting.",
      },
      shipping: {
        country: "United Arab Emirates",
        region: "Dubai",
        city: "Dubai",
        timeframe: "delivery within 10 days",
        destinationType: "home",
        notes: "Packaging should protect the brim shape.",
      },
      language: {
        language: "AR",
        locale: "ar-AE",
      },
      tone: "formal",
      density: "comfortable",
      accessibility: ["high contrast", "right-to-left language support"],
      constraints: ["brim must hold shape", "needs color guidance for event outfit"],
      style: {
        aesthetics: ["elegant", "modest", "photogenic"],
        colors: ["ivory", "date brown", "deep green"],
        materials: ["structured straw", "wool felt", "silk band"],
        occasions: ["outdoor celebration", "family portraits", "garden reception"],
        avoids: ["flimsy brims", "neon colors", "tiny decorative hats"],
      },
    },
    knownFacts: [
      "Samira is coordinating the hat with a long emerald outfit.",
      "The event is outdoors in direct sun.",
      "She is comfortable paying for a hat that keeps its shape.",
    ],
    hiddenPrefs: [
      "She wants the hat to look expensive without drawing attention away from family.",
      "She is worried the brim will arrive bent.",
    ],
  },
];
