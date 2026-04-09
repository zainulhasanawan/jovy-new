import type { Quote } from "@/types/dashboard/schema";
import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";
import type { LocationTier } from "@/types/dashboard/location";
import type {
  ServiceCategoryType,
  TierType,
  NewEventRequirementsLike,
  UnifiedCoverageOptions,
  UnifiedCoverageResult,
  VendorCategoryInfo,
  VendorCoverageSummary,
  VendorCoverageInput,
  GapAnalysisResult,
  EventAwareCoveredPair,
  EventAwareGap,
  EventAwareCoverageResult,
} from "@/types/dashboard/coverage-utils";
import { SEGMENT_IDS } from "@/utils/dashboard/wedding-taxonomy";
import {
  VENDOR_TAXONOMY,
  VENDOR_CATEGORY_IDS,
  mapVendorTypeToCategory,
  getEstimatedCostForSubcategory,
  migrateLegacyServiceToSubcategory,
  inferVendorCategoryFromQuote,
} from "@/utils/dashboard/vendor-taxonomy";
import { getLocationAdjustedCost } from "@/utils/dashboard/location-utils";

export type {
  ServiceCategoryType,
  TierType,
  RequirementEntry,
  NewEventRequirementsLike,
  UnifiedCoverageOptions,
  UnifiedCoverageResult,
  VendorCategoryInfo,
  VendorCoverageSummary,
  VendorCoverageInput,
  GapAnalysisResult,
  EventAwareCoveredPair,
  EventAwareGap,
  EventAwareCoverageResult,
} from "@/types/dashboard/coverage-utils";

/**
 * Coverage mapping utilities for wedding quote analysis
 */

type EventCoverageServiceLike = {
  status?: string;
};

type EventCoverageSegmentLike = {
  services?: Record<string, EventCoverageServiceLike>;
};

type QuoteLike = Quote & {
  id?: string;
  vendorName?: string;
  vendorCategory?: string;
  vendorType?: string;
  coveredSubcategories?: string[] | null;
  alsoCoversCategories?: Record<string, string[]> | null;
  coveredPairs?: Array<{ category?: string; events?: string[] }> | null;
  itemMappings?: Array<{
    category?: string;
    event?: string;
    skipped?: boolean;
  }> | null;
  menuOptions?: Array<{ id?: string; vendorCategory?: string }> | null;
  eventCoverage?: Record<string, EventCoverageSegmentLike>;
  quoteSubtype?: string;
  exclusions?: Array<string | { name?: string }>;
};

