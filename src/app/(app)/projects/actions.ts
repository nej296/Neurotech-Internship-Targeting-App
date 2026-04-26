"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/types";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = (formData.get("status") as ProjectStatus) ?? "idea";
  const githubUrl = (formData.get("githubUrl") as string) || null;
  const relevantTo = (formData.get("relevantTo") as string) || null;

  try {
    const project = await prisma.project.create({
      data: { name, description, status, githubUrl, relevantTo },
    });
    revalidatePath("/projects");
    return { success: true, id: project.id };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateProjectField(
  id: string,
  field: string,
  value: string | null
) {
  try {
    await prisma.project.update({ where: { id }, data: { [field]: value } });
    revalidatePath("/projects");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/projects");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
