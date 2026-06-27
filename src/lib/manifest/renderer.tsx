import { registry } from "./registry";
import { BRIM_ACCENT_COLORS, type PageManifest } from "./schema";

/**
 * Renders a PageManifest. Never throws and never blanks the page:
 * - unknown component kind  -> section skeleton
 * - props fail validation   -> section skeleton
 * - status !== 'ready'       -> a trailing skeleton signals "still building"
 */
export function ManifestRenderer({ manifest }: { manifest: PageManifest }) {
  const sections = [...manifest.sections].sort((a, b) => a.order - b.order);
  const isBuilding = manifest.status !== "ready";
  const accent = manifest.theme.accent ?? manifest.theme.preset;
  const accentColor =
    manifest.theme.accentColor ?? BRIM_ACCENT_COLORS[accent] ?? BRIM_ACCENT_COLORS.heritage;

  return (
    <div
      className="brim-storefront mx-auto flex w-full max-w-7xl flex-col gap-10"
      data-density={manifest.theme.density}
      dir={manifest.theme.direction}
      style={{
        ["--accent" as string]: accentColor,
        ["--brim-accent" as string]: accentColor,
      }}
    >
      {sections.length === 0 && isBuilding ? <ConfiguringShell /> : null}

      {sections.map((section) => {
        const entry = registry[section.component];
        if (!entry) return <SectionSkeleton key={section.id} />;

        const parsed = entry.propsSchema.safeParse(section.props);
        if (!parsed.success) return <SectionSkeleton key={section.id} />;

        const Component = entry.Component;
        return (
          <Component
            key={section.id}
            {...(parsed.data as Record<string, unknown>)}
            contentRefs={section.contentRefs}
            theme={manifest.theme}
          />
        );
      })}

      {sections.length > 0 && isBuilding ? <SectionSkeleton /> : null}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section
      className="grid gap-4 rounded-[var(--b-radius)] border border-[var(--b-line)] bg-[var(--b-bg)] p-4 sm:grid-cols-[220px_1fr]"
      aria-busy
    >
      <div className="brim-skeleton h-40 rounded-[var(--b-radius)]" />
      <div className="flex flex-col justify-center gap-4">
        <div className="brim-skeleton h-5 w-2/3 rounded-full" />
        <div className="brim-skeleton h-4 w-1/2 rounded-full" />
        <div className="brim-skeleton h-10 w-40 rounded-[var(--b-radius)]" />
      </div>
    </section>
  );
}

function ConfiguringShell() {
  return (
    <div className="flex flex-col gap-10" aria-busy>
      <section className="grid overflow-hidden rounded-[var(--b-radius-lg)] border border-[var(--b-line)] bg-[var(--b-bg)] md:grid-cols-[1.4fr_1fr]">
        <div className="flex min-h-[320px] flex-col justify-center gap-5 px-8 py-10 md:px-12">
          <div className="brim-skeleton h-4 w-44 rounded-full" />
          <div className="brim-skeleton h-14 w-3/4 rounded-[var(--b-radius)]" />
          <div className="brim-skeleton h-5 w-1/2 rounded-full" />
          <div className="brim-skeleton h-11 w-40 rounded-[var(--b-radius)]" />
        </div>
        <div className="flex min-h-[300px] items-center justify-center bg-[var(--b-paper)] p-10">
          <div className="brim-skeleton h-48 w-72 rounded-[var(--b-radius-lg)]" />
        </div>
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    </div>
  );
}
