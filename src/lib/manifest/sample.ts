import type { PageManifest } from "./schema";

/**
 * A BRIM storefront manifest for /demo. It exercises every storefront section
 * plus ready, partial, and skeleton product card states.
 */
export const sampleManifest: PageManifest = {
  version: 1,
  sessionId: "demo",
  status: "ready",
  theme: {
    preset: "heritage",
    accent: "heritage",
    density: "comfortable",
    direction: "ltr",
  },
  sections: [
    {
      id: "hero",
      component: "hero",
      order: 0,
      props: {
        eyebrow: "New · Autumn felts",
        headline: "Find the hat that finds you.",
        subheadline:
          "Your agent already knows your size, your style, and the weather where you're headed. We just bring the hats.",
        primaryCta: { label: "Shop the collection", href: "#collection" },
        secondaryCta: { label: "Take the fit quiz", href: "#fit" },
        imageUrl: "/inventory/carter-fedora.png",
        imageAlt: "Brown felt Carter fedora",
      },
    },
    {
      id: "filters",
      component: "filterBar",
      order: 1,
      props: {
        active: "all",
        resultLabel: "48 styles",
        sortLabel: "Sort · Featured",
        categories: [
          { label: "All", value: "all", count: 48 },
          { label: "Fedoras", value: "fedoras", count: 14 },
          { label: "Caps", value: "caps", count: 11 },
          { label: "Beanies", value: "beanies", count: 9 },
          { label: "Straw", value: "straw", count: 8 },
        ],
      },
    },
    {
      id: "collection",
      component: "productList",
      order: 2,
      props: {
        eyebrow: "The collection",
        title: "Men's",
        summary: "8 styles · everyday & tailored",
        layout: "grid",
        products: [
          {
            state: "ready",
            id: "carter-fedora",
            name: "The Carter Fedora",
            price: "$98",
            description: "Rabbit-felt · wide brim",
            imageUrl: "/inventory/carter-fedora.png",
            imageAlt: "Brown felt fedora",
            badge: "Best seller",
            sizes: "S-XL",
            colors: [
              { name: "Heritage", value: "#7B2D3A" },
              { name: "Field", value: "#3E5236" },
              { name: "Coastal", value: "#1E3A5F" },
            ],
          },
          {
            state: "partial",
            id: "lido-panama",
            name: "The Lido Panama",
            description: "Toquilla straw · packable",
            imageUrl: "/inventory/lido-panama.png",
            imageAlt: "Natural straw panama hat",
            sizes: "S-L",
          },
          {
            state: "skeleton",
            id: "configuring-card",
          },
          {
            state: "ready",
            id: "dock-beanie",
            name: "The Dock Beanie",
            price: "$42",
            description: "Merino rib · cuffed",
            imageUrl: "/inventory/dock-beanie.png",
            imageAlt: "Green knit beanie",
            badge: "New",
            sizes: "One size",
            colors: [
              { name: "Field", value: "#3E5236" },
              { name: "Mono", value: "#111111" },
            ],
          },
        ],
      },
    },
    {
      id: "stats",
      component: "statCallout",
      order: 3,
      props: {
        title: "Fitted by agents",
        tone: "dark",
        stats: [
          { label: "heads fitted this year", value: "12.4k" },
          { label: "avg. fit rating", value: "4.8" },
          { label: "ready-to-ship styles", value: "48" },
        ],
      },
    },
    {
      id: "testimonial",
      component: "testimonial",
      order: 4,
      props: {
        quote:
          "I told my agent 'something for the rain, nothing flashy.' It picked the waxed bucket. Perfect.",
        author: "Maya R.",
        role: "fitted",
        place: "Seattle",
      },
    },
    {
      id: "faq",
      component: "faqAccordion",
      order: 5,
      props: {
        title: "Fit questions",
        openIndex: 0,
        items: [
          {
            question: "How do you size a hat for me?",
            answer:
              "Your agent passes your head measurement or usual size at arrival. We map it to each maker's sizing and only show styles that come in your fit.",
          },
          {
            question: "Can I return a fitted hat?",
            answer:
              "Yes. Unworn fitted hats can be returned within 30 days, and your agent keeps the fit notes so the next recommendation is better.",
          },
          {
            question: "Do you ship internationally?",
            answer:
              "Most BRIM styles ship internationally. Duties and timelines appear before checkout when your agent provides the destination.",
          },
        ],
      },
    },
    {
      id: "compact-row",
      component: "productList",
      order: 6,
      props: {
        eyebrow: "Density · compact",
        layout: "list",
        density: "compact",
        products: [
          {
            state: "ready",
            id: "brooklyn-cap",
            name: "The Brooklyn Cap",
            price: "$38",
            description: "Cotton twill · 6-panel",
            imageUrl: "/inventory/brooklyn-cap.png",
            imageAlt: "Navy baseball cap",
          },
          {
            state: "ready",
            id: "harbor-bucket",
            name: "The Harbor Bucket",
            price: "$68",
            description: "Waxed cotton · packable",
            imageUrl: "/inventory/harbor-bucket.png",
            imageAlt: "Dark green bucket hat",
          },
          {
            state: "ready",
            id: "carrick-flatcap",
            name: "The Carrick Flat Cap",
            price: "$58",
            description: "Wool herringbone · lined",
            imageUrl: "/inventory/carrick-flatcap.png",
            imageAlt: "Grey flat cap",
          },
        ],
      },
    },
    {
      id: "cta",
      component: "ctaBanner",
      order: 7,
      props: {
        eyebrow: "Not sure what fits?",
        headline: "Let your agent pick three.",
        body: "Choose a direction and BRIM will hold a short list while your agent compares fit, color, and delivery windows.",
        cta: { label: "Start the fit quiz", href: "#fit" },
      },
    },
  ],
};
