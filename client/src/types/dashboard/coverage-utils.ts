import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";
import type { Quote } from "@/types/dashboard/schema";

export type ServiceCategoryType =
  | "venue"
  | "catering"
  | "photography"
  | "videography"
  | "flowers"
  | "music_dj"
  | "music_band"
  | "officiant"
  | "rentals"
  | "lighting"
  | "cake"
  | "transportation"
  | "planner"
  | "stationery"
  | "decor"
  | "av"
  | "lodging"
  | "beauty_preparation"
  | "ceremony_details"
  | "reception_setup"
  | "entertainment"
  | "luxury"
  | "day_of_coordination"
  | "other";

export type TierType = "basic" | "standard" | "premium";

export type RequirementEntry = {
  desired?: boolean;
  tier?: string;
  qty?: number;
  notes?: string;
  selectedServices?: string[];
};

export type NewEventRequirementsLike = Record<string, RequirementEntry>;

export interface UnifiedCoverageOptions {
  selectedAddOns?: string[];
  attachedVendorCoveredServices?: Set<string>[];
  manualOverrides?: Record<string, "included" | "excluded">;
}

export interface UnifiedCoverageResult {
  percentage: number;
  coveredServices: Set<string>;
  totalServices: number;
  missingServices: string[];
}

export interface VendorCategoryInfo {
  categoryId: string;
  categoryName: string;
  icon: string;
  status: "booked" | "partial" | "needed";
  bookedVendorName?: string;
  bookedQuoteId?: string;
  coveredSubcategories: string[];
  neededSubcategories: string[];
}

export interface VendorCoverageSummary {
  booked: number;
  partial: number;
  total: number;
  percentage: number;
  coveredCount: number;
  totalCount: number;
  percentCovered: number;
}

export interface VendorCoverageInput {
  venueQuote: Quote | null | undefined;
  attachedVendorQuoteIds: string[];
  allQuotes: Quote[];
  selectedMenuOptionIds?: string[];
}

export interface GapAnalysisResult {
  explicitExclusions: string[];
  availableFromVenue: string[];
  mustSourceExternally: string[];
}

export interface EventAwareCoveredPair {
  event: string;
  category: VendorCategoryType;
  source: string;
}

export interface EventAwareGap {
  event: string;
  category: VendorCategoryType;
  gapType: "available_from_venue" | "must_source_externally";
}

export interface EventAwareCoverageResult {
  coveredPairs: EventAwareCoveredPair[];
  gaps: EventAwareGap[];
  allCovered: boolean;
  totalRequired: number;
}
