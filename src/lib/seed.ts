import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync } from "fs";
import path from "path";
import type { SeedCompany } from "../types";

const dbPath = path.join(process.cwd(), "data", "app.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const seedPath = path.join(process.cwd(), "data", "seed-companies.json");
  const raw = readFileSync(seedPath, "utf-8");
  const companies: SeedCompany[] = JSON.parse(raw);

  console.log(`Seeding ${companies.length} companies...`);

  for (const company of companies) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: {
        lane: company.lane,
        priority: company.priority,
        careerPageUrl: company.careerPageUrl,
        cycleOpensMonth: company.cycleOpensMonth,
        cycleClosesMonth: company.cycleClosesMonth,
        rolesHiredBs: company.rolesHiredBs,
        notes: company.notes,
        warmIntros: company.warmIntros,
      },
      create: {
        name: company.name,
        lane: company.lane,
        priority: company.priority,
        careerPageUrl: company.careerPageUrl,
        cycleOpensMonth: company.cycleOpensMonth,
        cycleClosesMonth: company.cycleClosesMonth,
        rolesHiredBs: company.rolesHiredBs,
        notes: company.notes,
        warmIntros: company.warmIntros,
      },
    });
    console.log(`  ✓ ${company.name}`);
  }

  // Create a default profile if none exists
  const existing = await prisma.profile.findUnique({
    where: { id: "singleton" },
  });
  if (!existing) {
    await prisma.profile.create({
      data: {
        id: "singleton",
        resumeText: "",
        skillsJson: "[]",
        educationText: "",
      },
    });
    console.log("  ✓ Default profile created");
  }

  const count = await prisma.company.count();
  console.log(`\nDone. ${count} companies in database.`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
