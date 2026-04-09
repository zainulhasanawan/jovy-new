import type { GuestPricing, MandatoryFee } from "@/types/dashboard/schema";

type ComputeQuoteTotal = (quote: unknown, guestCount: number) => number;

export type QuotePriceData = {
  amount: number;
  currency: string;
  guestPricing: GuestPricing | null;
  mandatoryFees: MandatoryFee[];
};

export function getQuotePriceData(
  quote: Record<string, unknown>,
  guestCount: number | undefined,
  computeQuoteTotalFromItems: ComputeQuoteTotal,
): QuotePriceData {
  const displayCurrency =
    (quote.displayCurrency as string) || (quote.currency as string) || "EUR";
  const guestPricing = (quote.guestPricing as GuestPricing) || null;
  const mandatoryFees = (quote.mandatoryFees as MandatoryFee[]) || [];

  let amount: number | null = null;
  const menuOptions = Array.isArray(quote.menuOptions) ? quote.menuOptions : [];
  const addOns = Array.isArray(quote.addOns) ? quote.addOns : [];

  const quoted =
    quote.quotedTotalCost != null
      ? typeof quote.quotedTotalCost === "string"
        ? parseFloat(quote.quotedTotalCost)
        : Number(quote.quotedTotalCost)
      : NaN;

  if (Number.isFinite(quoted) && quoted > 0) {
    amount = quoted;
  } else if (
    guestPricing &&
    typeof guestPricing.baseGuestCount === "number" &&
    typeof guestPricing.basePrice === "number"
  ) {
    amount =
      (guestPricing.basePriceWithFees as number | undefined) ??
      (guestPricing.basePrice as number);
  } else {
    const total =
      quote.totalPrice != null
        ? typeof quote.totalPrice === "string"
          ? parseFloat(quote.totalPrice)
          : Number(quote.totalPrice)
        : NaN;

    const base =
      quote.basePrice != null
        ? typeof quote.basePrice === "string"
          ? parseFloat(quote.basePrice)
          : Number(quote.basePrice)
        : NaN;

    if (Number.isFinite(total) && total > 0) amount = total;
    else if (Number.isFinite(base) && base > 0) amount = base;
  }

  if (
    (amount == null || amount === 0) &&
    (menuOptions.length || addOns.length)
  ) {
    const computed = computeQuoteTotalFromItems(quote, guestCount ?? 100);
    if (computed > 0) amount = computed;
  }

  return {
    amount: amount ?? 0,
    currency: displayCurrency,
    guestPricing,
    mandatoryFees,
  };
}
