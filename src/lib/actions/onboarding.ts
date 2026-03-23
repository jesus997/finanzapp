"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });
}

export async function getOnboardingStatus(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return true; // no user = skip
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });
  return user?.onboardingCompleted ?? false;
}
