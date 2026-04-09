import type { Quote, LocationInfo } from "@/types/dashboard/schema";
import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";
import type { LocationTier } from "@/types/dashboard/location";
import { deriveLocationTier } from "@/utils/dashboard/location-utils";
import {
  getVendorCategoryCoverage,
  estimateMissingServiceCost,
} from "@/utils/dashboard/coverage-utils";
import { WEDDING_TAXONOMY } from "@/utils/dashboard/wedding-taxonomy";
import { computeQuoteTotalFromItems } from "@/utils/dashboard/utils";
import type { NameLike, EventCoverageSegment } from "./quote-types";
import { getQuotePriceData as getQuotePriceDataFromPricing } from "./pricing";

export const toLabel = (entry: unknown): string => {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object") {
    const obj = entry as NameLike;
    if (typeof obj.name === "string" && obj.name.trim().length > 0)
      return obj.name;
    if (typeof obj.label === "string" && obj.label.trim().length > 0)
      return obj.label;
  }
  return String(entry);
};

export const getQuotePriceData = (quote: Quote, guestCount?: number) =>
  getQuotePriceDataFromPricing(
    quote as unknown as Record<string, unknown>,
    guestCount,
    (candidateQuote, count) =>
      computeQuoteTotalFromItems(
        candidateQuote as Parameters<typeof computeQuoteTotalFromItems>[0],
        count,
      ),
  );

export function getCategoryCoverage(quote: Quote): {
  covered: VendorCategoryType[];
  notCovered: VendorCategoryType[];
} {
  const categories = getVendorCategoryCoverage({
    venueQuote: quote,
    attachedVendorQuoteIds: [],
    allQuotes: [],
    selectedMenuOptionIds: (quote.selectedMenuOptionIds as string[]) || [],
  });
  return {
    covered: categories
      .filter((c) => c.status !== "needed")
      .map((c) => c.categoryId as VendorCategoryType),
    notCovered: categories
      .filter((c) => c.status === "needed")
      .map((c) => c.categoryId as VendorCategoryType),
  };
}

const SERVICE_CATEGORY_MAPPING: Record<string, VendorCategoryType> = {
  rehearsal_venue: "venue_location",
  rehearsal_catering: "catering_food",
  rehearsal_bar: "bar_beverage",
  rehearsal_transportation: "planning_coordination",
  rehearsal_welcome_bags: "planning_coordination",
  rehearsal_signage: "flowers_decor",
  rehearsal_favors: "planning_coordination",
  prep_hair: "beauty_prep",
  prep_makeup: "beauty_prep",
  prep_venue: "venue_location",
  prep_refreshments: "catering_food",
  prep_spa_services: "beauty_prep",
  prep_breakfast: "catering_food",
  prep_champagne: "bar_beverage",
  prep_photographer: "photography_video",
  ceremony_venue: "venue_location",
  ceremony_officiant: "planning_coordination",
  ceremony_arch: "flowers_decor",
  ceremony_seating: "venue_location",
  ceremony_music: "entertainment_music",
  ceremony_additional_seating: "venue_location",
  ceremony_programs: "planning_coordination",
  ceremony_ring_pillow: "flowers_decor",
  ceremony_flower_petals: "flowers_decor",
  cocktail_venue: "venue_location",
  cocktail_appetizers: "catering_food",
  cocktail_bar: "bar_beverage",
  cocktail_music: "entertainment_music",
  cocktail_specialty_drinks: "bar_beverage",
  cocktail_extra_bartender: "bar_beverage",
  cocktail_outdoor_heaters: "venue_location",
  cocktail_lawn_games: "entertainment_music",
  reception_venue: "venue_location",
  reception_catering: "catering_food",
  reception_tables_chairs: "venue_location",
  reception_linens: "flowers_decor",
  reception_centerpieces: "flowers_decor",
  reception_upgraded_menu: "catering_food",
  reception_wine_pairing: "bar_beverage",
  reception_late_night_snacks: "catering_food",
  reception_kids_menu: "catering_food",
  entertainment_dj_band: "entertainment_music",
  entertainment_dance_floor: "venue_location",
  entertainment_lighting: "entertainment_music",
  cake_wedding: "catering_food",
  cake_cutting: "catering_food",
  photo_photographer: "photography_video",
  photo_videographer: "photography_video",
  flowers_bouquets: "flowers_decor",
  flowers_personals: "flowers_decor",
  flowers_ceremony: "flowers_decor",
  flowers_reception: "flowers_decor",
};

const ESSENTIAL_SERVICES = [
  "ceremony_venue",
  "ceremony_officiant",
  "ceremony_music",
  "cocktail_venue",
  "cocktail_bar",
  "cocktail_appetizers",
  "reception_venue",
  "reception_catering",
  "reception_tables_chairs",
  "entertainment_dj_band",
  "photo_photographer",
  "flowers_personals",
];

export function calculateMissingServicesEstimate(quote: Quote): {
  estimate: number;
  locationTier: LocationTier;
  locationSource: string;
} {
  const venueLocation = quote.venue as LocationInfo | null | undefined;
  const { tier: locationTier, source: locationSource } =
    deriveLocationTier(venueLocation);

  const { covered: coveredCategories } = getCategoryCoverage(quote);
  const coveredServices = new Set<string>();

  coveredCategories.forEach((catId) => {
    Object.values(WEDDING_TAXONOMY).forEach((segment) => {
      segment.standardServices.forEach((service) => {
        if (SERVICE_CATEGORY_MAPPING[service.id] === catId)
          coveredServices.add(service.id);
      });
    });
  });

  if (quote.eventCoverage) {
    Object.values(
      quote.eventCoverage as Record<string, EventCoverageSegment>,
    ).forEach((segData) => {
      if (!segData?.services) return;
      Object.entries(segData.services).forEach(([serviceId, svcData]) => {
        if (svcData?.status === "included") coveredServices.add(serviceId);
      });
    });
  }

  if (coveredCategories.includes("venue_location")) {
    if (!coveredServices.has("ceremony_venue"))
      coveredServices.add("ceremony_venue");
    if (!coveredServices.has("cocktail_venue"))
      coveredServices.add("cocktail_venue");
    if (!coveredServices.has("reception_venue"))
      coveredServices.add("reception_venue");
  }

  let totalEstimate = 0;
  ESSENTIAL_SERVICES.forEach((serviceId) => {
    if (!coveredServices.has(serviceId))
      totalEstimate += estimateMissingServiceCost(serviceId, locationTier);
  });

  return { estimate: totalEstimate, locationTier, locationSource };
}
