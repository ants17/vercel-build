export const BRIM_CATALOG_VERSION = "brim-canonical-2026-06-27";
export const BRIM_CANONICAL_CATALOG_COUNT = 24;

export type BrimCollection = "men" | "women" | "kids";
export type BrimShippingClass = "packable" | "boxed" | "protective" | "kids";
export type BrimThemePreset = "heritage" | "coastal" | "field" | "mono" | "sun";
export type BrimShippingSpeed = "standard" | "express" | "international";

export type BrimColorway = {
  name: string;
  hex: string;
};

export type BrimProduct = {
  slug: string;
  name: string;
  collection: BrimCollection;
  priceBaselineCents: number;
  currency: "USD";
  materials: readonly string[];
  fit: {
    sizes: readonly string[];
    note: string;
  };
  colors: {
    count: number;
    default: string;
    colorways: readonly BrimColorway[];
  };
  tags: readonly string[];
  imagePath: string;
  badges: readonly string[];
  shippingClass: BrimShippingClass;
  themeHints: {
    accentColor: string;
    colorway: string;
    mood: readonly string[];
  };
};

export type BrimPreferenceInput = {
  intent?: string;
  interests?: readonly string[];
  constraints?: readonly string[];
  hiddenPrefs?: readonly string[];
  knownFacts?: readonly string[];
  tone?: string;
  density?: string;
  accessibility?: readonly string[];
};

export type BrimSelectionOptions = {
  collection?: BrimCollection;
  limit?: number;
  excludeSlugs?: readonly string[];
};

export type BrimSelectedProduct = {
  product: BrimProduct;
  score: number;
  matchedSignals: readonly string[];
  reason: string;
};

export type BrimVisitorOffer = {
  productSlug: string;
  pricing: {
    currency: "USD";
    baselineCents: number;
    adjustmentCents: number;
    finalCents: number;
    display: string;
    copy: string;
  };
  shipping: {
    speed: BrimShippingSpeed;
    costCents: number;
    display: string;
    eta: string;
    copy: string;
  };
};

export type BrimThemeHints = {
  preset: BrimThemePreset;
  accentColor: string;
  density: "compact" | "comfortable";
  colorway: string;
  palette: readonly string[];
  matchedSignals: readonly string[];
};

export type BrimVisitorInventory = {
  catalogVersion: string;
  canonicalCount: number;
  theme: BrimThemeHints;
  products: readonly (BrimSelectedProduct & { offer: BrimVisitorOffer })[];
};

const assertCatalogCount = <T extends readonly BrimProduct[] & { length: 24 }>(catalog: T) =>
  catalog;

