"use client";

import { useActionState } from "react";
import { enterPin } from "./actions";

export function PinForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(enterPin, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input
        name="pin"
        className="input text-center text-2xl tracking-[0.4em]"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        placeholder="••••"
        required
      />
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Checking…" : "Enter"}
      </button>
      {error && <p className="rounded-xl bg-danger/10 p-3 text-center text-sm text-danger">{error}</p>}
    </form>
  );
}
