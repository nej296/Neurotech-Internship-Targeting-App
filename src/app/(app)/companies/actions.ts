"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Lane, ApplicationStatus } from "@/types";

export async function createCompany(formData: FormData) {
  const name = formData.get("name") as string;
  const lane = formData.get("lane") as Lane;
  const priority = parseInt(formData.get("priority") as string, 10);
  const careerPageUrl = formData.get("careerPageUrl") as string;
  const cycleOpensMonth = formData.get("cycleOpensMonth")
    ? parseInt(formData.get("cycleOpensMonth") as string, 10)
    : null;
  const cycleClosesMonth = formData.get("cycleClosesMonth")
    ? parseInt(formData.get("cycleClosesMonth") as string, 10)
    : null;
  const rolesHiredBs = formData.get("rolesHiredBs") as string;
  const notes = (formData.get("notes") as string) || "";
  const warmIntros = (formData.get("warmIntros") as string) || "";

  try {
    const company = await prisma.company.create({
      data: {
        name,
        lane,
        priority,
        careerPageUrl,
        cycleOpensMonth,
        cycleClosesMonth,
        rolesHiredBs,
        notes,
        warmIntros,
      },
    });
    revalidatePath("/companies");
    return { success: true, id: company.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateCompanyField(
  id: string,
  field: string,
  value: string | number | null
) {
  try {
    await prisma.company.update({
      where: { id },
      data: { [field]: value },
    });
    revalidatePath(`/companies/${id}`);
    revalidatePath("/companies");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteCompany(id: string) {
  try {
    await prisma.company.delete({ where: { id } });
    revalidatePath("/companies");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function createApplication(
  companyId: string,
  roleTitle: string,
  roleUrl?: string
) {
  try {
    const app = await prisma.application.create({
      data: {
        companyId,
        roleTitle,
        roleUrl: roleUrl || null,
        status: "target",
      },
    });
    revalidatePath(`/companies/${companyId}`);
    revalidatePath("/pipeline");
    return { success: true, id: app.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteApplication(id: string, companyId: string) {
  try {
    await prisma.application.delete({ where: { id } });
    revalidatePath(`/companies/${companyId}`);
    revalidatePath("/pipeline");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
