import type { PageManifest } from "@/lib/manifest/schema";
import { pageManifestSchema } from "@/lib/manifest/schema";
import { getSavedPersonaById } from "@/lib/persona/generate";
import { buildDemoScenario, getDemoScenario } from "./showcase";

export type PrototypeEventType =
  | "run.started"
  | "human.agent.outbound"
  | "shop.agent.accepted"
  | "shop.agent.probe"
  | "human.agent.reveal"
  | "subagent.inventory"
  | "subagent.ui"
  | "sandbox.requested"
  | "sandbox.generated"
  | "sandbox.unavailable"
  | "manifest.ready"
  | "run.failed";

export type PrototypeEvent = {
  type: PrototypeEventType;
  at: string;
  owner: string;
  title: string;
  body: string;
  payload?: unknown;
  manifest?: PageManifest;
};

type SandboxGenerationResult =
  | {
      status: "generated";
      manifest: PageManifest;
      detail: string;
      payload: unknown;
    }
  | {
      status: "unavailable";
      detail: string;
      payload: unknown;
    };

export async function* runPrototypeFlow(personaId?: string): AsyncGenerator<PrototypeEvent> {
  const runId = crypto.randomUUID();
  const savedPersona = await loadSavedPersona(personaId);
  const scenario = savedPersona ? buildDemoScenario(savedPersona) : getDemoScenario(personaId);
  const humanAgentName = `${scenario.persona.name.split(" - ")[0]} Agent`;
  const handoff = scenario.handoff;
  const shopping = handoff.publicContext.shopping;
  const manifest = pageManifestSchema.parse({
    ...scenario.manifest,
    sessionId: runId,
  });
  const collectionSection = manifest.sections.find((section) => section.id === "collection");
  const productNames = getProductNames(manifest);
  const hiddenPref = handoff.privateContext.hiddenPrefs[0];

  yield event({
    type: "run.started",
    owner: "Demo Orchestrator",
    title: "Session created",
    body: `Runtime session ${runId} opened for ${scenario.persona.name}.`,
    payload: { runId, personaId: scenario.persona.id, route: "/api/showcase/run" },
  });
  await pause();

  yield event({
    type: "human.agent.outbound",
    owner: humanAgentName,
    title: "Concierge handoff sent",
    body: "The human-side agent sends BRIM the public persona package and keeps private preferences gated.",
    payload: {
      persona: handoff.personaName,
      intent: handoff.publicContext.intent,
      publicShoppingContext: handoff.publicContext.shopping,
      privateContext: {
        revealPolicy: handoff.privateContext.revealPolicy,
        hiddenPreferenceCount: handoff.privateContext.hiddenPrefs.length,
      },
    },
  });
  await pause();

  yield event({
    type: "shop.agent.accepted",
    owner: "BRIM Shop Agent",
    title: "Handoff validated",
    body: "The shop agent validates the handoff schema and fans work out to inventory, content, UI, and state agents.",
    payload: {
      collections: handoff.negotiationContext.m5Inputs.collections,
      locale: handoff.negotiationContext.m5Inputs.locale,
      density: handoff.negotiationContext.m4Prefs.density,
      m4Prefs: handoff.negotiationContext.m4Prefs,
      m5Inputs: handoff.negotiationContext.m5Inputs,
    },
  });
  await pause();

  if (hiddenPref) {
    yield event({
      type: "shop.agent.probe",
      owner: "BRIM Shop Agent",
      title: "Natural follow-up",
      body: "BRIM asks one specific question before using a private preference.",
      payload: {
        question: "What would make this feel safe enough to buy today?",
      },
    });
    await pause();

    yield event({
      type: "human.agent.reveal",
      owner: humanAgentName,
      title: "Private preference revealed",
      body: "The human-side agent reveals one gated preference because the shop asked a relevant question.",
      payload: { revealedPreference: hiddenPref },
    });
    await pause();
  }

  yield event({
    type: "subagent.inventory",
    owner: "Inventory Agent",
    title: "Assortment and offers generated",
    body: `${productNames.join(", ")} were selected with personalized pricing and delivery copy.`,
    payload: {
      selectedProducts: productNames,
      summary: collectionSection?.props.summary,
      priceRange: shopping.priceSensitivity.targetRange,
      shipping: shopping.shipping,
    },
  });
  await pause();

  yield event({
    type: "subagent.ui",
    owner: "UI Agent",
    title: "Store contract assembled",
    body: `The UI agent sets ${manifest.theme.preset} theme, ${manifest.theme.density} density, and ${manifest.theme.direction} direction.`,
    payload: {
      theme: manifest.theme,
      sections: manifest.sections.map((section) => ({
        id: section.id,
        component: section.component,
        order: section.order,
      })),
    },
  });
  await pause();

  yield event({
    type: "sandbox.requested",
    owner: "Vercel Sandbox Agent",
    title: "Sandbox generation requested",
    body: "The shop agent asks the sandbox compiler to generate the storefront manifest from the handoff and agent outputs.",
    payload: {
      runtime: "node24",
      package: "@vercel/sandbox",
      sessionId: runId,
    },
  });
  await pause();

  const sandboxResult = await runSandboxCompiler({
    runId,
    personaName: scenario.persona.name,
    role: scenario.persona.identity.role,
    manifest,
  });

  if (sandboxResult.status === "generated") {
    yield event({
      type: "sandbox.generated",
      owner: "Vercel Sandbox Agent",
      title: "Sandbox returned manifest",
      body: sandboxResult.detail,
      payload: sandboxResult.payload,
    });
    await pause();
  } else {
    yield event({
      type: "sandbox.unavailable",
      owner: "Vercel Sandbox Agent",
      title: "Sandbox unavailable locally",
      body: sandboxResult.detail,
      payload: sandboxResult.payload,
    });
    await pause();
  }

  const finalManifest =
    sandboxResult.status === "generated" ? sandboxResult.manifest : manifest;

  yield event({
    type: "manifest.ready",
    owner: "BRIM Shop Agent",
    title: "Generated storefront ready",
    body: "The generated PageManifest is now mounted into the BRIM renderer.",
    payload: {
      sessionId: finalManifest.sessionId,
      status: finalManifest.status,
      sectionCount: finalManifest.sections.length,
      generatedBy: sandboxResult.status === "generated" ? "vercel-sandbox" : "local-agent-runtime",
    },
    manifest: finalManifest,
  });
}