export const canonicalBrimCatalog = assertCatalogCount([
  {
    slug: "carter-fedora",
    name: "Carter Fedora",
    collection: "men",
    priceBaselineCents: 16800,
    currency: "USD",
    materials: ["rabbit felt", "grosgrain ribbon", "satin lining"],
    fit: { sizes: ["S", "M", "L", "XL"], note: "Structured crown with a firm 3 inch brim." },
    colors: {
      count: 5,
      default: "Walnut",
      colorways: [
        { name: "Walnut", hex: "#7B563A" },
        { name: "Oxblood", hex: "#552126" },
        { name: "Marine", hex: "#1E3548" },
        { name: "Loden", hex: "#41543C" },
        { name: "Black", hex: "#171717" },
      ],
    },
    tags: ["felt", "wide brim", "heritage", "formal", "gift", "fall"],
    imagePath: "/inventory/carter-fedora.png",
    badges: ["Signature", "Colorways"],
    shippingClass: "boxed",
    themeHints: { accentColor: "#7B563A", colorway: "heritage neutral", mood: ["editorial", "heritage"] },
  },
  {
    slug: "lido-panama",
    name: "Lido Panama",
    collection: "men",
    priceBaselineCents: 14200,
    currency: "USD",
    materials: ["toquilla straw", "grosgrain ribbon"],
    fit: { sizes: ["S", "M", "L"], note: "Breathable handwoven body with a medium brim." },
    colors: {
      count: 3,
      default: "Natural",
      colorways: [
        { name: "Natural", hex: "#E7D9B8" },
        { name: "Ivory", hex: "#F4EEDC" },
        { name: "Tea", hex: "#C9A56F" },
      ],
    },
    tags: ["straw", "sun", "travel", "breathable", "summer"],
    imagePath: "/inventory/lido-panama.png",
    badges: ["Summer edit"],
    shippingClass: "protective",
    themeHints: { accentColor: "#C9A56F", colorway: "coastal straw", mood: ["minimal", "warm"] },
  },
  {
    slug: "brooklyn-cap",
    name: "Brooklyn Cap",
    collection: "men",
    priceBaselineCents: 4800,
    currency: "USD",
    materials: ["cotton twill", "brushed metal slider"],
    fit: { sizes: ["Adjustable"], note: "Low-profile six-panel cap." },
    colors: {
      count: 6,
      default: "Deep Navy",
      colorways: [
        { name: "Deep Navy", hex: "#172A46" },
        { name: "Black", hex: "#171717" },
        { name: "Stone", hex: "#D8D0C3" },
        { name: "Forest", hex: "#274633" },
        { name: "Burgundy", hex: "#6D2435" },
        { name: "Washed Blue", hex: "#5C7991" },
      ],
    },
    tags: ["cap", "casual", "adjustable", "everyday", "value"],
    imagePath: "/inventory/brooklyn-cap.png",
    badges: ["Everyday"],
    shippingClass: "packable",
    themeHints: { accentColor: "#172A46", colorway: "city navy", mood: ["casual", "compact"] },
  },
  {
    slug: "dock-beanie",
    name: "Dock Beanie",
    collection: "men",
    priceBaselineCents: 5200,
    currency: "USD",
    materials: ["merino wool"],
    fit: { sizes: ["One size"], note: "Cuffed rib knit with a close warm fit." },
    colors: {
      count: 5,
      default: "Forest",
      colorways: [
        { name: "Forest", hex: "#234434" },
        { name: "Navy", hex: "#182A40" },
        { name: "Oat", hex: "#D7C6AC" },
        { name: "Charcoal", hex: "#383838" },
        { name: "Rust", hex: "#A34D2F" },
      ],
    },
    tags: ["beanie", "winter", "warm", "wool", "packable", "value"],
    imagePath: "/inventory/dock-beanie.png",
    badges: ["Cold weather"],
    shippingClass: "packable",
    themeHints: { accentColor: "#234434", colorway: "utility green", mood: ["warm", "casual"] },
  },
  {
    slug: "harbor-bucket",
    name: "Harbor Bucket",
    collection: "men",
    priceBaselineCents: 6400,
    currency: "USD",
    materials: ["waxed cotton", "cotton lining"],
    fit: { sizes: ["S/M", "L/XL"], note: "Soft bucket shape with water-resistant structure." },
    colors: {
      count: 4,
      default: "Olive",
      colorways: [
        { name: "Olive", hex: "#596343" },
        { name: "Black", hex: "#171717" },
        { name: "Khaki", hex: "#B7A57A" },
        { name: "Navy", hex: "#172A46" },
      ],
    },
    tags: ["bucket", "rain", "travel", "outdoor", "packable", "casual"],
    imagePath: "/inventory/harbor-bucket.png",
    badges: ["Weather ready"],
    shippingClass: "packable",
    themeHints: { accentColor: "#596343", colorway: "harbor olive", mood: ["outdoor", "utilitarian"] },
  },
  {
    slug: "mesa-widebrim",
    name: "Mesa Widebrim",
    collection: "men",
    priceBaselineCents: 15600,
    currency: "USD",
    materials: ["wool felt", "leather band"],
    fit: { sizes: ["S", "M", "L", "XL"], note: "Firm western-inspired crown with a generous brim." },
    colors: {
      count: 3,
      default: "Camel",
      colorways: [
        { name: "Camel", hex: "#B8864F" },
        { name: "Taupe", hex: "#8C7A65" },
        { name: "Black", hex: "#171717" },
      ],
    },
    tags: ["felt", "wide brim", "outdoor", "statement", "fall"],
    imagePath: "/inventory/mesa-widebrim.png",
    badges: ["Editor's pick"],
    shippingClass: "boxed",
    themeHints: { accentColor: "#B8864F", colorway: "desert camel", mood: ["editorial", "rugged"] },
  },
  {
    slug: "depot-trucker",
    name: "Depot Trucker",
    collection: "men",
    priceBaselineCents: 4200,
    currency: "USD",
    materials: ["foam front", "poly mesh", "cotton sweatband"],
    fit: { sizes: ["Adjustable"], note: "Classic snapback trucker profile." },
    colors: {
      count: 4,
      default: "Cream/Brown",
      colorways: [
        { name: "Cream/Brown", hex: "#8A5A36" },
        { name: "Navy/White", hex: "#19395D" },
        { name: "Green/Stone", hex: "#3F5B3B" },
        { name: "Black/White", hex: "#202020" },
      ],
    },
    tags: ["cap", "trucker", "casual", "breathable", "value"],
    imagePath: "/inventory/depot-trucker.png",
    badges: ["Under $50"],
    shippingClass: "packable",
    themeHints: { accentColor: "#8A5A36", colorway: "workwear brown", mood: ["casual", "retro"] },
  },
  {
    slug: "carrick-flatcap",
    name: "Carrick Flatcap",
    collection: "men",
    priceBaselineCents: 7800,
    currency: "USD",
    materials: ["wool tweed", "cotton lining"],
    fit: { sizes: ["S", "M", "L", "XL"], note: "Tailored flat cap with a short stitched brim." },
    colors: {
      count: 3,
      default: "Grey Herringbone",
      colorways: [
        { name: "Grey Herringbone", hex: "#77736C" },
        { name: "Brown Donegal", hex: "#72583F" },
        { name: "Charcoal", hex: "#393939" },
      ],
    },
    tags: ["flat cap", "wool", "heritage", "formal", "fall"],
    imagePath: "/inventory/carrick-flatcap.png",
    badges: ["Heritage"],
    shippingClass: "packable",
    themeHints: { accentColor: "#77736C", colorway: "grey tweed", mood: ["heritage", "quiet"] },
  },
  {
    slug: "riviera-sun",
    name: "Riviera Sun",
    collection: "women",
    priceBaselineCents: 11800,
    currency: "USD",
    materials: ["paper straw", "cotton ribbon"],
    fit: { sizes: ["S/M", "M/L"], note: "Wide floppy brim with internal size adjuster." },
    colors: {
      count: 4,
      default: "Natural/Ivory",
      colorways: [
        { name: "Natural/Ivory", hex: "#E6D4A7" },
        { name: "Natural/Black", hex: "#DAC487" },
        { name: "Honey", hex: "#C79B49" },
        { name: "White", hex: "#F2EFE4" },
      ],
    },
    tags: ["sun", "straw", "wide brim", "travel", "summer", "resort"],
    imagePath: "/inventory/riviera-sun.png",
    badges: ["Vacation ready"],
    shippingClass: "protective",
    themeHints: { accentColor: "#C79B49", colorway: "riviera straw", mood: ["warm", "resort"] },
  },
  {
    slug: "margaux-cloche",
    name: "Margaux Cloche",
    collection: "women",
    priceBaselineCents: 13200,
    currency: "USD",
    materials: ["wool felt", "tonal bow"],
    fit: { sizes: ["S", "M", "L"], note: "Close bell shape with a soft brim." },
    colors: {
      count: 3,
      default: "Dusty Rose",
      colorways: [
        { name: "Dusty Rose", hex: "#C58B8F" },
        { name: "Plum", hex: "#59314C" },
        { name: "Camel", hex: "#B8875A" },
      ],
    },
    tags: ["cloche", "felt", "formal", "vintage", "gift"],
    imagePath: "/inventory/margaux-cloche.png",
    badges: ["Occasion"],
    shippingClass: "boxed",
    themeHints: { accentColor: "#C58B8F", colorway: "dusty rose", mood: ["romantic", "editorial"] },
  },
  {
    slug: "left-bank-beret",
    name: "Left Bank Beret",
    collection: "women",
    priceBaselineCents: 5800,
    currency: "USD",
    materials: ["wool"],
    fit: { sizes: ["One size"], note: "Soft crown that can be shaped to either side." },
    colors: {
      count: 7,
      default: "Camel",
      colorways: [
        { name: "Camel", hex: "#B8875A" },
        { name: "Black", hex: "#171717" },
        { name: "Red", hex: "#B3232D" },
        { name: "Navy", hex: "#172A46" },
        { name: "Cream", hex: "#EFE6D1" },
        { name: "Sage", hex: "#8D9A80" },
        { name: "Charcoal", hex: "#383838" },
      ],
    },
    tags: ["beret", "wool", "casual", "gift", "color"],
    imagePath: "/inventory/left-bank-beret.png",
    badges: ["Best color range"],
    shippingClass: "packable",
    themeHints: { accentColor: "#B8875A", colorway: "left bank camel", mood: ["artful", "casual"] },
  },
  {
    slug: "adler-floppy",
    name: "Adler Floppy",
    collection: "women",
    priceBaselineCents: 14800,
    currency: "USD",
    materials: ["wool felt", "grosgrain band"],
    fit: { sizes: ["S/M", "M/L"], note: "Soft dramatic brim with a flexible crown." },
    colors: {
      count: 3,
      default: "Charcoal",
      colorways: [
        { name: "Charcoal", hex: "#3E3D3B" },
        { name: "Black", hex: "#171717" },
        { name: "Wine", hex: "#6D2435" },
      ],
    },
    tags: ["floppy", "wide brim", "felt", "statement", "formal"],
    imagePath: "/inventory/adler-floppy.png",
    badges: ["Statement"],
    shippingClass: "boxed",
    themeHints: { accentColor: "#3E3D3B", colorway: "charcoal drama", mood: ["editorial", "bold"] },
  },
  {
    slug: "colette-fedora",
    name: "Colette Fedora",
    collection: "women",
    priceBaselineCents: 13800,
    currency: "USD",
    materials: ["wool felt", "tonal ribbon"],
    fit: { sizes: ["S", "M", "L"], note: "Slim brim fedora with a medium structured crown." },
    colors: {
      count: 4,
      default: "Blush Mauve",
      colorways: [
        { name: "Blush Mauve", hex: "#B98791" },
        { name: "Ivory", hex: "#EFE7D5" },
        { name: "Camel", hex: "#B8875A" },
        { name: "Black", hex: "#171717" },
      ],
    },
    tags: ["fedora", "felt", "gift", "formal", "fall"],
    imagePath: "/inventory/colette-fedora.png",
    badges: ["Polished"],
    shippingClass: "boxed",
    themeHints: { accentColor: "#B98791", colorway: "blush mauve", mood: ["soft", "editorial"] },
  },
  {
    slug: "aspen-bobble",
    name: "Aspen Bobble",
    collection: "women",
    priceBaselineCents: 6200,
    currency: "USD",
    materials: ["wool blend", "faux fur pom"],
    fit: { sizes: ["One size"], note: "Chunky cable knit with a relaxed cuff." },
    colors: {
      count: 4,
      default: "Cream",
      colorways: [
        { name: "Cream", hex: "#EFE6D1" },
        { name: "Powder", hex: "#BFD1DD" },
        { name: "Charcoal", hex: "#383838" },
        { name: "Berry", hex: "#8A3652" },
      ],
    },
    tags: ["beanie", "winter", "warm", "gift", "playful"],
    imagePath: "/inventory/aspen-bobble.png",
    badges: ["Cold weather"],
    shippingClass: "packable",
    themeHints: { accentColor: "#BFD1DD", colorway: "alpine powder", mood: ["cozy", "playful"] },
  },
  {
    slug: "marlowe-bucket",
    name: "Marlowe Bucket",
    collection: "women",
    priceBaselineCents: 7200,
    currency: "USD",
    materials: ["quilted nylon", "cotton lining"],
    fit: { sizes: ["S/M", "M/L"], note: "Lightly padded bucket with a soft downturned brim." },
    colors: {
      count: 4,
      default: "Sage",
      colorways: [
        { name: "Sage", hex: "#9BAB8E" },
        { name: "Black", hex: "#171717" },
        { name: "Cream", hex: "#EFE6D1" },
        { name: "Clay", hex: "#B76E57" },
      ],
    },
    tags: ["bucket", "quilted", "casual", "travel", "rain"],
    imagePath: "/inventory/marlowe-bucket.png",
    badges: ["Packable"],
    shippingClass: "packable",
    themeHints: { accentColor: "#9BAB8E", colorway: "soft sage", mood: ["casual", "fresh"] },
  },
  {
    slug: "provence-boater",
    name: "Provence Boater",
    collection: "women",
    priceBaselineCents: 12600,
    currency: "USD",
    materials: ["braided straw", "grosgrain ribbon"],
    fit: { sizes: ["S", "M", "L"], note: "Flat-top crown with a crisp straight brim." },
    colors: {
      count: 3,
      default: "Natural/Navy",
      colorways: [
        { name: "Natural/Navy", hex: "#1D3557" },
        { name: "Natural/Black", hex: "#202020" },
        { name: "Natural/Ivory", hex: "#E9D8A6" },
      ],
    },
    tags: ["boater", "straw", "sun", "formal", "summer"],
    imagePath: "/inventory/provence-boater.png",
    badges: ["Event ready"],
    shippingClass: "protective",
    themeHints: { accentColor: "#1D3557", colorway: "navy straw", mood: ["classic", "summer"] },
  },
  {
    slug: "cub-beanie",
    name: "Cub Beanie",
    collection: "kids",
    priceBaselineCents: 3400,
    currency: "USD",
    materials: ["cotton knit"],
    fit: { sizes: ["Toddler", "Kids"], note: "Stretch beanie with soft rounded ears." },
    colors: {
      count: 3,
      default: "Mustard",
      colorways: [
        { name: "Mustard", hex: "#D7A12B" },
        { name: "Oat", hex: "#D7C6AC" },
        { name: "Berry", hex: "#A83A55" },
      ],
    },
    tags: ["kids", "beanie", "warm", "playful", "gift"],
    imagePath: "/inventory/cub-beanie.png",
    badges: ["Toddler"],
    shippingClass: "kids",
    themeHints: { accentColor: "#D7A12B", colorway: "mustard play", mood: ["playful", "warm"] },
  },
  {
    slug: "rex-bucket",
    name: "Rex Bucket",
    collection: "kids",
    priceBaselineCents: 3200,
    currency: "USD",
    materials: ["printed cotton canvas"],
    fit: { sizes: ["Toddler", "Kids"], note: "Soft bucket hat with a stitched brim." },
    colors: {
      count: 2,
      default: "Dino Green",
      colorways: [
        { name: "Dino Green", hex: "#5FAD56" },
        { name: "Sky Dino", hex: "#84B8D8" },
      ],
    },
    tags: ["kids", "bucket", "sun", "playful", "cotton"],
    imagePath: "/inventory/rex-bucket.png",
    badges: ["Play print"],
    shippingClass: "kids",
    themeHints: { accentColor: "#5FAD56", colorway: "dino green", mood: ["playful", "bright"] },
  },
  {
    slug: "daisy-sun",
    name: "Daisy Sun",
    collection: "kids",
    priceBaselineCents: 3600,
    currency: "USD",
    materials: ["cotton poplin", "embroidered detail"],
    fit: { sizes: ["Toddler", "Kids"], note: "Ruffled sun hat with a soft chin tie." },
    colors: {
      count: 3,
      default: "Soft Pink",
      colorways: [
        { name: "Soft Pink", hex: "#F3B7C6" },
        { name: "Lilac", hex: "#C8B6E2" },
        { name: "Butter", hex: "#F2D47E" },
      ],
    },
    tags: ["kids", "sun", "cotton", "playful", "gift"],
    imagePath: "/inventory/daisy-sun.png",
    badges: ["Sun safe"],
    shippingClass: "kids",
    themeHints: { accentColor: "#F3B7C6", colorway: "daisy pink", mood: ["soft", "playful"] },
  },
  {
    slug: "rookie-cap",
    name: "Rookie Cap",
    collection: "kids",
    priceBaselineCents: 3000,
    currency: "USD",
    materials: ["cotton twill", "velcro adjuster"],
    fit: { sizes: ["Kids"], note: "Small baseball cap with an easy adjust back." },
    colors: {
      count: 4,
      default: "Cherry",
      colorways: [
        { name: "Cherry", hex: "#D62D30" },
        { name: "Royal", hex: "#2F65B0" },
        { name: "Sunshine", hex: "#F2C230" },
        { name: "Grass", hex: "#5FAD56" },
      ],
    },
    tags: ["kids", "cap", "casual", "adjustable", "value"],
    imagePath: "/inventory/rookie-cap.png",
    badges: ["Under $35"],
    shippingClass: "kids",
    themeHints: { accentColor: "#D62D30", colorway: "rookie cherry", mood: ["sporty", "bright"] },
  },
  {
    slug: "sprout-pom",
    name: "Sprout Pom",
    collection: "kids",
    priceBaselineCents: 3400,
    currency: "USD",
    materials: ["acrylic knit", "faux fur pom"],
    fit: { sizes: ["Toddler", "Kids"], note: "Stretch rib beanie with a soft pom." },
    colors: {
      count: 2,
      default: "Rainbow",
      colorways: [
        { name: "Rainbow", hex: "#E4572E" },
        { name: "Pastel", hex: "#8FC6D8" },
      ],
    },
    tags: ["kids", "beanie", "winter", "warm", "playful"],
    imagePath: "/inventory/sprout-pom.png",
    badges: ["Bright"],
    shippingClass: "kids",
    themeHints: { accentColor: "#E4572E", colorway: "rainbow bright", mood: ["playful", "vibrant"] },
  },
  {
    slug: "pebble-sun",
    name: "Pebble Sun",
    collection: "kids",
    priceBaselineCents: 4200,
    currency: "USD",
    materials: ["straw", "cotton gingham bow"],
    fit: { sizes: ["Kids"], note: "Small floppy brim with an adjustable inner band." },
    colors: {
      count: 2,
      default: "Natural/Blue",
      colorways: [
        { name: "Natural/Blue", hex: "#6B9FC9" },
        { name: "Natural/Pink", hex: "#F3B7C6" },
      ],
    },
    tags: ["kids", "sun", "straw", "travel", "gift"],
    imagePath: "/inventory/pebble-sun.png",
    badges: ["Vacation ready"],
    shippingClass: "protective",
    themeHints: { accentColor: "#6B9FC9", colorway: "blue gingham", mood: ["summer", "soft"] },
  },
  {
    slug: "scout-trapper",
    name: "Scout Trapper",
    collection: "kids",
    priceBaselineCents: 4600,
    currency: "USD",
    materials: ["cotton shell", "faux fur lining"],
    fit: { sizes: ["Toddler", "Kids"], note: "Ear flaps fasten under chin or on crown." },
    colors: {
      count: 2,
      default: "Tan",
      colorways: [
        { name: "Tan", hex: "#B68A5B" },
        { name: "Olive", hex: "#596343" },
      ],
    },
    tags: ["kids", "trapper", "winter", "warm", "outdoor"],
    imagePath: "/inventory/scout-trapper.png",
    badges: ["Warmest kids"],
    shippingClass: "kids",
    themeHints: { accentColor: "#B68A5B", colorway: "scout tan", mood: ["outdoor", "cozy"] },
  },
  {
    slug: "tadpole-bucket",
    name: "Tadpole Bucket",
    collection: "kids",
    priceBaselineCents: 3200,
    currency: "USD",
    materials: ["cotton canvas"],
    fit: { sizes: ["Toddler", "Kids"], note: "Reversible soft bucket hat." },
    colors: {
      count: 3,
      default: "Sky Cloud",
      colorways: [
        { name: "Sky Cloud", hex: "#8FC6D8" },
        { name: "Mint", hex: "#98D2A4" },
        { name: "Lilac", hex: "#C8B6E2" },
      ],
    },
    tags: ["kids", "bucket", "sun", "reversible", "value"],
    imagePath: "/inventory/tadpole-bucket.png",
    badges: ["Reversible"],
    shippingClass: "kids",
    themeHints: { accentColor: "#8FC6D8", colorway: "sky cloud", mood: ["playful", "fresh"] },
  },
] as const);

