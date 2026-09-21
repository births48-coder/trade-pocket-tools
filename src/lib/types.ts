export type Direction = "LONG" | "SHORT";
export type TradeStatus = "Open" | "Closed";

export interface Account {
  id: string;
  name: string;
  currency: string;
  startingBalance: number;
  currentBalance: number;
  defaultRiskPct: number;
}

export interface Trade {
  id: string;
  instrument: string;
  accountId: string;
  direction: Direction;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  size: number;
  multiplier: number;
  entryDate: string;
  exitPrice: number | null;
  exitDate: string;
  fees: number;
  strategy: string;
  setup: string;
  emotion: string;
  notes: string;
  tags: string[];
  status: TradeStatus;
}

export interface Strategy {
  id: string;
  name: string;
  entryRules: string;
  stopRules: string;
  takeProfitRules: string;
  riskPct: number;
  defaultRR: number;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  defaultAccountId: string;
  defaultCurrency: string;
  defaultRiskPct: number;
  defaultRR: number;
  precision: number;
}

export interface DB {
  settings: Settings;
  accounts: Account[];
  trades: Trade[];
  strategies: Strategy[];
  checklist: ChecklistItem[];
}
