const round2 = (n: number) => Math.round(n * 100) / 100;

export interface AmortizationRow {
  period: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface AmortizationSummary {
  schedule: AmortizationRow[];
  totalInterest: number;
  totalPaid: number;
  interestPaidSoFar: number;
  principalPaidSoFar: number;
  currentPeriodInterest: number;
  currentPeriodPrincipal: number;
  /** true when payment doesn't cover interest */
  insufficientPayment: boolean;
}

/** IVA rate applied to loan interest in Mexico */
export const INTEREST_TAX_RATE = 0.16;

/** Number of payment periods per year for each frequency */
export function periodsPerYear(frequency: string): number {
  switch (frequency) {
    case "DAILY": return 360;
    case "WEEKLY": return 52;
    case "BIWEEKLY": return 24;
    case "MONTHLY": return 12;
    default: return 12;
  }
}

export function calculateAmortization(
  totalAmount: number,
  paymentAmount: number,
  annualRate: number,
  paymentFrequency: string,
  startDate: Date,
  remainingBalance: number,
): AmortizationSummary {
  const periods = periodsPerYear(paymentFrequency);
  const periodRate = annualRate / periods / 100;
  const taxMultiplier = 1 + INTEREST_TAX_RATE;
  const firstPeriodInterest = round2(totalAmount * periodRate * taxMultiplier);
  const insufficientPayment = paymentAmount <= firstPeriodInterest && annualRate > 0;

  const schedule: AmortizationRow[] = [];
  let balance = totalAmount;
  let totalInterest = 0;

  const now = new Date();
  const msPerPeriod = (365.25 / periods) * 24 * 60 * 60 * 1000;
  const elapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / msPerPeriod));

  let interestPaidSoFar = 0;
  let principalPaidSoFar = 0;
  let currentPeriodInterest = 0;
  let currentPeriodPrincipal = 0;
  let period = 0;
  const maxPeriods = periods * 100; // 100 years max

  while (balance > 0.01 && period < maxPeriods) {
    period++;
    const interest = round2(balance * periodRate * taxMultiplier);
    const principal = round2(Math.min(paymentAmount - interest, balance));
    balance = round2(balance - principal);
    totalInterest = round2(totalInterest + interest);

    schedule.push({ period, interest, principal, balance });

    if (period <= elapsed) {
      interestPaidSoFar = round2(interestPaidSoFar + interest);
      principalPaidSoFar = round2(principalPaidSoFar + principal);
    }
    if (period === elapsed + 1) {
      currentPeriodInterest = interest;
      currentPeriodPrincipal = principal;
    }

    if (insufficientPayment && period >= elapsed + 1) break;
  }

  return {
    schedule,
    totalInterest,
    totalPaid: round2(totalAmount + totalInterest),
    interestPaidSoFar,
    principalPaidSoFar,
    currentPeriodInterest,
    currentPeriodPrincipal,
    insufficientPayment,
  };
}
