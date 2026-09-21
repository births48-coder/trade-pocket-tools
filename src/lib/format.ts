const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  IDR: "Rp",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
};

export function fmtNum(n: number, precision = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function fmtMoney(n: number, currency = "USD", precision = 2): string {
  if (!Number.isFinite(n)) return "—";
  const sym = SYMBOLS[currency] ?? currency + " ";
  const sign = n < 0 ? "-" : "";
  return `${sign}${sym}${fmtNum(Math.abs(n), precision)}`;
}

export function fmtSigned(n: number, currency = "USD", precision = 2): string {
  if (!Number.isFinite(n)) return "—";
  return (n > 0 ? "+" : "") + fmtMoney(n, currency, precision);
}

export function fmtPct(n: number, precision = 2): string {
  if (!Number.isFinite(n)) return "—";
  return `${fmtNum(n, precision)}%`;
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(iso: string): boolean {
  return !!iso && iso.slice(0, 10) === todayISO();
}
