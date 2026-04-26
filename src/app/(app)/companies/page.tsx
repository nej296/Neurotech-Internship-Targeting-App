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
      <div className="mb-6 flex items-start justify-between rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Target Database
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Companies
          </h1>
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
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium uppercase tracking-[0.22em] text-muted">
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
