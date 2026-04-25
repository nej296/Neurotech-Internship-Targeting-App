import { prisma } from "@/lib/db";
import ProjectList from "./ProjectList";
import NewProjectForm from "./NewProjectForm";

export const dynamic = "force-dynamic";

const STATUS_ORDER = { shipped: 0, in_progress: 1, idea: 2 };

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  const sorted = [...projects].sort(
    (a, b) =>
      (STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] ?? 3) -
      (STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] ?? 3)
  );

  const shipped = projects.filter((p) => p.status === "shipped").length;
  const inProgress = projects.filter((p) => p.status === "in_progress").length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length} total — {shipped} shipped, {inProgress} in progress
          </p>
        </div>
        <NewProjectForm />
      </div>

      <ProjectList projects={sorted} />

      {projects.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Click a row to expand and edit. Click the status badge to cycle it.
        </p>
      )}
    </div>
  );
}
