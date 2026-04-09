/**
 * Shared utility functions for currency parsing and validation
 */

/**
 * Parses a currency value from a string, handling common formatting issues
 * @param value - String that may contain currency symbols, commas, spaces
 * @returns Parsed number or 0 if invalid
 *
 * Examples:
 * - "$1,200.50" -> 1200.5
 * - "3,500" -> 3500
 * - "EUR 2.400,00" -> 2400
 * - "invalid" -> 0
 */
export function parseCurrencyValue(value: unknown): number {
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  const rawValue =
    typeof value === "string"
      ? value
      : value === null || value === undefined
        ? ""
        : String(value);

  if (!rawValue) {
    return 0;
  }

  let cleanValue = rawValue
    .replace(/[$EURGBPJPYINRRUB¢€£¥₹₽]/g, "")
    .replace(/[^\d.,-]/g, "")
    .trim();

  if (!cleanValue) {
    return 0;
  }

  const isNegative = cleanValue.includes("-");
  cleanValue = cleanValue.replace(/-/g, "");

  if (cleanValue.includes(",") && cleanValue.includes(".")) {
    const lastCommaIndex = cleanValue.lastIndexOf(",");
    const lastDotIndex = cleanValue.lastIndexOf(".");

    if (lastCommaIndex > lastDotIndex) {
      cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
    } else {
      cleanValue = cleanValue.replace(/,/g, "");
    }
  } else if (cleanValue.includes(",")) {
    const commaCount = (cleanValue.match(/,/g) || []).length;
    const afterLastComma = cleanValue.substring(
      cleanValue.lastIndexOf(",") + 1,
    );

    if (commaCount === 1 && afterLastComma.length <= 2) {
      cleanValue = cleanValue.replace(",", ".");
    } else {
      cleanValue = cleanValue.replace(/,/g, "");
    }
  }

  const parsedValue = parseFloat(cleanValue);
  const result = Number.isNaN(parsedValue)
    ? 0
    : isNegative
      ? -parsedValue
      : parsedValue;

  return result;
}

/**
 * Safely parses numeric values from AI responses with fallback
 * @param value - Value to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed number or fallback
 */
export function safeParseNumber(value: unknown, fallback: number = 0): number {
  const parsed = parseCurrencyValue(value);
  return parsed === 0 && value !== 0 && value !== "0" ? fallback : parsed;
}

export interface QuoteCapacitySource {
  inclusions?: string[];
  terms?: string;
  notes?: string;
  rawContent?: string;
  packageName?: string;
  vendorName?: string;
}

/**
 * Formats a number as currency for display
 * @param amount - Numeric amount
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Extract guest capacity information from quote text/inclusions
 * @param quote - Quote object with inclusions and text
 * @returns Extracted capacity information
 */
export function extractGuestCapacityFromQuote(quote: QuoteCapacitySource): {
  baseCapacity?: number;
  perPersonPrice?: number;
  maxCapacity?: number;
} {
  const capacityPatterns = [
    /for (\d+) guests?/i,
    /accommodates (\d+)/i,
    /includes (\d+) people/i,
    /(\d+) person package/i,
    /up to (\d+) guests?/i,
  ];

  const perPersonPatterns = [
    /\$(\d+)(?:\.\d{2})? per (?:additional )?(?:extra )?(?:person|guest)/i,
    /additional guests? \$(\d+)/i,
    /extra guests? \$(\d+)/i,
    /\+\$(\d+)\/person/i,
    /\$(\d+) each additional/i,
  ];

  const maxCapacityPatterns = [
    /maximum (\d+) guests?/i,
    /max capacity (\d+)/i,
    /up to (\d+) (?:people|guests?) maximum/i,
  ];

  let baseCapacity: number | undefined;
  let perPersonPrice: number | undefined;
  let maxCapacity: number | undefined;

  const searchTexts = [
    ...(quote.inclusions || []),
    quote.terms || "",
    quote.notes || "",
    quote.rawContent || "",
    quote.packageName || "",
  ];

  const allText = searchTexts.join(" ");

  for (const pattern of capacityPatterns) {
    const match = allText.match(pattern);
    if (match && !baseCapacity) {
      baseCapacity = parseInt(match[1], 10);
      break;
    }
  }

  for (const pattern of perPersonPatterns) {
    const match = allText.match(pattern);
    if (match && !perPersonPrice) {
      perPersonPrice = parseInt(match[1], 10);
      break;
    }
  }

  for (const pattern of maxCapacityPatterns) {
    const match = allText.match(pattern);
    if (match && !maxCapacity) {
      maxCapacity = parseInt(match[1], 10);
      break;
    }
  }

  const isHeartOfOcean =
    quote.vendorName?.toLowerCase().includes("heart of") ||
    quote.packageName?.toLowerCase().includes("heart of") ||
    quote.vendorName?.toLowerCase().includes("blue diamond");

  if (isHeartOfOcean && !baseCapacity) {
    baseCapacity = 80;
    perPersonPrice = 65;
  }

  return {
    baseCapacity,
    perPersonPrice,
    maxCapacity,
  };
}

/**
 * Calculate actual pricing based on user's guest count vs quote's base capacity
 * @param quote - Quote with base pricing and capacity information
 * @param userGuestCount - User's actual guest count
 * @returns Detailed pricing breakdown with display string
 */
