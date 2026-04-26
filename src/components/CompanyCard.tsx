import Link from "next/link";

const LANE_LABELS: Record<string, string> = {
  neurotech: "Neurotech",
  biotech: "Biotech",
  defense: "Defense",
  ai_ml: "AI / ML",
  academic_lab: "Academic",
};

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface CompanyCardProps {
  id: string;
  name: string;
  lane: string;
  priority: number;
  careerPageUrl: string;
  cycleOpensMonth: number | null;
  cycleClosesMonth: number | null;
  rolesHiredBs: string;
  warmIntros: string | null;
  applicationCount: number;
}

export default function CompanyCard({
  id,
  name,
  lane,
  priority,
  cycleOpensMonth,
  cycleClosesMonth,
  warmIntros,
  applicationCount,
}: CompanyCardProps) {
  const cycleStr =
    cycleOpensMonth && cycleClosesMonth
      ? `${MONTH_NAMES[cycleOpensMonth]}–${MONTH_NAMES[cycleClosesMonth]}`
      : "Rolling";

  const introCount = warmIntros
    ? warmIntros.split("\n").filter((l) => l.trim()).length
    : 0;

  return (
    <Link
      href={`/companies/${id}`}
      className="group flex items-center gap-4 border-b border-white/10 px-4 py-3 transition-colors hover:bg-cyan-300/5"
    >
      {/* Priority */}
      <span
        className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold shrink-0"
        style={{
          background:
            priority === 1
              ? "#22d3ee"
              : priority === 2
                ? "#34d399"
                : "#475569",
          color: priority <= 2 ? "#031016" : "#fff",
        }}
      >
        {priority}
      </span>

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium text-white transition-colors group-hover:text-accent">
        {name}
      </span>

      {/* Lane badge */}
      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted">
        {LANE_LABELS[lane] ?? lane}
      </span>

      {/* Cycle window */}
      <span className="shrink-0 w-28 text-xs text-muted text-right tabular-nums">
        {cycleStr}
      </span>

      {/* Intros */}
      <span className="shrink-0 w-16 text-xs text-muted text-right tabular-nums">
        {introCount > 0 ? `${introCount} intro${introCount !== 1 ? "s" : ""}` : "—"}
      </span>

      {/* Apps */}
      <span className="shrink-0 w-16 text-xs text-muted text-right tabular-nums">
        {applicationCount > 0
          ? `${applicationCount} app${applicationCount !== 1 ? "s" : ""}`
          : "—"}
      </span>
    </Link>
  );
}
