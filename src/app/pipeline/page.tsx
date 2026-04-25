import { prisma } from "@/lib/db";
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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-muted">
            {total} application{total !== 1 ? "s" : ""} — {active} active
          </p>
        </div>
        <p className="text-xs text-muted">
          Drag cards between columns to update status.
        </p>
      </div>

      {total === 0 ? (
        <div className="border border-border rounded p-12 text-center">
          <p className="text-sm text-muted">No applications yet.</p>
          <p className="text-xs text-muted mt-1">
            Add applications from a{" "}
            <a href="/companies" className="text-accent underline">
              company detail page
            </a>
            .
          </p>
        </div>
      ) : (
        <KanbanBoard applications={applications} />
      )}
    </div>
  );
}
