export interface WeddingService {
  id: string;
  name: string;
  type: "binary";
}

export interface WeddingSegment {
  name: string;
  standardServices: WeddingService[];
  optionalServices: WeddingService[];
}

export type ExternalVendorType =
  | "photography"
  | "videography"
  | "catering"
  | "flowers"
  | "music"
  | "dj"
  | "band"
  | "officiant"
  | "planner"
  | "transportation"
  | "rentals"
  | "lighting"
  | "cake"
  | "hair_makeup"
  | "stationery"
  | "other";
