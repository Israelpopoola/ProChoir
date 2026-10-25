"use client";

import { useEffect, useState } from "react";
import { browserClient, isConfigured } from "./supabase";

export type EditorState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-editor"; email: string }
  | { status: "ok"; email: string };

export function useEditor(): EditorState {
  const [state, setState] = useState<EditorState>({ status: isConfigured ? "loading" : "signed-out" });

  useEffect(() => {
    if (!isConfigured) return;
    const db = browserClient();
    let cancelled = false;

    async function check() {
      const { data } = await db.auth.getSession();
      const email = data.session?.user.email;
      if (!email) {
        if (!cancelled) setState({ status: "signed-out" });
        return;
      }
      const { data: ok } = await db.rpc("is_editor");
      if (!cancelled) setState(ok ? { status: "ok", email } : { status: "not-editor", email });
    }

    check();
    const { data: sub } = db.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") check();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