export function calculateGuestPricing(
  quote: {
    basePrice: number;
    baseCapacity?: number;
    perPersonPrice?: number;
    maxCapacity?: number;
    vendorName: string;
  },
  userGuestCount: number,
): {
  basePrice: number;
  baseCapacity: number;
  additionalGuests: number;
  additionalCost: number;
  totalPrice: number;
  priceDisplay: string;
  isOverCapacity: boolean;
  capacityWarning?: string;
} {
  let baseCapacity = Number(quote.baseCapacity) || 0;
  let perPersonPrice = Number(quote.perPersonPrice) || 0;
  const maxCapacity = quote.maxCapacity ? Number(quote.maxCapacity) : undefined;
  const basePrice = Number(quote.basePrice) || 0;

  if (baseCapacity === 0 && perPersonPrice === 0) {
    const extracted = extractGuestCapacityFromQuote(quote);
    baseCapacity = extracted.baseCapacity || 0;
    perPersonPrice = extracted.perPersonPrice || 0;
  }

  const additionalGuests = Math.max(0, userGuestCount - baseCapacity);
  const additionalCost = additionalGuests * perPersonPrice;
  const totalPrice = basePrice + additionalCost;

  const isOverCapacity = maxCapacity ? userGuestCount > maxCapacity : false;

  let priceDisplay = `${quote.vendorName}: $${basePrice.toLocaleString()}`;

  if (baseCapacity > 0) {
    priceDisplay += ` (${baseCapacity} guests)`;
  }

  if (additionalGuests > 0 && perPersonPrice > 0) {
    priceDisplay += ` + $${additionalCost.toLocaleString()} for ${additionalGuests} additional guests = $${totalPrice.toLocaleString()} total`;
  } else if (baseCapacity > 0) {
    priceDisplay += ` = $${totalPrice.toLocaleString()} total`;
  }

  let capacityWarning;
  if (isOverCapacity) {
    capacityWarning = `Warning: ${userGuestCount} guests exceeds maximum capacity of ${maxCapacity}`;
  } else if (baseCapacity === 0 && perPersonPrice === 0) {
    capacityWarning = "Guest count pricing not specified in quote";
  }

  return {
    basePrice,
    baseCapacity,
    additionalGuests,
    additionalCost,
    totalPrice,
    priceDisplay,
    isOverCapacity,
    capacityWarning,
  };
}

// ============================================================================
// LINE ITEM PRICING CALCULATION
// ============================================================================

export type PricingBasisType =
  | "flat"
  | "per_person"
  | "per_unit"
  | "per_hour"
  | "per_table"
  | "per_piece"
  | "per_night"
  | "per_person_per_night"
  | "tiered";

export interface LineItemPricingParams {
  price: number;
  pricingBasis: PricingBasisType;
  guestCount: number;
  quantity?: number;
  hours?: number;
  tables?: number;
  nights?: number;
  selectedDurationPrice?: number;
  selectedDurationPricePerPerson?: number;
}

export interface LineItemTotal {
  unitPrice: number;
  multiplier: number;
  multiplierLabel: string;
  total: number;
  breakdown: string;
}

export function calculateLineItemTotal(
  params: LineItemPricingParams,
): LineItemTotal {
  const {
    price,
    pricingBasis,
    guestCount,
    quantity = 1,
    hours = 1,
    tables = 1,
    selectedDurationPrice,
    selectedDurationPricePerPerson,
  } = params;

  let multiplier = 1;
  let multiplierLabel = "";
  let unitPrice = price;

  switch (pricingBasis) {
    case "per_person":
      multiplier = guestCount;
      multiplierLabel = `x ${guestCount} guests`;
      break;
    case "per_unit":
      multiplier = quantity;
      multiplierLabel = `x ${quantity} units`;
      break;
    case "per_hour":
      multiplier = hours;
      multiplierLabel = `x ${hours} hours`;
      break;
    case "per_table":
      multiplier = tables;
      multiplierLabel = `x ${tables} tables`;
      break;
    case "per_piece":
      multiplier = quantity;
      multiplierLabel = `x ${quantity} pieces`;
      break;
    case "per_night":
      multiplier = quantity;
      multiplierLabel = `x ${quantity} nights`;
      break;
    case "per_person_per_night":
      multiplier = guestCount * (params.nights || 1);
      multiplierLabel = `x ${guestCount} guests x ${params.nights || 1} nights`;
      break;
    case "tiered":
      if (selectedDurationPricePerPerson !== undefined) {
        unitPrice = selectedDurationPricePerPerson;
        multiplier = guestCount;
        multiplierLabel = `x ${guestCount} guests`;
      } else if (selectedDurationPrice !== undefined) {
        unitPrice = selectedDurationPrice;
        multiplier = 1;
        multiplierLabel = "";
      }
      break;
    case "flat":
    default:
      multiplier = 1;
      multiplierLabel = "";
      break;
  }

  const total = unitPrice * multiplier;
  const breakdown = multiplierLabel
    ? `${unitPrice.toLocaleString()} ${multiplierLabel} = ${total.toLocaleString()}`
    : `${total.toLocaleString()}`;

  return {
    unitPrice,
    multiplier,
    multiplierLabel,
    total,
    breakdown,
  };
}

/** Minimal quote-like shape for computing total from menu/addon items (no schema import). */
export interface QuoteLikeForTotal {
  basePrice?: number | string | null;
  totalPrice?: number | string | null;
  quotedTotalCost?: number | string | null;
  menuOptions?: Array<{
    price: number;
    pricingBasis?: string;
    selectedQuantity?: number;
    defaultQuantity?: number;
    durationOptions?: Array<{
      id?: string;
      price?: number;
      pricePerPerson?: number;
    }>;
    selectedDurationId?: string;
  }> | null;
  addOns?: Array<{
    price?: number | null;
    pricingBasis?: string;
    selectedQuantity?: number;
    defaultQuantity?: number;
    durationOptions?: Array<{
      id?: string;
      price?: number;
      pricePerPerson?: number;
    }>;
    selectedDurationId?: string;
  }> | null;
}

/**
 * Compute a display total for a quote from stored total/basePrice or from menu options + add-ons.
 */
