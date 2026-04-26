import { prisma } from "@/lib/db";
import Link from "next/link";
import KanbanBoard from "./KanbanBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const applications = await prisma.application.findMany({
    include: {
      company: { select: { id: true, name: true } },
    },
    orderBy: { lastActivityAt: "desc" },
  });

  const total = applications.length;
  const active = applications.filter(
    (a) => !["rejected", "ghosted"].includes(a.status)
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Application Flow
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-muted">
            {total} application{total !== 1 ? "s" : ""} — {active} active
          </p>
        </div>
        <p className="text-xs text-muted">
          Drag cards between columns to update status.
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-surface p-12 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
          <p className="text-sm text-muted">No applications yet.</p>
          <p className="text-xs text-muted mt-1">
            Add applications from a{" "}
            <Link href="/companies" className="text-accent underline">
              company detail page
            </Link>
            .
          </p>
        </div>
      ) : (
        <KanbanBoard applications={applications} />
      )}
    </div>
  );
}
