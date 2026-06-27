"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getBrowserClient } from "@/lib/db/supabase";
import { ManifestRenderer } from "@/lib/manifest/renderer";
import { pageManifestSchema, type PageManifest } from "@/lib/manifest/schema";

export function LiveManifest({ sessionId }: { sessionId: string }) {
  const [manifest, setManifest] = useState<PageManifest | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    let cancelled = false;

    async function init() {
      const { data } = await supabase
        .from("manifests")
        .select("doc")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (cancelled) return;
      const parsed = pageManifestSchema.safeParse(data?.doc);
      if (parsed.success) setManifest(parsed.data);
    }

    init();

    const channel = supabase
      .channel(`manifest-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manifests", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const next = pageManifestSchema.safeParse(
            (payload.new as { doc?: unknown })?.doc
          );
          if (next.success) setManifest(next.data);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  if (manifest === null) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Your agent is configuring this page…
          </h2>
          <p className="text-sm text-muted-foreground">
            Hang tight — this usually takes a few seconds.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return <ManifestRenderer manifest={manifest} />;
}
