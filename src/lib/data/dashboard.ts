import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { INCOME_TYPE_LABELS, FREQUENCY_LABELS, LOAN_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency as fmt } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/types/calendar";

function buildCalendarEvents(
  incomeSources: any[],
  cards: any[],
  loans: any[],
  expenses: any[],
  dailyExpenses: any[],
  savingsFunds: any[],
  year: number,
  month: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build map of income source pay days for savings events
  const incomePayDays = new Map<string, number[]>();

  for (const src of incomeSources) {
    const amount = Number(src.amount);
    const detail = `${INCOME_TYPE_LABELS[src.type]} · ${FREQUENCY_LABELS[src.frequency]}${src.isVariable ? " · Monto variable" : ""}`;
    const ev = (day: number) => ({ day, label: src.name, type: "income" as const, amount, detail });

    if (src.frequency === "ONE_TIME") {
      if (src.oneTimeDate) {
        const d = new Date(src.oneTimeDate);
        if (d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month) {
          const day = d.getUTCDate();
          events.push(ev(day));
          incomePayDays.set(src.id, [day]);
        }
      }
      continue;
    }
    if (src.frequency === "WEEKLY") {
      const targetDay = src.payDay[0];
      const days: number[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, month - 1, d).getDay() === targetDay) { events.push(ev(d)); days.push(d); }
      }
      incomePayDays.set(src.id, days);
      continue;
    }
    const requiresMonth = ["BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"].includes(src.frequency);
    if (requiresMonth) {
      if (!src.payMonth.includes(month)) continue;
      const monthIndex = src.payMonth.indexOf(month);
      const day = src.payDay[monthIndex] ?? src.payDay[0];
      if (day) { events.push(ev(day)); incomePayDays.set(src.id, [day]); }
      continue;
    }
    const days: number[] = [];
    for (const day of src.payDay) { events.push(ev(day)); days.push(day); }
    incomePayDays.set(src.id, days);
  }

  for (const card of cards) {
    const limit = card.creditLimit ? `Límite: ${fmt(Number(card.creditLimit))}` : "";
    const rate = card.interestRate ? `Tasa: ${Number(card.interestRate)}%` : "";
    const cardDetail = `${card.bank} · ••••${card.lastFourDigits}${limit ? ` · ${limit}` : ""}${rate ? ` · ${rate}` : ""}`;
    if (card.cutOffDay) events.push({ day: card.cutOffDay, label: `${card.name} (corte)`, type: "card_cutoff", amount: null, detail: cardDetail });
    if (card.paymentDay) events.push({ day: card.paymentDay, label: `${card.name} (pago)`, type: "card_payment", amount: null, detail: cardDetail });
  }

  for (const loan of loans) {
    const remaining = Number(loan.remainingBalance);
    const total = Number(loan.totalAmount);
    const progress = total > 0 ? ((total - remaining) / total * 100).toFixed(0) : 0;
    const detail = `${LOAN_TYPE_LABELS[loan.type]} · ${loan.institution} · Saldo: ${fmt(remaining)} · Progreso: ${progress}%`;
    if (loan.cutOffDay) events.push({ day: loan.cutOffDay, label: `${loan.name} (corte)`, type: "loan", amount: null, detail });
    events.push({ day: loan.paymentDueDay, label: loan.name, type: "loan", amount: Number(loan.paymentAmount), detail });
  }

  for (const exp of expenses) {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : null;
    const current = new Date(year, month - 1, 1);
    const amount = Number(exp.amount);
    const detail = `${FREQUENCY_LABELS[exp.frequency]}${exp.description ? ` · ${exp.description}` : ""}`;

    if (current < new Date(start.getUTCFullYear(), start.getUTCMonth(), 1)) continue;
    if (end && current > new Date(end.getUTCFullYear(), end.getUTCMonth(), 1)) continue;

    const monthsDiff = (year - start.getUTCFullYear()) * 12 + (month - 1 - start.getUTCMonth());
    const freq = exp.frequency;
    const ev = (day: number) => ({ day, label: exp.name, type: "expense" as const, amount, detail });

    if (freq === "ONE_TIME") {
      if (start.getUTCFullYear() === year && start.getUTCMonth() + 1 === month) events.push(ev(start.getUTCDate()));
      continue;
    }
    if (freq === "WEEKLY") {
      const dayOfWeek = start.getDay();
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, month - 1, d).getDay() === dayOfWeek) events.push(ev(d));
      }
      continue;
    }
    if (freq === "BIWEEKLY") {
      if (exp.payDay.length === 2) {
        for (const day of exp.payDay) events.push(ev(day));
      } else {
        const startMs = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()).getTime();
        for (let d = 1; d <= daysInMonth; d++) {
          const diffDays = Math.round((new Date(year, month - 1, d).getTime() - startMs) / 86400000);
          if (diffDays >= 0 && diffDays % 14 === 0) events.push(ev(d));
        }
      }
      continue;
    }
    const interval: Record<string, number> = { MONTHLY: 1, BIMONTHLY: 2, QUARTERLY: 3, SEMIANNUAL: 6, ANNUAL: 12 };
    const step = interval[freq] ?? 1;
    if (monthsDiff % step !== 0) continue;
    if (freq === "MONTHLY" && exp.payDay.length === 1) events.push(ev(exp.payDay[0]));
    else events.push(ev(start.getUTCDate()));
  }

  for (const exp of dailyExpenses) {
    const d = new Date(exp.date);
    events.push({ day: d.getUTCDate(), label: exp.name, type: "expense", amount: Number(exp.amount), detail: exp.description ?? "Gasto diario" });
  }

  // Savings events — appear on the same days as their linked income source
  for (const fund of savingsFunds) {
    if (fund.completedAt || !fund.incomeSourceId) continue;
    const target = fund.targetAmount ? Number(fund.targetAmount) : null;
    const accumulated = Number(fund.accumulatedBalance);
    if (target !== null && accumulated >= target) continue;

    const days = incomePayDays.get(fund.incomeSourceId);
    if (!days || days.length === 0) continue;

    const value = Number(fund.value);
    const detail = target
      ? `${fmt(accumulated)} de ${fmt(target)}${fund.targetDate ? ` · Meta: ${new Date(fund.targetDate).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}` : ""}`
      : "Ahorro recurrente";

    for (const day of days) {
      events.push({ day, label: `🐷 ${fund.name}`, type: "savings" as const, amount: value, detail });
    }
  }

  return events.sort((a, b) => a.day - b.day);
}

