/**
 * Vendor Category Taxonomy
 *
 * Organizes wedding services by VENDOR TYPE instead of event timeline.
 * This matches how couples actually hire vendors:
 * - "Do I have a florist?" vs "Is my centerpiece segment 40% covered?"
 * - "5/8 vendors booked" vs "50% coverage"
 *
 * 8 vendor categories, each with standard and optional subcategories (services).
 */

import { z } from "zod";

export const VendorCategoryEnum = z.enum([
  "venue_location",
  "catering_food",
  "bar_beverage",
  "photography_video",
  "entertainment_music",
  "flowers_decor",
  "beauty_prep",
  "planning_coordination",
  "officiant",
  "transport",
  "lighting_av",
  "wedding_cake",
  "other",
]);

export type VendorCategoryType = z.infer<typeof VendorCategoryEnum>;

/**
 * CLEAN EVENT MODEL
 *
 * SERVICE = CATEGORY + EVENT
 *
 * Events are where services happen. A service is defined by:
 * 1. Category (what type: Catering, Bar, etc.)
 * 2. Event (when/where: Ceremony, Reception, etc.)
 * 3. Primary vs Add-on (is this the main service or an extra?)
 */

// Wedding Day sub-events (always part of wedding day)
export const WeddingDayEventEnum = z.enum([
  "ceremony", // The ceremony itself
  "cocktail_hour", // Post-ceremony drinks and appetizers
  "reception", // Main wedding dinner/reception
]);

export type WeddingDayEventType = z.infer<typeof WeddingDayEventEnum>;

// Other events (optional multi-day events)
export const OtherEventEnum = z.enum([
  "rehearsal_dinner", // Pre-wedding dinner
  "welcome_event", // Welcome party for guests
  "next_day_brunch", // Brunch after wedding
  "after_party", // Late night party after reception
]);

export type OtherEventType = z.infer<typeof OtherEventEnum>;

// All events combined (for selection dropdowns)
export const EventEnum = z.enum([
  // Wedding Day sub-events
  "ceremony",
  "cocktail_hour",
  "reception",
  // Other events
  "rehearsal_dinner",
  "welcome_event",
  "next_day_brunch",
  "after_party",
  // Special values
  "all_day", // Spans entire wedding day (ceremony + cocktail + reception)
  "all_events", // Spans all selected events
]);

export type EventType = z.infer<typeof EventEnum>;

export const EVENTS: Record<
  EventType,
  {
    name: string;
    description: string;
    isWeddingDay: boolean;
    icon: string;
  }
> = {
  ceremony: {
    name: "Ceremony",
    description: "The wedding ceremony",
    isWeddingDay: true,
    icon: "💒",
  },
  cocktail_hour: {
    name: "Cocktail Hour",
    description: "Post-ceremony drinks and appetizers",
    isWeddingDay: true,
    icon: "🥂",
  },
  reception: {
    name: "Reception",
    description: "Main wedding dinner and reception",
    isWeddingDay: true,
    icon: "🎉",
  },
  rehearsal_dinner: {
    name: "Rehearsal Dinner",
    description: "Pre-wedding dinner, typically night before",
    isWeddingDay: false,
    icon: "🍽️",
  },
  welcome_event: {
    name: "Welcome Event",
    description: "Welcome party for guests",
    isWeddingDay: false,
    icon: "👋",
  },
  next_day_brunch: {
    name: "Next Day Brunch",
    description: "Farewell brunch after wedding",
    isWeddingDay: false,
    icon: "🥞",
  },
  after_party: {
    name: "After Party",
    description: "Late night celebration after reception",
    isWeddingDay: false,
    icon: "🎊",
  },
  all_day: {
    name: "All Day",
    description: "Spans entire wedding day",
    isWeddingDay: true,
    icon: "📸",
  },
  all_events: {
    name: "All Events",
    description: "Spans all selected events",
    isWeddingDay: false,
    icon: "📋",
  },
};

// Default event associations by category (what event to auto-select)
export const CATEGORY_DEFAULT_EVENTS: Record<
  VendorCategoryType,
  EventType | EventType[] | null
> = {
  venue_location: null, // User must select
  catering_food: null, // User must select
  bar_beverage: null, // User must select
  photography_video: "all_day", // Typically covers whole wedding day
  entertainment_music: "reception", // Typically reception
  flowers_decor: ["reception", "ceremony"], // Reception first (more common for external florists), then ceremony
  beauty_prep: "all_day", // Spa/beauty services available throughout the day
  planning_coordination: "all_events", // Coordinator for all events
  officiant: "ceremony", // Ceremony-specific
  transport: null, // User must select which events need transport
  lighting_av: null, // User must select
  wedding_cake: "reception", // Typically served at reception
  other: "all_events", // Misc services span all events
};

/**
 * Item Type Classification
 *
 * When parsing quotes, items are classified as:
 * - PRIMARY: Main service for this category+event (e.g., "5-course wedding meal")
 * - ADD_ON: Upgrade or extra (e.g., "Premium spirits upgrade")
 * - EXCLUDED: Not a service - fees, taxes, deposits (don't show in mapping)
 */
export const ItemTypeEnum = z.enum([
  "primary", // Main service for this category+event
  "add_on", // Upgrade or extra
  "excluded", // Fee, tax, deposit - don't show in mapping
]);

export type ItemType = z.infer<typeof ItemTypeEnum>;

// Keywords that indicate an item is a fee/tax/deposit (EXCLUDED from mapping — show in Fees & Deposits)
export const EXCLUDED_KEYWORDS = [
  // Taxes
  "city tax",
  "tourist tax",
  "hotel tax",
  "local tax",
  "bed tax",
  "occupancy tax",
  "environmental tax",
  "eco tax",
  "green tax",
  "vat",
  "sales tax",
  "gst",
  "tax",
  "iva",
  "tva",
  // Fees
  "service charge",
  "service fee",
  "admin fee",
  "administrative fee",
  "processing fee",
  "booking fee",
  "reservation fee",
  "cancellation fee",
  "corkage",
  "corkage fee",
  "cleaning fee",
  "setup fee",
  "breakdown fee",
  "resort fee",
  "hotel fee",
  "facility fee",
  "room block total",
  "with taxes/fees", // room block total (with taxes/fees) — display-only line
  // Tips
  "gratuity",
  "tip",
  "tips",
  // Deposits
  "deposit",
  "security deposit",
  "damage deposit",
];

// Keywords that indicate an item is an ADD-ON (upgrade/extra)
export const ADD_ON_KEYWORDS = [
  "upgrade",
  "premium",
  "extra",
  "additional",
  "supplement",
  "enhancement",
  "add-on",
  "addon",
  "optional",
  "upgrade to",
  "top shelf",
  "deluxe",
  "extended",
  "overtime",
  "extra hour",
  "additional hour",
  "surcharge",
  "external vendor fee",
  "vendor fee",
  "per vendor",
  "room rate",
  "room supplement",
  "room block",
  "extra person",
  "person supplement",
];

// Keywords that indicate an item is a PRIMARY service (main offering)
export const PRIMARY_KEYWORDS = [
  "menu",
  "package",
  "service",
  "wedding",
  "reception",
  "ceremony",
  "dinner",
  "lunch",
  "brunch",
  "breakfast",
  "cocktail",
  "bar",
  "open bar",
  "photography",
  "videography",
  "dj",
  "band",
  "music",
  "flowers",
  "bouquet",
  "centerpiece",
  "decor",
  "decoration",
  "hair",
  "makeup",
  "coordinator",
  "planner",
];

/**
 * Classify a quote item as PRIMARY, ADD_ON, or EXCLUDED
 */
export function classifyItemType(itemName: string): ItemType {
  if (!itemName) return "primary";
  const normalized = itemName.toLowerCase().trim();

  // Check for excluded items first (fees, taxes, deposits)
  for (const keyword of EXCLUDED_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "excluded";
    }
  }

  // Check for add-on keywords
  for (const keyword of ADD_ON_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "add_on";
    }
  }

  // Default to primary
  return "primary";
}

/**
 * Category Detection Keywords
 *
 * Used to auto-detect vendor category from item names when the parent quote
 * category doesn't match (e.g., food items in a venue quote).
 */

// CATERING & FOOD keywords
export const CATERING_KEYWORDS = [
  // Courses and meals
  "course",
  "menu",
  "meal",
  "lunch",
  "dinner",
  "breakfast",
  "brunch",
  "chef",
  "chef's",
  "chefs",
  // Food types
  "buffet",
  "plated",
  "dish",
  "hot dish",
  "cold dish",
  "station",
  "food station",
  // Appetizers
  "appetizer",
  "appetiser",
  "canape",
  "canapes",
  "starter",
  "starters",
  "hors d'oeuvre",
  "hors doeuvre",
  "amuse",
  "amuse-bouche",
  // Desserts ('sweet' omitted — false positive on "sweetheart"; use 'sweets' plural instead)
  "dessert",
  "desserts",
  "cake",
  "cakes",
  "mignardises",
  "petit four",
  "petit fours",
  "sweets",
  "pastry",
  "pastries",
  "tart",
  "tarts",
  "sweet table",
  "candy bar",
  // Boards and platters
  "cheese",
  "charcuterie",
  "board",
  "platter",
  "antipasti",
  "tapas",
  "mezze",
  // Other food
  "food",
  "cuisine",
  "catering",
  "kitchen",
  "culinary",
  "gala",
  "banquet",
  "feast",
  // Menu types
  "tasting menu",
  "prix fixe",
  "a la carte",
  "family style",
  "vegetarian",
  "vegan",
  "gluten-free",
  "halal",
  "kosher",
  // Specific items
  "salad",
  "soup",
  "entree",
  "main",
  "side",
  "sides",
];

// BAR & BEVERAGE keywords
export const BAR_KEYWORDS = [
  // Drinks
  "wine",
  "champagne",
  "prosecco",
  "cava",
  "sparkling",
  "beer",
  "ale",
  "lager",
  "craft beer",
  "cocktail",
  "cocktails",
  "mixology",
  "spirits",
  "liquor",
  "liqueur",
  // Bar types
  "bar",
  "open bar",
  "cash bar",
  "hosted bar",
  "premium bar",
  "top shelf",
  // Non-alcoholic
  "soft drinks",
  "mocktail",
  "juice",
  "coffee",
  "tea",
  "espresso",
  // Service
  "bartender",
  "sommelier",
  "drinks package",
  "beverage",
  "glass",
  "glasses",
  "bottle",
  "bottles",
];

// PHOTOGRAPHY & VIDEO keywords
export const PHOTO_KEYWORDS = [
  "photo",
  "photograph",
  "photography",
  "photographer",
  "photos",
  "video",
  "videograph",
  "videographer",
  "film",
  "filming",
  "cinematography",
  "drone",
  "aerial",
  "coverage",
  "editing",
  "album",
  "prints",
];