export function computeQuoteTotalFromItems(
  quote: QuoteLikeForTotal,
  guestCount: number = 100,
): number {
  const n = (v: number | string | null | undefined) => {
    if (v == null) return 0;
    const num = typeof v === "string" ? parseFloat(v) : Number(v);
    return Number.isFinite(num) ? num : 0;
  };
  const quoted = n(quote.quotedTotalCost);
  if (quoted > 0) return quoted;
  const total = n(quote.totalPrice);
  if (total > 0) return total;
  const base = n(quote.basePrice);
  if (base > 0 && !quote.menuOptions?.length && !quote.addOns?.length)
    return base;

  let sum = base;
  const basis = (b: string | undefined): PricingBasisType =>
    (b as PricingBasisType) || "flat";
  const menuOptions = quote.menuOptions || [];
  const addOns = quote.addOns || [];

  for (const opt of menuOptions) {
    const quantity = opt.selectedQuantity ?? opt.defaultQuantity ?? 1;
    const price = Number(opt.price) || 0;
    if (price === 0) continue;
    let durationPrice: number | undefined;
    let durationPricePerPerson: number | undefined;
    if (opt.durationOptions?.length && opt.selectedDurationId) {
      const tier = opt.durationOptions.find(
        (d: { id?: string }) =>
          (d as { id?: string }).id === opt.selectedDurationId,
      );
      if (tier) {
        durationPrice = tier.price;
        durationPricePerPerson = tier.pricePerPerson;
      }
    }
    if (
      durationPrice == null &&
      durationPricePerPerson == null &&
      opt.durationOptions?.length
    ) {
      const first = opt.durationOptions[0];
      durationPrice = first?.price;
      durationPricePerPerson = first?.pricePerPerson;
    }
    const line = calculateLineItemTotal({
      price,
      pricingBasis: basis(opt.pricingBasis),
      guestCount,
      quantity,
      selectedDurationPrice: durationPrice,
      selectedDurationPricePerPerson: durationPricePerPerson,
    });
    sum += line.total;
  }

  for (const add of addOns) {
    const price = add.price != null ? Number(add.price) : 0;
    if (price === 0) continue;
    const quantity = add.selectedQuantity ?? add.defaultQuantity ?? 1;
    let durationPrice: number | undefined;
    let durationPricePerPerson: number | undefined;
    if (add.durationOptions?.length && add.selectedDurationId) {
      const tier = add.durationOptions.find(
        (d: { id?: string }) =>
          (d as { id?: string }).id === add.selectedDurationId,
      );
      if (tier) {
        durationPrice = tier.price;
        durationPricePerPerson = tier.pricePerPerson;
      }
    }
    if (
      durationPrice == null &&
      durationPricePerPerson == null &&
      add.durationOptions?.length
    ) {
      const first = add.durationOptions[0];
      durationPrice = first?.price;
      durationPricePerPerson = first?.pricePerPerson;
    }
    const line = calculateLineItemTotal({
      price,
      pricingBasis: basis(add.pricingBasis),
      guestCount,
      quantity,
      selectedDurationPrice: durationPrice,
      selectedDurationPricePerPerson: durationPricePerPerson,
    });
    sum += line.total;
  }

  return sum;
}

// ============================================================================
// PRICING BASIS DETECTION HEURISTICS
// ============================================================================

const PER_PERSON_PATTERNS = [
  /\bpp\b/i,
  /per\s*person/i,
  /per\s*guest/i,
  /per\s*head/i,
  /\/\s*person/i,
  /\/\s*guest/i,
  /each\s*guest/i,
  /per\s*pax/i,
  /\bpppn\b/i,
];

const PER_UNIT_PATTERNS: { pattern: RegExp; unitType: string }[] = [
  { pattern: /per\s*bottle/i, unitType: "bottle" },
  { pattern: /\/\s*bottle/i, unitType: "bottle" },
  { pattern: /per\s*keg/i, unitType: "keg" },
  { pattern: /keg\s*of/i, unitType: "keg" },
  { pattern: /per\s*case/i, unitType: "case" },
  { pattern: /per\s*table/i, unitType: "table" },
  { pattern: /\/\s*table/i, unitType: "table" },
  { pattern: /per\s*dozen/i, unitType: "dozen" },
  { pattern: /per\s*serving/i, unitType: "serving" },
  { pattern: /per\s*glass/i, unitType: "glass" },
  { pattern: /per\s*plate/i, unitType: "plate" },
];

const PER_HOUR_PATTERNS = [
  /per\s*hour/i,
  /\/\s*hr\b/i,
  /\/\s*hour/i,
  /hourly/i,
  /\bhours?\s*@/i,
];

const MEAL_KEYWORDS = [
  "dinner",
  "lunch",
  "brunch",
  "breakfast",
  "bbq",
  "barbecue",
  "menu",
  "meal",
  "buffet",
  "plated",
  "appetizer",
  "starter",
  "main course",
  "dessert",
  "reception dinner",
  "wedding dinner",
  "cocktail hour food",
  "canapes",
  "children menu",
  "kids menu",
];

export interface DetectedPricing {
  pricingBasis: PricingBasisType;
  unitType?: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export function detectPricingBasis(
  label: string,
  description?: string,
  rawPriceText?: string,
  category?: string,
): DetectedPricing {
  const combinedText = [label, description, rawPriceText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const pattern of PER_PERSON_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        pricingBasis: "per_person",
        confidence: "high",
        reason: "Explicit per-person indicator found",
      };
    }
  }

  if (
    /open\s*bar|bar\s*package|drinks?\s*package|beverage\s*package|unlimited\s*bar|premium\s*bar|all[- ]?inclusive\s*bar|cocktail\s*package/i.test(
      combinedText,
    )
  ) {
    return {
      pricingBasis: "per_person",
      confidence: "high",
      reason: "Open bar/beverage packages are per-person",
    };
  }

  for (const { pattern, unitType } of PER_UNIT_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        pricingBasis: "per_unit",
        unitType,
        confidence: "high",
        reason: `Per-unit indicator: ${unitType}`,
      };
    }
  }

  for (const pattern of PER_HOUR_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        pricingBasis: "per_hour",
        confidence: "high",
        reason: "Per-hour indicator found",
      };
    }
  }

  if (category === "bar_beverage" || category === "drinks") {
    if (/bottle|keg|case|glass/i.test(combinedText)) {
      const unitMatch = combinedText.match(/bottle|keg|case|glass/i);
      return {
        pricingBasis: "per_unit",
        unitType: unitMatch ? unitMatch[0].toLowerCase() : "bottle",
        confidence: "medium",
        reason: "Beverage item mentions unit type",
      };
    }
  }

  for (const keyword of MEAL_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      return {
        pricingBasis: "per_person",
        confidence: "medium",
        reason: `Meal-related keyword: ${keyword}`,
      };
    }
  }

  const priceMatch = combinedText.match(/[€$£]?\s*(\d+)/);
  if (priceMatch) {
    const extractedPrice = parseInt(priceMatch[1], 10);
    if (extractedPrice < 150 && extractedPrice > 10) {
      return {
        pricingBasis: "per_person",
        confidence: "low",
        reason: "Price range suggests per-person ($10-150)",
      };
    }
  }

  return {
    pricingBasis: "flat",
    confidence: "low",
    reason: "No pricing indicators found, defaulting to flat",
  };
}

