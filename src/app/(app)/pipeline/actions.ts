"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@/types";

export async function moveApplication(id: string, status: ApplicationStatus) {
  try {
    await prisma.application.update({
      where: { id },
      data: {
        status,
        lastActivityAt: new Date(),
        ...(status === "applied" ? { appliedAt: new Date() } : {}),
      },
    });
    revalidatePath("/pipeline");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateFollowUpDate(id: string, date: string | null) {
  try {
    await prisma.application.update({
      where: { id },
      data: { followUpDueAt: date ? new Date(date) : null },
    });
    revalidatePath("/pipeline");
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
