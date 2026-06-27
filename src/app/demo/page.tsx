import { ManifestRenderer } from "@/lib/manifest/renderer";
import { sampleManifest } from "@/lib/manifest/sample";

/**
 * M2 demo: renders a hardcoded PageManifest through the registry. Includes one
 * intentionally-malformed section to show the skeleton fallback (never blanks).
 */
export default function DemoPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <ManifestRenderer manifest={sampleManifest} />
    </main>
  );
}