export function inferUnitTypeFromLabel(label: string): string | undefined {
  const labelLower = label.toLowerCase();

  if (/wine|champagne|prosecco|cava|sparkling/i.test(labelLower))
    return "bottle";
  if (/beer|ale|lager|ipa/i.test(labelLower) && /keg/i.test(labelLower))
    return "keg";
  if (/cocktail/i.test(labelLower) && !/package|bar/i.test(labelLower))
    return "glass";
  if (/table/i.test(labelLower)) return "table";

  return undefined;
}

export function detectChildMenu(label: string, description?: string): boolean {
  const text = `${label} ${description || ""}`.toLowerCase();

  const childMenuPatterns = [
    /\(child(ren)?\s*(up\s+to\s*\d+|under\s*\d+)?\)/i,
    /\bchild(ren)?'?s?\s+(menu|option|plate|portion|meal|dinner|lunch|breakfast)\b/i,
    /\b(menu|dinner|lunch|breakfast|meal)\s+\(child(ren)?\)/i,
    /\bkids?\s+(menu|option|plate|portion|meal|dinner|lunch|breakfast)\b/i,
    /\bjunior\s+(menu|option|plate|portion|meal)\b/i,
  ];

  return childMenuPatterns.some((pattern) => pattern.test(text));
}

export function detectMenuVendorCategory(
  label: string,
  description?: string,
): string | undefined {
  const text = `${label} ${description || ""}`.toLowerCase();

  const drinkPatterns = [
    /\bbar\b/i,
    /\bcocktail/i,
    /\bwine/i,
    /\bchampagne/i,
    /\bbeer/i,
    /\bdrink/i,
    /\bspirits?\b/i,
    /\bprosecco/i,
    /\bcava\b/i,
    /\bmimosa/i,
    /\bsangria/i,
    /\bopen bar\b/i,
    /\bbar\s+package\b/i,
  ];

  const foodPatterns = [
    /\bdinner\b/i,
    /\blunch\b/i,
    /\bbreakfast\b/i,
    /\bbrunch\b/i,
    /\bmeal\b/i,
    /\bbbq\b/i,
    /\bcatering\b/i,
    /\bappetizer/i,
    /\bcanape/i,
    /\bmenu\b/i,
    /\bcake\b/i,
    /\bdessert/i,
    /\breception dinner\b/i,
    /\bwedding\s+(dinner|breakfast|brunch)\b/i,
  ];

  if (drinkPatterns.some((p) => p.test(text))) return "bar_beverage";
  if (foodPatterns.some((p) => p.test(text))) return "catering_food";
  return undefined;
}

export interface MenuOptionLike {
  targetAudience?: string;
  label?: string;
  description?: string;
  vendorCategory?: string;
  pricingBasis?: string;
  defaultQuantity?: number;
  rawPriceText?: string;
  category?: string;
  unitType?: string;
  [key: string]: unknown;
}

export interface AddOnLike {
  label?: string;
  description?: string;
  vendorCategory?: string;
  pricingBasis?: string;
  rawPriceText?: string;
  category?: string;
  unitType?: string;
  [key: string]: unknown;
}

type PostProcessedPricing = {
  pricingBasis?: string;
  unitType?: string;
  pricingConfidence?: DetectedPricing["confidence"];
  pricingReason?: string;
  targetAudience?: string;
  defaultQuantity?: number;
  vendorCategory?: string;
};

export function postProcessMenuOption(
  option: MenuOptionLike,
): MenuOptionLike & PostProcessedPricing {
  const isChildMenu =
    option.targetAudience === "child" ||
    detectChildMenu(option.label || "", option.description);

  const vendorCategory =
    option.vendorCategory ||
    detectMenuVendorCategory(option.label || "", option.description);

  if (option.pricingBasis && option.pricingBasis !== "flat") {
    return {
      ...option,
      targetAudience: isChildMenu ? "child" : option.targetAudience || "adult",
      defaultQuantity: isChildMenu ? 0 : option.defaultQuantity,
      vendorCategory,
    };
  }

  const detected = detectPricingBasis(
    option.label || "",
    option.description,
    option.rawPriceText,
    vendorCategory || option.category,
  );

  return {
    ...option,
    pricingBasis: detected.pricingBasis,
    unitType:
      detected.unitType ||
      option.unitType ||
      inferUnitTypeFromLabel(option.label || ""),
    pricingConfidence: detected.confidence,
    pricingReason: detected.reason,
    targetAudience: isChildMenu ? "child" : option.targetAudience || "adult",
    defaultQuantity: isChildMenu ? 0 : option.defaultQuantity,
    vendorCategory,
  };
}

