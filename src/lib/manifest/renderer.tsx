import { Skeleton } from "@/components/ui/skeleton";
import { registry } from "./registry";
import type { PageManifest } from "./schema";

/**
 * Renders a PageManifest. Never throws and never blanks the page:
 * - unknown component kind  -> section skeleton
 * - props fail validation   -> section skeleton
 * - status !== 'ready'       -> a trailing skeleton signals "still building"
 */
export function ManifestRenderer({ manifest }: { manifest: PageManifest }) {
  const sections = [...manifest.sections].sort((a, b) => a.order - b.order);
  const isBuilding = manifest.status !== "ready";

  return (
    <div
      className="flex flex-col gap-16"
      style={{ ["--accent" as string]: manifest.theme.accentColor }}
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
          />
        );
      })}

      {sections.length > 0 && isBuilding ? <SectionSkeleton /> : null}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section className="flex flex-col gap-4" aria-busy>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
    </section>
  );
}

function ConfiguringShell() {
  return (
    <div className="flex flex-col gap-16" aria-busy>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-10 w-40" />
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