export type BrimProductSlug = (typeof canonicalBrimCatalog)[number]["slug"];

const collectionLabels: Record<BrimCollection, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

const preferenceProfiles = [
  { signals: ["kid", "kids", "child", "children", "toddler", "family"], tags: ["kids", "playful"], collection: "kids" as const },
  { signals: ["men", "mens", "man", "dad", "father"], tags: ["heritage", "casual"], collection: "men" as const },
  { signals: ["women", "womens", "woman", "mom", "mother"], tags: ["formal", "gift"], collection: "women" as const },
  { signals: ["sun", "summer", "vacation", "beach", "resort"], tags: ["sun", "straw", "summer", "travel"] },
  { signals: ["winter", "cold", "warm", "snow"], tags: ["winter", "warm", "beanie"] },
  { signals: ["travel", "pack", "packable", "trip"], tags: ["travel", "packable"] },
  { signals: ["gift", "present", "occasion"], tags: ["gift", "formal"] },
  { signals: ["formal", "polished", "event", "wedding"], tags: ["formal", "felt"] },
  { signals: ["casual", "everyday", "street", "sport"], tags: ["casual", "cap", "bucket"] },
  { signals: ["outdoor", "rain", "hike", "trail"], tags: ["outdoor", "rain", "travel"] },
  { signals: ["budget", "value", "affordable", "under"], tags: ["value"] },
  { signals: ["premium", "luxury", "heritage"], tags: ["heritage", "felt", "wide brim"] },
];