export function postProcessAddOn(
  addon: AddOnLike,
): AddOnLike & PostProcessedPricing {
  const combinedText = [addon.label, addon.description, addon.rawPriceText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const vendorCategory =
    addon.vendorCategory ||
    detectMenuVendorCategory(addon.label || "", addon.description);

  const isBarPackage =
    /open\s*bar|bar\s*package|drinks?\s*package|beverage\s*package|unlimited\s*bar|premium\s*bar|all[- ]?inclusive\s*bar|cocktail\s*package/i.test(
      combinedText,
    );

  if (addon.pricingBasis && addon.pricingBasis !== "flat" && !isBarPackage) {
    return {
      ...addon,
      vendorCategory,
    };
  }

  const detected = detectPricingBasis(
    addon.label || "",
    addon.description,
    addon.rawPriceText,
    vendorCategory || addon.category,
  );

  return {
    ...addon,
    pricingBasis: detected.pricingBasis,
    unitType:
      detected.unitType ||
      addon.unitType ||
      inferUnitTypeFromLabel(addon.label || ""),
    pricingConfidence: detected.confidence,
    pricingReason: detected.reason,
    vendorCategory,
  };
}

// ============================================================================
// MANDATORY FEE CALCULATIONS
// ============================================================================

export interface MandatoryFeeInput {
  id?: string;
  label?: string;
  percentage?: number;
  flatAmount?: number;
  type?: "service" | "tax" | "gratuity" | "fee" | "other";
  appliesToBase?: boolean;
  appliesToAddOns?: boolean;
  appliesToAdditionalGuests?: boolean;
  appliesToBaseOnly?: boolean;
}

export interface GuestPricingInput {
  baseGuestCount: number;
  basePrice: number;
  additionalGuestPrice: number;
  maxGuests?: number;
}

export interface PricingBreakdown {
  basePrice: number;
  basePriceWithFees: number;
  additionalGuests: number;
  additionalGuestPricePerPerson: number;
  additionalGuestPricePerPersonWithFees: number;
  additionalGuestTotal: number;
  additionalGuestTotalWithFees: number;
  mandatoryFeesTotal: number;
  grandTotal: number;
  feeBreakdown: { label: string; amount: number }[];
}

const FEE_TYPE_ORDER: Record<string, number> = {
  service: 0,
  gratuity: 1,
  fee: 2,
  other: 2,
  tax: 3,
};

export function sortMandatoryFeesForCalculation(
  fees: MandatoryFeeInput[],
): MandatoryFeeInput[] {
  return [...fees].sort(
    (a, b) =>
      (FEE_TYPE_ORDER[a.type || "other"] ?? 2) -
      (FEE_TYPE_ORDER[b.type || "other"] ?? 2),
  );
}

export type AmountsAlreadyIncludingFeeType = {
  base?: number;
  addOns?: number;
  additionalGuests?: number;
};

export function applyMandatoryFeesWithBreakdown(
  amounts: {
    base?: number;
    addOns?: number;
    additionalGuests?: number;
  },
  fees: MandatoryFeeInput[],
  options: {
    includesTax?: boolean;
    includesServiceCharge?: boolean;
    amountsAlreadyIncludingFees?: {
      base?: number;
      addOns?: number;
      additionalGuests?: number;
    };
    amountsAlreadyIncludingService?: AmountsAlreadyIncludingFeeType;
    amountsAlreadyIncludingTax?: AmountsAlreadyIncludingFeeType;
  } = {},
): { totalWithFees: number; breakdown: { label: string; amount: number }[] } {
  const sortedFees = sortMandatoryFeesForCalculation(fees);
  const usePerTypeExclusion =
    options.amountsAlreadyIncludingService != null ||
    options.amountsAlreadyIncludingTax != null;
  const already = options.amountsAlreadyIncludingFees;

  let base: number;
  let addOns: number;
  let additionalGuests: number;
  let baseIncluded = 0;
  let addOnsIncluded = 0;
  let guestsIncluded = 0;

  if (usePerTypeExclusion) {
    base = amounts.base || 0;
    addOns = amounts.addOns || 0;
    additionalGuests = amounts.additionalGuests || 0;
  } else {
    base = Math.max(0, (amounts.base || 0) - (already?.base || 0));
    addOns = Math.max(0, (amounts.addOns || 0) - (already?.addOns || 0));
    additionalGuests = Math.max(
      0,
      (amounts.additionalGuests || 0) - (already?.additionalGuests || 0),
    );
    baseIncluded = already?.base || 0;
    addOnsIncluded = already?.addOns || 0;
    guestsIncluded = already?.additionalGuests || 0;
  }

  const feeTypeOpt = (applyTo: "base" | "addons" | "additionalGuests") => {
    if (!usePerTypeExclusion) return {};
    const key =
      applyTo === "addons"
        ? "addOns"
        : applyTo === "additionalGuests"
          ? "additionalGuests"
          : "base";
    return {
      amountsAlreadyIncludingFeeType: {
        service: options.amountsAlreadyIncludingService?.[key] || 0,
        tax: options.amountsAlreadyIncludingTax?.[key] || 0,
      },
    };
  };

  const breakdown: { label: string; amount: number }[] = [];

  for (let i = 0; i < sortedFees.length; i++) {
    const fee = sortedFees[i];
    if (fee.type === "tax" && options.includesTax) continue;
    if (fee.type === "service" && options.includesServiceCharge) continue;

    const feesUpToPrev = sortedFees.slice(0, i);
    const feesUpToCurrent = sortedFees.slice(0, i + 1);
    const baseOpt = (o: Record<string, unknown>) => ({
      ...o,
      initialBaseForTaxOnly: base,
    });
    const basePrev = applyMandatoryFees(
      base,
      feesUpToPrev,
      baseOpt({ applyTo: "base", ...options, ...feeTypeOpt("base") }),
    );
    const addOnsPrev = applyMandatoryFees(addOns, feesUpToPrev, {
      applyTo: "addons",
      ...options,
      ...feeTypeOpt("addons"),
    });
    const guestsPrev = applyMandatoryFees(additionalGuests, feesUpToPrev, {
      applyTo: "additionalGuests",
      ...options,
      ...feeTypeOpt("additionalGuests"),
    });
    const totalPrev = basePrev + addOnsPrev + guestsPrev;

    const baseCurr = applyMandatoryFees(
      base,
      feesUpToCurrent,
      baseOpt({ applyTo: "base", ...options, ...feeTypeOpt("base") }),
    );
    const addOnsCurr = applyMandatoryFees(addOns, feesUpToCurrent, {
      applyTo: "addons",
      ...options,
      ...feeTypeOpt("addons"),
    });
    const guestsCurr = applyMandatoryFees(additionalGuests, feesUpToCurrent, {
      applyTo: "additionalGuests",
      ...options,
      ...feeTypeOpt("additionalGuests"),
    });
    const totalCurr = baseCurr + addOnsCurr + guestsCurr;

    const feeAmount = totalCurr - totalPrev;
    const feeLabel = fee.label || "Mandatory Fee";
    const label =
      fee.flatAmount != null
        ? feeLabel
        : `${feeLabel} (${fee.percentage ?? 0}%)`;
    breakdown.push({ label, amount: Math.round(feeAmount * 100) / 100 });
  }

  const baseWithFees =
    applyMandatoryFees(base, sortedFees, {
      applyTo: "base",
      ...options,
      ...feeTypeOpt("base"),
      initialBaseForTaxOnly: base,
    }) + baseIncluded;
  const addOnsWithFees =
    applyMandatoryFees(addOns, sortedFees, {
      applyTo: "addons",
      ...options,
      ...feeTypeOpt("addons"),
    }) + addOnsIncluded;
  const guestsWithFees =
    applyMandatoryFees(additionalGuests, sortedFees, {
      applyTo: "additionalGuests",
      ...options,
      ...feeTypeOpt("additionalGuests"),
    }) + guestsIncluded;
  const totalWithFees = baseWithFees + addOnsWithFees + guestsWithFees;

  return { totalWithFees: Math.round(totalWithFees * 100) / 100, breakdown };
}

export function applyMandatoryFeesSimple(
  basePrice: number,
  fees: MandatoryFeeInput[],
): { totalWithFees: number; breakdown: { label: string; amount: number }[] } {
  const breakdown: { label: string; amount: number }[] = [];
  let runningTotal = basePrice;

  for (const fee of fees) {
    const feeAmount =
      fee.flatAmount != null
        ? fee.flatAmount
        : runningTotal * ((fee.percentage ?? 0) / 100);
    breakdown.push({
      label: (() => {
        const feeLabel = fee.label || "Mandatory Fee";
        return fee.flatAmount != null
          ? feeLabel
          : `${feeLabel} (${fee.percentage ?? 0}%)`;
      })(),
      amount: Math.round(feeAmount * 100) / 100,
    });
    runningTotal += feeAmount;
  }

  return {
    totalWithFees: Math.round(runningTotal * 100) / 100,
    breakdown,
  };
}

export function applyMandatoryFees(
  basePrice: number,
  fees: MandatoryFeeInput[],
  options: {
    applyTo?: "base" | "addons" | "additionalGuests";
    includesTax?: boolean;
    includesServiceCharge?: boolean;
    amountsAlreadyIncludingFeeType?: { service?: number; tax?: number };
    initialBaseForTaxOnly?: number;
  } = {},
): number {
  const {
    applyTo = "base",
    includesTax = false,
    includesServiceCharge = false,
    amountsAlreadyIncludingFeeType,
    initialBaseForTaxOnly,
  } = options;

  let result = basePrice;

  for (const fee of fees) {
    if (fee.type === "tax" && includesTax) continue;
    if (fee.type === "service" && includesServiceCharge) continue;

    const applies =
      (applyTo === "base" && fee.appliesToBase !== false) ||
      (applyTo === "addons" && fee.appliesToAddOns !== false) ||
      (applyTo === "additionalGuests" &&
        fee.appliesToAdditionalGuests !== false);

    if (!applies) continue;

    if (fee.flatAmount != null && typeof fee.flatAmount === "number") {
      result += fee.flatAmount;
      continue;
    }

    const pct = fee.percentage ?? 0;
    if (pct <= 0) continue;

    if (
      fee.appliesToBaseOnly &&
      applyTo === "base" &&
      initialBaseForTaxOnly != null
    ) {
      result += initialBaseForTaxOnly * (pct / 100);
      continue;
    }

    const excl = amountsAlreadyIncludingFeeType;
    const excludeThis =
      fee.type === "service" || fee.type === "gratuity"
        ? (excl?.service ?? 0)
        : fee.type === "tax"
          ? (excl?.tax ?? 0)
          : 0;
    const eligible = Math.max(0, result - excludeThis);
    result = eligible * (1 + pct / 100) + excludeThis;
  }

  return Math.round(result * 100) / 100;
}

export function calculatePricingWithFees(
  guestPricing: GuestPricingInput,
  fees: MandatoryFeeInput[],
  userGuestCount: number,
  options: { includesTax?: boolean; includesServiceCharge?: boolean } = {},
): PricingBreakdown {
  const { baseGuestCount, basePrice, additionalGuestPrice } = guestPricing;

  const basePriceWithFees = applyMandatoryFees(basePrice, fees, {
    applyTo: "base",
    ...options,
    initialBaseForTaxOnly: basePrice,
  });

  const additionalGuests = Math.max(0, userGuestCount - baseGuestCount);
  const additionalGuestTotal = additionalGuests * additionalGuestPrice;
  const additionalGuestPricePerPersonWithFees = applyMandatoryFees(
    additionalGuestPrice,
    fees,
    { applyTo: "additionalGuests", ...options },
  );
  const additionalGuestTotalWithFees =
    additionalGuests * additionalGuestPricePerPersonWithFees;

  const feeBreakdown: { label: string; amount: number }[] = [];
  let runningTotal = basePrice + additionalGuestTotal;

  for (const fee of fees) {
    if (fee.type === "tax" && options.includesTax) continue;
    if (fee.type === "service" && options.includesServiceCharge) continue;

    const pct = fee.percentage ?? 0;
    const feeAmount =
      fee.flatAmount != null
        ? fee.flatAmount
        : fee.appliesToBaseOnly
          ? basePrice * (pct / 100)
          : runningTotal * (pct / 100);
    feeBreakdown.push({
      label:
        fee.flatAmount != null
          ? fee.label || "Mandatory Fee"
          : `${fee.label || "Mandatory Fee"} (${pct}%)`,
      amount: Math.round(feeAmount * 100) / 100,
    });
    runningTotal = runningTotal + feeAmount;
  }

  const grandTotal = basePriceWithFees + additionalGuestTotalWithFees;
  const mandatoryFeesTotal = grandTotal - (basePrice + additionalGuestTotal);

  return {
    basePrice,
    basePriceWithFees,
    additionalGuests,
    additionalGuestPricePerPerson: additionalGuestPrice,
    additionalGuestPricePerPersonWithFees,
    additionalGuestTotal,
    additionalGuestTotalWithFees,
    mandatoryFeesTotal,
    grandTotal,
    feeBreakdown,
  };
}

/**
 * Calculate per-guest all-in cost estimate for a quote
 */
export function calculatePerGuestAllInCost(
  quote: {
    guestPricing?: GuestPricingInput | null;
    mandatoryFees?: MandatoryFeeInput[];
    accommodationDetails?: {
      pricePerNight?: { min: number; max: number; currency: string };
      pricePerNightWithFees?: { min: number; max: number; currency: string };
      nightsRequired?: number;
      guestsPayAccommodation?: boolean;
      estimatedTotalGuestCost?: number;
    } | null;
    currency?: string;
    basePrice?: string | number;
    totalPrice?: string | number;
    includesTax?: boolean;
    includesServiceCharge?: boolean;
  },
  userGuestCount: number,
): {
  min: number;
  max: number;
  currency: string;
  breakdown: {
    venuePackage?: number;
    accommodation?: { min: number; max: number } | number;
    total?: { min: number; max: number };
  };
} | null {
  if (!quote.guestPricing) {
    const totalPrice =
      typeof quote.totalPrice === "string"
        ? parseFloat(quote.totalPrice)
        : quote.totalPrice || 0;

    if (totalPrice > 0 && userGuestCount > 0) {
      const perGuest = totalPrice / userGuestCount;
      return {
        min: perGuest,
        max: perGuest,
        currency: quote.currency || "USD",
        breakdown: {
          venuePackage: perGuest,
          total: { min: perGuest, max: perGuest },
        },
      };
    }

    // Backward-compat fallback used in current UI flow
    const accommodationTotal =
      quote.accommodationDetails?.estimatedTotalGuestCost || 0;
    if (accommodationTotal > 0 && userGuestCount > 0) {
      const perGuestAccommodation = accommodationTotal / userGuestCount;
      return {
        min: perGuestAccommodation,
        max: perGuestAccommodation,
        currency: quote.currency || "USD",
        breakdown: {
          accommodation: perGuestAccommodation,
          total: { min: perGuestAccommodation, max: perGuestAccommodation },
        },
      };
    }

    return null;
  }

  const fees = quote.mandatoryFees || [];
  const currency = quote.currency || "USD";

  const pricingBreakdown = calculatePricingWithFees(
    quote.guestPricing,
    fees,
    userGuestCount,
    {
      includesTax: quote.includesTax,
      includesServiceCharge: quote.includesServiceCharge,
    },
  );

  const venuePackagePerGuest =
    userGuestCount > 0 ? pricingBreakdown.grandTotal / userGuestCount : 0;

  let accommodationPerGuest: { min: number; max: number } | undefined;

  if (
    quote.accommodationDetails?.pricePerNightWithFees &&
    quote.accommodationDetails.guestsPayAccommodation !== false
  ) {
    const nights = quote.accommodationDetails.nightsRequired || 1;
    const pricePerNight = quote.accommodationDetails.pricePerNightWithFees;

    const accMin =
      (typeof pricePerNight === "object" && pricePerNight.min !== undefined
        ? pricePerNight.min
        : 0) * nights;
    const accMax =
      (typeof pricePerNight === "object" && pricePerNight.max !== undefined
        ? pricePerNight.max
        : accMin) * nights;

    accommodationPerGuest = {
      min: accMin,
      max: accMax,
    };
  } else if (
    quote.accommodationDetails?.estimatedTotalGuestCost &&
    userGuestCount > 0
  ) {
    const acc =
      quote.accommodationDetails.estimatedTotalGuestCost / userGuestCount;
    accommodationPerGuest = { min: acc, max: acc };
  }

  const min = venuePackagePerGuest + (accommodationPerGuest?.min || 0);
  const max =
    venuePackagePerGuest +
    (accommodationPerGuest?.max || accommodationPerGuest?.min || 0);

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    currency,
    breakdown: {
      venuePackage: Math.round(venuePackagePerGuest * 100) / 100,
      ...(accommodationPerGuest && { accommodation: accommodationPerGuest }),
      total: {
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
      },
    },
  };
}

