export type Currency = 'USD' | 'GBP';

export interface Row {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category?: string;
  cadence?: string;
}

export interface MonthEntry {
  id: string;
  month: string;
  planSave: number;
  actualSave?: number;
  actualNetWorth?: number;
  note?: string;
}

export interface SnapshotRow {
  month: string;
  asset_total_usd: number;
  liability_total_usd: number;
  net_worth_usd: number;
  gbp_usd_rate: number;
}

export interface AntiSpendEntry {
  id: string;
  month: string;
  timestamp: string; // ISO string
  instead_of: string;
  i_did: string;
  category: string;
  amount_saved: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  amount: number;
  type: 'long-term' | 'short-term';
}

export interface GuiltFreeData {
  month: string;
  takeHomePay: number;
  savingsGoals: SavingsGoal[];
}

export interface MonthlyNetWorthData {
  month: string;
  assets: Row[];
  liabilities: Row[];
  fixedCosts: Row[];
  settings: {
    income: number;
    gbpRate: number;
    annualReturn: number;
    months: number;
  };
  scenarios: { amount: number; on: boolean }[];
}
