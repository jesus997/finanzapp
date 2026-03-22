const round2 = (n: number) => Math.round(n * 100) / 100;

export interface AmortizationRow {
  month: number;
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
  currentMonthInterest: number;
  currentMonthPrincipal: number;
}

export function calculateAmortization(
  totalAmount: number,
  monthlyPayment: number,
  annualRate: number,
  startDate: Date,
  remainingBalance: number,
): AmortizationSummary {
  const monthlyRate = annualRate / 12 / 100;
  const schedule: AmortizationRow[] = [];
  let balance = totalAmount;
  let totalInterest = 0;

  const now = new Date();
  const monthsElapsed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  let interestPaidSoFar = 0;
  let principalPaidSoFar = 0;
  let currentMonthInterest = 0;
  let currentMonthPrincipal = 0;
  let month = 0;

  while (balance > 0.01 && month < 1200) {
    month++;
    const interest = round2(balance * monthlyRate);
    const principal = round2(Math.min(monthlyPayment - interest, balance));
    balance = round2(balance - principal);
    totalInterest = round2(totalInterest + interest);

    schedule.push({ month, interest, principal, balance });

    if (month <= monthsElapsed) {
      interestPaidSoFar = round2(interestPaidSoFar + interest);
      principalPaidSoFar = round2(principalPaidSoFar + principal);
    }
    if (month === monthsElapsed + 1) {
      currentMonthInterest = interest;
      currentMonthPrincipal = principal;
    }
  }

  return {
    schedule,
    totalInterest,
    totalPaid: round2(totalAmount + totalInterest),
    interestPaidSoFar,
    principalPaidSoFar,
    currentMonthInterest,
    currentMonthPrincipal,
  };
}
