/**
 * Master Wedding Taxonomy
 * Defines 8 core wedding segments with standard services
 */

import type {
  WeddingSegment,
  ExternalVendorType,
} from "@/types/dashboard/wedding-taxonomy";

export type {
  WeddingService,
  WeddingSegment,
  ExternalVendorType,
} from "@/types/dashboard/wedding-taxonomy";

export const WEDDING_TAXONOMY: Record<string, WeddingSegment> = {
  rehearsal_dinner: {
    name: "Rehearsal Dinner",
    standardServices: [
      { id: "rehearsal_venue", name: "Venue/Location", type: "binary" },
      { id: "rehearsal_catering", name: "Catering", type: "binary" },
      { id: "rehearsal_bar", name: "Bar Service", type: "binary" },
    ],
    optionalServices: [
      {
        id: "rehearsal_transportation",
        name: "Transportation",
        type: "binary",
      },
      {
        id: "rehearsal_welcome_bags",
        name: "Welcome Bags/Gifts",
        type: "binary",
      },
      { id: "rehearsal_signage", name: "Event Signage", type: "binary" },
      { id: "rehearsal_favors", name: "Party Favors", type: "binary" },
    ],
  },
  ceremony_preparation: {
    name: "Ceremony Preparation",
    standardServices: [
      { id: "prep_hair", name: "Hair Styling", type: "binary" },
      { id: "prep_makeup", name: "Makeup Application", type: "binary" },
      {
        id: "prep_venue",
        name: "Getting Ready Space",
        type: "binary",
      },
      {
        id: "prep_refreshments",
        name: "Refreshments for Wedding Party",
        type: "binary",
      },
    ],
    optionalServices: [
      {
        id: "prep_spa_services",
        name: "Spa Services (massage, nails)",
        type: "binary",
      },
      {
        id: "prep_breakfast",
        name: "Breakfast/Lunch Service",
        type: "binary",
      },
      { id: "prep_champagne", name: "Champagne Toast", type: "binary" },
      {
        id: "prep_photographer",
        name: "Photographer for Prep",
        type: "binary",
      },
    ],
  },
  ceremony: {
    name: "Ceremony",
    standardServices: [
      {
        id: "ceremony_venue",
        name: "Ceremony Venue/Space",
        type: "binary",
      },
      { id: "ceremony_officiant", name: "Officiant", type: "binary" },
      {
        id: "ceremony_arch",
        name: "Arch/Gazebo Structure",
        type: "binary",
      },
      {
        id: "ceremony_seating",
        name: "Ceremony Seating/Chairs",
        type: "binary",
      },
      { id: "ceremony_music", name: "Ceremony Music", type: "binary" },
    ],
    optionalServices: [
      {
        id: "ceremony_additional_seating",
        name: "Additional Guest Seating",
        type: "binary",
      },
      {
        id: "ceremony_programs",
        name: "Ceremony Programs",
        type: "binary",
      },
      {
        id: "ceremony_ring_pillow",
        name: "Ring Pillow/Bearer",
        type: "binary",
      },
      {
        id: "ceremony_flower_petals",
        name: "Flower Petals/Confetti",
        type: "binary",
      },
    ],
  },
  cocktail_hour: {
    name: "Cocktail Hour",
    standardServices: [
      {
        id: "cocktail_venue",
        name: "Cocktail Hour Space",
        type: "binary",
      },
      {
        id: "cocktail_appetizers",
        name: "Passed Appetizers",
        type: "binary",
      },
      { id: "cocktail_bar", name: "Bar Service", type: "binary" },
      {
        id: "cocktail_music",
        name: "Background Music",
        type: "binary",
      },
    ],
    optionalServices: [
      {
        id: "cocktail_specialty_drinks",
        name: "Specialty Cocktails/Signature Drinks",
        type: "binary",
      },
      {
        id: "cocktail_extra_bartender",
        name: "Additional Bartender",
        type: "binary",
      },
      {
        id: "cocktail_outdoor_heaters",
        name: "Outdoor Heaters/Fans",
        type: "binary",
      },
      { id: "cocktail_lawn_games", name: "Lawn Games", type: "binary" },
    ],
  },
  reception_dinner: {
    name: "Reception Dinner",
    standardServices: [
      {
        id: "reception_venue",
        name: "Reception Venue/Space",
        type: "binary",
      },
      {
        id: "reception_catering",
        name: "Dinner Service",
        type: "binary",
      },
      {
        id: "reception_tables_chairs",
        name: "Tables and Chairs",
        type: "binary",
      },
      {
        id: "reception_linens",
        name: "Linens and Table Settings",
        type: "binary",
      },
      {
        id: "reception_centerpieces",
        name: "Centerpieces",
        type: "binary",
      },
    ],
    optionalServices: [
      {
        id: "reception_upgraded_menu",
        name: "Upgraded Menu/Premium Options",
        type: "binary",
      },
      {
        id: "reception_wine_pairing",
        name: "Wine Pairing",
        type: "binary",
      },
      {
        id: "reception_late_night_snacks",
        name: "Late Night Snacks",
        type: "binary",
      },
      {
        id: "reception_kids_menu",
        name: "Children's Menu",
        type: "binary",
      },
    ],
  },
  reception_entertainment: {
    name: "Reception Entertainment/Dancing",
    standardServices: [
      {
        id: "entertainment_dj_band",
        name: "DJ or Live Band",
        type: "binary",
      },
      {
        id: "entertainment_dance_floor",
        name: "Dance Floor",
        type: "binary",
      },
      {
        id: "entertainment_lighting",
        name: "Lighting and Sound",
        type: "binary",
      },
    ],
    optionalServices: [
      {
        id: "entertainment_photo_booth",
        name: "Photo Booth",
        type: "binary",
      },
      {
        id: "entertainment_specialty_lighting",
        name: "Specialty Lighting (uplighting, monogram)",
        type: "binary",
      },
      {
        id: "entertainment_fireworks",
        name: "Fireworks/Sparklers",
        type: "binary",
      },
      {
        id: "entertainment_live_painter",
        name: "Live Event Painter",
        type: "binary",
      },
    ],
  },
  cake_dessert: {
    name: "Wedding Cake & Desserts",
    standardServices: [
      { id: "cake_wedding", name: "Wedding Cake", type: "binary" },
      {
        id: "cake_cutting",
        name: "Cake Cutting Service",
        type: "binary",
      },
    ],
    optionalServices: [
      {
        id: "cake_dessert_bar",
        name: "Dessert Bar/Display",
        type: "binary",
      },
      {
        id: "cake_coffee_bar",
        name: "Coffee/Espresso Bar",
        type: "binary",
      },
      {
        id: "cake_delivery",
        name: "Cake Delivery/Setup",
        type: "binary",
      },
      { id: "cake_grooms_cake", name: "Groom's Cake", type: "binary" },
    ],
  },
  photography_video: {
    name: "Photography & Videography",
    standardServices: [
      {
        id: "photo_photographer",
        name: "Professional Photographer",
        type: "binary",
      },
      {
        id: "photo_videographer",
        name: "Videographer",
        type: "binary",
      },
    ],
    optionalServices: [
      {
        id: "photo_drone_footage",
        name: "Drone Footage",
        type: "binary",
      },
      {
        id: "photo_second_shooter",
        name: "Second Photographer/Videographer",
        type: "binary",
      },
      {
        id: "photo_engagement_session",
        name: "Engagement Photo Session",
        type: "binary",
      },
      {
        id: "photo_album",
        name: "Photo Album/Prints",
        type: "binary",
      },
    ],
  },
};