type SelectedServiceLike = {
  quoteId?: string;
  name?: string;
  category?: string;
  price?: number;
  vendorName?: string;
  originalComponent?: {
    isPackage?: boolean;
    coveredCategories?: string[];
  };
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isVendorCategory(value: string): value is VendorCategoryType {
  return VENDOR_CATEGORY_IDS.includes(value as VendorCategoryType);
}

/**
 * Estimate cost for missing wedding services based on category, tier, and guest count
 */
export function estimateFallbackCost(
  category: ServiceCategoryType,
  tier: TierType,
  guestCount: number = 100,
): number {
  const baseCosts: Record<ServiceCategoryType, number> = {
    venue: 8000,
    catering: 75,
    photography: 2500,
    videography: 1800,
    flowers: 1200,
    music_dj: 800,
    music_band: 2500,
    officiant: 500,
    rentals: 1500,
    lighting: 600,
    cake: 400,
    transportation: 300,
    planner: 1500,
    stationery: 400,
    decor: 1200,
    av: 800,
    lodging: 150,
    beauty_preparation: 800,
    ceremony_details: 1000,
    reception_setup: 900,
    entertainment: 1200,
    luxury: 2000,
    day_of_coordination: 1500,
    other: 500,
  };

  const tierMultipliers: Record<TierType, number> = {
    basic: 0.7,
    standard: 1.0,
    premium: 1.8,
  };

  const baseCost = baseCosts[category] || 500;
  const tierMultiplier = tierMultipliers[tier];

  if (category === "catering") {
    return baseCost * guestCount * tierMultiplier;
  }
  if (category === "lodging") {
    const estimatedRooms = Math.ceil(guestCount * 0.3);
    return baseCost * estimatedRooms * tierMultiplier;
  }

  return baseCost * tierMultiplier;
}

function extractCoveredCategoriesFromEventServices(
  eventServices: Array<{ included?: boolean; serviceCategory?: string }>,
): Set<string> {
  const categories = new Set<string>();
  eventServices.forEach((eventService) => {
    if (eventService.included && eventService.serviceCategory) {
      categories.add(eventService.serviceCategory);
    }
  });
  return categories;
}

function calculateGuestPricing(
  quote: {
    basePrice?: number;
    baseCapacity?: number;
    perPersonPrice?: number;
    maxCapacity?: number;
    vendorName?: string;
  },
  guestCount: number,
): { totalPrice: number; pricePerGuest: number } {
  const basePrice = toNumber(quote.basePrice);
  const baseCapacity = toNumber(quote.baseCapacity);
  const perPerson = toNumber(quote.perPersonPrice);

  if (baseCapacity > 0 && guestCount > baseCapacity && perPerson > 0) {
    const additionalGuests = guestCount - baseCapacity;
    const total = basePrice + additionalGuests * perPerson;
    return {
      totalPrice: total,
      pricePerGuest: guestCount > 0 ? total / guestCount : 0,
    };
  }

  return {
    totalPrice: basePrice,
    pricePerGuest: guestCount > 0 ? basePrice / guestCount : 0,
  };
}

/**
 * Comprehensive coverage computation with guest pricing analysis
 * Supports event-based (eventPackageDetails) and legacy (packageDetails-like) structures.
 */
export function computeCoverage(
  requirements: Record<
    string,
    { desired: boolean; tier: string; qty?: number; notes?: string }
  >,
  selectedServices: SelectedServiceLike[],
  quotes: Quote[],
  guestCount: number,
) {
  const requiredCategories = Object.keys(requirements || {}).filter(
    (cat) => requirements?.[cat]?.desired,
  );

  const coveredCategories = new Set<string>();
  let totalCoveredCost = 0;
  const guestBreakdowns: Array<Record<string, unknown>> = [];

  selectedServices.forEach((service) => {
    if (service.originalComponent?.isPackage) {
      const relatedQuote = quotes.find(
        (q) => (q as QuoteLike).id === service.quoteId,
      ) as
        | (QuoteLike & {
            eventPackageDetails?: {
              eventServices?: Array<{
                included?: boolean;
                serviceCategory?: string;
              }>;
            };
          })
        | undefined;

      if (relatedQuote?.eventPackageDetails?.eventServices) {
        const eventCoveredCategories =
          extractCoveredCategoriesFromEventServices(
            relatedQuote.eventPackageDetails.eventServices,
          );
        eventCoveredCategories.forEach((cat) => {
          if (requiredCategories.includes(cat)) {
            coveredCategories.add(cat);
          }
        });
      } else if (service.originalComponent.coveredCategories) {
        service.originalComponent.coveredCategories.forEach((cat) => {
          if (requiredCategories.includes(cat)) {
            coveredCategories.add(cat);
          }
        });
      }

      if (relatedQuote) {
        const guestPricing = calculateGuestPricing(
          {
            basePrice:
              toNumber(relatedQuote.basePrice) || toNumber(service.price),
            baseCapacity: toNumber(relatedQuote.baseCapacity) || undefined,
            perPersonPrice: toNumber(relatedQuote.perPersonPrice) || undefined,
            maxCapacity: toNumber((relatedQuote as QuoteLike).maxCapacity),
            vendorName: relatedQuote.vendorName,
          },
          guestCount,
        );

        totalCoveredCost += guestPricing.totalPrice;
        guestBreakdowns.push({
          serviceName: service.name,
          vendorName: service.vendorName,
          ...guestPricing,
        });
      } else {
        totalCoveredCost += toNumber(service.price);
      }
    } else {
      if (service.category && requiredCategories.includes(service.category)) {
        coveredCategories.add(service.category);
      }
      totalCoveredCost += toNumber(service.price);
    }
  });

  const coveragePercent =
    requiredCategories.length > 0
      ? (coveredCategories.size / requiredCategories.length) * 100
      : 0;

  const missingServices = requiredCategories.filter(
    (cat) => !coveredCategories.has(cat),
  );
  const missingEstimatedCost = missingServices.reduce(
    (total, serviceCategory) => {
      const requirement = requirements?.[serviceCategory];
      const tier = ((requirement?.tier as TierType) || "standard") as TierType;
      return (
        total +
        estimateFallbackCost(
          serviceCategory as ServiceCategoryType,
          tier,
          guestCount,
        )
      );
    },
    0,
  );

  return {
    coveredByCategory: Array.from(coveredCategories),
    missingByCategory: missingServices,
    coveragePercent,
    totals: {
      coveredCost: totalCoveredCost,
      missingEstimatedCost,
      guestBreakdowns,
    },
  };
}

/**
 * UNIFIED COVERAGE CALCULATION - Single source of truth for all views
 */
export function calculateUnifiedCoverage(
  requirements: NewEventRequirementsLike | null | undefined,
  venueQuote: Quote | null | undefined,
  options: UnifiedCoverageOptions = {},
): UnifiedCoverageResult {
  const {
    selectedAddOns = [],
    attachedVendorCoveredServices = [],
    manualOverrides = {},
  } = options;

  if (!requirements) {
    return {
      percentage: 0,
      coveredServices: new Set(),
      totalServices: 0,
      missingServices: [],
    };
  }

  let totalServices = 0;
  const coveredServicesSet = new Set<string>();
  const missingServicesList: string[] = [];

  const segmentIds = SEGMENT_IDS.length
    ? SEGMENT_IDS
    : Object.keys(requirements);

  for (const segmentId of segmentIds) {
    const segReq = requirements[segmentId];
    if (!segReq?.desired) continue;

    const venueCoverage = (venueQuote as QuoteLike | null | undefined)
      ?.eventCoverage?.[segmentId] as EventCoverageSegmentLike | undefined;
    const selectedServices = segReq.selectedServices || [];

    for (const serviceId of selectedServices) {
      totalServices++;

      if (manualOverrides[serviceId] === "included") {
        coveredServicesSet.add(serviceId);
        continue;
      }
      if (manualOverrides[serviceId] === "excluded") {
        missingServicesList.push(serviceId);
        continue;
      }

      const serviceStatus = venueCoverage?.services?.[serviceId]?.status;

      if (serviceStatus === "included") {
        coveredServicesSet.add(serviceId);
      } else if (
        serviceStatus === "available_for_fee" &&
        selectedAddOns.includes(serviceId)
      ) {
        coveredServicesSet.add(serviceId);
      } else {
        let coveredByVendor = false;
        for (const vendorCoverage of attachedVendorCoveredServices) {
          if (vendorCoverage.has(serviceId)) {
            coveredServicesSet.add(serviceId);
            coveredByVendor = true;
            break;
          }
        }

        if (!coveredByVendor) {
          missingServicesList.push(serviceId);
        }
      }
    }
  }

  const percentage =
    totalServices > 0
      ? Math.round((coveredServicesSet.size / totalServices) * 100)
      : 0;

  return {
    percentage,
    coveredServices: coveredServicesSet,
    totalServices,
    missingServices: missingServicesList,
  };
}

// ============================================================
// VENDOR CATEGORY COVERAGE (Phase 2 - 8-category model)
// ============================================================

/**
 * Build effective alsoCoversCategories for a venue quote.
 * Type A: use quote's alsoCoversCategories as-is.
 * Type B/C: also include categories of selected menu options.
 */
export function getEffectiveAlsoCoversCategories(
  quote: Quote,
  selectedMenuOptionIds: string[] = [],
): Record<string, string[]> {
  const raw = ((quote as QuoteLike).alsoCoversCategories || {}) as Record<
    string,
    string[]
  >;
  const subtype = (quote as QuoteLike).quoteSubtype;
  const isTypeBOrC = subtype === "type_b" || subtype === "type_c";

  if (
    !isTypeBOrC ||
    !selectedMenuOptionIds.length ||
    !Array.isArray((quote as QuoteLike).menuOptions)
  ) {
    return { ...raw };
  }

  const effective: Record<string, string[]> = { ...raw };
  const menuOptions = (quote as QuoteLike).menuOptions as Array<{
    id?: string;
    vendorCategory?: string;
  }>;

  for (const id of selectedMenuOptionIds) {
    const option = menuOptions.find((m) => m.id === id);
    const category = option?.vendorCategory as VendorCategoryType | undefined;
    if (category && VENDOR_CATEGORY_IDS.includes(category)) {
      if (!effective[category]?.length) {
        const categoryTaxonomy = VENDOR_TAXONOMY[category];
        const firstSub = categoryTaxonomy?.standardServices?.[0]?.id;
        effective[category] = firstSub ? [firstSub] : ["_selected"];
      }
    }
  }

  return effective;
}

/**
 * Cross-reference quote against required vendor categories.
 */
export function getGapAnalysis(
  quote: Quote,
  requiredCategoryIds: string[],
  selectedMenuOptionIds: string[] = [],
): GapAnalysisResult {
  const rawExclusions: Array<string | { name?: string }> = Array.isArray(
    (quote as QuoteLike).exclusions,
  )
    ? ((quote as QuoteLike).exclusions ?? [])
    : [];

  const explicitExclusions = rawExclusions
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : entry && typeof entry === "object"
          ? String((entry as { name?: string }).name || "")
          : "",
    )
    .filter((entry): entry is string => entry.trim().length > 0);

  const effectiveAlsoCovers = getEffectiveAlsoCoversCategories(
    quote,
    selectedMenuOptionIds,
  );
  const covered = new Set<string>(Object.keys(effectiveAlsoCovers));

  if ((quote as QuoteLike).vendorCategory) {
    covered.add((quote as QuoteLike).vendorCategory as string);
  }

  const venueAvailable = new Set<string>();
  const menuOptions = Array.isArray((quote as QuoteLike).menuOptions)
    ? ((quote as QuoteLike).menuOptions as Array<{ vendorCategory?: string }>)
    : [];

  menuOptions.forEach((option) => {
    if (option.vendorCategory) {
      venueAvailable.add(option.vendorCategory);
    }
  });

  const availableFromVenue: string[] = [];
  const mustSourceExternally: string[] = [];

  requiredCategoryIds.forEach((categoryId) => {
    if (covered.has(categoryId)) return;

    if (venueAvailable.has(categoryId)) {
      availableFromVenue.push(categoryId);
    } else {
      mustSourceExternally.push(categoryId);
    }
  });

  return { explicitExclusions, availableFromVenue, mustSourceExternally };
}

