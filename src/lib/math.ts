export function simulateGrowth({
  startUSD,
  monthlyContribution,
  months,
  annualReturn,
}: {
  startUSD: number;
  monthlyContribution: number;
  months: number;
  annualReturn: number;
}) {
  const r = annualReturn / 12;
  const out: { month: number; balance: number }[] = [];
  let bal = startUSD;
  for (let m = 0; m <= months; m++) {
    if (m > 0) bal = r === 0 ? bal + monthlyContribution : bal * (1 + r) + monthlyContribution;
    out.push({ month: m, balance: bal });
  }
  return out;
}

export function monthsToTarget(startUSD: number, monthlyContribution: number, targetUSD: number, annualReturn: number, maxMonths = 240) {
  const r = annualReturn / 12;
  let bal = startUSD;
  for (let m = 1; m <= maxMonths; m++) {
    bal = r === 0 ? bal + monthlyContribution : bal * (1 + r) + monthlyContribution;
    if (bal >= targetUSD) return m;
  }
  return Infinity;
}

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const nextMonthKey = (key: string) => {
  const [y, m] = key.split('-').map((v) => parseInt(v, 10));
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + 1);
  return monthKey(d);
};