export function getCachedCalendarEvents(userId: string, year: number, month: number) {
  return unstable_cache(
    async () => {
      const [incomeSources, cards, loans, expenses, dailyExpenses, savingsFunds] = await Promise.all([
        prisma.incomeSource.findMany({ where: { userId, active: true } }),
        prisma.card.findMany({ where: { userId, type: "CREDIT" } }),
        prisma.loan.findMany({ where: { userId } }),
        prisma.recurringExpense.findMany({ where: { userId } }),
        prisma.expense.findMany({
          where: { userId, date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
        }),
        prisma.savingsFund.findMany({ where: { userId, completedAt: null } }),
      ]);
      return buildCalendarEvents(incomeSources, cards, loans, expenses, dailyExpenses, savingsFunds, year, month);
    },
    [`calendar-${userId}-${year}-${month}`],
    { tags: [`calendar-${userId}`], revalidate: 300 },
  )();
}

export function getCachedDashboardData(userId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return unstable_cache(
    async () => {
      const [savingsFunds, loans, dailyExpensesTotal, inProgressSessions] = await Promise.all([
        prisma.savingsFund.findMany({ where: { userId }, select: { accumulatedBalance: true } }),
        prisma.loan.findMany({ where: { userId }, select: { remainingBalance: true } }),
        prisma.expense.aggregate({
          where: { userId, date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
          _sum: { amount: true },
        }),
        prisma.shoppingSession.findMany({
          where: { userId, status: "IN_PROGRESS" },
          orderBy: { date: "desc" },
          include: { store: { select: { name: true } }, _count: { select: { items: true } } },
        }),
      ]);
      return {
        totalSavings: savingsFunds.reduce((s, f) => s + Number(f.accumulatedBalance), 0),
        totalDebt: loans.reduce((s, l) => s + Number(l.remainingBalance), 0),
        dailyExpensesAmount: Number(dailyExpensesTotal._sum.amount ?? 0),
        inProgressSessions: inProgressSessions.map((s) => ({
          id: s.id, name: s.name, storeName: s.store.name,
          itemCount: s._count.items, estimatedTotal: Number(s.estimatedTotal),
        })),
      };
    },
    [`dashboard-${userId}-${year}-${month}`],
    { tags: [`dashboard-${userId}`], revalidate: 300 },
  )();
}