const themeProfiles = [
  {
    signals: ["kids", "child", "playful", "bright", "rainbow"],
    hints: {
      preset: "sun" as const,
      accentColor: "#C8841C",
      density: "comfortable" as const,
      colorway: "playful brights",
      palette: ["#E4572E", "#F2C230", "#5FAD56", "#8FC6D8"],
    },
  },
  {
    signals: ["luxury", "premium", "formal", "event", "heritage"],
    hints: {
      preset: "heritage" as const,
      accentColor: "#7B2D3A",
      density: "comfortable" as const,
      colorway: "heritage neutrals",
      palette: ["#171717", "#7B563A", "#B8875A", "#EFE6D1"],
    },
  },
  {
    signals: ["sun", "summer", "vacation", "beach", "resort"],
    hints: {
      preset: "coastal" as const,
      accentColor: "#1E3A5F",
      density: "comfortable" as const,
      colorway: "coastal straw",
      palette: ["#F4EEDC", "#E6D4A7", "#C79B49", "#1D3557"],
    },
  },
  {
    signals: ["compact", "quick", "efficient", "compare"],
    hints: {
      preset: "mono" as const,
      accentColor: "#111111",
      density: "compact" as const,
      colorway: "city navy",
      palette: ["#172A46", "#5C7991", "#D8D0C3", "#171717"],
    },
  },
];

