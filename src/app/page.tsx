import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-20">
      <header className="flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit">
          <Sparkles data-icon="inline-start" />
          Agent Concierge
        </Badge>
        <h1 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
          A site that assembles itself around your agent
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Your personal agent arrives ahead of you, negotiates your preferences with our engine,
          and the page reconfigures — purpose-built for this visit.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/showcase">
          <Card className="h-full transition-all hover:ring-foreground/20">
            <CardHeader>
              <CardTitle>Four-persona showcase</CardTitle>
              <CardDescription>
                Run the demo handoff: persona, agents, custom BRIM storefront.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/persona">
          <Card className="h-full transition-all hover:ring-foreground/20">
            <CardHeader>
              <CardTitle>Persona Studio</CardTitle>
              <CardDescription>
                Develop the human your agent represents. Author or generate a persona.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/demo">
          <Card className="h-full transition-all hover:ring-foreground/20">
            <CardHeader>
              <CardTitle>Manifest demo</CardTitle>
              <CardDescription>
                See a page rendered live from a declarative manifest + component registry.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div>
        <Button render={<Link href="/showcase" />}>
          Run the four-persona demo
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </main>
  );
}
