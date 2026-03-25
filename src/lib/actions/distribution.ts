"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  return session.user.id;
}

// ── Helpers ─────────────────────────────────────────────────

/** How many times per month does this income frequency pay? */
function incomeTimesPerMonth(frequency: string): number {
  switch (frequency) {
    case "WEEKLY": return 4;
    case "BIWEEKLY": return 2;
    case "MONTHLY": return 1;
    default: return 1;
  }
}

/** Monthly equivalent cost of an expense given its frequency */
function monthlyEquivalent(amount: number, frequency: string): number {
  switch (frequency) {
    case "WEEKLY": return amount * 4;
    case "BIWEEKLY": return amount * 2;
    case "MONTHLY": return amount;
    case "BIMONTHLY": return amount / 2;
    case "QUARTERLY": return amount / 3;
    case "SEMIANNUAL": return amount / 6;
    case "ANNUAL": return amount / 12;
    default: return amount;
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ── Types ───────────────────────────────────────────────────

export interface ExpenseLineItem {
  id: string;
  name: string;
  totalMonthly: number;
  perPaycheck: number;
}

export interface CardGroup {
  cardId: string;
  cardName: string;
  cardBank: string;
  lastFourDigits: string;
  paymentDay: number | null;
  expenses: ExpenseLineItem[];
  totalPerPaycheck: number;
}

export interface LoanLineItem {
  id: string;
  name: string;
  institution: string;
  monthlyPayment: number;
  perPaycheck: number;
}

export interface SavingsLineItem {
  id: string;
  name: string;
  amount: number;
}

export interface DistributionPreview {
  incomeSourceId: string;
  incomeSourceName: string;
  totalAmount: number;
  timesPerMonth: number;
  cardGroups: CardGroup[];
  loans: LoanLineItem[];
  savings: SavingsLineItem[];
  totalAllocated: number;
  remaining: number;
}

// ── Queries ─────────────────────────────────────────────────

export async function getActiveIncomeSources() {
  const userId = await getAuthUserId();
  const sources = await prisma.incomeSource.findMany({
    where: { userId, active: true },
    select: { id: true, name: true, amount: true, frequency: true },
  });
  return sources.map((s) => ({ ...s, amount: Number(s.amount) }));
}

export async function getDistributions() {
  const userId = await getAuthUserId();
  const distributions = await prisma.distribution.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      incomeSource: { select: { name: true } },
      details: true,
    },
  });

  // Resolve names
  const allIds = distributions.flatMap((d) => d.details.flatMap((dt) => [dt.destinationId, dt.groupId].filter(Boolean) as string[]));
  const uniqueIds = [...new Set(allIds)];

  const [expNames, savNames, loanNames, cardNames] = await Promise.all([
    prisma.recurringExpense.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, name: true } }),
    prisma.savingsFund.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, name: true } }),
    prisma.loan.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, name: true } }),
    prisma.card.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, name: true } }),
  ]);

  const nameMap = new Map<string, string>();
  for (const x of [...expNames, ...savNames, ...loanNames, ...cardNames]) nameMap.set(x.id, x.name);

  return distributions.map((dist) => ({
    id: dist.id,
    date: dist.date,
    totalAmount: Number(dist.totalAmount),
    incomeSourceName: dist.incomeSource.name,
    details: dist.details.map((d) => ({
      id: d.id,
      destinationType: d.destinationType,
      destinationId: d.destinationId,
      groupId: d.groupId,
      name: nameMap.get(d.destinationId) ?? "Eliminado",
      groupName: d.groupId ? nameMap.get(d.groupId) ?? null : null,
      amount: Number(d.amount),
    })),
  }));
}

// ── Calculate ───────────────────────────────────────────────