export function detectExternalVendorFee(
  label: string,
  description?: string,
): {
  isExternalVendorFee: boolean;
  pricingBasis: "flat" | "per_person";
  unitType?: string;
} {
  const combinedText = `${label} ${description || ""}`.toLowerCase();

  const externalVendorPatterns = [
    /external\s*vendor\s*fee/i,
    /outside\s*vendor\s*fee/i,
    /vendor\s*corkage/i,
    /outside\s*caterer\s*fee/i,
    /non-?preferred\s*vendor/i,
    /third[- ]?party\s*vendor/i,
    /external\s*contractor/i,
  ];

  const isExternalVendorFee = externalVendorPatterns.some((p) =>
    p.test(combinedText),
  );

  if (isExternalVendorFee) {
    const isPerPerson = /per\s*person|per\s*guest|pp\b/i.test(combinedText);
    return {
      isExternalVendorFee: true,
      pricingBasis: isPerPerson ? "per_person" : "flat",
      unitType: isPerPerson ? undefined : "vendor",
    };
  }

  return {
    isExternalVendorFee: false,
    pricingBasis: "flat",
  };
}

/**
 * Detects the quote structure type based on quote data
 */
export type QuoteStructureType =
  | "all_inclusive"
  | "venue_only"
  | "venue_with_required_options"
  | "itemized";

