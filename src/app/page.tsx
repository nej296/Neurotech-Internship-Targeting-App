import { prisma } from "@/lib/db";
import Link from "next/link";
import WeeklyReview from "@/components/WeeklyReview";
import CycleCalendar from "@/components/CycleCalendar";

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
    <div className="space-y-12">
      {/* This Week */}
      <WeeklyReview
        openingSoon={openingSoon}
        followUpsDue={followUpsDue}
        staleApps={staleApps}
      />

      {/* Cycle Calendar */}
      <CycleCalendar companies={companies} />

      {/* Pipeline Summary */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pipeline</h2>
          <Link
            href="/pipeline"
            className="text-xs text-accent hover:underline"
          >
            Open kanban →
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-sm text-muted border border-border rounded px-4 py-6 text-center">
            No applications yet.{" "}
            <Link href="/companies" className="text-accent underline">
              Add one from a company page.
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0;
              const isTerminal =
                status === "rejected" || status === "ghosted";
              return (
                <Link
                  key={status}
                  href="/pipeline"
                  className="border border-border rounded p-3 text-center hover:border-accent transition-colors group"
                >
                  <div
                    className={`text-2xl font-semibold tabular-nums mb-1 ${
                      count > 0 && !isTerminal
                        ? "text-foreground"
                        : "text-muted"
                    }`}
                  >
                    {count}
                  </div>
                  <div className="text-xs text-muted group-hover:text-foreground transition-colors">
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