// ENTERTAINMENT & MUSIC keywords
export const ENTERTAINMENT_KEYWORDS = [
  "dj",
  "band",
  "live band",
  "musician",
  "music",
  "live music",
  "entertainment",
  "performer",
  "performance",
  "dance floor",
  "sound system",
  "sound",
  "speaker",
  "speakers",
  "microphone",
  "mic",
  "lighting",
  "disco",
  "karaoke",
  "audio",
];

// FLOWERS & DECOR keywords ('styling' omitted — false positive on "hairstyling"; use BEAUTY for that)
export const FLOWERS_KEYWORDS = [
  "flower",
  "flowers",
  "floral",
  "florist",
  "bouquet",
  "boutonniere",
  "centerpiece",
  "centrepiece",
  "arrangement",
  "garland",
  "arch",
  "decor",
  "decoration",
  "decorations",
  "table setting",
  "candles",
  "linens",
  "draping",
  "backdrop",
];

// BEAUTY & PREP keywords
export const BEAUTY_KEYWORDS = [
  "hair",
  "makeup",
  "make-up",
  "stylist",
  "beauty",
  "spa",
  "manicure",
  "pedicure",
  "facial",
  "massage",
  "bridal prep",
  "getting ready",
  "trial",
  "touch-up",
];

// OFFICIANT keywords — checked BEFORE planning so "minister"/"celebrant" don't fall through to planning_coordination
export const OFFICIANT_KEYWORDS = [
  "officiant",
  "celebrant",
  "minister",
  "ceremony service",
  "symbolic ceremony",
  "ceremony officiant",
  "ceremony celebrant",
  "symbolic officiant",
];

// PLANNING & COORDINATION keywords
export const PLANNING_KEYWORDS = [
  "coordinator",
  "coordination",
  "planner",
  "planning",
  "organizer",
  "wedding planner",
  "day-of coordinator",
  "event manager",
  "timeline",
  "vendor management",
];

// VENUE & LOCATION keywords (checked FIRST to override other categories)
// Split venue keywords: explicit venue words (check first) vs generic venue items (check last)
export const EXPLICIT_VENUE_KEYWORDS = [
  "venue",
  "venue included",
  "ceremony venue",
  "cocktail venue",
  "reception venue",
  "location included",
  "site included",
  "space included",
];

export const GENERIC_VENUE_KEYWORDS = [
  "space",
  "room",
  "hall",
  "ballroom",
  "gazebo",
  "chapel",
  "terrace",
  "patio",
  "garden",
  "chairs",
  "chair",
  "seating",
  "seats",
  "setup",
  "set-up",
  "furniture",
  "linen",
  "linens",
  "arch",
  "aisle",
  "rose petals",
];

// Keep original for backwards compatibility
export const VENUE_KEYWORDS = [
  ...EXPLICIT_VENUE_KEYWORDS,
  ...GENERIC_VENUE_KEYWORDS,
  "table",
  "tables",
  "location",
  "site",
];

/**
 * Normalize text for keyword matching
 * Removes diacritics, punctuation, and extra spaces
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/['']/g, "'") // Normalize quotes
    .replace(/[""]/g, '"') // Normalize quotes
    .replace(/[&]/g, " and ") // Replace & with and
    .replace(/[^\w\s'-]/g, " ") // Remove other punctuation
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Detect vendor category from item name using keyword matching
 * Returns the detected category or null if no match found
 */
export function detectCategoryFromName(
  itemName: string,
): VendorCategoryType | null {
  if (!itemName) return null;
  const normalized = normalizeForMatching(itemName);

  // STEP 1: Check EXPLICIT venue keywords FIRST
  // This catches "Venue for ceremony included", "Cocktail hour venue", etc.
  for (const keyword of EXPLICIT_VENUE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "venue_location";
    }
  }

  // STEP 2: Check SPECIFIC service categories
  // Order matters — more specific or higher-priority checks first.

  // Catering & Food - check early to catch "dinner", "meal", "food"
  for (const keyword of CATERING_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "catering_food";
    }
  }

  // Photography & Video - "photo", "photographer", "video"
  for (const keyword of PHOTO_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "photography_video";
    }
  }

  // Entertainment & Music BEFORE Bar — "live music (1 set...during cocktail hour)" must → entertainment,
  // not bar_beverage just because the word "cocktail" appears in the event description.
  for (const keyword of ENTERTAINMENT_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "entertainment_music";
    }
  }

  // Bar & Beverage - "bar", "drinks", "wine", "cocktail" (checked after entertainment)
  for (const keyword of BAR_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "bar_beverage";
    }
  }

  // Flowers & Decor - "flower", "centerpiece", "bouquet", "floral"
  // NOTE: 'styling' was removed from FLOWERS_KEYWORDS to prevent false match on "hairstyling".
  // BEAUTY is checked AFTER FLOWERS so 'hair' in BEAUTY doesn't false-match "chairs".
  for (const keyword of FLOWERS_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "flowers_decor";
    }
  }

  // Officiant — checked BEFORE planning so "minister", "celebrant", "symbolic ceremony" hit here
  for (const keyword of OFFICIANT_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "officiant";
    }
  }

  // Planning & Coordination - "coordinator", "planner"
  for (const keyword of PLANNING_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "planning_coordination";
    }
  }

  // Beauty & Prep - kept AFTER flowers so 'hair' in BEAUTY doesn't false-match "chairs"
  // (hairstyling → 'hair' only reached after FLOWERS doesn't match, since 'styling' was removed)
  for (const keyword of BEAUTY_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "beauty_prep";
    }
  }

  // STEP 3: Check GENERIC venue keywords LAST as fallback
  // "setup", "chair", "gazebo", "arch", etc. - only if no specific category matched
  for (const keyword of GENERIC_VENUE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return "venue_location";
    }
  }

  // No specific category detected
  return null;
}

/**
 * Pricing Type Detection
 *
 * Detects if an item should have quantity input based on naming patterns.
 */
export interface PricingDetection {
  type: "flat" | "per_unit" | "per_person";
  unitSize?: number; // e.g., "for 4" → unitSize = 4
  unitLabel?: string; // e.g., "board", "table", "person"
}

/**
 * Detect pricing type from item name
 * Items like "Cheese Board for 4" should have quantity input
 */
export function detectPricingType(itemName: string): PricingDetection {
  if (!itemName) return { type: "flat" };
  const normalized = normalizeForMatching(itemName);

  // Pattern: explicit "per person/guest/head" in the name
  if (
    normalized.includes("per person") ||
    normalized.includes("/person") ||
    normalized.match(/\bpp\b/) ||
    normalized.includes("per guest") ||
    normalized.includes("/guest") ||
    normalized.includes("per head") ||
    normalized.includes("each guest") ||
    normalized.includes("per pax") ||
    normalized.includes("per attendee")
  ) {
    return { type: "per_person" };
  }

  // Pattern: "for X" (e.g., "Cheese Board for 4", "Table for 8")
  const forNPattern = /\bfor\s+(\d+)\b/i;
  const forNMatch = normalized.match(forNPattern);
  if (forNMatch) {
    const unitSize = parseInt(forNMatch[1], 10);
    // Try to detect unit label (board, table, etc.)
    let unitLabel = "unit";
    if (normalized.includes("board")) unitLabel = "board";
    else if (normalized.includes("table")) unitLabel = "table";
    else if (normalized.includes("platter")) unitLabel = "platter";
    else if (normalized.includes("bottle")) unitLabel = "bottle";
    else if (normalized.includes("guest")) unitLabel = "guests";

    return { type: "per_unit", unitSize, unitLabel };
  }

  // Pattern: textual numbers (for two, for six, etc.)
  const textualNumbers: Record<string, number> = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    twelve: 12,
  };
  for (const [word, num] of Object.entries(textualNumbers)) {
    if (normalized.includes(`for ${word}`)) {
      let unitLabel = "unit";
      if (normalized.includes("board")) unitLabel = "board";
      else if (normalized.includes("table")) unitLabel = "table";
      else if (normalized.includes("platter")) unitLabel = "platter";
      return { type: "per_unit", unitSize: num, unitLabel };
    }
  }

  // Pattern: Wine/drinks with glasses (e.g., "3 glasses")
  const glassesPattern = /(\d+)\s*glass(es)?/i;
  const glassesMatch = normalized.match(glassesPattern);
  if (glassesMatch) {
    return {
      type: "per_person",
      unitSize: parseInt(glassesMatch[1], 10),
      unitLabel: "glasses",
    };
  }

  // Default to flat fee
  return { type: "flat" };
}

// Legacy aliases for backward compatibility
export const ServicePhaseEnum = EventEnum;
export type ServicePhaseType = EventType;
export const SERVICE_PHASES = EVENTS;

/**
 * Multi-Day Event Enum (legacy - kept for backward compatibility)
 */
export const MultiDayEventEnum = z.enum([
  "wedding_day", // Required - always included
  "rehearsal_dinner", // Optional - dinner night before wedding
  "welcome_event", // Optional - welcome party for guests
  "next_day_brunch", // Optional - brunch after wedding
  "after_party", // Optional - late night party after reception
]);

export type MultiDayEventType = z.infer<typeof MultiDayEventEnum>;

/**
 * Keyword Mapping Library
 *
 * Maps common wedding service terms to their taxonomy subcategory and default phase.
 * Used for automatic recognition of standard services from venue quotes.
 */
export interface ServiceKeywordMapping {
  categoryId: VendorCategoryType;
  subcategoryId: string;
  defaultPhase?: ServicePhaseType;
  requiresPhaseSelection?: boolean; // If true, user must select which phase this applies to
}

