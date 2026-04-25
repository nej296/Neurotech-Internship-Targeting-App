import { prisma } from "@/lib/db";
import { Suspense } from "react";
import CompanyCard from "@/components/CompanyCard";
import CompanyFilters from "./CompanyFilters";
import NewCompanyForm from "./NewCompanyForm";

interface PageProps {
  searchParams: Promise<{ lane?: string; priority?: string }>;
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const { lane, priority } = await searchParams;

  const where: Record<string, unknown> = {};
  if (lane) where.lane = lane;
  if (priority) where.priority = parseInt(priority, 10);

  const companies = await prisma.company.findMany({
    where,
    include: { applications: { select: { id: true } } },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted">
            {companies.length} target{companies.length !== 1 ? "s" : ""}
            {lane || priority ? " (filtered)" : ""}
          </p>
        </div>
        <NewCompanyForm />
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Suspense fallback={null}>
          <CompanyFilters />
        </Suspense>
      </div>

      {/* Table header */}
      <div className="border border-border rounded overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 bg-surface border-b border-border text-xs text-muted uppercase tracking-wide font-medium">
          <span className="w-6 shrink-0">P</span>
          <span className="flex-1">Name</span>
          <span className="shrink-0 w-28 text-right">Lane</span>
          <span className="shrink-0 w-28 text-right">Cycle</span>
          <span className="shrink-0 w-16 text-right">Intros</span>
          <span className="shrink-0 w-16 text-right">Apps</span>
        </div>

        {companies.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted">
            No companies found.{" "}
            {lane || priority ? "Try clearing the filters." : "Add one above."}
          </div>
        ) : (
          companies.map((c) => (
            <CompanyCard
              key={c.id}
              id={c.id}
              name={c.name}
              lane={c.lane}
              priority={c.priority}
              careerPageUrl={c.careerPageUrl}
              cycleOpensMonth={c.cycleOpensMonth}
              cycleClosesMonth={c.cycleClosesMonth}
              rolesHiredBs={c.rolesHiredBs}
              warmIntros={c.warmIntros}
              applicationCount={c.applications.length}
            />
          ))
        )}
      </div>
    </div>
  );
}
