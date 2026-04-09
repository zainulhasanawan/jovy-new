import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";

export type PlanningStage =
  | "exploring"
  | "researching"
  | "comparing"
  | "booked";

export type DateInfo = {
  dateType: "specific" | "month" | "season" | "year" | "undecided";
  specificDate?: string;
  month?: number;
  year?: number;
  season?: "spring" | "summer" | "fall" | "winter";
};

export type WeddingLocation = {
  name: string;
  placeId?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  region?: string;
  accommodationInfo?: {
    onSiteRooms?: number;
    onSiteCapacity?: number;
    notes?: string;
  };
};

export type LocationInfo = WeddingLocation;

export type MandatoryFee = {
  id?: string;
  label?: string;
  percentage?: number;
  type?: "service" | "tax" | "gratuity" | "fee" | "other";
};

export type GuestPricing = {
  baseGuestCount: number;
  basePrice: number;
  basePriceWithFees?: number;
  additionalGuestPrice: number;
  additionalGuestPriceWithFees?: number;
  maxGuests?: number;
};

export type User = {
  id?: string;
  email?: string;
  onboardingComplete?: boolean;
  weddingProfile?: {
    coupleNames?: string;
    primaryOptionId?: string;
    planningStage?: PlanningStage;
    locations?: WeddingLocation[];
    dateInfo?: DateInfo;
    timeline?: {
      weddingDate?: string;
    };
    budget?: {
      totalBudget?: number;
      currency?: string;
    };
    guestInfo?: {
      estimatedCount?: number;
    };
    servicesByEvent?: Record<string, VendorCategoryType[]>;
    allDayServices?: VendorCategoryType[];
  } & Record<string, unknown>;
} & Record<string, unknown>;

export type Quote = {
  id?: string;
  vendorName?: string;
  vendorType?: string;
  vendorCategory?: string;
  quoteType?: string;
  totalPrice?: string;
  basePrice?: string;
  baseCapacity?: string;
  perPersonPrice?: string;
  outsideVendorFee?: string;
  alsoCoversCategories?: Record<string, string[]>;
  coveredSubcategories?: string[];
  coveredPairs?: Array<{ category: string; events?: string[] }>;
  itemMappings?: Array<{
    category?: string;
    event?: string;
    skipped?: boolean;
  }>;
  menuOptions?: Array<{ vendorCategory?: string }>;
  addOns?: Array<{
    price?: number;
    included?: boolean;
    label?: string;
    name?: string;
  }>;
  pricingTiers?: Array<{
    label?: string;
    title?: string;
    name?: string;
    description?: string;
    price?: number;
    lineItems?: Array<{ name?: string; price?: number }>;
  }>;
  selectedMenuOptionIds?: string[];
  accommodationDetails?: {
    totalRooms?: number;
    totalCapacity?: number;
    estimatedTotalGuestCost?: number;
    notes?: string;
  };
  guestPricing?: GuestPricing;
  mandatoryFees?: MandatoryFee[];
  quotedTotalCost?: number | string;
  projectedTotalCost?: number | string;
  includesTax?: boolean;
  includesServiceCharge?: boolean;
  currency?: string;
  displayCurrency?: string;
  exclusions?: Array<string | { name?: string }>;
  inclusions?: Array<string | { name?: string }>;
  restrictions?: string[];
  packageName?: string;
  notes?: string;
  reviewStatus?: string;
  aiAnalysis?: {
    recommendations?: string[];
  };
  venue?: LocationInfo;
  eventCoverage?: Record<string, unknown>;
} & Record<string, unknown>;

export type WeddingOption = {
  id?: string;
  name?: string;
  baseVenueQuoteId?: string;
  attachedVendorQuoteIds?: string[];
  selectedAddOnQuoteIds?: string[];
  selectedMenuOptionIds?: string[];
  bookedVendorCategories?: string[];
} & Record<string, unknown>;
