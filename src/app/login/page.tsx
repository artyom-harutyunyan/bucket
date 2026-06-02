import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-stone-500">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