export function getVendorCategoryCoverage(
  input: VendorCoverageInput,
): VendorCategoryInfo[] {
  const {
    venueQuote,
    attachedVendorQuoteIds,
    allQuotes,
    selectedMenuOptionIds = [],
  } = input;

  const effectiveVenueAlsoCovers = venueQuote
    ? getEffectiveAlsoCoversCategories(venueQuote, selectedMenuOptionIds)
    : {};

  const attachedVendors = attachedVendorQuoteIds
    .map((id) => allQuotes.find((q) => (q as QuoteLike).id === id))
    .filter(Boolean) as Quote[];

  const allQuotesForOption = venueQuote
    ? [venueQuote, ...attachedVendors]
    : attachedVendors;
  const categories: VendorCategoryInfo[] = [];

  for (const categoryId of VENDOR_CATEGORY_IDS) {
    const category = VENDOR_TAXONOMY[categoryId];

    const primaryVendor = allQuotesForOption.find((rawQuote) => {
      const quote = rawQuote as QuoteLike;
      if (quote.vendorCategory === categoryId) return true;
      const mappedCategory = mapVendorTypeToCategory(quote.vendorType || "");
      if (mappedCategory === categoryId) return true;

      const pairs = quote.coveredPairs as
        | Array<{ category?: string }>
        | null
        | undefined;
      if (pairs && pairs.some((pair) => pair.category === categoryId))
        return true;

      return false;
    });

    const secondaryVendors = allQuotesForOption.filter((rawQuote) => {
      const quote = rawQuote as QuoteLike;
      if (quote === primaryVendor) return false;

      const alsoCovers =
        quote === venueQuote
          ? effectiveVenueAlsoCovers
          : (quote.alsoCoversCategories as Record<string, string[]>) || {};
      if (alsoCovers[categoryId]) return true;

      const pairs = quote.coveredPairs as
        | Array<{ category?: string }>
        | null
        | undefined;
      if (pairs && pairs.some((pair) => pair.category === categoryId))
        return true;

      return false;
    });

    const neededSubcategories = category.standardServices.map(
      (service) => service.id,
    );

    let coveredSubcategories: string[] = [];
    let bookedVendorName: string | undefined;
    let bookedQuoteId: string | undefined;

    if (primaryVendor) {
      const primary = primaryVendor as QuoteLike;
      const quoteCoverage = primary.coveredSubcategories;
      coveredSubcategories =
        quoteCoverage && quoteCoverage.length > 0
          ? [...quoteCoverage]
          : [...neededSubcategories];
      bookedVendorName = primary.vendorName;
      bookedQuoteId = primary.id;
    }

    for (const vendorRaw of secondaryVendors) {
      const vendor = vendorRaw as QuoteLike;
      const alsoCovers =
        vendor === venueQuote
          ? effectiveVenueAlsoCovers
          : (vendor.alsoCoversCategories as Record<string, string[]>) || {};
      const additionalSubcategories = alsoCovers[categoryId] || [];

      for (const subcategory of additionalSubcategories) {
        if (!coveredSubcategories.includes(subcategory)) {
          coveredSubcategories.push(subcategory);
        }
      }

      if (!bookedVendorName) {
        bookedVendorName = vendor.vendorName;
        bookedQuoteId = vendor.id;
      }
    }

    const coveredCount = coveredSubcategories.filter((subcategory) =>
      neededSubcategories.includes(subcategory),
    ).length;
    const neededCount = neededSubcategories.length;

    let status: "booked" | "partial" | "needed";
    if (coveredCount === 0) {
      status = "needed";
    } else if (coveredCount >= neededCount) {
      status = "booked";
    } else {
      status = "partial";
    }

    categories.push({
      categoryId,
      categoryName: category.name,
      icon: category.icon,
      status,
      bookedVendorName: coveredCount > 0 ? bookedVendorName : undefined,
      bookedQuoteId: coveredCount > 0 ? bookedQuoteId : undefined,
      coveredSubcategories,
      neededSubcategories,
    });
  }

  return categories;
}