export function getCanonicalCatalog(collection?: BrimCollection): readonly BrimProduct[] {
  if (!collection) return canonicalBrimCatalog;
  return canonicalBrimCatalog.filter((product) => product.collection === collection);
}

export function getProductBySlug(slug: string): BrimProduct | undefined {
  return canonicalBrimCatalog.find((product) => product.slug === slug);
}

export function selectProductsForPersona(
  preferences: BrimPreferenceInput,
  options: BrimSelectionOptions = {},
): readonly BrimSelectedProduct[] {
  const signals = getSignals(preferences);
  const excluded = new Set(options.excludeSlugs ?? []);
  const limit = options.limit ?? 6;

  return canonicalBrimCatalog
    .filter((product) => !options.collection || product.collection === options.collection)
    .filter((product) => !excluded.has(product.slug))
    .map((product, index) => {
      const matchedSignals = getMatchedSignals(product, signals);
      const score = getProductScore(product, signals, matchedSignals) - index / 100;

      return {
        product,
        score: Math.round(score * 100) / 100,
        matchedSignals,
        reason: getSelectionReason(product, matchedSignals),
      };
    })
    .sort((a, b) => b.score - a.score || a.product.priceBaselineCents - b.product.priceBaselineCents)
    .slice(0, Math.max(0, limit));
}