// Keywords are normalized to lowercase for matching
export const SERVICE_KEYWORD_MAPPINGS: Record<string, ServiceKeywordMapping> = {
  // Catering - Reception Dinner
  "wedding dinner": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "wedding dinner menu": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "dinner menu": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "reception dinner": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "main course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "gala dinner": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  // Course-based menus (3-course, 5-course, 7-course, etc.) - use specific patterns to avoid matching "golf course"
  "3-course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "3 course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "4-course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "4 course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "5-course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "5 course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "6-course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "6 course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "7-course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "7 course": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "tasting menu": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "signature menu": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "plated dinner": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "buffet dinner": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "family style": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },

  // Catering - Cocktail Hour
  "drinks reception": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "drinks reception and appetisers": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "drinks reception and appetizers": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "cocktail hour": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "cocktail reception": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  appetizers: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  appetisers: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  appetizer: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  appetiser: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  canapes: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  canapés: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "hors d'oeuvres": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "passed appetizers": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  "passed hors d'oeuvres": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },

  // Catering - Welcome Event
  "welcome bbq": {
    categoryId: "catering_food",
    subcategoryId: "rehearsal_dinner_catering",
    defaultPhase: "welcome_event",
  },
  "welcome dinner": {
    categoryId: "catering_food",
    subcategoryId: "rehearsal_dinner_catering",
    defaultPhase: "welcome_event",
  },
  "welcome party": {
    categoryId: "catering_food",
    subcategoryId: "rehearsal_dinner_catering",
    defaultPhase: "welcome_event",
  },
  "rehearsal dinner": {
    categoryId: "catering_food",
    subcategoryId: "rehearsal_dinner_catering",
    defaultPhase: "welcome_event",
  },

  // Catering - Next Day
  brunch: {
    categoryId: "catering_food",
    subcategoryId: "brunch_next_day",
    defaultPhase: "next_day_brunch",
  },
  "farewell brunch": {
    categoryId: "catering_food",
    subcategoryId: "brunch_next_day",
    defaultPhase: "next_day_brunch",
  },
  "next day brunch": {
    categoryId: "catering_food",
    subcategoryId: "brunch_next_day",
    defaultPhase: "next_day_brunch",
  },
  breakfast: {
    categoryId: "catering_food",
    subcategoryId: "brunch_next_day",
    defaultPhase: "next_day_brunch",
  },
  "continental breakfast": {
    categoryId: "catering_food",
    subcategoryId: "brunch_next_day",
    defaultPhase: "next_day_brunch",
  },

  // Catering - Cake/Dessert
  "wedding cake": {
    categoryId: "catering_food",
    subcategoryId: "wedding_cake",
    defaultPhase: "reception",
  },
  cake: {
    categoryId: "catering_food",
    subcategoryId: "wedding_cake",
    defaultPhase: "reception",
  },
  dessert: {
    categoryId: "catering_food",
    subcategoryId: "dessert_table",
    defaultPhase: "reception",
  },
  "dessert table": {
    categoryId: "catering_food",
    subcategoryId: "dessert_table",
    defaultPhase: "reception",
  },

  // Catering - Late Night
  "late night snacks": {
    categoryId: "catering_food",
    subcategoryId: "late_night_snacks",
    defaultPhase: "after_party",
  },
  "midnight snacks": {
    categoryId: "catering_food",
    subcategoryId: "late_night_snacks",
    defaultPhase: "after_party",
  },

  // Generic Food Keywords - catch common food-related terms
  lunch: {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  dinner: {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  meal: {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  dish: {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  buffet: {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "hot dish": {
    categoryId: "catering_food",
    subcategoryId: "reception",
    defaultPhase: "reception",
  },
  "first course": {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  cheese: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  charcuterie: {
    categoryId: "catering_food",
    subcategoryId: "cocktail_hour_food",
    defaultPhase: "cocktail_hour",
  },
  mignardise: {
    categoryId: "catering_food",
    subcategoryId: "dessert_table",
    defaultPhase: "reception",
  },

  // Bar - Reception
  "open bar": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    requiresPhaseSelection: true,
  },
  "open bar package": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    requiresPhaseSelection: true,
  },
  "bar package": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    requiresPhaseSelection: true,
  },
  "bar service": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    requiresPhaseSelection: true,
  },
  "reception bar": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    defaultPhase: "reception",
  },

  // Bar - Cocktail Hour
  "cocktail hour bar": {
    categoryId: "bar_beverage",
    subcategoryId: "cocktail_hour_bar",
    defaultPhase: "cocktail_hour",
  },
  "welcome drinks": {
    categoryId: "bar_beverage",
    subcategoryId: "cocktail_hour_bar",
    defaultPhase: "cocktail_hour",
  },

  // Bar - Toast
  "champagne toast": {
    categoryId: "bar_beverage",
    subcategoryId: "champagne_toast",
    defaultPhase: "reception",
  },
  champagne: {
    categoryId: "bar_beverage",
    subcategoryId: "champagne_toast",
    defaultPhase: "reception",
  },
  "prosecco toast": {
    categoryId: "bar_beverage",
    subcategoryId: "champagne_toast",
    defaultPhase: "reception",
  },

  // Bar - Wine
  wine: {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    defaultPhase: "reception",
  },
  "estate wine": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    defaultPhase: "reception",
  },
  "house wine": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    defaultPhase: "reception",
  },
  "wine pairing": {
    categoryId: "bar_beverage",
    subcategoryId: "reception_bar",
    defaultPhase: "reception",
  },

  // Bar - Coffee/Tea
  coffee: {
    categoryId: "bar_beverage",
    subcategoryId: "coffee_tea_service",
    defaultPhase: "reception",
  },
  "coffee service": {
    categoryId: "bar_beverage",
    subcategoryId: "coffee_tea_service",
    defaultPhase: "reception",
  },
  "espresso bar": {
    categoryId: "bar_beverage",
    subcategoryId: "espresso_bar",
    defaultPhase: "reception",
  },

  // Venue
  ceremony: {
    categoryId: "venue_location",
    subcategoryId: "ceremony_site",
    defaultPhase: "ceremony",
  },
  "ceremony site": {
    categoryId: "venue_location",
    subcategoryId: "ceremony_site",
    defaultPhase: "ceremony",
  },
  reception: {
    categoryId: "venue_location",
    subcategoryId: "reception_venue",
    defaultPhase: "reception",
  },
  "reception venue": {
    categoryId: "venue_location",
    subcategoryId: "reception_venue",
    defaultPhase: "reception",
  },
  "getting ready": {
    categoryId: "venue_location",
    subcategoryId: "getting_ready_rooms",
    defaultPhase: "all_day",
  },
  "bridal suite": {
    categoryId: "venue_location",
    subcategoryId: "getting_ready_rooms",
    defaultPhase: "all_day",
  },

  // Entertainment
  dj: {
    categoryId: "entertainment_music",
    subcategoryId: "reception_dj_or_band",
    defaultPhase: "reception",
  },
  band: {
    categoryId: "entertainment_music",
    subcategoryId: "reception_dj_or_band",
    defaultPhase: "reception",
  },
  "live band": {
    categoryId: "entertainment_music",
    subcategoryId: "reception_dj_or_band",
    defaultPhase: "reception",
  },
  "live music": {
    categoryId: "entertainment_music",
    subcategoryId: "reception_dj_or_band",
    defaultPhase: "reception",
  },

  // Planning
  coordination: {
    categoryId: "planning_coordination",
    subcategoryId: "day_of_coordinator",
    defaultPhase: "all_day",
  },
  "wedding coordinator": {
    categoryId: "planning_coordination",
    subcategoryId: "day_of_coordinator",
    defaultPhase: "all_day",
  },
  "day of coordinator": {
    categoryId: "planning_coordination",
    subcategoryId: "day_of_coordinator",
    defaultPhase: "all_day",
  },
};

/**
 * Variant modifiers that should be treated as attributes of the same service
 * rather than separate services
 */
export const SERVICE_VARIANT_MODIFIERS = [
  "adult",
  "adults",
  "child",
  "children",
  "kids",
  "vegetarian",
  "vegan",
  "gluten-free",
  "gluten free",
  "kosher",
  "halal",
  "pescatarian",
];

/**
 * Find the best keyword mapping for a given service name
 * Returns null if no match found
 */
export function findServiceMapping(
  serviceName: string,
): ServiceKeywordMapping | null {
  const normalized = serviceName.toLowerCase().trim();

  // First, try exact match
  if (SERVICE_KEYWORD_MAPPINGS[normalized]) {
    return SERVICE_KEYWORD_MAPPINGS[normalized];
  }

  // Remove variant modifiers and try again
  let cleanedName = normalized;
  for (const modifier of SERVICE_VARIANT_MODIFIERS) {
    cleanedName = cleanedName
      .replace(new RegExp(`\\b${modifier}\\b`, "gi"), "")
      .trim();
    cleanedName = cleanedName.replace(/\s*\([^)]*\)\s*/g, "").trim(); // Remove parenthetical content
  }
  cleanedName = cleanedName.replace(/\s+/g, " ").trim();

  if (cleanedName && SERVICE_KEYWORD_MAPPINGS[cleanedName]) {
    return SERVICE_KEYWORD_MAPPINGS[cleanedName];
  }

  // Try partial match - keyword must appear as a recognizable phrase
  // For specific keywords like "3-course", "5-course" - use simple substring match
  // since they're unique enough. For regular words, use word boundaries.
  for (const [keyword, mapping] of Object.entries(SERVICE_KEYWORD_MAPPINGS)) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Keywords with numbers (e.g., "3-course", "5-course") are specific enough
    // that simple substring matching is safe
    const hasNumber = /\d/.test(keyword);

    if (hasNumber) {
      // Simple substring match for numbered keywords like "3-course"
      if (normalized.includes(keyword) || cleanedName.includes(keyword)) {
        return mapping;
      }
    } else {
      // For regular words, use word boundary to avoid partial word matches
      // Allows optional trailing "s" for plurals
      const regex = new RegExp(`\\b${escapedKeyword}(?:s)?\\b`, "i");
      if (regex.test(normalized) || regex.test(cleanedName)) {
        return mapping;
      }
    }
  }

  return null;
}

/**
 * Extract variant information from a service name
 */
export function extractServiceVariant(serviceName: string): {
  baseName: string;
  variant: "adult" | "child" | "dietary" | null;
  dietaryType?: string;
} {
  const normalized = serviceName.toLowerCase();

  if (normalized.includes("child") || normalized.includes("kids")) {
    return {
      baseName: serviceName
        .replace(/\s*\((child|children|kids)\)\s*/gi, "")
        .trim(),
      variant: "child",
    };
  }

  if (normalized.includes("adult")) {
    return {
      baseName: serviceName.replace(/\s*\((adult|adults)\)\s*/gi, "").trim(),
      variant: "adult",
    };
  }

  const dietaryTypes = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "gluten free",
    "kosher",
    "halal",
    "pescatarian",
  ];
  for (const diet of dietaryTypes) {
    if (normalized.includes(diet)) {
      return {
        baseName: serviceName
          .replace(new RegExp(`\\s*\\(?${diet}\\)?\\s*`, "gi"), "")
          .trim(),
        variant: "dietary",
        dietaryType: diet,
      };
    }
  }

  return { baseName: serviceName, variant: null };
}

export interface VendorSubcategory {
  id: string;
  name: string;
  estimatedCost?: { low: number; mid: number; high: number };
}

export interface VendorCategory {
  id: VendorCategoryType;
  name: string;
  icon: string;
  description: string;
  standardServices: VendorSubcategory[];
  optionalServices: VendorSubcategory[];
}

