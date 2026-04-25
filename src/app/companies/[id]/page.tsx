import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import CompanyEditor from "./CompanyEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/companies"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← Companies
        </Link>
      </div>
      <CompanyEditor company={company} />
    </div>
  );
}