export function getVendorCoverageSummary(
  categories: VendorCategoryInfo[],
): VendorCoverageSummary {
  const booked = categories.filter(
    (category) => category.status === "booked",
  ).length;
  const partial = categories.filter(
    (category) => category.status === "partial",
  ).length;
  const total = categories.length;
  const effectiveBooked = booked + partial * 0.5;
  const percentage =
    total > 0 ? Math.round((effectiveBooked / total) * 100) : 0;

  return {
    booked,
    partial,
    total,
    percentage,
    coveredCount: booked + partial,
    totalCount: total,
    percentCovered: percentage,
  };
}

/**
 * Single source of truth for missing-service cost estimates (vendor-taxonomy + location).
 */
export function estimateMissingServiceCost(
  legacyServiceId: string,
  locationTier: LocationTier,
): number {
  if (legacyServiceId === "prep_beauty") {
    const combinedBeautyCost = 1200;
    return getLocationAdjustedCost(combinedBeautyCost, locationTier);
  }

  if (legacyServiceId === "other_services") {
    const genericOtherCost = 500;
    return getLocationAdjustedCost(genericOtherCost, locationTier);
  }

  const subcategoryId = migrateLegacyServiceToSubcategory(legacyServiceId);
  const baseCost = subcategoryId
    ? getEstimatedCostForSubcategory(subcategoryId, "mid")
    : 500;

  return getLocationAdjustedCost(baseCost, locationTier);
}

