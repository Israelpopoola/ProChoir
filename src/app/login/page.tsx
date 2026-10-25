"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SetupNotice } from "@/components/SetupNotice";
import { browserClient, isConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  if (!isConfigured) return <SetupNotice />;

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await browserClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage({ kind: "error", text: error.message });
    else router.replace("/md");
  }

  async function sendLink() {
    if (!email) {
      setMessage({ kind: "error", text: "Type your email first." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await browserClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/md` },
    });
    setBusy(false);
    setMessage(
      error
        ? { kind: "error", text: error.message }
        : { kind: "info", text: "Check your email for a sign-in link." },
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">MD sign in</h1>
        <p className="text-sm text-muted">Only music directors need to sign in. Choir members can just use the site.</p>
      </div>
      <form onSubmit={signIn} className="space-y-3">
        <input className="input" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full" disabled={busy || !password}>
          Sign in
        </button>
        <button type="button" onClick={sendLink} className="btn btn-secondary w-full" disabled={busy}>
          Email me a sign-in link instead
        </button>
      </form>
      {message && (
        <p className={`rounded-xl p-3 text-sm ${message.kind === "error" ? "bg-danger/10 text-danger" : "bg-accent-soft text-accent"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
