"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, MusicIcon } from "./icons";

const tabs = [
  { href: "/", label: "Set lists", Icon: CalendarIcon, match: (p: string) => p === "/" || p.startsWith("/setlists") || p === "/past" },
  { href: "/songs", label: "Songs", Icon: MusicIcon, match: (p: string) => p.startsWith("/songs") },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/md") || pathname === "/login") return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${active ? "text-accent" : "text-muted"}`}
            >
              <Icon className="size-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
