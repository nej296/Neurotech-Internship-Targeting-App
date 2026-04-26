"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfileField(
  field: "resumeText" | "educationText",
  value: string
) {
  try {
    await prisma.profile.upsert({
      where: { id: "singleton" },
      update: { [field]: value },
      create: {
        id: "singleton",
        resumeText: "",
        skillsJson: "[]",
        educationText: "",
        [field]: value,
      },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateSkills(skillsJson: string) {
  try {
    await prisma.profile.upsert({
      where: { id: "singleton" },
      update: { skillsJson },
      create: {
        id: "singleton",
        resumeText: "",
        skillsJson,
        educationText: "",
      },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
