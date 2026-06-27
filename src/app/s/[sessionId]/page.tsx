import { LiveManifest } from "./LiveManifest";

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <LiveManifest sessionId={sessionId} />
    </main>
  );
}