export function detectQuoteStructureType(quote: {
  menuOptions?: Array<{
    required?: boolean;
    price?: number | null;
    label?: string;
    name?: string;
  }>;
  addOns?: Array<{ required?: boolean; price?: number | null }>;
  inclusions?: string[];
  exclusions?: string[];
  basePrice?: string | number;
  totalPrice?: string | number;
  packageName?: string | null;
  quoteSubtype?: string | null;
}): QuoteStructureType {
  const menuOptions = (quote.menuOptions || []) as Array<{
    required?: boolean;
    price?: number | null;
    label?: string;
    name?: string;
  }>;
  const addOns = (quote.addOns || []) as Array<{
    required?: boolean;
    price?: number | null;
  }>;
  const inclusions = (quote.inclusions || []) as string[];
  const exclusions = (quote.exclusions || []) as string[];
  const basePrice =
    typeof quote.basePrice === "string"
      ? parseFloat(quote.basePrice)
      : quote.basePrice || 0;
  const totalPrice =
    typeof quote.totalPrice === "string"
      ? parseFloat(quote.totalPrice)
      : quote.totalPrice || 0;
  const hasPackageName = !!quote.packageName;
  const packageNameLower = (quote.packageName || "").toLowerCase();
  const vendorName = (
    (quote as { vendorName?: string | null }).vendorName || ""
  ).toLowerCase();
  const pricingTiers =
    (quote as { pricingTiers?: Array<{ label?: string }> }).pricingTiers || [];
  const exclusionsText = exclusions.join(" ").toLowerCase();

  const hasPricingTiers =
    Array.isArray(pricingTiers) && pricingTiers.length >= 2;
  const hasSignificantBasePrice = basePrice >= 1000;
  const hasFoodDrinkExcluded =
    /food|drink|catering|f&b|beverage|meal|dinner/i.test(exclusionsText);
  const hasFoodDrinkMenuOptions = menuOptions.some((m) => {
    const label = (m.label || m.name || "").toLowerCase();
    return /dinner|lunch|breakfast|brunch|bbq|menu|meal|catering|drinks|bar|wine|cocktail|appetizer/i.test(
      label,
    );
  });

  if (
    (hasPricingTiers || hasSignificantBasePrice) &&
    hasFoodDrinkMenuOptions &&
    hasFoodDrinkExcluded
  ) {
    return "venue_only";
  }

  if (hasPricingTiers && menuOptions.length >= 2) {
    const tierLabels = pricingTiers
      .map((t) => (t.label || "").toLowerCase())
      .join(" ");
    if (
      /santoline|jasmin|asphodele|venue\s*hire|rental|privatisation|season|chateau|serjac/i.test(
        tierLabels,
      ) ||
      vendorName.includes("serjac")
    ) {
      return "venue_only";
    }
  }

  const quoteSubtype = (quote as { quoteSubtype?: string | null }).quoteSubtype;
  if (quoteSubtype) {
    if (quoteSubtype === "type_a") return "all_inclusive";
    if (quoteSubtype === "type_b") return "venue_only";
    if (quoteSubtype === "type_c") return "itemized";
  }

  const hasRequiredMenuOptions = menuOptions.some((m) => m.required === true);
  const hasManyInclusions = inclusions.length >= 5;
  const hasOptionalMenuOptions =
    menuOptions.length > 0 && !hasRequiredMenuOptions;
  const hasMultiplePricedItems =
    menuOptions.filter((m) => (m.price ?? 0) > 0).length +
      addOns.filter((a) => (a.price ?? 0) > 0).length >=
    3;

  if (/all\s*inclusive|all-inclusive|allinclusive/.test(packageNameLower)) {
    return "all_inclusive";
  }
  if (hasManyInclusions && !hasMultiplePricedItems) {
    return "all_inclusive";
  }

  const inclusionText = inclusions.join(" ").toLowerCase();
  const hasBundledWeddingInclusions =
    hasManyInclusions &&
    !hasRequiredMenuOptions &&
    /ceremony|cocktail|reception|coordinator|included|open bar|dinner|package/.test(
      inclusionText,
    ) &&
    ((inclusionText.includes("ceremony") &&
      inclusionText.includes("reception")) ||
      /what'?s\s+included|package\s+includes/i.test(inclusionText));

  if (hasBundledWeddingInclusions) {
    return "all_inclusive";
  }

  const totalLineItems = menuOptions.length + addOns.length;
  const hasMultipleMenuItems = totalLineItems >= 3;
  const priceDifference =
    totalPrice > 0 && basePrice > 0 ? (totalPrice - basePrice) / basePrice : 0;
  const hasFullItemizedProposal = totalLineItems >= 8 && hasMultiplePricedItems;
  const looksLikeItemizedProposal =
    hasPackageName &&
    hasMultipleMenuItems &&
    (priceDifference > 0.1 || (basePrice <= 0 && totalPrice > 0));
  const packageNameSaysItemized = /itemized|proposal|proposed\s+package/i.test(
    packageNameLower,
  );
  const isItemized =
    looksLikeItemizedProposal ||
    hasFullItemizedProposal ||
    (packageNameSaysItemized && hasMultipleMenuItems);

  if (isItemized) {
    return "itemized";
  }

  if (hasRequiredMenuOptions) {
    return "venue_with_required_options";
  }

  const hasCateringInInclusions =
    /catering|food|dinner|menu|meal|bar|drink|beverage/i.test(inclusionText);

  if (
    hasCateringInInclusions &&
    menuOptions.length === 0 &&
    addOns.length === 0
  ) {
    return "all_inclusive";
  }

  const hasOptionalAddOnsOnly =
    addOns.length > 0 &&
    menuOptions.length === 0 &&
    !addOns.some((a) => a.required === true);

  if (
    hasOptionalMenuOptions ||
    (menuOptions.length > 0 && !hasCateringInInclusions) ||
    hasOptionalAddOnsOnly
  ) {
    return "venue_only";
  }

  return "venue_only";
}

export function extractMandatoryFeesFromText(
  text: string,
): MandatoryFeeInput[] {
  const fees: MandatoryFeeInput[] = [];

  const patterns = [
    {
      regex: /(\d+(?:\.\d+)?)\s*%\s*service\s*(?:charge|fee)?/gi,
      type: "service" as const,
      label: "Service Charge",
    },
    {
      regex: /service\s*(?:charge|fee)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/gi,
      type: "service" as const,
      label: "Service Charge",
    },
    {
      regex: /(\d+(?:\.\d+)?)\s*%\s*(?:iva|vat|sales)\s*(?:tax)?/gi,
      type: "tax" as const,
      label: "Tax",
    },
    {
      regex: /(?:iva|vat|sales)\s*(?:tax)?\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/gi,
      type: "tax" as const,
      label: "Tax",
    },
    {
      regex: /(\d+(?:\.\d+)?)\s*%\s*gratuity/gi,
      type: "gratuity" as const,
      label: "Gratuity",
    },
    {
      regex: /gratuity\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/gi,
      type: "gratuity" as const,
      label: "Gratuity",
    },
    {
      regex: /(\d+(?:\.\d+)?)\s*%\s*administrative\s*(?:fee)?/gi,
      type: "fee" as const,
      label: "Administrative Fee",
    },
  ];

  for (const { regex, type, label } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const percentage = parseFloat(match[1]);
      if (percentage > 0 && percentage < 50) {
        const existsAlready = fees.some(
          (f) =>
            f.type === type && Math.abs((f.percentage ?? 0) - percentage) < 0.1,
        );
        if (!existsAlready) {
          fees.push({
            id: `fee-${type}-${percentage}`,
            label: `${label} (${percentage}%)`,
            percentage,
            type,
            appliesToBase: true,
            appliesToAddOns: true,
            appliesToAdditionalGuests: true,
          });
        }
      }
    }
  }

  return fees;
}
