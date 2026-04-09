import {
  Camera,
  CakeSlice,
  Car,
  ClipboardList,
  FileText,
  Flower2,
  Heart,
  Lightbulb,
  MapPin,
  Music,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  venue_location: MapPin,
  catering_food: UtensilsCrossed,
  bar_beverage: Wine,
  wedding_cake: CakeSlice,
  entertainment_music: Music,
  lighting_av: Lightbulb,
  photography_video: Camera,
  flowers_decor: Flower2,
  beauty_prep: Sparkles,
  officiant: Heart,
  planning_coordination: ClipboardList,
  transport: Car,
  other: FileText,
};

export const CATEGORY_ORDER = [
  "venue_location",
  "catering_food",
  "bar_beverage",
  "wedding_cake",
  "entertainment_music",
  "lighting_av",
  "photography_video",
  "flowers_decor",
  "beauty_prep",
  "officiant",
  "planning_coordination",
  "transport",
];

export function getCategoryIcon(categoryId: string) {
  return CATEGORY_ICONS[categoryId] || FileText;
}

export function getCategoryIconNode(categoryId: string, className: string) {
  return createElement(getCategoryIcon(categoryId), { className });
}

export function getVendorCategoryName(
  categoryId: string,
  taxonomy: Record<string, { name?: string }>,
): string {
  const category = taxonomy[categoryId];
  return category?.name || categoryId;
}

export function categorizeInclusionItem(item: string): string | null {
  const normalized = item.toLowerCase();

  if (
    /officiant|celebrant|minister|priest|pastor|rabbi|imam|ceremony leader/i.test(
      normalized,
    )
  )
    return "officiant";

  if (
    /transport|shuttle|bus|car hire|limousine|limo|vehicle|taxi|transfer/i.test(
      normalized,
    )
  )
    return "transport";

  if (
    /wedding cake|cake cutting|cake stand|dessert table|sweet table|patisserie|macaron tower/i.test(
      normalized,
    )
  )
    return "wedding_cake";

  if (
    /lighting|uplighting|fairy light|festoon|string light|projector|screen|av hire|audio visual|sound system|speaker|microphone/i.test(
      normalized,
    )
  )
    return "lighting_av";

  if (
    /venue|estate|château|castle|property|room|hall|garden|terrace|ceremony space|reception space|setup|furniture|staffing|cleaning|marquee|teardown|logistics|table setup/i.test(
      normalized,
    )
  )
    return "venue_location";

  if (
    /bar|wine|champagne|cocktail|beverage|drink|beer|spirits|open bar|welcome drink|toast/i.test(
      normalized,
    )
  )
    return "bar_beverage";

  if (
    /photo|video|camera|drone|album|editing|coverage|shoot|photographer|videographer/i.test(
      normalized,
    )
  )
    return "photography_video";

  if (/music|dj|band|entertainment|dance floor|mc/i.test(normalized))
    return "entertainment_music";

  if (
    /flower|floral|centerpiece|bouquet|arrangement|decor|decoration|table setting|linen|stationery|stationer|place card|seating chart|table number|invitation|signage|welcome sign|menu card|order of service/i.test(
      normalized,
    )
  )
    return "flowers_decor";

  if (
    /food|catering|dinner|lunch|breakfast|brunch|meal|menu|chef|cuisine|appetizer|entr[ée]e|buffet/i.test(
      normalized,
    )
  )
    return "catering_food";

  if (
    /hair|makeup|beauty|spa|getting ready|bridal suite|groom suite|preparation/i.test(
      normalized,
    )
  )
    return "beauty_prep";

  if (
    /coordinator|planner|planning|timeline|vendor management|day-of|wedding planner/i.test(
      normalized,
    )
  )
    return "planning_coordination";

  return null;
}

export function extractKeyDetails(quote: Record<string, unknown>): string[] {
  const keyDetails: string[] = [];
  const inclusions = Array.isArray(quote.inclusions) ? quote.inclusions : [];
  const exclusions = Array.isArray(quote.exclusions) ? quote.exclusions : [];
  const allItems = [...inclusions, ...exclusions];

  const allText = allItems
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : (entry as { name?: string })?.name || "",
    )
    .join(" ")
    .toLowerCase();

  if (
    /suite|room|accommodation|guest room|bedroom|lodging|\d+\s*guest/i.test(
      allText,
    )
  ) {
    const match = allText.match(/(\d+)\s*(suite|room|bedroom|guest)/i);
    if (match) {
      keyDetails.push(`${match[1]} guest suites available`);
    } else if (/accommodation|lodging/i.test(allText)) {
      keyDetails.push("Guest accommodation available");
    }
  }

  if (
    /external (caterer|vendor|supplier)|outside (caterer|vendor)|bring your own|byob/i.test(
      allText,
    )
  ) {
    keyDetails.push("External vendors allowed");
  }

  if (
    /coordinator|day-of coordination|planning|wedding planner/i.test(allText)
  ) {
    keyDetails.push("Coordination included");
  }

  if (/exclusive|private|buyout|full property/i.test(allText)) {
    keyDetails.push("Exclusive venue access");
  }

  if (quote.accommodationDetails) {
    const details = quote.accommodationDetails as {
      totalCapacity?: number;
      totalRooms?: number;
    };
    if (
      details.totalCapacity &&
      !keyDetails.some((e) => e.includes("capacity"))
    ) {
      keyDetails.push(`Capacity: ${details.totalCapacity} guests`);
    }
    if (details.totalRooms && !keyDetails.some((e) => e.includes("room"))) {
      keyDetails.push(`${details.totalRooms} rooms on-site`);
    }
  } else {
    const venueData = quote.venue as {
      accommodationInfo?: { onSiteRooms?: number; onSiteCapacity?: number };
    };
    if (venueData?.accommodationInfo) {
      const accom = venueData.accommodationInfo;
      if (accom.onSiteRooms || accom.onSiteCapacity) {
        const rooms =
          accom.onSiteRooms || Math.ceil((accom.onSiteCapacity || 0) / 2);
        if (
          rooms > 0 &&
          !keyDetails.some((e) => e.includes("suite") || e.includes("room"))
        ) {
          keyDetails.push(`${rooms} rooms on-site`);
        }
      }
    }
  }

  return keyDetails.slice(0, 4);
}

export function groupInclusionsByCategory(
  inclusions: unknown[],
): Map<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const item of inclusions) {
    const text =
      typeof item === "string"
        ? item
        : (item as { name?: string })?.name || String(item);

    const category = categorizeInclusionItem(text);
    if (!category) continue;

    const existing = grouped.get(category) || [];
    existing.push(text);
    grouped.set(category, existing);
  }

  return grouped;
}
