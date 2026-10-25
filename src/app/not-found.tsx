import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-xl font-bold">Not found</h1>
      <p className="mb-6 text-muted">That song or set list may have been removed.</p>
      <Link href="/" className="btn btn-primary">
        Back to set lists
      </Link>
    </div>
  );
}
