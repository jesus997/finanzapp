"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";

export async function completeOnboarding() {
  const userId = await getAuthUserId();

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  });
}

export async function getOnboardingStatus(): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    });
    return user?.onboardingCompleted ?? false;
  } catch {
    return true; // no user = skip
  }
}
