"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companies", label: "Companies" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/projects", label: "Projects" },
  { href: "/profile", label: "Profile" },
];

export default function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-orbital transition-colors group-hover:border-cyan-200/70">
            <Activity size={17} />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-white">
              Neurotarget
            </span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-muted">
              Internship Ops
            </span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-cyan-300 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.25)] font-medium"
                  : "text-muted hover:bg-white/[0.06] hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