export async function calculateDistribution(incomeSourceId: string): Promise<DistributionPreview> {
  const userId = await getAuthUserId();

  const incomeSource = await prisma.incomeSource.findFirst({
    where: { id: incomeSourceId, userId },
  });
  if (!incomeSource) throw new Error("Fuente de ingreso no encontrada");

  const totalAmount = Number(incomeSource.amount);
  const timesPerMonth = incomeTimesPerMonth(incomeSource.frequency);

  const [expenses, cards, loans, savings] = await Promise.all([
    prisma.recurringExpense.findMany({ where: { userId } }),
    prisma.card.findMany({ where: { userId } }),
    prisma.loan.findMany({ where: { userId } }),
    prisma.savingsFund.findMany({ where: { userId, incomeSourceId } }),
  ]);

  const cardMap = new Map(cards.map((c) => [c.id, c]));

  // Group expenses by card
  const groupMap = new Map<string, CardGroup>();

  for (const exp of expenses) {
    const monthly = monthlyEquivalent(Number(exp.amount), exp.frequency);
    const perPaycheck = round2(monthly / timesPerMonth);

    if (exp.paymentMethodType === "CREDIT_CARD" || exp.paymentMethodType === "DEBIT_CARD") {
      const card = cardMap.get(exp.paymentMethodId);
      if (!card) continue;

      let group = groupMap.get(card.id);
      if (!group) {
        group = {
          cardId: card.id,
          cardName: card.name,
          cardBank: card.bank,
          lastFourDigits: card.lastFourDigits,
          paymentDay: card.paymentDay,
          expenses: [],
          totalPerPaycheck: 0,
        };
        groupMap.set(card.id, group);
      }
      group.expenses.push({ id: exp.id, name: exp.name, totalMonthly: round2(monthly), perPaycheck });
      group.totalPerPaycheck = round2(group.totalPerPaycheck + perPaycheck);
    }
    // Expenses paid from INCOME_SOURCE go ungrouped — skip for now
  }

  // Add card monthlyPayment as a line item in the card group
  for (const card of cards) {
    if (card.type !== "CREDIT" || !card.monthlyPayment) continue;
    const payment = Number(card.monthlyPayment);
    if (payment <= 0) continue;
    const perPaycheck = round2(payment / timesPerMonth);

    let group = groupMap.get(card.id);
    if (!group) {
      group = {
        cardId: card.id,
        cardName: card.name,
        cardBank: card.bank,
        lastFourDigits: card.lastFourDigits,
        paymentDay: card.paymentDay,
        expenses: [],
        totalPerPaycheck: 0,
      };
      groupMap.set(card.id, group);
    }
    group.expenses.push({ id: `card-payment-${card.id}`, name: "Pago de tarjeta", totalMonthly: payment, perPaycheck });
    group.totalPerPaycheck = round2(group.totalPerPaycheck + perPaycheck);
  }

  const cardGroups = [...groupMap.values()];

  // Loans prorated per paycheck
  const loanItems: LoanLineItem[] = loans.map((loan) => {
    const payment = Number(loan.paymentAmount);
    // Convert to monthly equivalent based on loan payment frequency
    const freqMultiplier: Record<string, number> = { DAILY: 30, WEEKLY: 4, BIWEEKLY: 2, MONTHLY: 1 };
    const monthlyEquiv = payment * (freqMultiplier[loan.paymentFrequency] ?? 1);
    return {
      id: loan.id,
      name: loan.name,
      institution: loan.institution,
      monthlyPayment: round2(monthlyEquiv),
      perPaycheck: round2(monthlyEquiv / timesPerMonth),
    };
  });

  // Savings linked to this income source
  const savingsItems: SavingsLineItem[] = savings.map((fund) => {
    if (fund.type === "PERCENTAGE") {
      return { id: fund.id, name: fund.name, amount: round2(totalAmount * Number(fund.value) / 100) };
    }
    // Fixed amount: prorate based on savings frequency vs income frequency
    const savingsMonthly = monthlyEquivalent(Number(fund.value), fund.frequency);
    return { id: fund.id, name: fund.name, amount: round2(savingsMonthly / timesPerMonth) };
  });

  const totalCards = cardGroups.reduce((s, g) => s + g.totalPerPaycheck, 0);
  const totalLoans = loanItems.reduce((s, l) => s + l.perPaycheck, 0);
  const totalSavings = savingsItems.reduce((s, f) => s + f.amount, 0);
  const totalAllocated = round2(totalCards + totalLoans + totalSavings);
  const remaining = round2(totalAmount - totalAllocated);

  return {
    incomeSourceId,
    incomeSourceName: incomeSource.name,
    totalAmount,
    timesPerMonth,
    cardGroups,
    loans: loanItems,
    savings: savingsItems,
    totalAllocated,
    remaining,
  };
}

// ── Create ──────────────────────────────────────────────────

export async function createDistribution(
  incomeSourceId: string,
  items: { destinationType: string; destinationId: string; amount: number; groupId?: string }[]
) {
  const userId = await getAuthUserId();

  const incomeSource = await prisma.incomeSource.findFirst({
    where: { id: incomeSourceId, userId },
  });
  if (!incomeSource) throw new Error("Fuente de ingreso no encontrada");

  const totalAmount = Number(incomeSource.amount);

  await prisma.$transaction(async (tx) => {
    await tx.distribution.create({
      data: {
        userId,
        incomeSourceId,
        date: new Date(),
        totalAmount,
        details: {
          create: items.map((i) => ({
            destinationType: i.destinationType,
            destinationId: i.destinationId,
            groupId: i.groupId ?? null,
            amount: i.amount,
          })),
        },
      },
    });

    // Update savings fund balances
    for (const item of items) {
      if (item.destinationType === "savings") {
        await tx.savingsFund.update({
          where: { id: item.destinationId },
          data: { accumulatedBalance: { increment: item.amount } },
        });
      }
    }
  });

  revalidatePath("/dispersiones");
  revalidatePath("/ahorro");
  redirect("/dispersiones");
}

// ── Delete (revert) ─────────────────────────────────────────

export async function deleteDistribution(id: string) {
  const userId = await getAuthUserId();

  const distribution = await prisma.distribution.findFirst({
    where: { id, userId },
    include: { details: true },
  });
  if (!distribution) throw new Error("Dispersión no encontrada");

  await prisma.$transaction(async (tx) => {
    for (const detail of distribution.details) {
      if (detail.destinationType === "savings") {
        await tx.savingsFund.update({
          where: { id: detail.destinationId },
          data: { accumulatedBalance: { decrement: Number(detail.amount) } },
        });
      }
    }

    await tx.distributionDetail.deleteMany({ where: { distributionId: id } });
    await tx.distribution.deleteMany({ where: { id, userId } });
  });

  revalidatePath("/dispersiones");
  revalidatePath("/ahorro");
}