// Helper to get all wedding segment IDs
export const SEGMENT_IDS = Object.keys(WEDDING_TAXONOMY);

// Helper to get all standard service IDs
export function getAllStandardServiceIds(): string[] {
  return SEGMENT_IDS.flatMap((segmentId) =>
    WEDDING_TAXONOMY[segmentId].standardServices.map((s) => s.id),
  );
}

// Helper to find which wedding segment a service belongs to
export function findSegmentForService(serviceId: string): string | null {
  for (const segmentId of SEGMENT_IDS) {
    const segment = WEDDING_TAXONOMY[segmentId];
    if (
      segment.standardServices.some((s) => s.id === serviceId) ||
      segment.optionalServices.some((s) => s.id === serviceId)
    ) {
      return segmentId;
    }
  }
  return null;
}

/**
 * @deprecated Use VENDOR_CATEGORY_IDS from vendor-taxonomy.ts instead.
 * This legacy array is kept for backward compatibility with older code.
 * New code should use VendorCategoryType and VENDOR_TAXONOMY.
 */
export const EXTERNAL_VENDOR_TYPES = [
  "photography",
  "videography",
  "catering",
  "flowers",
  "music",
  "dj",
  "band",
  "officiant",
  "planner",
  "transportation",
  "rentals",
  "lighting",
  "cake",
  "hair_makeup",
  "stationery",
  "other",
] as const;

