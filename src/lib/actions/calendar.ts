"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { INCOME_TYPE_LABELS, FREQUENCY_LABELS, LOAN_TYPE_LABELS } from "@/lib/constants";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

export interface CalendarEvent {
  day: number;
  label: string;
  type: "income" | "card_payment" | "card_cutoff" | "loan" | "expense";
  amount: number | null;
  detail: string;
}

export async function getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const userId = await getAuthUserId();

  const [incomeSources, cards, loans, expenses, dailyExpenses] = await Promise.all([
    prisma.incomeSource.findMany({ where: { userId, active: true } }),
    prisma.card.findMany({ where: { userId, type: "CREDIT" } }),
    prisma.loan.findMany({ where: { userId } }),
    prisma.recurringExpense.findMany({ where: { userId } }),
    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    }),
  ]);

  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  // Income sources
  for (const src of incomeSources) {
    const amount = Number(src.amount);
    const detail = `${INCOME_TYPE_LABELS[src.type]} · ${FREQUENCY_LABELS[src.frequency]}${src.isVariable ? " · Monto variable" : ""}`;
    const ev = (day: number) => ({ day, label: src.name, type: "income" as const, amount, detail });

    if (src.frequency === "ONE_TIME") {
      if (src.oneTimeDate) {
        const d = src.oneTimeDate;
        if (d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month) {
          events.push(ev(d.getUTCDate()));
        }
      }
      continue;
    }

    if (src.frequency === "WEEKLY") {
      const targetDay = src.payDay[0];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (date.getDay() === targetDay) events.push(ev(d));
      }
      continue;
    }

    const requiresMonth = ["BIMONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"].includes(src.frequency);
    if (requiresMonth) {
      if (!src.payMonth.includes(month)) continue;
      const monthIndex = src.payMonth.indexOf(month);
      const day = src.payDay[monthIndex] ?? src.payDay[0];
      if (day) events.push(ev(day));
      continue;
    }

    for (const day of src.payDay) events.push(ev(day));
  }

  // Credit cards
  for (const card of cards) {
    const limit = card.creditLimit ? `Límite: ${fmt(Number(card.creditLimit))}` : "";
    const rate = card.interestRate ? `Tasa: ${Number(card.interestRate)}%` : "";
    const cardDetail = `${card.bank} · ••••${card.lastFourDigits}${limit ? ` · ${limit}` : ""}${rate ? ` · ${rate}` : ""}`;

    if (card.cutOffDay) {
      events.push({ day: card.cutOffDay, label: `${card.name} (corte)`, type: "card_cutoff", amount: null, detail: cardDetail });
    }
    if (card.paymentDay) {
      events.push({ day: card.paymentDay, label: `${card.name} (pago)`, type: "card_payment", amount: null, detail: cardDetail });
    }
  }

  // Loans
  for (const loan of loans) {
    const remaining = Number(loan.remainingBalance);
    const total = Number(loan.totalAmount);
    const progress = total > 0 ? ((total - remaining) / total * 100).toFixed(0) : 0;
    const detail = `${LOAN_TYPE_LABELS[loan.type]} · ${loan.institution} · Saldo: ${fmt(remaining)} · Progreso: ${progress}%`;

    if (loan.cutOffDay) {
      events.push({
        day: loan.cutOffDay,
        label: `${loan.name} (corte)`,
        type: "loan",
        amount: null,
        detail,
      });
    }

    events.push({
      day: loan.paymentDueDay,
      label: loan.name,
      type: "loan",
      amount: Number(loan.paymentAmount),
      detail,
    });
  }

  // Recurring expenses
  for (const exp of expenses) {
    const start = exp.startDate;
    const end = exp.endDate;
    const current = new Date(year, month - 1, 1);
    const amount = Number(exp.amount);
    const detail = `${FREQUENCY_LABELS[exp.frequency]}${exp.description ? ` · ${exp.description}` : ""}`;

    if (current < new Date(start.getUTCFullYear(), start.getUTCMonth(), 1)) continue;
    if (end && current > new Date(end.getUTCFullYear(), end.getUTCMonth(), 1)) continue;

    const monthsDiff = (year - start.getUTCFullYear()) * 12 + (month - 1 - start.getUTCMonth());
    const freq = exp.frequency;
    const ev = (day: number) => ({ day, label: exp.name, type: "expense" as const, amount, detail });

    if (freq === "ONE_TIME") {
      if (start.getUTCFullYear() === year && start.getUTCMonth() + 1 === month) {
        events.push(ev(start.getUTCDate()));
      }
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

    if (freq === "MONTHLY" && exp.payDay.length === 1) {
      events.push(ev(exp.payDay[0]));
    } else {
      events.push(ev(start.getUTCDate()));
    }
  }

  // Daily expenses (one-time)
  for (const exp of dailyExpenses) {
    events.push({
      day: exp.date.getUTCDate(),
      label: exp.name,
      type: "expense",
      amount: Number(exp.amount),
      detail: exp.description ?? "Gasto diario",
    });
  }

  return events.sort((a, b) => a.day - b.day);
}
