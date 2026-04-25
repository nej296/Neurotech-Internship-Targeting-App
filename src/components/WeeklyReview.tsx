import Link from "next/link";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Company {
  id: string;
  name: string;
  cycleOpensMonth: number | null;
  priority: number;
}

interface Application {
  id: string;
  roleTitle: string;
  status: string;
  lastActivityAt: Date;
  followUpDueAt: Date | null;
  company: { id: string; name: string };
}

interface WeeklyReviewProps {
  openingSoon: Company[];
  followUpsDue: Application[];
  staleApps: Application[];
}

function daysSince(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {count > 0 && (
        <span className="text-xs font-semibold bg-foreground text-white px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default function WeeklyReview({
  openingSoon,
  followUpsDue,
  staleApps,
}: WeeklyReviewProps) {
  const hasAnything =
    openingSoon.length > 0 || followUpsDue.length > 0 || staleApps.length > 0;

  if (!hasAnything) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">This Week</h2>
        <p className="text-sm text-muted border border-border rounded px-4 py-6 text-center">
          Nothing urgent — you&apos;re up to date.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">This Week</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Opening soon */}
        <div className="border border-border rounded p-4">
          <SectionHeader title="Cycles Opening" count={openingSoon.length} />
          {openingSoon.length === 0 ? (
            <p className="text-xs text-muted italic">None this month.</p>
          ) : (
            <ul className="space-y-1.5">
              {openingSoon.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/companies/${c.id}`}
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-xs w-5 h-5 flex items-center justify-center rounded bg-foreground text-white font-semibold shrink-0">
                      {c.priority}
                    </span>
                    <span className="text-sm group-hover:text-accent transition-colors truncate">
                      {c.name}
                    </span>
                    <span className="ml-auto text-xs text-muted shrink-0">
                      {MONTH_NAMES[c.cycleOpensMonth ?? 0]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Follow-ups due */}
        <div className="border border-border rounded p-4">
          <SectionHeader title="Follow-ups Due" count={followUpsDue.length} />
          {followUpsDue.length === 0 ? (
            <p className="text-xs text-muted italic">No follow-ups pending.</p>
          ) : (
            <ul className="space-y-1.5">
              {followUpsDue.map((a) => {
                const overdue = a.followUpDueAt
                  ? new Date(a.followUpDueAt) < new Date()
                  : false;
                return (
                  <li key={a.id}>
                    <Link
                      href={`/companies/${a.company.id}`}
                      className="group block"
                    >
                      <span className="text-sm group-hover:text-accent transition-colors block truncate">
                        {a.company.name}
                      </span>
                      <span
                        className={`text-xs ${
                          overdue ? "text-red-600 font-medium" : "text-muted"
                        }`}
                      >
                        {a.roleTitle} ·{" "}
                        {overdue
                          ? "Overdue"
                          : `Due ${a.followUpDueAt
                              ? new Date(a.followUpDueAt).toLocaleDateString()
                              : ""}`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Stale applications */}
        <div className="border border-border rounded p-4">
          <SectionHeader title="No Response 14d+" count={staleApps.length} />
          {staleApps.length === 0 ? (
            <p className="text-xs text-muted italic">All applications active.</p>
          ) : (
            <ul className="space-y-1.5">
              {staleApps.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/companies/${a.company.id}`}
                    className="group block"
                  >
                    <span className="text-sm group-hover:text-accent transition-colors block truncate">
                      {a.company.name}
                    </span>
                    <span className="text-xs text-amber-600">
                      {a.roleTitle} · {daysSince(a.lastActivityAt)}d ago
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
