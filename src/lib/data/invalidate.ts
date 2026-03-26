import { revalidateTag } from "next/cache";

/** Invalidate cached dashboard and calendar data for a user */
export function invalidateUserCache(userId: string) {
  revalidateTag(`calendar-${userId}`, "max");
  revalidateTag(`dashboard-${userId}`, "max");
}
