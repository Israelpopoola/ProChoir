"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase";

export default function AccountPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await browserClient().auth.updateUser({ password });
    setBusy(false);
    setMsg(error ? error.message : "Password saved. You can sign in with it next time.");
    if (!error) setPassword("");
  }

  return (
    <form onSubmit={save} className="max-w-sm space-y-3">
      <h1 className="text-xl font-bold">Set your password</h1>
      <p className="text-sm text-muted">Signed in with an email link? Set a password so you can sign in without waiting for an email.</p>
      <input
        className="input"
        type="password"
        autoComplete="new-password"
        minLength={8}
        placeholder="New password (8+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className="btn btn-primary w-full" disabled={busy}>
        Save password
      </button>
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </form>
  );
}