export const VENDOR_TAXONOMY: Record<VendorCategoryType, VendorCategory> = {
  venue_location: {
    id: "venue_location",
    name: "Venue & Setup",
    icon: "📍",
    description:
      "Venue hire, furniture, setup/teardown, staffing, cleaning, marquee, ceremony site, reception hall, logistics",
    standardServices: [
      {
        id: "ceremony_site",
        name: "Ceremony Site",
        estimatedCost: { low: 1500, mid: 3000, high: 8000 },
      },
      {
        id: "cocktail_space",
        name: "Cocktail Hour Space",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
      {
        id: "reception_venue",
        name: "Reception Venue",
        estimatedCost: { low: 3000, mid: 8000, high: 25000 },
      },
      {
        id: "getting_ready_rooms",
        name: "Getting Ready Rooms",
        estimatedCost: { low: 200, mid: 500, high: 1500 },
      },
    ],
    optionalServices: [
      {
        id: "rehearsal_dinner_venue",
        name: "Rehearsal Dinner Venue",
        estimatedCost: { low: 500, mid: 1500, high: 5000 },
      },
      {
        id: "welcome_party_venue",
        name: "Welcome Party Venue",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
      {
        id: "after_party_venue",
        name: "After Party Venue",
        estimatedCost: { low: 300, mid: 1000, high: 3000 },
      },
    ],
  },

  catering_food: {
    id: "catering_food",
    name: "Catering & Food",
    icon: "🍽️",
    description:
      "All meals from rehearsal to reception, appetizers to desserts",
    standardServices: [
      {
        id: "cocktail_hour_food",
        name: "Cocktail Hour Appetizers",
        estimatedCost: { low: 800, mid: 2000, high: 5000 },
      },
      {
        id: "reception",
        name: "Reception Dinner",
        estimatedCost: { low: 3000, mid: 8000, high: 20000 },
      },
    ],
    optionalServices: [
      {
        id: "rehearsal_dinner_catering",
        name: "Rehearsal Dinner Catering",
        estimatedCost: { low: 1000, mid: 2500, high: 6000 },
      },
      {
        id: "welcome_event_catering",
        name: "Welcome Event Catering",
        estimatedCost: { low: 1500, mid: 3000, high: 7000 },
      },
      {
        id: "after_party_food",
        name: "After Party Food",
        estimatedCost: { low: 300, mid: 800, high: 2000 },
      },
      {
        id: "dessert_table",
        name: "Dessert Table/Bar",
        estimatedCost: { low: 300, mid: 700, high: 1500 },
      },
      {
        id: "late_night_snacks",
        name: "Late Night Snacks",
        estimatedCost: { low: 300, mid: 800, high: 2000 },
      },
      {
        id: "brunch_next_day",
        name: "Next Day Brunch",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
      {
        id: "kids_menu",
        name: "Children's Menu",
        estimatedCost: { low: 100, mid: 300, high: 600 },
      },
    ],
  },

  bar_beverage: {
    id: "bar_beverage",
    name: "Bar & Beverages",
    icon: "🍷",
    description: "Cocktail hour drinks, reception bar, champagne toast",
    standardServices: [
      {
        id: "cocktail_hour_bar",
        name: "Cocktail Hour Bar",
        estimatedCost: { low: 800, mid: 2000, high: 5000 },
      },
      {
        id: "reception_bar",
        name: "Reception Bar Service",
        estimatedCost: { low: 1500, mid: 4000, high: 10000 },
      },
      {
        id: "champagne_toast",
        name: "Champagne for Toasts",
        estimatedCost: { low: 200, mid: 500, high: 1200 },
      },
    ],
    optionalServices: [
      {
        id: "rehearsal_dinner_bar",
        name: "Rehearsal Dinner Bar",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
      {
        id: "welcome_event_bar",
        name: "Welcome Event Bar",
        estimatedCost: { low: 800, mid: 2000, high: 5000 },
      },
      {
        id: "brunch_beverages",
        name: "Brunch Beverages",
        estimatedCost: { low: 200, mid: 500, high: 1200 },
      },
      {
        id: "after_party_bar",
        name: "After Party Bar",
        estimatedCost: { low: 400, mid: 1000, high: 2500 },
      },
      {
        id: "signature_cocktails",
        name: "Signature Cocktails",
        estimatedCost: { low: 200, mid: 500, high: 1000 },
      },
      {
        id: "premium_spirits",
        name: "Premium Spirits Upgrade",
        estimatedCost: { low: 500, mid: 1500, high: 3000 },
      },
      {
        id: "coffee_tea_service",
        name: "Coffee/Tea Service",
        estimatedCost: { low: 150, mid: 400, high: 800 },
      },
      {
        id: "espresso_bar",
        name: "Espresso Bar",
        estimatedCost: { low: 300, mid: 600, high: 1200 },
      },
    ],
  },

  photography_video: {
    id: "photography_video",
    name: "Photography & Video",
    icon: "📸",
    description: "Photo and video coverage throughout the day",
    standardServices: [
      {
        id: "main_photographer",
        name: "Professional Photographer",
        estimatedCost: { low: 2000, mid: 4000, high: 10000 },
      },
    ],
    optionalServices: [
      {
        id: "second_photographer",
        name: "Second Photographer",
        estimatedCost: { low: 500, mid: 1000, high: 2000 },
      },
      {
        id: "videographer",
        name: "Videographer",
        estimatedCost: { low: 1500, mid: 3500, high: 8000 },
      },
      {
        id: "drone_footage",
        name: "Drone Footage",
        estimatedCost: { low: 300, mid: 700, high: 1500 },
      },
      {
        id: "photo_booth",
        name: "Photo Booth",
        estimatedCost: { low: 400, mid: 800, high: 1500 },
      },
      {
        id: "printed_albums",
        name: "Printed Albums",
        estimatedCost: { low: 300, mid: 800, high: 2000 },
      },
      {
        id: "engagement_session",
        name: "Engagement Photo Session",
        estimatedCost: { low: 200, mid: 500, high: 1200 },
      },
    ],
  },

  entertainment_music: {
    id: "entertainment_music",
    name: "Entertainment & Music",
    icon: "🎵",
    description:
      "DJs, bands, MCs, ceremony musicians, cocktail hour entertainment, sound systems, AV equipment",
    standardServices: [
      {
        id: "reception_dj_or_band",
        name: "Reception DJ or Live Band",
        estimatedCost: { low: 1000, mid: 2500, high: 8000 },
      },
    ],
    optionalServices: [
      {
        id: "ceremony_music",
        name: "Ceremony Musicians",
        estimatedCost: { low: 300, mid: 600, high: 1500 },
      },
      {
        id: "cocktail_hour_music",
        name: "Cocktail Hour Music",
        estimatedCost: { low: 200, mid: 500, high: 1000 },
      },
      {
        id: "dance_floor_rental",
        name: "Dance Floor Rental",
        estimatedCost: { low: 300, mid: 700, high: 1500 },
      },
      {
        id: "live_painter",
        name: "Live Event Painter",
        estimatedCost: { low: 500, mid: 1200, high: 3000 },
      },
    ],
  },

  flowers_decor: {
    id: "flowers_decor",
    name: "Florals & Décor",
    icon: "💐",
    description:
      "Bouquets, centerpieces, ceremony and reception decor, stationery, place cards, signage, seating charts",
    standardServices: [
      {
        id: "bridal_bouquet",
        name: "Bridal Bouquet",
        estimatedCost: { low: 150, mid: 300, high: 600 },
      },
      {
        id: "bridesmaid_bouquets",
        name: "Bridesmaid Bouquets",
        estimatedCost: { low: 200, mid: 500, high: 1000 },
      },
      {
        id: "centerpieces",
        name: "Reception Centerpieces",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
    ],
    optionalServices: [
      {
        id: "boutonnieres",
        name: "Boutonnieres",
        estimatedCost: { low: 50, mid: 150, high: 300 },
      },
      {
        id: "ceremony_arch_flowers",
        name: "Ceremony Arch/Altar Flowers",
        estimatedCost: { low: 300, mid: 800, high: 2000 },
      },
      {
        id: "aisle_decorations",
        name: "Aisle Decorations",
        estimatedCost: { low: 200, mid: 500, high: 1200 },
      },
      {
        id: "reception_decor",
        name: "Reception Decor Beyond Flowers",
        estimatedCost: { low: 300, mid: 1000, high: 3000 },
      },
      {
        id: "flower_girl_basket",
        name: "Flower Girl Basket/Petals",
        estimatedCost: { low: 50, mid: 100, high: 200 },
      },
      {
        id: "stationery",
        name: "Stationery & Signage",
        estimatedCost: { low: 150, mid: 400, high: 1000 },
      },
    ],
  },

  beauty_prep: {
    id: "beauty_prep",
    name: "Beauty & Getting Ready",
    icon: "💇",
    description: "Hair, makeup, spa services for the wedding party",
    standardServices: [
      {
        id: "bride_hair",
        name: "Bride Hair Styling",
        estimatedCost: { low: 150, mid: 300, high: 600 },
      },
      {
        id: "bride_makeup",
        name: "Bride Makeup",
        estimatedCost: { low: 100, mid: 250, high: 500 },
      },
    ],
    optionalServices: [
      {
        id: "bridal_party_hair",
        name: "Bridal Party Hair",
        estimatedCost: { low: 200, mid: 500, high: 1000 },
      },
      {
        id: "bridal_party_makeup",
        name: "Bridal Party Makeup",
        estimatedCost: { low: 200, mid: 400, high: 800 },
      },
      {
        id: "hair_makeup_trials",
        name: "Hair & Makeup Trials",
        estimatedCost: { low: 150, mid: 300, high: 600 },
      },
      {
        id: "spa_services",
        name: "Spa/Massage Services",
        estimatedCost: { low: 200, mid: 500, high: 1500 },
      },
      {
        id: "touch_up_kit",
        name: "Touch-up Kit",
        estimatedCost: { low: 50, mid: 100, high: 200 },
      },
    ],
  },

  planning_coordination: {
    id: "planning_coordination",
    name: "Planning & Coordination",
    icon: "👔",
    description: "Day-of coordinator, month-of or full-service planning",
    standardServices: [],
    optionalServices: [
      {
        id: "day_of_coordinator",
        name: "Day-of Coordinator",
        estimatedCost: { low: 800, mid: 1500, high: 3000 },
      },
      {
        id: "month_of_planning",
        name: "Month-of Planning",
        estimatedCost: { low: 1500, mid: 3000, high: 6000 },
      },
      {
        id: "full_service_planning",
        name: "Full-Service Wedding Planner",
        estimatedCost: { low: 3000, mid: 6000, high: 15000 },
      },
    ],
  },

  officiant: {
    id: "officiant",
    name: "Officiant",
    icon: "🎙️",
    description:
      "Celebrants, ministers, ceremony officiants, symbolic ceremony leaders, priests, pastors",
    standardServices: [
      {
        id: "ceremony_officiant",
        name: "Officiant / Celebrant",
        estimatedCost: { low: 300, mid: 800, high: 2000 },
      },
    ],
    optionalServices: [],
  },

  transport: {
    id: "transport",
    name: "Transport",
    icon: "🚌",
    description:
      "Guest transport, couple transport, shuttle buses, car hire, limousines, airport transfers",
    standardServices: [
      {
        id: "guest_transport",
        name: "Guest Transport & Transfers",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
    ],
    optionalServices: [
      {
        id: "airport_transfers",
        name: "Airport Transfers",
        estimatedCost: { low: 300, mid: 800, high: 2000 },
      },
    ],
  },

  lighting_av: {
    id: "lighting_av",
    name: "Lighting & AV",
    icon: "💡",
    description:
      "Lighting design, uplighting, fairy lights, festoon lights, AV hire, projectors, screens, microphones, speakers",
    standardServices: [
      {
        id: "reception_lighting",
        name: "Reception Lighting",
        estimatedCost: { low: 500, mid: 1500, high: 4000 },
      },
      {
        id: "ceremony_av",
        name: "Ceremony AV / Microphones",
        estimatedCost: { low: 200, mid: 500, high: 1200 },
      },
    ],
    optionalServices: [],
  },

  wedding_cake: {
    id: "wedding_cake",
    name: "Wedding Cake",
    icon: "🎂",
    description:
      "Wedding cake, cake cutting, dessert table, sweet treats, macaron towers, patisserie",
    standardServices: [
      {
        id: "wedding_cake_main",
        name: "Wedding Cake",
        estimatedCost: { low: 300, mid: 800, high: 2500 },
      },
    ],
    optionalServices: [
      {
        id: "dessert_table_cake",
        name: "Dessert Table",
        estimatedCost: { low: 200, mid: 600, high: 1500 },
      },
    ],
  },

  other: {
    id: "other",
    name: "Other Services",
    icon: "📦",
    description: "Miscellaneous wedding services not fitting other categories",
    standardServices: [],
    optionalServices: [
      {
        id: "other_service",
        name: "Other Service",
        estimatedCost: { low: 200, mid: 500, high: 1500 },
      },
    ],
  },
};

export const VENDOR_CATEGORY_IDS = Object.keys(
  VENDOR_TAXONOMY,
) as VendorCategoryType[];

export function estimateCategoryGapCost(
  categoryId: VendorCategoryType,
  tier: "low" | "mid" | "high",
  _guestCount: number,
): number {
  void _guestCount;
  const cat = VENDOR_TAXONOMY[categoryId];
  if (!cat) return 0;
  return cat.standardServices.reduce((total, svc) => {
    return total + (svc.estimatedCost?.[tier] ?? 0);
  }, 0);
}

export const VENDOR_TYPE_TO_CATEGORY: Record<string, VendorCategoryType> = {
  venue: "venue_location",
  location: "venue_location",
  caterer: "catering_food",
  catering: "catering_food",
  food: "catering_food",
  bar: "bar_beverage",
  beverage: "bar_beverage",
  bartender: "bar_beverage",
  photographer: "photography_video",
  photography: "photography_video",
  videographer: "photography_video",
  videography: "photography_video",
  dj: "entertainment_music",
  band: "entertainment_music",
  music: "entertainment_music",
  entertainment: "entertainment_music",
  florist: "flowers_decor",
  flowers: "flowers_decor",
  decor: "flowers_decor",
  decorator: "flowers_decor",
  rentals: "flowers_decor",
  hair: "beauty_prep",
  makeup: "beauty_prep",
  beauty: "beauty_prep",
  planner: "planning_coordination",
  coordinator: "planning_coordination",
  officiant: "officiant",
  celebrant: "officiant",
  minister: "officiant",
  other: "other",
};

export function mapVendorTypeToCategory(
  vendorType: string,
): VendorCategoryType {
  const normalized = vendorType.toLowerCase().trim();
  return VENDOR_TYPE_TO_CATEGORY[normalized] || "planning_coordination";
}

export function getAllVendorSubcategoryIds(): string[] {
  return VENDOR_CATEGORY_IDS.flatMap((categoryId) => {
    const category = VENDOR_TAXONOMY[categoryId];
    return [
      ...category.standardServices.map((s) => s.id),
      ...category.optionalServices.map((s) => s.id),
    ];
  });
}

export function findCategoryForSubcategory(
  subcategoryId: string,
): VendorCategoryType | null {
  for (const categoryId of VENDOR_CATEGORY_IDS) {
    const category = VENDOR_TAXONOMY[categoryId];
    if (
      category.standardServices.some((s) => s.id === subcategoryId) ||
      category.optionalServices.some((s) => s.id === subcategoryId)
    ) {
      return categoryId;
    }
  }
  return null;
}

export function getSubcategoryById(
  subcategoryId: string,
): VendorSubcategory | null {
  for (const categoryId of VENDOR_CATEGORY_IDS) {
    const category = VENDOR_TAXONOMY[categoryId];
    const found = [
      ...category.standardServices,
      ...category.optionalServices,
    ].find((s) => s.id === subcategoryId);
    if (found) return found;
  }
  return null;
}

export function getCategoryDisplayInfo(categoryId: VendorCategoryType): {
  name: string;
  icon: string;
} {
  const category = VENDOR_TAXONOMY[categoryId];
  return { name: category.name, icon: category.icon };
}

export function getEstimatedCostForSubcategory(
  subcategoryId: string,
  tier: "low" | "mid" | "high" = "mid",
): number {
  const subcategory = getSubcategoryById(subcategoryId);
  if (!subcategory?.estimatedCost) return 0;
  return subcategory.estimatedCost[tier];
}

export function getTotalEstimatedCostForCategory(
  categoryId: VendorCategoryType,
  selectedSubcategories: string[],
  tier: "low" | "mid" | "high" = "mid",
): number {
  const category = VENDOR_TAXONOMY[categoryId];
  const allSubcategories = [
    ...category.standardServices,
    ...category.optionalServices,
  ];

  return selectedSubcategories.reduce((total, subId) => {
    const sub = allSubcategories.find((s) => s.id === subId);
    if (sub?.estimatedCost) {
      return total + sub.estimatedCost[tier];
    }
    return total;
  }, 0);
}

export const VendorCategoryCoverageSchema = z.record(
  VendorCategoryEnum,
  z.object({
    status: z.enum(["booked", "partial", "not_booked"]),
    coveredSubcategories: z.array(z.string()),
    missingSubcategories: z.array(z.string()),
    bookedVendorName: z.string().optional(),
    bookedQuoteId: z.string().optional(),
    estimatedMissingCost: z
      .object({
        low: z.number(),
        mid: z.number(),
        high: z.number(),
      })
      .optional(),
  }),
);

export type VendorCategoryCoverage = z.infer<
  typeof VendorCategoryCoverageSchema
>;

export const CustomServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: VendorCategoryEnum,
  eventId: MultiDayEventEnum.optional(), // Which multi-day event this service is for
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(["user-added", "venue-quote"]).optional(),
  sourceQuoteId: z.number().optional(),
  sourceVendorName: z.string().optional(),
  createdAt: z.string().optional(),
  isAutoGenerated: z.boolean().optional(), // True if auto-created when event selected
});

export type CustomService = z.infer<typeof CustomServiceSchema>;

export const MappedServiceSchema = z.object({
  id: z.string(),
  subcategoryId: z.string(),
  name: z.string(),
  estimatedCost: z.number(),
  currency: z.string().optional().default("EUR"),
  vendorName: z.string().optional().default(""),
  eventId: MultiDayEventEnum.optional().default("wedding_day"),
  source: z.literal("vendor-quote").optional().default("vendor-quote"),
});

export type MappedService = z.infer<typeof MappedServiceSchema>;

export const VendorCategoryRequirementsSchema = z.record(
  VendorCategoryEnum,
  z.object({
    needed: z.boolean(),
    selectedSubcategories: z.array(z.string()),
    customServices: z.array(CustomServiceSchema).optional(),
    mappedServices: z.array(MappedServiceSchema).optional(),
  }),
);

export type VendorCategoryRequirements = z.infer<
  typeof VendorCategoryRequirementsSchema
>;

export function getDefaultVendorRequirements(): VendorCategoryRequirements {
  const requirements: Partial<VendorCategoryRequirements> = {};

  for (const categoryId of VENDOR_CATEGORY_IDS) {
    const category = VENDOR_TAXONOMY[categoryId];
    requirements[categoryId] = {
      needed: category.standardServices.length > 0,
      selectedSubcategories: category.standardServices.map((s) => s.id),
      customServices: [],
      mappedServices: [],
    };
  }

  return requirements as VendorCategoryRequirements;
}

export const LEGACY_SEGMENT_TO_VENDOR_CATEGORY: Record<
  string,
  VendorCategoryType[]
> = {
  rehearsal_dinner: ["venue_location", "catering_food", "bar_beverage"],
  ceremony_preparation: ["beauty_prep", "venue_location"],
  ceremony: [
    "venue_location",
    "entertainment_music",
    "flowers_decor",
    "planning_coordination",
  ],
  cocktail_hour: [
    "venue_location",
    "catering_food",
    "bar_beverage",
    "entertainment_music",
  ],
  reception: [
    "venue_location",
    "catering_food",
    "bar_beverage",
    "flowers_decor",
  ],
  reception_entertainment: ["entertainment_music", "photography_video"],
  cake_dessert: ["catering_food"],
  photography_video: ["photography_video"],
};

export const LEGACY_SERVICE_TO_SUBCATEGORY: Record<string, string> = {
  rehearsal_venue: "rehearsal_dinner_venue",
  rehearsal_catering: "rehearsal_dinner_catering",
  rehearsal_bar: "cocktail_hour_bar",
  prep_hair: "bride_hair",
  prep_makeup: "bride_makeup",
  prep_beauty: "bride_hair", // Maps to beauty category for estimates
  prep_venue: "getting_ready_rooms",
  planning_coordinator: "day_of_coordinator", // Maps to planning/coordination for estimates
  other_services: "day_of_coordinator", // Fallback estimate for misc services
  ceremony_venue: "ceremony_site",
  ceremony_officiant: "officiant",
  ceremony_arch: "ceremony_arch_flowers",
  ceremony_music: "ceremony_music",
  cocktail_venue: "cocktail_space",
  cocktail_appetizers: "cocktail_hour_food",
  cocktail_bar: "cocktail_hour_bar",
  cocktail_music: "cocktail_hour_music",
  reception_venue: "reception_venue",
  reception_catering: "reception",
  reception_centerpieces: "centerpieces",
  reception_late_night_snacks: "late_night_snacks",
  entertainment_dj_band: "reception_dj_or_band",
  entertainment_dance_floor: "dance_floor_rental",
  entertainment_lighting: "specialty_lighting",
  entertainment_photo_booth: "photo_booth",
  cake_wedding: "wedding_cake",
  cake_dessert_bar: "dessert_table",
  photo_photographer: "main_photographer",
  photo_videographer: "videographer",
  photo_second_shooter: "second_photographer",
  photo_drone_footage: "drone_footage",
  photo_album: "printed_albums",
};

export function migrateLegacyServiceToSubcategory(
  legacyServiceId: string,
): string | null {
  return LEGACY_SERVICE_TO_SUBCATEGORY[legacyServiceId] || null;
}

export function migrateLegacySegmentToCategories(
  segmentId: string,
): VendorCategoryType[] {
  return LEGACY_SEGMENT_TO_VENDOR_CATEGORY[segmentId] || [];
}

export interface LegacySegmentRequirement {
  desired?: boolean;
  selectedServices?: string[];
}

export function migrateLegacyRequirementsToVendorCategories(
  legacyRequirements: Record<string, LegacySegmentRequirement>,
): VendorCategoryRequirements {
  const vendorReqs = getDefaultVendorRequirements();
  const processedCategories = new Set<VendorCategoryType>();

  Object.entries(legacyRequirements).forEach(([segmentId, segReq]) => {
    if (!segReq.desired) return;

    const targetCategories = migrateLegacySegmentToCategories(segmentId);
    targetCategories.forEach((categoryId) => {
      processedCategories.add(categoryId);
      const catReq = vendorReqs[categoryId];
      if (catReq) catReq.needed = true;
    });

    (segReq.selectedServices || []).forEach((serviceId) => {
      const subcategoryId = migrateLegacyServiceToSubcategory(serviceId);
      if (subcategoryId) {
        const categoryId = findCategoryForSubcategory(subcategoryId);
        if (categoryId) {
          const catReq = vendorReqs[categoryId];
          if (catReq && !catReq.selectedSubcategories.includes(subcategoryId)) {
            catReq.selectedSubcategories.push(subcategoryId);
          }
        }
      }
    });
  });

  VENDOR_CATEGORY_IDS.forEach((categoryId) => {
    if (!processedCategories.has(categoryId)) {
      const catReq = vendorReqs[categoryId];
      if (catReq) catReq.needed = false;
    }
  });

  return vendorReqs;
}

/**
 * Canonical subcategory IDs from VENDOR_TAXONOMY for validation
 * CATERING_FOOD: cocktail_hour_food, reception_dinner, wedding_cake, rehearsal_dinner_catering, dessert_table, late_night_snacks, brunch_next_day, kids_menu
 * BAR_BEVERAGE: cocktail_hour_bar, reception_bar, champagne_toast, signature_cocktails, premium_spirits, coffee_tea_service, espresso_bar
 */

/**
 * Find the best matching subcategory for a menu item label
 * Uses strict keyword matching with multi-word phrases prioritized
 * Only returns canonical subcategory IDs that exist in VENDOR_TAXONOMY
 */
export function mapMenuItemToSubcategory(
  label: string,
): { subcategoryId: string; categoryId: VendorCategoryType } | null {
  // Normalize: lowercase, remove accents, remove ALL apostrophe variants, replace & and / and , with "and", collapse whitespace, trim
  const normalizedLabel = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`''\u2018\u2019\u201B\u0027\u0060]/g, "") // All apostrophe and quote variants
    .replace(/[&/,]/g, " and ") // Replace &, /, and comma with "and"
    .replace(/\s+/g, " ")
    .trim();

  // Ordered keyword mappings - more specific phrases first
  // ALL subcategory IDs here are verified to exist in VENDOR_TAXONOMY
  const mappings: Array<{
    patterns: string[];
    subcategoryId: string;
    categoryId: VendorCategoryType;
  }> = [
    // Bar & Beverage - specific phrases first
    {
      patterns: [
        "open bar",
        "unlimited bar",
        "bar package",
        "drinks package",
        "bar service",
      ],
      subcategoryId: "reception_bar",
      categoryId: "bar_beverage",
    },
    {
      patterns: ["cocktail hour bar", "welcome drinks", "pre-dinner drinks"],
      subcategoryId: "cocktail_hour_bar",
      categoryId: "bar_beverage",
    },
    {
      patterns: ["champagne toast", "champagne for toast", "sparkling toast"],
      subcategoryId: "champagne_toast",
      categoryId: "bar_beverage",
    },
    {
      patterns: ["signature cocktail", "custom cocktail"],
      subcategoryId: "signature_cocktails",
      categoryId: "bar_beverage",
    },
    {
      patterns: ["premium spirits", "premium bar", "top shelf"],
      subcategoryId: "premium_spirits",
      categoryId: "bar_beverage",
    },
    {
      patterns: ["coffee service", "tea service", "coffee and tea"],
      subcategoryId: "coffee_tea_service",
      categoryId: "bar_beverage",
    },
    {
      patterns: ["espresso bar", "espresso station", "espresso service"],
      subcategoryId: "espresso_bar",
      categoryId: "bar_beverage",
    },

    // Catering & Food - specific phrases first
    {
      patterns: ["next day brunch", "morning brunch", "farewell brunch"],
      subcategoryId: "brunch_next_day",
      categoryId: "catering_food",
    },
    {
      patterns: [
        "seated dinner",
        "plated dinner",
        "buffet dinner",
        "wedding dinner",
        "reception dinner",
        "gala dinner",
        "dinner menu",
      ],
      subcategoryId: "reception",
      categoryId: "catering_food",
    },
    {
      patterns: [
        "welcome bbq",
        "welcome dinner",
        "rehearsal dinner",
        "rehearsal catering",
      ],
      subcategoryId: "rehearsal_dinner_catering",
      categoryId: "catering_food",
    },
    {
      patterns: [
        "drinks reception and appetisers",
        "drinks reception and appetizers",
        "drinks reception",
        "cocktail appetizers",
        "cocktail hour food",
        "canapes",
        "hors doeuvres",
        "passed appetizers",
        "appetisers",
        "canapés",
        "cocktail reception",
      ],
      subcategoryId: "cocktail_hour_food",
      categoryId: "catering_food",
    },
    {
      patterns: ["wedding cake", "cake cutting", "celebration cake"],
      subcategoryId: "wedding_cake",
      categoryId: "catering_food",
    },
    {
      patterns: ["dessert table", "dessert bar", "sweet table"],
      subcategoryId: "dessert_table",
      categoryId: "catering_food",
    },
    {
      patterns: ["late night snack", "midnight snack", "late-night food"],
      subcategoryId: "late_night_snacks",
      categoryId: "catering_food",
    },
    {
      patterns: ["kids menu", "childrens menu", "child menu", "junior menu"],
      subcategoryId: "kids_menu",
      categoryId: "catering_food",
    },

    // Single-word fallbacks - only for unambiguous terms
    {
      patterns: ["brunch"],
      subcategoryId: "brunch_next_day",
      categoryId: "catering_food",
    },
    {
      patterns: ["bbq", "barbecue"],
      subcategoryId: "rehearsal_dinner_catering",
      categoryId: "catering_food",
    },
    {
      patterns: ["appetizers", "appetisers"],
      subcategoryId: "cocktail_hour_food",
      categoryId: "catering_food",
    },
    {
      patterns: ["dinner"],
      subcategoryId: "reception",
      categoryId: "catering_food",
    },
  ];

  for (const { patterns, subcategoryId, categoryId } of mappings) {
    for (const pattern of patterns) {
      if (normalizedLabel.includes(pattern)) {
        return { subcategoryId, categoryId };
      }
    }
  }

  return null;
}

/**
 * Maps multiple menu item labels to their corresponding subcategories
 * Returns both matched and unmatched items
 */
export function mapMenuSelectionsToSubcategories(
  menuItems: Array<{ id: string; label: string; vendorCategory?: string }>,
): {
  matched: Array<{
    menuId: string;
    label: string;
    subcategoryId: string;
    categoryId: VendorCategoryType;
  }>;
  unmatched: Array<{
    menuId: string;
    label: string;
    suggestedCategory: VendorCategoryType;
  }>;
} {
  const matched: Array<{
    menuId: string;
    label: string;
    subcategoryId: string;
    categoryId: VendorCategoryType;
  }> = [];
  const unmatched: Array<{
    menuId: string;
    label: string;
    suggestedCategory: VendorCategoryType;
  }> = [];

  for (const item of menuItems) {
    const mapping = mapMenuItemToSubcategory(item.label);
    if (mapping) {
      matched.push({
        menuId: item.id,
        label: item.label,
        subcategoryId: mapping.subcategoryId,
        categoryId: mapping.categoryId,
      });
    } else {
      // Suggest a category based on the item's vendorCategory or default to catering_food
      const suggestedCategory =
        (item.vendorCategory as VendorCategoryType) || "catering_food";
      unmatched.push({
        menuId: item.id,
        label: item.label,
        suggestedCategory,
      });
    }
  }

  return { matched, unmatched };
}

export function inferVendorCategoryFromQuote(quote: {
  vendorType?: string | null;
  vendorCategory?: string | null;
  vendorName?: string | null;
}): VendorCategoryType {
  if (
    quote.vendorCategory &&
    VENDOR_TAXONOMY[quote.vendorCategory as VendorCategoryType]
  ) {
    return quote.vendorCategory as VendorCategoryType;
  }

  if (quote.vendorType) {
    return mapVendorTypeToCategory(quote.vendorType);
  }

  const nameLower = (quote.vendorName || "").toLowerCase();
  if (
    nameLower.includes("photo") ||
    nameLower.includes("video") ||
    nameLower.includes("film")
  ) {
    return "photography_video";
  }
  if (
    nameLower.includes("flower") ||
    nameLower.includes("floral") ||
    nameLower.includes("decor")
  ) {
    return "flowers_decor";
  }
  if (
    nameLower.includes("cater") ||
    nameLower.includes("food") ||
    nameLower.includes("chef")
  ) {
    return "catering_food";
  }
  if (
    nameLower.includes("dj") ||
    nameLower.includes("band") ||
    nameLower.includes("music") ||
    nameLower.includes("entertainment")
  ) {
    return "entertainment_music";
  }
  if (
    nameLower.includes("bar") ||
    nameLower.includes("beverage") ||
    nameLower.includes("cocktail")
  ) {
    return "bar_beverage";
  }
  if (
    nameLower.includes("hair") ||
    nameLower.includes("makeup") ||
    nameLower.includes("beauty")
  ) {
    return "beauty_prep";
  }
  if (
    nameLower.includes("officiant") ||
    nameLower.includes("celebrant") ||
    nameLower.includes("minister")
  ) {
    return "officiant";
  }
  if (nameLower.includes("plan") || nameLower.includes("coordin")) {
    return "planning_coordination";
  }

  return "planning_coordination";
}

/**
 * Multi-Day Wedding Event System
 *
 * Represents the major events across a multi-day wedding celebration.
 * Different from ServicePhaseEnum which represents phases WITHIN a single day.
 *
 * wedding_day: The main wedding day (required for all users)
 * rehearsal_dinner: Pre-wedding dinner, typically night before
 * welcome_event: Welcome party for out-of-town guests (could be same night as rehearsal or separate)
 * next_day_brunch: Post-wedding brunch for guests
 * after_party: Late night celebration after reception
 */
// MultiDayEventEnum is defined earlier in file to avoid circular reference

export interface MultiDayEventDefinition {
  id: MultiDayEventType;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  defaultSelected: boolean;
  coverageWeight: number; // For weighted overall coverage calculation
  requiredVendorCategories: VendorCategoryType[]; // Which vendor categories this event needs
  defaultServices: Array<{
    categoryId: VendorCategoryType;
    serviceId: string;
    name: string;
    estimatedCost: number;
  }>;
}

export const MULTI_DAY_EVENTS: Record<
  MultiDayEventType,
  MultiDayEventDefinition
> = {
  wedding_day: {
    id: "wedding_day",
    name: "Wedding Day",
    description: "The main wedding ceremony and reception",
    icon: "💒",
    required: true,
    defaultSelected: true,
    coverageWeight: 0.5, // Wedding day gets 50% weight
    requiredVendorCategories: [
      "venue_location",
      "catering_food",
      "bar_beverage",
      "photography_video",
      "entertainment_music",
      "flowers_decor",
      "beauty_prep",
      "planning_coordination",
    ],
    defaultServices: [
      // Wedding Day has all standard services from each category - handled by VENDOR_TAXONOMY
    ],
  },
  rehearsal_dinner: {
    id: "rehearsal_dinner",
    name: "Rehearsal Dinner",
    description: "Pre-wedding dinner, typically the night before",
    icon: "🍽️",
    required: false,
    defaultSelected: false,
    coverageWeight: 0, // Calculated dynamically based on selected events
    requiredVendorCategories: [
      "venue_location",
      "catering_food",
      "bar_beverage",
    ],
    defaultServices: [
      {
        categoryId: "venue_location",
        serviceId: "rehearsal_dinner_venue",
        name: "Rehearsal Dinner Venue",
        estimatedCost: 1500,
      },
      {
        categoryId: "catering_food",
        serviceId: "rehearsal_dinner_catering",
        name: "Rehearsal Dinner Catering",
        estimatedCost: 2500,
      },
      {
        categoryId: "bar_beverage",
        serviceId: "rehearsal_dinner_bar",
        name: "Rehearsal Dinner Bar",
        estimatedCost: 1500,
      },
    ],
  },
  welcome_event: {
    id: "welcome_event",
    name: "Welcome Event",
    description: "Welcome party or BBQ for out-of-town guests",
    icon: "🎉",
    required: false,
    defaultSelected: false,
    coverageWeight: 0,
    requiredVendorCategories: [
      "venue_location",
      "catering_food",
      "bar_beverage",
    ],
    defaultServices: [
      {
        categoryId: "venue_location",
        serviceId: "welcome_party_venue",
        name: "Welcome Event Venue",
        estimatedCost: 1500,
      },
      {
        categoryId: "catering_food",
        serviceId: "welcome_event_catering",
        name: "Welcome Event Catering",
        estimatedCost: 3000,
      },
      {
        categoryId: "bar_beverage",
        serviceId: "welcome_event_bar",
        name: "Welcome Event Bar",
        estimatedCost: 2000,
      },
    ],
  },
  next_day_brunch: {
    id: "next_day_brunch",
    name: "Next Day Brunch",
    description: "Post-wedding brunch for guests before departure",
    icon: "🥂",
    required: false,
    defaultSelected: false,
    coverageWeight: 0,
    requiredVendorCategories: ["catering_food", "bar_beverage"],
    defaultServices: [
      {
        categoryId: "catering_food",
        serviceId: "brunch_next_day",
        name: "Next Day Brunch Catering",
        estimatedCost: 1500,
      },
      {
        categoryId: "bar_beverage",
        serviceId: "brunch_beverages",
        name: "Brunch Beverages",
        estimatedCost: 500,
      },
    ],
  },
  after_party: {
    id: "after_party",
    name: "After Party",
    description: "Late night celebration after the reception",
    icon: "🌙",
    required: false,
    defaultSelected: false,
    coverageWeight: 0,
    requiredVendorCategories: [
      "venue_location",
      "bar_beverage",
      "entertainment_music",
    ],
    defaultServices: [
      {
        categoryId: "venue_location",
        serviceId: "after_party_venue",
        name: "After Party Venue",
        estimatedCost: 1000,
      },
      {
        categoryId: "catering_food",
        serviceId: "after_party_food",
        name: "After Party Food",
        estimatedCost: 800,
      },
      {
        categoryId: "bar_beverage",
        serviceId: "after_party_bar",
        name: "After Party Bar",
        estimatedCost: 1000,
      },
    ],
  },
};

/**
 * Calculate coverage weights for selected events
 * Wedding Day always gets 50% weight, remaining 50% is split equally among other selected events.
 * When only wedding_day is selected, it gets 100% weight.
 * Weights always sum to 1.0.
 */
export function calculateEventCoverageWeights(
  selectedEvents: MultiDayEventType[],
): Record<MultiDayEventType, number> {
  const weights: Record<MultiDayEventType, number> = {
    wedding_day: 0,
    rehearsal_dinner: 0,
    welcome_event: 0,
    next_day_brunch: 0,
    after_party: 0,
  };

  // Ensure wedding_day is always included
  const events = selectedEvents.includes("wedding_day")
    ? [...selectedEvents]
    : ["wedding_day" as MultiDayEventType, ...selectedEvents];

  const otherEvents = events.filter((e) => e !== "wedding_day");

  // If only wedding_day, it gets 100%. Otherwise, wedding_day gets 50%, rest splits the other 50%
  if (otherEvents.length === 0) {
    weights.wedding_day = 1.0;
  } else {
    weights.wedding_day = 0.5;
    const otherEventWeight = 0.5 / otherEvents.length;
    for (const event of otherEvents) {
      weights[event] = otherEventWeight;
    }
  }

  return weights;
}

/**
 * Get all required vendor categories for a set of selected events
 */
export function getRequiredVendorCategoriesForEvents(
  selectedEvents: MultiDayEventType[],
): Map<VendorCategoryType, MultiDayEventType[]> {
  const categoryToEvents = new Map<VendorCategoryType, MultiDayEventType[]>();

  for (const eventId of selectedEvents) {
    const eventDef = MULTI_DAY_EVENTS[eventId];
    if (eventDef) {
      for (const categoryId of eventDef.requiredVendorCategories) {
        if (!categoryToEvents.has(categoryId)) {
          categoryToEvents.set(categoryId, []);
        }
        categoryToEvents.get(categoryId)!.push(eventId);
      }
    }
  }

  return categoryToEvents;
}

/**
 * Schema for selected multi-day events stored in user profile
 */
export const SelectedMultiDayEventsSchema = z.object({
  events: z
    .array(MultiDayEventEnum)
    .refine((events) => events.includes("wedding_day"), {
      message: "Wedding Day must always be selected",
    }),
  customServices: z
    .array(
      z.object({
        id: z.string(),
        eventId: MultiDayEventEnum,
        categoryId: VendorCategoryEnum,
        name: z.string(),
        estimatedCost: z.number(),
        isSelected: z.boolean(),
        isCustom: z.boolean(),
      }),
    )
    .optional(),
});

export type SelectedMultiDayEvents = z.infer<
  typeof SelectedMultiDayEventsSchema
>;

/**
 * Service with multi-day event assignment
 */
export const EventServiceDefinitionSchema = z.object({
  id: z.string(),
  eventId: MultiDayEventEnum,
  categoryId: VendorCategoryEnum,
  subcategoryId: z.string().optional(),
  name: z.string(),
  estimatedCost: z.number(),
  isSelected: z.boolean(),
  isCustom: z.boolean(),
  coveredByQuoteId: z.string().optional(), // If covered by a quote, which one
  notes: z.string().optional(),
});

export type EventServiceDefinition = z.infer<
  typeof EventServiceDefinitionSchema
>;

// ═══════════════════════════════════════════════════════
// STANDARD SERVICES - Predefined services for wedding planning
// ═══════════════════════════════════════════════════════
// Each service is defined by: Category + Event + Estimated Cost
// These are the default services users can select in the Services tab
// ═══════════════════════════════════════════════════════

export interface StandardService {
  id: string;
  category: VendorCategoryType;
  event: EventType;
  serviceName: string;
  estimatedCost: number; // Default estimate in EUR
  isPrimary: boolean;
  pricingType: "flat" | "per_person" | "per_unit" | "per_hour" | "per_table";
}

export const STANDARD_SERVICES: StandardService[] = [
  // ═══════════════════════════════════════════════════════
  // VENUE & LOCATION
  // ═══════════════════════════════════════════════════════
  {
    id: "venue-ceremony",
    category: "venue_location",
    event: "ceremony",
    serviceName: "Ceremony Site",
    estimatedCost: 3000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "venue-cocktail",
    category: "venue_location",
    event: "cocktail_hour",
    serviceName: "Cocktail Hour Venue",
    estimatedCost: 2000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "venue-reception",
    category: "venue_location",
    event: "reception",
    serviceName: "Reception Venue",
    estimatedCost: 8000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "venue-rehearsal",
    category: "venue_location",
    event: "rehearsal_dinner",
    serviceName: "Rehearsal Dinner Venue",
    estimatedCost: 1500,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "venue-welcome",
    category: "venue_location",
    event: "welcome_event",
    serviceName: "Welcome Event Venue",
    estimatedCost: 1500,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "venue-brunch",
    category: "venue_location",
    event: "next_day_brunch",
    serviceName: "Brunch Venue",
    estimatedCost: 800,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "venue-afterparty",
    category: "venue_location",
    event: "after_party",
    serviceName: "After Party Venue",
    estimatedCost: 1000,
    isPrimary: true,
    pricingType: "flat",
  },

  // ═══════════════════════════════════════════════════════
  // CATERING & FOOD
  // ═══════════════════════════════════════════════════════
  {
    id: "catering-cocktail",
    category: "catering_food",
    event: "cocktail_hour",
    serviceName: "Cocktail Hour Appetizers",
    estimatedCost: 25,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "catering-reception",
    category: "catering_food",
    event: "reception",
    serviceName: "Reception Dinner",
    estimatedCost: 85,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "catering-latenight",
    category: "catering_food",
    event: "reception",
    serviceName: "Late Night Snacks",
    estimatedCost: 15,
    isPrimary: false,
    pricingType: "per_person",
  },
  {
    id: "catering-cake",
    category: "catering_food",
    event: "reception",
    serviceName: "Wedding Cake",
    estimatedCost: 600,
    isPrimary: false,
    pricingType: "flat",
  },
  {
    id: "catering-rehearsal",
    category: "catering_food",
    event: "rehearsal_dinner",
    serviceName: "Rehearsal Dinner Catering",
    estimatedCost: 65,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "catering-welcome",
    category: "catering_food",
    event: "welcome_event",
    serviceName: "Welcome Event Food",
    estimatedCost: 40,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "catering-brunch",
    category: "catering_food",
    event: "next_day_brunch",
    serviceName: "Brunch Catering",
    estimatedCost: 35,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "catering-afterparty",
    category: "catering_food",
    event: "after_party",
    serviceName: "After Party Snacks",
    estimatedCost: 20,
    isPrimary: true,
    pricingType: "per_person",
  },

  // ═══════════════════════════════════════════════════════
  // BAR & BEVERAGES
  // ═══════════════════════════════════════════════════════
  {
    id: "bar-ceremony",
    category: "bar_beverage",
    event: "ceremony",
    serviceName: "Ceremony Refreshments",
    estimatedCost: 10,
    isPrimary: false,
    pricingType: "per_person",
  },
  {
    id: "bar-cocktail",
    category: "bar_beverage",
    event: "cocktail_hour",
    serviceName: "Cocktail Hour Bar",
    estimatedCost: 30,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "bar-reception",
    category: "bar_beverage",
    event: "reception",
    serviceName: "Reception Bar",
    estimatedCost: 50,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "bar-champagne",
    category: "bar_beverage",
    event: "reception",
    serviceName: "Champagne Toast",
    estimatedCost: 12,
    isPrimary: false,
    pricingType: "per_person",
  },
  {
    id: "bar-rehearsal",
    category: "bar_beverage",
    event: "rehearsal_dinner",
    serviceName: "Rehearsal Dinner Bar",
    estimatedCost: 35,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "bar-welcome",
    category: "bar_beverage",
    event: "welcome_event",
    serviceName: "Welcome Event Bar",
    estimatedCost: 35,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "bar-brunch",
    category: "bar_beverage",
    event: "next_day_brunch",
    serviceName: "Brunch Beverages",
    estimatedCost: 20,
    isPrimary: true,
    pricingType: "per_person",
  },
  {
    id: "bar-afterparty",
    category: "bar_beverage",
    event: "after_party",
    serviceName: "After Party Bar",
    estimatedCost: 40,
    isPrimary: true,
    pricingType: "per_person",
  },

  // ═══════════════════════════════════════════════════════
  // PHOTOGRAPHY & VIDEO
  // ═══════════════════════════════════════════════════════
  {
    id: "photo-allday",
    category: "photography_video",
    event: "all_day",
    serviceName: "Wedding Day Photography",
    estimatedCost: 4000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "video-allday",
    category: "photography_video",
    event: "all_day",
    serviceName: "Wedding Day Videography",
    estimatedCost: 3500,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "photo-rehearsal",
    category: "photography_video",
    event: "rehearsal_dinner",
    serviceName: "Rehearsal Dinner Photography",
    estimatedCost: 800,
    isPrimary: false,
    pricingType: "flat",
  },
  {
    id: "photo-welcome",
    category: "photography_video",
    event: "welcome_event",
    serviceName: "Welcome Event Photography",
    estimatedCost: 600,
    isPrimary: false,
    pricingType: "flat",
  },
  {
    id: "photo-brunch",
    category: "photography_video",
    event: "next_day_brunch",
    serviceName: "Brunch Photography",
    estimatedCost: 400,
    isPrimary: false,
    pricingType: "flat",
  },

  // ═══════════════════════════════════════════════════════
  // ENTERTAINMENT & MUSIC
  // ═══════════════════════════════════════════════════════
  {
    id: "music-ceremony",
    category: "entertainment_music",
    event: "ceremony",
    serviceName: "Ceremony Music",
    estimatedCost: 500,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "music-cocktail",
    category: "entertainment_music",
    event: "cocktail_hour",
    serviceName: "Cocktail Hour Music",
    estimatedCost: 400,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "music-reception-dj",
    category: "entertainment_music",
    event: "reception",
    serviceName: "Reception DJ",
    estimatedCost: 1500,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "music-reception-band",
    category: "entertainment_music",
    event: "reception",
    serviceName: "Reception Live Band",
    estimatedCost: 4000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "music-afterparty",
    category: "entertainment_music",
    event: "after_party",
    serviceName: "After Party DJ",
    estimatedCost: 800,
    isPrimary: true,
    pricingType: "flat",
  },

  // ═══════════════════════════════════════════════════════
  // FLOWERS & DECOR
  // ═══════════════════════════════════════════════════════
  {
    id: "flowers-ceremony",
    category: "flowers_decor",
    event: "ceremony",
    serviceName: "Ceremony Flowers & Decor",
    estimatedCost: 2000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "flowers-cocktail",
    category: "flowers_decor",
    event: "cocktail_hour",
    serviceName: "Cocktail Hour Decor",
    estimatedCost: 500,
    isPrimary: false,
    pricingType: "flat",
  },
  {
    id: "flowers-reception",
    category: "flowers_decor",
    event: "reception",
    serviceName: "Reception Centerpieces & Decor",
    estimatedCost: 3500,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "flowers-bridal",
    category: "flowers_decor",
    event: "all_day",
    serviceName: "Bridal Party Flowers",
    estimatedCost: 1200,
    isPrimary: true,
    pricingType: "flat",
  },

  // ═══════════════════════════════════════════════════════
  // BEAUTY & PREP
  // ═══════════════════════════════════════════════════════
  {
    id: "beauty-hair",
    category: "beauty_prep",
    event: "ceremony",
    serviceName: "Bridal Hair Styling",
    estimatedCost: 350,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "beauty-makeup",
    category: "beauty_prep",
    event: "ceremony",
    serviceName: "Bridal Makeup",
    estimatedCost: 300,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "beauty-party-hair",
    category: "beauty_prep",
    event: "ceremony",
    serviceName: "Bridal Party Hair",
    estimatedCost: 120,
    isPrimary: false,
    pricingType: "per_person",
  },
  {
    id: "beauty-party-makeup",
    category: "beauty_prep",
    event: "ceremony",
    serviceName: "Bridal Party Makeup",
    estimatedCost: 100,
    isPrimary: false,
    pricingType: "per_person",
  },
  {
    id: "beauty-trial",
    category: "beauty_prep",
    event: "ceremony",
    serviceName: "Hair & Makeup Trial",
    estimatedCost: 250,
    isPrimary: false,
    pricingType: "flat",
  },

  // ═══════════════════════════════════════════════════════
  // PLANNING & COORDINATION
  // ═══════════════════════════════════════════════════════
  {
    id: "planning-full",
    category: "planning_coordination",
    event: "all_events",
    serviceName: "Full Wedding Planning",
    estimatedCost: 5000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "planning-partial",
    category: "planning_coordination",
    event: "all_events",
    serviceName: "Partial Wedding Planning",
    estimatedCost: 3000,
    isPrimary: true,
    pricingType: "flat",
  },
  {
    id: "planning-dayof",
    category: "planning_coordination",
    event: "all_day",
    serviceName: "Day-of Coordination",
    estimatedCost: 1500,
    isPrimary: true,
    pricingType: "flat",
  },
];

// Helper to get services by category
export function getServicesByCategory(
  category: VendorCategoryType,
): StandardService[] {
  return STANDARD_SERVICES.filter((s) => s.category === category);
}

// Helper to get services by event
export function getServicesByEvent(event: EventType): StandardService[] {
  return STANDARD_SERVICES.filter((s) => s.event === event);
}

// Helper to get service by ID
export function getServiceById(id: string): StandardService | undefined {
  return STANDARD_SERVICES.find((s) => s.id === id);
}

// Get all Wedding Day sub-events
export const WEDDING_DAY_EVENTS: EventType[] = [
  "ceremony",
  "cocktail_hour",
  "reception",
];

// Get all other events
export const OTHER_EVENTS: EventType[] = [
  "rehearsal_dinner",
  "welcome_event",
  "next_day_brunch",
  "after_party",
];

// Get all special events
export const SPECIAL_EVENTS: EventType[] = ["all_day", "all_events"];

/**
 * Auto-generate initial itemMappings from parsed menuOptions and addOns.
 * Called by the AI parsers (anthropic.ts, openai.ts) immediately after items are finalized,
 * so every quote has (category × event) data without requiring the user to complete step 2.
 *
 * Rules:
 * - Only items that have a vendorCategory are mapped (items without one are skipped).
 * - Event is looked up from CATEGORY_DEFAULT_EVENTS. Arrays use the first value.
 *   Null entries (ambiguous categories: venue_location, catering_food, bar_beverage,
 *   transport, lighting_av) fall back to 'all_day' as a placeholder.
 * - isPrimary = true when the item's category matches the quote's primary vendorCategory.
 * - skipped = false (these are initial defaults; user can override in step 2).
 */
export function buildAutoItemMappings(
  menuOptions: Array<{
    id: string;
    label?: string;
    price?: number | null;
    vendorCategory?: string;
  }>,
  addOns: Array<{
    id: string;
    label?: string;
    price?: number | null;
    vendorCategory?: string;
  }>,
  primaryVendorCategory: string | null | undefined,
  inclusions?: string[],
): Array<{
  itemId: string;
  itemType: "menu" | "addon";
  itemName: string;
  itemPrice: number;
  category: VendorCategoryType;
  event: string;
  isPrimary: boolean;
  skipped: boolean;
}> {
  const resolveEvent = (cat: VendorCategoryType, label?: string): string => {
    if (label) {
      const n = label.toLowerCase();
      if (
        n.includes("ceremony") ||
        n.includes("aisle") ||
        n.includes("altar") ||
        n.includes("chapel") ||
        n.includes("officiant") ||
        n.includes("minister") ||
        n.includes("vows")
      )
        return "ceremony";
      if (
        n.includes("cocktail") ||
        n.includes("welcome drink") ||
        n.includes("aperitif")
      )
        return "cocktail_hour";
      if (
        n.includes("dinner") ||
        n.includes("reception") ||
        n.includes("banquet") ||
        n.includes("gala")
      )
        return "reception";
    }
    const val = CATEGORY_DEFAULT_EVENTS[cat];
    if (val === null || val === undefined) return "all_day";
    if (Array.isArray(val)) return val[0] as string;
    return val as string;
  };

  const results: ReturnType<typeof buildAutoItemMappings> = [];

  for (const m of menuOptions) {
    let cat = m.vendorCategory as VendorCategoryType | undefined;
    if (!cat || !VENDOR_CATEGORY_IDS.includes(cat)) {
      cat = primaryVendorCategory as VendorCategoryType | undefined;
    }
    if (!cat || !VENDOR_CATEGORY_IDS.includes(cat)) continue;
    results.push({
      itemId: m.id,
      itemType: "menu",
      itemName: m.label || m.id,
      itemPrice: typeof m.price === "number" ? m.price : 0,
      category: cat,
      event: resolveEvent(cat, m.label),
      isPrimary: cat === primaryVendorCategory,
      skipped: false,
    });
  }

  for (const a of addOns) {
    let cat = a.vendorCategory as VendorCategoryType | undefined;
    if (!cat || !VENDOR_CATEGORY_IDS.includes(cat)) {
      cat = primaryVendorCategory as VendorCategoryType | undefined;
    }
    if (!cat || !VENDOR_CATEGORY_IDS.includes(cat)) continue;
    results.push({
      itemId: a.id,
      itemType: "addon",
      itemName: a.label || a.id,
      itemPrice: typeof a.price === "number" ? a.price : 0,
      category: cat,
      event: resolveEvent(cat, a.label),
      isPrimary: cat === primaryVendorCategory,
      skipped: false,
    });
  }

  if (inclusions && inclusions.length > 0) {
    const primaryCat = primaryVendorCategory as VendorCategoryType | undefined;
    inclusions.forEach((label, index) => {
      if (!label || typeof label !== "string") return;
      const detected = detectCategoryFromName(label);
      const cat: VendorCategoryType | undefined = detected || primaryCat;
      if (!cat || !VENDOR_CATEGORY_IDS.includes(cat)) return;
      results.push({
        itemId: `inclusion-${index}`,
        itemType: "addon",
        itemName: label,
        itemPrice: 0,
        category: cat,
        event: resolveEvent(cat, label),
        isPrimary: cat === primaryVendorCategory,
        skipped: false,
      });
    });
  }

  return results;
}
