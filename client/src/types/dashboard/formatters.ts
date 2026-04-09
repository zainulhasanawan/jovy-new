export function isRestriction(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    /\b(must end by|not permitted|not allowed|not allowed during|policy|policies|restriction|by 11|nesting season|outdoor activities)\b/i.test(
      normalized,
    ) || /(?:by|until)\s*\d{1,2}(?::\d{2})?\s*(?:pm|am)/i.test(normalized)
  );
}

export function splitExclusionsAndRestrictions(
  exclusions: string[],
  quoteRestrictions: string[] = [],
): { notIncluded: string[]; restrictions: string[] } {
  const notIncluded = exclusions.filter((entry) => !isRestriction(entry));
  const fromExclusions = exclusions.filter(isRestriction);

  return {
    notIncluded,
    restrictions: [...quoteRestrictions, ...fromExclusions],
  };
}

export function formatPrice(
  price: string | number | null | undefined,
  currency: string = "EUR",
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (!price) return formatter.format(0);

  const parsed = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(parsed)) return formatter.format(0);

  return formatter.format(parsed);
}
