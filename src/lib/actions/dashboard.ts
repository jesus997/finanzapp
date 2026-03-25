"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCalendarEvents } from "@/lib/actions/calendar";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

export interface UpcomingEvent {
  label: string;
  day: number;
  amount: number | null;
  type: string;
  detail: string;
}

export interface DashboardStats {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLoans: number;
  projectedBalance: number;
  totalSavings: number;
  totalDebt: number;
  upcoming: UpcomingEvent[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getAuthUserId();
  const now = new Date();
  const today = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [events, savingsFunds, loans, dailyExpensesTotal] = await Promise.all([
    getCalendarEvents(year, month),
    prisma.savingsFund.findMany({
      where: { userId },
      select: { accumulatedBalance: true },
    }),
    prisma.loan.findMany({
      where: { userId },
      select: { remainingBalance: true },
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
      _sum: { amount: true },
    }),
  ]);

  // Monthly totals from calendar events
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let monthlyLoans = 0;

  for (const e of events) {
    if (e.amount == null) continue;
    if (e.type === "income") monthlyIncome += e.amount;
    else if (e.type === "expense") monthlyExpenses += e.amount;
    else if (e.type === "loan") monthlyLoans += e.amount;
  }

  monthlyExpenses += Number(dailyExpensesTotal._sum.amount ?? 0);

  const projectedBalance = monthlyIncome - monthlyExpenses - monthlyLoans;

  const totalSavings = savingsFunds.reduce(
    (s, f) => s + Number(f.accumulatedBalance), 0,
  );

  const totalDebt = loans.reduce(
    (s, l) => s + Number(l.remainingBalance), 0,
  );

  // Upcoming: next events from today onwards (max 5)
  const upcoming = events
    .filter((e) => e.day >= today && e.amount != null)
    .slice(0, 5)
    .map((e) => ({ label: e.label, day: e.day, amount: e.amount, type: e.type, detail: e.detail }));

  return {
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    monthlyLoans: Math.round(monthlyLoans * 100) / 100,
    projectedBalance: Math.round(projectedBalance * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    totalDebt: Math.round(totalDebt * 100) / 100,
    upcoming,
  };
}
