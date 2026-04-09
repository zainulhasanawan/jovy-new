import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";

export type NameLike = { name?: unknown; label?: unknown };

export type EventCoverageService = {
  status?: string;
};

export type EventCoverageSegment = {
  services?: Record<string, EventCoverageService>;
};

export type AddOnLike = {
  price?: number;
  included?: boolean;
  label?: string;
  name?: string;
  required?: boolean;
  pricingBasis?: string;
};

export type MenuOptionLike = {
  label?: string;
  name?: string;
  price?: number;
  required?: boolean;
  pricingBasis?: string;
};

export type CoveredPair = {
  category: string;
  events: string[];
};

export type PricingTierLineItem = {
  name?: string;
  price?: number;
};

export type PricingTierLike = {
  label?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  lineItems?: PricingTierLineItem[];
};

export type WeddingProfileLike = {
  servicesByEvent?: Record<string, VendorCategoryType[]>;
  allDayServices?: VendorCategoryType[];
  customEvents?: Array<{ id: string; name: string }>;
};

export type ContactLike = {
  vendorName?: string;
};