export function computeVisitorOffer(
  product: BrimProduct,
  preferences: BrimPreferenceInput = {},
): BrimVisitorOffer {
  const signals = getSignals(preferences);
  const budgetSensitive = hasAnySignal(signals, ["budget", "value", "affordable", "under"]);
  const giftVisit = hasAnySignal(signals, ["gift", "present", "occasion"]);
  const urgentVisit = hasAnySignal(signals, ["rush", "urgent", "soon", "tomorrow", "express"]);
  const internationalVisit = hasAnySignal(signals, ["international", "global", "overseas"]);
  const adjustmentCents = budgetSensitive ? -Math.round(product.priceBaselineCents * 0.1) : 0;
  const finalCents = product.priceBaselineCents + adjustmentCents;

  const shipping = getShipping(product, {
    giftVisit,
    urgentVisit,
    internationalVisit,
    freeShipping: finalCents >= 12500,
  });

  return {
    productSlug: product.slug,
    pricing: {
      currency: product.currency,
      baselineCents: product.priceBaselineCents,
      adjustmentCents,
      finalCents,
      display: formatUsd(finalCents),
      copy: getPricingCopy({ budgetSensitive, giftVisit, finalCents }),
    },
    shipping,
  };
}

export function getColorwayHint(
  product: BrimProduct,
  preferences: BrimPreferenceInput = {},
): BrimColorway {
  const signals = getSignals(preferences);

  const colorMatch = product.colors.colorways.find((colorway) => {
    const name = colorway.name.toLowerCase();
    return signals.some((signal) => name.includes(signal) || signal.includes(name));
  });

  return colorMatch ?? product.colors.colorways[0];
}

