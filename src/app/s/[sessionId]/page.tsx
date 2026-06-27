import { LiveManifest } from "./LiveManifest";

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <LiveManifest sessionId={sessionId} />
    </main>
  );
}