async function loadSavedPersona(personaId: string | undefined) {
  if (!personaId || personaId.startsWith("preset-")) return null;

  try {
    return await getSavedPersonaById(personaId);
  } catch {
    return null;
  }
}

function event(input: Omit<PrototypeEvent, "at">): PrototypeEvent {
  return {
    ...input,
    at: new Date().toISOString(),
  };
}

async function runSandboxCompiler(input: {
  runId: string;
  personaName: string;
  role: string;
  manifest: PageManifest;
}): Promise<SandboxGenerationResult> {
  const credentials = getSandboxCredentials();

  if (!credentials.available) {
    return {
      status: "unavailable",
      detail:
        "Vercel Sandbox credentials are not present in this local process. On Vercel, OIDC can create the microVM automatically; locally set VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID.",
      payload: credentials.redacted,
    };
  }

  try {
    const { Sandbox } = await import("@vercel/sandbox");
    const sandbox = await Sandbox.create({
      ...credentials.options,
      runtime: "node24",
      timeout: 60_000,
    });

    try {
      const encodedInput = Buffer.from(JSON.stringify(input), "utf8").toString("base64");
      const script = `
const input = JSON.parse(Buffer.from(process.argv[1], "base64").toString("utf8"));
const manifest = {
  ...input.manifest,
  sessionId: input.runId,
  status: "ready",
  sections: input.manifest.sections.map((section) => ({
    ...section,
    props: {
      ...section.props,
      sandboxGenerated: section.component === "hero" ? true : undefined
    }
  }))
};
console.log(JSON.stringify({
  ok: true,
  manifest,
  proof: {
    generatedInside: "vercel-sandbox",
    personaName: input.personaName,
    role: input.role,
    sectionCount: manifest.sections.length
  }
}));
`;
      const result = await sandbox.runCommand("node", ["-e", script, encodedInput]);
      const stdout = await result.stdout();
      const parsed = JSON.parse(stdout.trim()) as {
        ok: boolean;
        manifest: PageManifest;
        proof: unknown;
      };
      const generatedManifest = pageManifestSchema.parse(parsed.manifest);

      return {
        status: "generated",
        manifest: generatedManifest,
        detail: "The Vercel Sandbox microVM generated and returned the storefront manifest.",
        payload: parsed.proof,
      };
    } finally {
      await sandbox.stop();
    }
  } catch (error) {
    return {
      status: "unavailable",
      detail:
        error instanceof Error
          ? `Vercel Sandbox generation failed: ${error.message}`
          : "Vercel Sandbox generation failed.",
      payload: credentials.redacted,
    };
  }
}

function getSandboxCredentials():
  | { available: true; options: Record<string, string>; redacted: Record<string, string> }
  | { available: false; options: Record<string, never>; redacted: Record<string, string> } {
  const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN);
  const isVercelRuntime = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL);
  const explicit = {
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
  };
  const hasExplicit = Boolean(explicit.token && explicit.teamId && explicit.projectId);
  const redacted = {
    VERCEL_OIDC_TOKEN: hasOidc ? "set" : "missing",
    VERCEL_TOKEN: explicit.token ? "set" : "missing",
    VERCEL_TEAM_ID: explicit.teamId ? "set" : "missing",
    VERCEL_PROJECT_ID: explicit.projectId ? "set" : "missing",
    VERCEL_RUNTIME: isVercelRuntime ? "set" : "missing",
  };

  if (hasExplicit) {
    return {
      available: true,
      options: explicit as Record<string, string>,
      redacted,
    };
  }

  if (hasOidc || isVercelRuntime) {
    return {
      available: true,
      options: {},
      redacted,
    };
  }

  return {
    available: false,
    options: {},
    redacted,
  };
}

function getProductNames(manifest: PageManifest): string[] {
  const collection = manifest.sections.find((section) => section.component === "productList");
  const products = collection?.props.products;

  if (!Array.isArray(products)) return [];

  return products
    .map((product) => {
      if (product && typeof product === "object" && "name" in product) {
        return String(product.name);
      }
      return "";
    })
    .filter(Boolean);
}

function pause() {
  return new Promise((resolve) => setTimeout(resolve, 450));
}