// ============================================================
// EVENT-AWARE COVERAGE (Phase 3 — itemMappings-driven)
// ============================================================
/**
 * Compute per-(category × event) coverage from a set of quotes.
 */
export function getEventAwareCoverage(params: {
  quotes: Quote[];
  servicesByEvent: Record<string, VendorCategoryType[]>;
  allDayServices: VendorCategoryType[];
}): EventAwareCoverageResult {
  const { quotes, servicesByEvent, allDayServices } = params;

  const allEvents = Object.keys(servicesByEvent ?? {});
  if (allEvents.length === 0) {
    return { coveredPairs: [], gaps: [], allCovered: true, totalRequired: 0 };
  }

  const coveredPairKey = (event: string, category: string) =>
    `${event}|${category}`;
  const rawCovered: EventAwareCoveredPair[] = [];

  const BUILT_IN_EVENT_IDS = [
    "ceremony",
    "cocktail_hour",
    "reception",
    "rehearsal_dinner",
    "welcome_event",
    "next_day_brunch",
    "after_party",
  ];

  const applyAlsoCoversCategories = (quote: QuoteLike, source: string) => {
    const alsoCovers = (quote.alsoCoversCategories ?? {}) as Record<
      string,
      unknown
    >;
    for (const categoryId of Object.keys(alsoCovers)) {
      const category = categoryId as VendorCategoryType;
      if (!VENDOR_CATEGORY_IDS.includes(category)) continue;

      for (const [event, categories] of Object.entries(servicesByEvent)) {
        if (!BUILT_IN_EVENT_IDS.includes(event)) continue;
        if ((categories as VendorCategoryType[]).includes(category)) {
          rawCovered.push({ event, category, source });
        }
      }

      if ((allDayServices ?? []).includes(category)) {
        rawCovered.push({ event: "all_day", category, source });
      }
    }
  };

  for (const rawQuote of quotes) {
    const quote = rawQuote as QuoteLike;
    const source = quote.vendorName || "Unknown";

    const coveredPairs = quote.coveredPairs as
      | Array<{ category?: string; events?: string[] }>
      | null
      | undefined;

    if (coveredPairs && coveredPairs.length > 0) {
      for (const pair of coveredPairs) {
        const category = pair.category as VendorCategoryType;
        if (!category || !VENDOR_CATEGORY_IDS.includes(category)) continue;

        const eventsToMark =
          Array.isArray(pair.events) && pair.events.length > 0
            ? pair.events
            : Object.keys(servicesByEvent);

        for (const event of eventsToMark) {
          rawCovered.push({ event, category, source });
        }
      }
      continue;
    }

    const mappings = quote.itemMappings as
      | Array<{ category?: string; event?: string; skipped?: boolean }>
      | null
      | undefined;

    if (mappings && mappings.length > 0) {
      for (const mapping of mappings) {
        if (mapping.skipped) continue;
        if (!mapping.category || !isVendorCategory(mapping.category)) continue;
        if (!mapping.event) continue;

        rawCovered.push({
          event: mapping.event,
          category: mapping.category,
          source,
        });
      }

      applyAlsoCoversCategories(quote, source);
    } else {
      const fallbackCategories: VendorCategoryType[] = [];

      const primaryCategory = quote.vendorCategory;
      if (primaryCategory && isVendorCategory(primaryCategory)) {
        fallbackCategories.push(primaryCategory);
      } else {
        const inferred = inferVendorCategoryFromQuote(quote as Quote);
        if (inferred && VENDOR_CATEGORY_IDS.includes(inferred)) {
          fallbackCategories.push(inferred);
        }
      }

      const alsoCovers = (quote.alsoCoversCategories ?? {}) as Record<
        string,
        unknown
      >;
      for (const categoryId of Object.keys(alsoCovers)) {
        if (isVendorCategory(categoryId)) {
          fallbackCategories.push(categoryId);
        }
      }

      for (const category of fallbackCategories) {
        for (const [event, categories] of Object.entries(servicesByEvent)) {
          if ((categories as VendorCategoryType[]).includes(category)) {
            rawCovered.push({ event, category, source });
          }
        }

        if ((allDayServices ?? []).includes(category)) {
          rawCovered.push({ event: "all_day", category, source });
        }
      }
    }
  }

  const rawSeenKeys = new Set<string>();
  const dedupedRaw: EventAwareCoveredPair[] = [];
  for (const pair of rawCovered) {
    const key = coveredPairKey(pair.event, pair.category);
    if (!rawSeenKeys.has(key)) {
      rawSeenKeys.add(key);
      dedupedRaw.push(pair);
    }
  }

  const allDayTokens = new Set(["all_day", "all_events"]);
  const coveredCategoryAnyEvent = new Set<VendorCategoryType>();
  const sourceByCategory = new Map<VendorCategoryType, string>();

  for (const pair of dedupedRaw) {
    coveredCategoryAnyEvent.add(pair.category);
    if (!sourceByCategory.has(pair.category)) {
      sourceByCategory.set(pair.category, pair.source);
    }
  }

  const finalCoveredPairs: EventAwareCoveredPair[] = [...dedupedRaw];
  const coveredSet = new Set(
    finalCoveredPairs.map((pair) => coveredPairKey(pair.event, pair.category)),
  );

  const categoriesToExpand = new Set<VendorCategoryType>();

  for (const pair of rawCovered) {
    if (allDayTokens.has(pair.event)) {
      categoriesToExpand.add(pair.category);
    }
  }

  for (const category of allDayServices ?? []) {
    if (coveredCategoryAnyEvent.has(category)) {
      categoriesToExpand.add(category);
    }
  }

  for (const category of Array.from(categoriesToExpand)) {
    const source = sourceByCategory.get(category) ?? "Unknown";
    for (const event of allEvents) {
      const key = coveredPairKey(event, category);
      if (!coveredSet.has(key)) {
        finalCoveredPairs.push({ event, category, source });
        coveredSet.add(key);
      }
    }
  }

  const venueAvailableCategories = new Set<VendorCategoryType>();
  for (const rawQuote of quotes) {
    const quote = rawQuote as QuoteLike;
    const menuOptions = (quote.menuOptions ?? []) as Array<{
      vendorCategory?: string;
    }>;
    for (const menuOption of menuOptions) {
      const category = menuOption.vendorCategory as
        | VendorCategoryType
        | undefined;
      if (category && VENDOR_CATEGORY_IDS.includes(category)) {
        venueAvailableCategories.add(category);
      }
    }
  }

  const gapKeysSeen = new Set<string>();
  const gaps: EventAwareGap[] = [];

  const addGapIfNew = (event: string, category: VendorCategoryType) => {
    const key = coveredPairKey(event, category);
    if (coveredSet.has(key) || gapKeysSeen.has(key)) return;

    gapKeysSeen.add(key);
    gaps.push({
      event,
      category,
      gapType: venueAvailableCategories.has(category)
        ? "available_from_venue"
        : "must_source_externally",
    });
  };

  const allDayServiceSet = new Set(allDayServices ?? []);

  for (const [event, categories] of Object.entries(servicesByEvent)) {
    for (const category of categories as VendorCategoryType[]) {
      if (allDayServiceSet.has(category)) continue;
      addGapIfNew(event, category);
    }
  }

  for (const category of allDayServices ?? []) {
    const isAnyCovered = allEvents.some((event) =>
      coveredSet.has(coveredPairKey(event, category)),
    );
    if (isAnyCovered) continue;

    const key = coveredPairKey("all_day", category);
    if (!gapKeysSeen.has(key)) {
      gapKeysSeen.add(key);
      gaps.push({
        event: "all_day",
        category,
        gapType: venueAvailableCategories.has(category)
          ? "available_from_venue"
          : "must_source_externally",
      });
    }
  }

  const allDayServicesSetForTotal = new Set(allDayServices ?? []);
  const requiredPairKeys = new Set<string>();
  for (const [event, categories] of Object.entries(servicesByEvent)) {
    for (const category of categories as VendorCategoryType[]) {
      if (!allDayServicesSetForTotal.has(category)) {
        requiredPairKeys.add(coveredPairKey(event, category));
      }
    }
  }
  const totalRequired = requiredPairKeys.size + (allDayServices ?? []).length;

  return {
    coveredPairs: finalCoveredPairs,
    gaps,
    allCovered: gaps.length === 0,
    totalRequired,
  };
}

