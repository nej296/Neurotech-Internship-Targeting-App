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
      <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        {title}
      </h3>
      {count > 0 && (
        <span className="rounded-full bg-cyan-300 px-1.5 py-0.5 text-xs font-semibold text-slate-950">
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
      <section className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-semibold text-white">This Week</h2>
        <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-center text-sm text-muted">
          Nothing urgent — you&apos;re up to date.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h2 className="mb-4 text-lg font-semibold text-white">This Week</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Opening soon */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
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
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-300 text-xs font-semibold text-slate-950">
                      {c.priority}
                    </span>
                    <span className="truncate text-sm transition-colors group-hover:text-accent">
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
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
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
                          overdue ? "text-red-300 font-medium" : "text-muted"
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
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
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
                    <span className="text-xs text-amber-300">
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
