"use server";

import { getAuthUserId } from "@/lib/auth-utils";
import { getCachedCalendarEvents } from "@/lib/data/dashboard";
import type { CalendarEvent } from "@/lib/types/calendar";

export async function getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const userId = await getAuthUserId();
  return getCachedCalendarEvents(userId, year, month);
}
