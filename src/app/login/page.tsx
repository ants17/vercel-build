import { LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeRedirectPath } from "@/lib/auth/password";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  const action = next === "/"
    ? "/api/auth/login"
    : `/api/auth/login?next=${encodeURIComponent(next)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader className="gap-3">
          <Badge variant="secondary" className="w-fit">
            <LockKeyhole data-icon="inline-start" />
            BRIM Preview
          </Badge>
          <CardTitle className="font-heading text-2xl">Enter password</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} method="post" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
              />
            </div>
            {params.error ? (
              <p className="text-sm text-destructive">That password did not match.</p>
            ) : null}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
