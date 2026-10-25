export function SetupNotice() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 text-sm leading-relaxed">
      <h2 className="mb-2 text-lg font-semibold">Almost there</h2>
      <p className="text-muted">
        The app isn&apos;t connected to Supabase yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your Vercel project&apos;s environment variables (or a{" "}
        <code>.env.local</code> file), then redeploy. See the README for the full steps.
      </p>
    </div>
  );
}
