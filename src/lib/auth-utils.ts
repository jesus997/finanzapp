import { auth } from "@/lib/auth";

/**
 * Returns the authenticated user's ID or throws if not authenticated.
 * Centralized to avoid duplicating auth checks across server actions.
 */
export async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}