const EXCLUSION_CATEGORY_KEYWORDS: Record<string, string[]> = {
  venue_location: ["venue", "location", "room", "space", "hall", "facility"],
  catering_food: [
    "cater",
    "food",
    "meal",
    "dinner",
    "lunch",
    "breakfast",
    "brunch",
    "buffet",
    "menu",
    "chef",
    "cook",
    "cuisine",
  ],
  bar_beverage: [
    "bar",
    "drink",
    "beverage",
    "alcohol",
    "wine",
    "beer",
    "spirit",
    "champagne",
    "liquor",
    "open bar",
    "corkage",
  ],
  wedding_cake: ["cake", "pastry", "dessert", "cutting fee", "confection"],
  entertainment_music: [
    "music",
    "band",
    "dj",
    "d.j.",
    "entertain",
    "musician",
    "live performance",
    "perform",
  ],
  lighting_av: [
    "lighting",
    "light show",
    "av ",
    "a/v",
    "projector",
    "screen",
    "visual",
  ],
  photography_video: [
    "photo",
    "photograph",
    "videograph",
    "video",
    "camera",
    "film",
    "footage",
    "drone",
  ],
  flowers_decor: [
    "floral",
    "flower",
    "decor",
    "decoration",
    "centrepiece",
    "centerpiece",
    "bouquet",
    "arrangement",
  ],
  beauty_prep: [
    "beauty",
    "hair",
    "makeup",
    "make-up",
    "groom",
    "spa",
    "stylist",
    "getting ready",
  ],
  officiant: [
    "officiant",
    "minister",
    "priest",
    "celebrant",
    "religious ceremony",
    "ceremony leader",
  ],
  planning_coordination: ["wedding planner", "coordinat", "day-of", "day of"],
  transport: [
    "transport",
    "transfer",
    "shuttle",
    "limousine",
    "limo",
    "car service",
  ],
};

/**
 * Filters exclusion strings that duplicate structured gap categories.
 */
export function filterExclusionsByGapCategories(
  exclusions: string[],
  gapCategoryIds: string[],
): string[] {
  if (!exclusions.length) return exclusions;
  if (!gapCategoryIds.length) return exclusions;

  return exclusions.filter((entry) => {
    const lower = entry.toLowerCase();
    return !gapCategoryIds.some((categoryId) => {
      const keywords = EXCLUSION_CATEGORY_KEYWORDS[categoryId] ?? [];
      return keywords.some((keyword) => lower.includes(keyword));
    });
  });
}
