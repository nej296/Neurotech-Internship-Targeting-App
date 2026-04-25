import Link from "next/link";

const MONTH_SHORT = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const LANE_COLORS: Record<string, string> = {
  neurotech: "#2563eb",
  biotech:   "#16a34a",
  defense:   "#d97706",
  ai_ml:     "#7c3aed",
  academic_lab: "#64748b",
};

// Returns 0-based index into the 6-month window, or -1 if outside
function getBarCols(
  opensMonth: number,
  closesMonth: number,
  windowMonths: Array<{ year: number; month: number }>
): { start: number; end: number } | null {
  const wraps = closesMonth < opensMonth; // e.g. Oct(10)–Feb(2)

  const inCycle = windowMonths.map(({ month }) => {
    return wraps
      ? month >= opensMonth || month <= closesMonth
      : month >= opensMonth && month <= closesMonth;
  });

  const start = inCycle.indexOf(true);
  if (start === -1) return null;

  let end = start;
  for (let i = start + 1; i < inCycle.length; i++) {
    if (inCycle[i]) end = i;
    else break;
  }

  return { start, end };
}

interface Company {
  id: string;
  name: string;
  lane: string;
  priority: number;
  cycleOpensMonth: number | null;
  cycleClosesMonth: number | null;
}

interface CycleCalendarProps {
  companies: Company[];
}

export default function CycleCalendar({ companies }: CycleCalendarProps) {
  const now = new Date();
  const MONTHS = 6;

  // Build the 6-month window starting from current month
  const windowMonths = Array.from({ length: MONTHS }, (_, i) => {
    const totalMonth = now.getMonth() + i; // 0-based
    return {
      year: now.getFullYear() + Math.floor(totalMonth / 12),
      month: (totalMonth % 12) + 1, // 1-based
    };
  });

  // Separate into companies with cycles and rolling
  const withCycle = companies.filter(
    (c) => c.cycleOpensMonth !== null && c.cycleClosesMonth !== null
  );
  const rolling = companies.filter(
    (c) => c.cycleOpensMonth === null
  );

  const colPct = 100 / MONTHS;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recruiting Calendar</h2>
        <div className="flex items-center gap-4 text-xs text-muted">
          {Object.entries(LANE_COLORS).map(([lane, color]) => (
            <span key={lane} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ background: color, opacity: 0.7 }}
              />
              {lane === "ai_ml" ? "AI / ML" : lane === "academic_lab" ? "Academic" : lane.charAt(0).toUpperCase() + lane.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="border border-border rounded overflow-hidden">
        {/* Month headers */}
        <div className="flex border-b border-border bg-surface">
          <div className="w-40 shrink-0 px-3 py-2 text-xs text-muted font-medium border-r border-border">
            Company
          </div>
          <div className="flex-1 flex">
            {windowMonths.map(({ year, month }, i) => (
              <div
                key={i}
                className="flex-1 px-2 py-2 text-xs text-muted font-medium text-center border-r border-border last:border-r-0"
              >
                {MONTH_SHORT[month]}
                {month === 1 && (
                  <span className="block text-[10px] text-muted/60">{year}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Company rows */}
        {companies.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted">
            No companies in target database.
          </div>
        )}

        {withCycle.map((company) => {
          const bar = getBarCols(
            company.cycleOpensMonth!,
            company.cycleClosesMonth!,
            windowMonths
          );
          const color = LANE_COLORS[company.lane] ?? "#6b7280";

          return (
            <div
              key={company.id}
              className="flex border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
            >
              {/* Company name */}
              <div className="w-40 shrink-0 px-3 py-2.5 border-r border-border flex items-center gap-2">
                <span
                  className="w-4 h-4 flex items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                  style={{ background: color }}
                >
                  {company.priority}
                </span>
                <Link
                  href={`/companies/${company.id}`}
                  className="text-xs font-medium truncate hover:text-accent transition-colors"
                >
                  {company.name}
                </Link>
              </div>

              {/* Timeline bar area */}
              <div className="flex-1 relative py-2.5 px-1">
                {bar ? (
                  <Link
                    href={`/companies/${company.id}`}
                    className="absolute top-2 bottom-2 rounded flex items-center px-2 transition-opacity hover:opacity-80"
                    style={{
                      left: `${bar.start * colPct}%`,
                      width: `${(bar.end - bar.start + 1) * colPct}%`,
                      background: color,
                      opacity: 0.8,
                    }}
                    title={`${company.name}: ${MONTH_SHORT[company.cycleOpensMonth!]}–${MONTH_SHORT[company.cycleClosesMonth!]}`}
                  >
                    <span className="text-[10px] text-white font-medium truncate">
                      {MONTH_SHORT[company.cycleOpensMonth!]}–{MONTH_SHORT[company.cycleClosesMonth!]}
                    </span>
                  </Link>
                ) : (
                  <div className="h-full flex items-center">
                    <span className="text-[10px] text-muted/40 px-2">
                      outside window
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Rolling companies footer */}
        {rolling.length > 0 && (
          <div className="px-4 py-2.5 bg-surface/50 border-t border-border">
            <span className="text-xs text-muted">
              Rolling cycle:{" "}
              {rolling.map((c, i) => (
                <span key={c.id}>
                  <Link
                    href={`/companies/${c.id}`}
                    className="hover:text-accent transition-colors"
                  >
                    {c.name}
                  </Link>
                  {i < rolling.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
