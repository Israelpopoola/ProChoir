"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SetupNotice } from "@/components/SetupNotice";
import { browserClient, isConfigured } from "@/lib/supabase";
import { useEditor } from "@/lib/useEditor";

export default function MdLayout({ children }: { children: React.ReactNode }) {
  const state = useEditor();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "signed-out") router.replace("/login");
  }, [state.status, router]);

  if (!isConfigured) return <SetupNotice />;
  if (state.status === "loading" || state.status === "signed-out") {
    return <p className="py-16 text-center text-muted">Loading…</p>;
  }

  async function signOut() {
    await browserClient().auth.signOut();
    router.replace("/");
  }

  if (state.status === "not-editor") {
    return (
      <div className="space-y-4 py-10 text-center">
        <h1 className="text-xl font-bold">Not an MD account</h1>
        <p className="text-muted">
          {state.email} is signed in but isn&apos;t on the MD list yet. Ask an admin to add it in Supabase (see README).
        </p>
        <button onClick={signOut} className="btn btn-secondary">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl bg-accent-soft px-4 py-2.5 text-sm">
        <Link href="/md" className="font-semibold text-accent">
          MD dashboard
        </Link>
        <div className="flex items-center gap-3 text-muted">
          <Link href="/" className="hover:text-accent">
            View site
          </Link>
          <Link href="/md/account" className="hover:text-accent">
            Account
          </Link>
          <button onClick={signOut} className="hover:text-accent">
            Sign out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
