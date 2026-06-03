"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/components/loading-provider";
import { Button, Card, Input, Label } from "@/components/ui";

export function LoginForm() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Invalid username or password");
      return;
    }

    const from = searchParams.get("from");
    router.push(from && from !== "/login" ? from : "/items");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="text-lg font-semibold text-stone-900">Sign in</h1>
      <p className="mt-1 text-sm text-stone-500">
        Welcome to the Bucket app. Please enter your credentials to continue.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div>
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
