import { prisma } from "@/lib/db";
import Link from "next/link";
import WeeklyReview from "@/components/WeeklyReview";
import CycleCalendar from "@/components/CycleCalendar";
import DashboardOrbit from "@/components/DashboardOrbit";

export const dynamic = "force-dynamic";

const STATUS_ORDER = [
  "target", "applied", "screen", "interview", "offer", "rejected", "ghosted",
] as const;

const STATUS_LABELS: Record<string, string> = {
  target: "Target",
  applied: "Applied",
  screen: "Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

export default async function DashboardPage() {
  const [companies, applications] = await Promise.all([
    prisma.company.findMany({
      orderBy: [{ priority: "asc" }, { name: "asc" }],
    }),
    prisma.application.findMany({
      include: { company: { select: { id: true, name: true } } },
      orderBy: { lastActivityAt: "desc" },
    }),
  ]);

  // --- This Week calculations ---
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 86_400_000);
  const currentMonth = now.getMonth() + 1; // 1-based
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const openingSoon = companies.filter(
    (c) =>
      c.cycleOpensMonth === currentMonth || c.cycleOpensMonth === nextMonth
  );

  const followUpsDue = applications.filter(
    (a) => a.followUpDueAt && new Date(a.followUpDueAt) <= in7Days
  );

  const staleApps = applications.filter((a) => {
    if (["offer", "rejected", "ghosted"].includes(a.status)) return false;
    const ms = now.getTime() - new Date(a.lastActivityAt).getTime();
    return ms / 86_400_000 > 14;
  });

  // --- Pipeline summary ---
  const statusCounts = applications.reduce<Record<string, number>>(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const activeCount = applications.filter(
    (a) => !["rejected", "ghosted"].includes(a.status)
  ).length;

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
            Command Dashboard
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Convert recruiting timing into action.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted md:text-base">
            A live operating surface for target companies, application motion,
            and follow-up risk across the neurotech internship hunt.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-3xl font-semibold text-white tabular-nums">
                {companies.length}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                Targets
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-3xl font-semibold text-cyan-200 tabular-nums">
                {openingSoon.length}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                Opening Soon
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-3xl font-semibold text-emerald-200 tabular-nums">
                {activeCount}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                Active Apps
              </div>
            </div>
          </div>
        </div>
        <DashboardOrbit
          targetCount={companies.length}
          openingSoonCount={openingSoon.length}
          followUpsDueCount={followUpsDue.length}
          staleAppsCount={staleApps.length}
          activeCount={activeCount}
        />
      </section>

      <WeeklyReview
        openingSoon={openingSoon}
        followUpsDue={followUpsDue}
        staleApps={staleApps}
      />

      {/* Cycle Calendar */}
      <CycleCalendar companies={companies} />

      {/* Pipeline Summary */}
      <section className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Pipeline</h2>
          <Link
            href="/pipeline"
            className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200 hover:text-white"
          >
            Open kanban →
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-center text-sm text-muted">
            No applications yet.{" "}
            <Link href="/companies" className="text-accent underline">
              Add one from a company page.
            </Link>
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0;
              const isTerminal =
                status === "rejected" || status === "ghosted";
              return (
                <Link
                  key={status}
                  href="/pipeline"
                  className="group rounded-2xl border border-white/10 bg-black/20 p-3 text-center transition-colors hover:border-cyan-300/60 hover:bg-cyan-300/10"
                >
                  <div
                    className={`text-2xl font-semibold tabular-nums mb-1 ${
                      count > 0 && !isTerminal
                        ? "text-white"
                        : "text-muted"
                    }`}
                  >
                    {count}
                  </div>
                  <div className="text-xs text-muted transition-colors group-hover:text-foreground">
                    {STATUS_LABELS[status]}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {activeCount > 0 && (
          <p className="mt-3 text-xs text-muted">
            {activeCount} active application{activeCount !== 1 ? "s" : ""}
          </p>
        )}
      </section>
    </div>
  );
}
