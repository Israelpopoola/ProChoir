import { PinForm } from "./PinForm";

export const metadata = { title: "Choir PIN" };

export default async function PinPage({ searchParams }: PageProps<"/pin">) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-xs space-y-6 pt-12 text-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Choir PIN</h1>
        <p className="text-sm text-muted">Enter the PIN from the choir WhatsApp group. You only need to do this once on this device.</p>
      </div>
      <PinForm next={typeof next === "string" ? next : "/"} />
    </div>
  );
}