export function getThemeHints(preferences: BrimPreferenceInput = {}): BrimThemeHints {
  const signals = getSignals(preferences);
  const match = themeProfiles.find((profile) =>
    profile.signals.some((signal) => signals.includes(signal)),
  );

  if (!match) {
    return {
      preset: "heritage",
      accentColor: "#7B2D3A",
      density: preferences.density === "compact" ? "compact" : "comfortable",
      colorway: "BRIM neutral",
      palette: ["#171717", "#7B563A", "#D8D0C3", "#FAF9F7"],
      matchedSignals: [],
    };
  }

  return {
    ...match.hints,
    density: preferences.density === "compact" ? "compact" : match.hints.density,
    matchedSignals: match.signals.filter((signal) => signals.includes(signal)),
  };
}

export function buildVisitorInventory(
  preferences: BrimPreferenceInput,
  options: BrimSelectionOptions = {},
): BrimVisitorInventory {
  const products = selectProductsForPersona(preferences, options).map((selection) => ({
    ...selection,
    offer: computeVisitorOffer(selection.product, preferences),
  }));

  return {
    catalogVersion: BRIM_CATALOG_VERSION,
    canonicalCount: BRIM_CANONICAL_CATALOG_COUNT,
    theme: getThemeHints(preferences),
    products,
  };
}

