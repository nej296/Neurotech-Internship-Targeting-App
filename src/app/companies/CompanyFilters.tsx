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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted font-medium uppercase tracking-wide mr-1">Lane</span>
      {LANES.map((l) => (
        <button
          key={l.value}
          onClick={() => update("lane", lane === l.value ? "" : l.value)}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
            lane === l.value
              ? "border-accent bg-accent text-white"
              : "border-border text-muted hover:border-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}

      <span className="text-xs text-muted font-medium uppercase tracking-wide ml-4 mr-1">P</span>
      {PRIORITIES.map((p) => (
        <button
          key={p}
          onClick={() => update("priority", priority === String(p) ? "" : String(p))}
          className={`w-8 h-8 text-xs rounded border transition-colors ${
            priority === String(p)
              ? "border-accent bg-accent text-white font-semibold"
              : "border-border text-muted hover:border-foreground hover:text-foreground"
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
