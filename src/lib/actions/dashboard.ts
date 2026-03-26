"use server";

import { getAuthUserId } from "@/lib/auth-utils";
import { getCachedCalendarEvents, getCachedDashboardData } from "@/lib/data/dashboard";

export interface UpcomingEvent {
  label: string;
  day: number;
  amount: number | null;
  type: string;
  detail: string;
}

export interface ActiveShopping {
  id: string;
  name: string;
  storeName: string;
  itemCount: number;
  estimatedTotal: number;
}

export interface DashboardStats {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLoans: number;
  projectedBalance: number;
  totalSavings: number;
  totalDebt: number;
  upcoming: UpcomingEvent[];
  activeShopping: ActiveShopping[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getAuthUserId();
  const now = new Date();
  const today = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [events, data] = await Promise.all([
    getCachedCalendarEvents(userId, year, month),
    getCachedDashboardData(userId),
  ]);

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let monthlyLoans = 0;

  for (const e of events) {
    if (e.amount == null) continue;
    if (e.type === "income") monthlyIncome += e.amount;
    else if (e.type === "expense") monthlyExpenses += e.amount;
    else if (e.type === "loan") monthlyLoans += e.amount;
  }

  monthlyExpenses += data.dailyExpensesAmount;
  const projectedBalance = monthlyIncome - monthlyExpenses - monthlyLoans;

  const upcoming = events
    .filter((e) => e.day >= today && e.amount != null)
    .slice(0, 5)
    .map((e) => ({ label: e.label, day: e.day, amount: e.amount, type: e.type, detail: e.detail }));

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    monthlyIncome: round(monthlyIncome),
    monthlyExpenses: round(monthlyExpenses),
    monthlyLoans: round(monthlyLoans),
    projectedBalance: round(projectedBalance),
    totalSavings: round(data.totalSavings),
    totalDebt: round(data.totalDebt),
    upcoming,
    activeShopping: data.inProgressSessions,
  };
}
