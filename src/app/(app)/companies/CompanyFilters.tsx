"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const LANES = [
  { value: "neurotech", label: "Neurotech" },
  { value: "biotech", label: "Biotech" },
  { value: "defense", label: "Defense" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "academic_lab", label: "Academic" },
];

const PRIORITIES = [1, 2, 3, 4, 5];

export default function CompanyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lane = searchParams.get("lane") ?? "";
  const priority = searchParams.get("priority") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/companies?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-surface p-3 backdrop-blur-xl">
      <span className="mr-1 text-xs font-medium uppercase tracking-[0.22em] text-muted">Lane</span>
      {LANES.map((l) => (
        <button
          key={l.value}
          onClick={() => update("lane", lane === l.value ? "" : l.value)}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            lane === l.value
              ? "border-accent bg-accent text-slate-950"
              : "border-white/10 text-muted hover:border-cyan-300/60 hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}

      <span className="ml-4 mr-1 text-xs font-medium uppercase tracking-[0.22em] text-muted">P</span>
      {PRIORITIES.map((p) => (
        <button
          key={p}
          onClick={() => update("priority", priority === String(p) ? "" : String(p))}
          className={`h-8 w-8 rounded-full border text-xs transition-colors ${
            priority === String(p)
              ? "border-accent bg-accent font-semibold text-slate-950"
              : "border-white/10 text-muted hover:border-cyan-300/60 hover:text-foreground"
          }`}
        >
          {p}
        </button>
      ))}

      {(lane || priority) && (
        <button
          onClick={() => router.push("/companies")}
          className="ml-2 text-xs text-muted hover:text-foreground underline underline-offset-2"
        >
          Clear
        </button>
      )}
    </div>
  );
}