function getSignals(preferences: BrimPreferenceInput): readonly string[] {
  const raw = [
    preferences.intent,
    preferences.tone,
    preferences.density,
    ...(preferences.interests ?? []),
    ...(preferences.constraints ?? []),
    ...(preferences.hiddenPrefs ?? []),
    ...(preferences.knownFacts ?? []),
    ...(preferences.accessibility ?? []),
  ];

  return Array.from(
    new Set(
      raw
        .filter((item): item is string => Boolean(item))
        .flatMap((item) => item.toLowerCase().split(/[^a-z0-9]+/))
        .filter((item) => item.length > 2),
    ),
  );
}

function getMatchedSignals(product: BrimProduct, signals: readonly string[]): readonly string[] {
  const searchable = [
    product.slug,
    product.name,
    product.collection,
    collectionLabels[product.collection],
    ...product.materials,
    ...product.fit.sizes,
    product.fit.note,
    product.colors.default,
    ...product.colors.colorways.map((colorway) => colorway.name),
    ...product.tags,
    ...product.badges,
    product.themeHints.colorway,
    ...product.themeHints.mood,
  ]
    .join(" ")
    .toLowerCase();

  return signals.filter((signal) => searchable.includes(signal));
}

function getProductScore(
  product: BrimProduct,
  signals: readonly string[],
  matchedSignals: readonly string[],
): number {
  let score = product.badges.length + matchedSignals.length * 2;

  for (const profile of preferenceProfiles) {
    const profileMatched = profile.signals.some((signal) => signals.includes(signal));
    if (!profileMatched) continue;

    score += product.tags.filter((tag) => profile.tags.includes(tag)).length * 4;
    if ("collection" in profile && product.collection === profile.collection) score += 8;
  }

  if (signals.includes("budget") || signals.includes("value")) {
    score += Math.max(0, 8 - product.priceBaselineCents / 2500);
  }

  if (signals.includes("premium") || signals.includes("luxury")) {
    score += product.priceBaselineCents / 3500;
  }

  return score;
}

function getSelectionReason(product: BrimProduct, matchedSignals: readonly string[]): string {
  if (matchedSignals.length > 0) {
    return `Matches ${matchedSignals.slice(0, 3).join(", ")} in ${collectionLabels[product.collection]}.`;
  }

  return `${collectionLabels[product.collection]} catalog pick with ${product.badges.join(", ").toLowerCase()} positioning.`;
}

function getShipping(
  product: BrimProduct,
  options: {
    giftVisit: boolean;
    urgentVisit: boolean;
    internationalVisit: boolean;
    freeShipping: boolean;
  },
): BrimVisitorOffer["shipping"] {
  if (options.internationalVisit) {
    return {
      speed: "international",
      costCents: 2500,
      display: formatUsd(2500),
      eta: "7-12 business days",
      copy: `${product.name} ships in protective international packaging.`,
    };
  }

  if (options.urgentVisit) {
    return {
      speed: "express",
      costCents: 1800,
      display: formatUsd(1800),
      eta: "2 business days",
      copy: `${product.name} can be prioritized for express delivery.`,
    };
  }

  const baseCostCents = getBaseShippingCost(product.shippingClass);
  const costCents = options.freeShipping ? 0 : baseCostCents;
  const giftCopy = options.giftVisit ? " Gift-ready packing is included in the recommendation." : "";

  const packingCopy = product.shippingClass === "packable"
    ? "flat"
    : product.shippingClass === "kids"
      ? "in lightweight family packing"
      : "securely boxed";

  return {
    speed: "standard",
    costCents,
    display: costCents === 0 ? "Free" : formatUsd(costCents),
    eta: product.shippingClass === "protective" || product.shippingClass === "boxed"
      ? "4-6 business days"
      : "3-5 business days",
    copy: `${product.name} ships ${packingCopy}.${giftCopy}`,
  };
}

function getBaseShippingCost(shippingClass: BrimShippingClass): number {
  switch (shippingClass) {
    case "packable":
      return 595;
    case "kids":
      return 495;
    case "protective":
      return 1095;
    case "boxed":
      return 895;
  }
}

function getPricingCopy(options: {
  budgetSensitive: boolean;
  giftVisit: boolean;
  finalCents: number;
}): string {
  if (options.budgetSensitive) {
    return `Personalized value price: ${formatUsd(options.finalCents)}.`;
  }

  if (options.giftVisit) {
    return `Gift-ready recommendation at ${formatUsd(options.finalCents)}.`;
  }

  return `Personalized price: ${formatUsd(options.finalCents)}.`;
}

function hasAnySignal(signals: readonly string[], candidates: readonly string[]): boolean {
  return candidates.some((candidate) => signals.includes(candidate));
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
