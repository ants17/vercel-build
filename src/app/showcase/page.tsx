import { getDemoScenarios } from "@/lib/demo/showcase";
import { listSavedPersonas } from "@/lib/persona/generate";
import { ShowcaseRunner, type ShowcaseScenarioCard } from "./ShowcaseRunner";

type ShowcasePageProps = {
  searchParams: Promise<{ persona?: string }>;
};

export default async function ShowcasePage({ searchParams }: ShowcasePageProps) {
  const params = await searchParams;
  const scenarios = getDemoScenarios();
  const savedPersonas = await loadSavedPersonas();
  const cards: ShowcaseScenarioCard[] = [
    ...savedPersonas.map((persona) => ({
      id: persona.id,
      name: persona.name,
      role: persona.identity.role,
      language: persona.preferences.language.language,
      locale: persona.preferences.language.locale,
      signals: [
        persona.preferences.language.locale,
        persona.preferences.density,
        persona.preferences.priceSensitivity.targetRange,
        persona.preferences.collectionInterests[0]?.collection ?? "BRIM",
      ],
    })),
    ...scenarios.map((scenario) => {
      const shopping = scenario.handoff.publicContext.shopping;

      return {
        id: scenario.persona.id,
        name: scenario.persona.name,
        role: scenario.persona.identity.role,
        language: shopping.language.language,
        locale: shopping.language.locale,
        signals: scenario.storefrontSignals,
      };
    }),
  ];
  const initialPersonaId =
    cards.find((scenario) => scenario.id === params.persona)?.id ?? cards[0]?.id ?? "preset-maya";

  return <ShowcaseRunner initialPersonaId={initialPersonaId} scenarios={cards} />;
}

async function loadSavedPersonas() {
  try {
    return await listSavedPersonas();
  } catch {
    return [];
  }
}