/**
 * @deprecated Use VENDOR_TAXONOMY from vendor-taxonomy.ts instead.
 * This legacy mapping is kept for backward compatibility.
 * New code should use VENDOR_TAXONOMY[categoryId].standardServices and .optionalServices.
 */
export const VENDOR_TYPE_TO_SERVICES: Record<
  ExternalVendorType,
  { serviceIds: string[]; segmentId: string; displayName: string }
> = {
  photography: {
    serviceIds: ["photo_photographer"],
    segmentId: "photography_video",
    displayName: "Photography",
  },
  videography: {
    serviceIds: ["photo_videographer"],
    segmentId: "photography_video",
    displayName: "Videography",
  },
  catering: {
    serviceIds: ["reception_catering", "cocktail_appetizers"],
    segmentId: "reception_dinner",
    displayName: "Catering",
  },
  flowers: {
    serviceIds: ["reception_centerpieces", "ceremony_arch"],
    segmentId: "reception_dinner",
    displayName: "Flowers & Florals",
  },
  music: {
    serviceIds: ["entertainment_dj_band", "ceremony_music", "cocktail_music"],
    segmentId: "reception_entertainment",
    displayName: "Music",
  },
  dj: {
    serviceIds: ["entertainment_dj_band"],
    segmentId: "reception_entertainment",
    displayName: "DJ",
  },
  band: {
    serviceIds: ["entertainment_dj_band"],
    segmentId: "reception_entertainment",
    displayName: "Live Band",
  },
  officiant: {
    serviceIds: ["ceremony_officiant"],
    segmentId: "ceremony",
    displayName: "Officiant",
  },
  planner: {
    serviceIds: [],
    segmentId: "",
    displayName: "Wedding Planner",
  },
  transportation: {
    serviceIds: ["rehearsal_transportation"],
    segmentId: "rehearsal_dinner",
    displayName: "Transportation",
  },
  rentals: {
    serviceIds: [
      "reception_tables_chairs",
      "ceremony_seating",
      "entertainment_dance_floor",
    ],
    segmentId: "reception_dinner",
    displayName: "Rentals",
  },
  lighting: {
    serviceIds: ["entertainment_lighting", "entertainment_specialty_lighting"],
    segmentId: "reception_entertainment",
    displayName: "Lighting",
  },
  cake: {
    serviceIds: ["cake_wedding", "cake_cutting"],
    segmentId: "cake_dessert",
    displayName: "Wedding Cake",
  },
  hair_makeup: {
    serviceIds: ["prep_hair", "prep_makeup"],
    segmentId: "ceremony_preparation",
    displayName: "Hair & Makeup",
  },
  stationery: {
    serviceIds: ["ceremony_programs"],
    segmentId: "ceremony",
    displayName: "Stationery & Invitations",
  },
  other: {
    serviceIds: [],
    segmentId: "",
    displayName: "Other",
  },
};

// Helper to get service names for a vendor type
export function getServiceNamesForVendorType(vendorType: string): string[] {
  const mapping = VENDOR_TYPE_TO_SERVICES[vendorType as ExternalVendorType];
  if (!mapping) return [];

  const names: string[] = [];
  for (const serviceId of mapping.serviceIds) {
    for (const segmentId of SEGMENT_IDS) {
      const segment = WEDDING_TAXONOMY[segmentId];
      const service = [
        ...segment.standardServices,
        ...segment.optionalServices,
      ].find((s) => s.id === serviceId);
      if (service) {
        names.push(service.name);
      }
    }
  }
  return names;
}

// Helper to get the display name for a vendor type
export function getVendorTypeDisplayName(vendorType: string): string {
  const mapping = VENDOR_TYPE_TO_SERVICES[vendorType as ExternalVendorType];
  return mapping?.displayName || vendorType.replace("_", " ");
}
