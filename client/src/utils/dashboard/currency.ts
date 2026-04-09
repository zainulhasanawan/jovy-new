export type { CurrencyCode } from "@/types/dashboard/currency";

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
] as const;

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  France: "EUR",
  Germany: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  Portugal: "EUR",
  Ireland: "EUR",
  Netherlands: "EUR",
  Belgium: "EUR",
  Austria: "EUR",
  Greece: "EUR",
  Finland: "EUR",
  Luxembourg: "EUR",
  Malta: "EUR",
  Cyprus: "EUR",
  Slovakia: "EUR",
  Slovenia: "EUR",
  Estonia: "EUR",
  Latvia: "EUR",
  Lithuania: "EUR",
  Mexico: "MXN",
  Thailand: "THB",
  Australia: "AUD",
  Canada: "CAD",
  Switzerland: "CHF",
  Japan: "JPY",
};

export function getCurrencySymbol(code: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || code;
}

export function formatCurrency(
  amount: number,
  currencyCode?: string | null,
): string {
  const code = currencyCode || "USD";
  try {
    // Use locale-specific formatting, but for USD use 'en-US' to ensure "$" instead of "US$"
    const locale = code === "USD" ? "en-US" : undefined;
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    // Replace "US$" with "$" if it appears (fallback for edge cases)
    return formatted.replace(/US\$/g, "$");
  } catch {
    const symbol = getCurrencySymbol(code);
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
}

export function formatWithConversion(
  amount: number,
  nativeCurrency: string,
  budgetCurrency: string,
  rates: Record<string, number>,
): string {
  const formatted = formatCurrency(amount, nativeCurrency);

  if (nativeCurrency === budgetCurrency) {
    return formatted;
  }

  const converted = convertCurrency(
    amount,
    nativeCurrency,
    budgetCurrency,
    rates,
  );
  return `${formatted} (~${formatCurrency(converted, budgetCurrency)})`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
}

export function inferCurrencyFromCountry(country: string | undefined): string {
  if (!country) return "USD";
  return COUNTRY_TO_CURRENCY[country] || "USD";
}

export const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MXN: 17.5,
  THB: 33.5,
  AUD: 1.55,
  CHF: 0.88,
  CAD: 1.36,
  JPY: 149.5,
};
