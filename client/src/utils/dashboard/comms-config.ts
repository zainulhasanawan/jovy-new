import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Camera,
  UtensilsCrossed,
  Flower2,
  Music,
  MoreHorizontal,
  Wine,
  ClipboardList,
  Heart,
  Car,
  Lightbulb,
  Cake,
  Scissors,
} from "lucide-react";

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; indicatorColor: string }
> = {
  researching: {
    label: "Researching",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    indicatorColor: "bg-gray-400",
  },
  reached_out: {
    label: "Reached Out",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    indicatorColor: "bg-blue-500",
  },
  in_conversation: {
    label: "In Conversation",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    indicatorColor: "bg-amber-500",
  },
  quote_received: {
    label: "Quote Received",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    indicatorColor: "bg-purple-500",
  },
  booked: {
    label: "Booked",
    color: "text-green-600",
    bgColor: "bg-green-100",
    indicatorColor: "bg-green-500",
  },
  passed: {
    label: "Passed",
    color: "text-red-600",
    bgColor: "bg-red-100",
    indicatorColor: "bg-red-500",
  },
};

const LEGACY_VENDOR_TYPE_MAP: Record<string, string> = {
  venue: "venue_location",
  photographer: "photography_video",
  videographer: "photography_video",
  caterer: "catering_food",
  florist: "flowers_decor",
  dj: "entertainment_music",
  planner: "planning_coordination",
};

export const VENDOR_TYPE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  venue_location: { label: "Venue & Setup", icon: Building2 },
  catering_food: { label: "Catering & Food", icon: UtensilsCrossed },
  bar_beverage: { label: "Bar & Beverages", icon: Wine },
  photography_video: { label: "Photography & Video", icon: Camera },
  entertainment_music: { label: "Entertainment & Music", icon: Music },
  flowers_decor: { label: "Flowers & Decor", icon: Flower2 },
  beauty_prep: { label: "Beauty & Prep", icon: Scissors },
  planning_coordination: {
    label: "Planning & Coordination",
    icon: ClipboardList,
  },
  officiant: { label: "Officiant", icon: Heart },
  transport: { label: "Transport", icon: Car },
  lighting_av: { label: "Lighting & AV", icon: Lightbulb },
  wedding_cake: { label: "Wedding Cake", icon: Cake },
  other: { label: "Other", icon: MoreHorizontal },
};

export const INQUIRY_TOGGLES: Record<
  string,
  Array<{ id: string; label: string }>
> = {
  venue_location: [
    { id: "accommodations", label: "Ask about guest accommodations" },
    {
      id: "exclusivity",
      label: "Ask about exclusive use (only wedding that day)",
    },
    { id: "outdoor", label: "Ask about outdoor/backup options" },
    { id: "vendorRestrictions", label: "Ask about vendor restrictions" },
    { id: "multiDay", label: "Mention multi-day celebration" },
  ],
  catering_food: [
    { id: "tasting", label: "Ask about tasting sessions" },
    { id: "dietary", label: "Mention dietary requirements" },
    { id: "bar", label: "Ask about bar/beverage packages" },
    { id: "lateNight", label: "Ask about late-night food options" },
    { id: "multiDay", label: "Mention multiple events/days" },
  ],
  bar_beverage: [
    { id: "openBar", label: "Ask about open bar packages" },
    { id: "signatureCocktails", label: "Ask about signature cocktails" },
    { id: "softDrinks", label: "Ask about non-alcoholic options" },
    { id: "multiDay", label: "Mention multiple events/days" },
  ],
  photography_video: [
    { id: "engagement", label: "Ask about engagement shoots" },
    { id: "secondShooter", label: "Ask about second shooter/assistant" },
    { id: "deliverables", label: "Ask about albums/prints/deliverables" },
    { id: "multipleLocations", label: "Mention multiple locations or events" },
    { id: "drone", label: "Ask about drone footage" },
  ],
  entertainment_music: [
    { id: "ceremonyMusic", label: "Ask about ceremony music" },
    { id: "cocktailHour", label: "Ask about cocktail hour coverage" },
    { id: "equipment", label: "Ask about equipment/setup requirements" },
    {
      id: "musicPreferences",
      label: "Mention specific music preferences or vibe",
    },
    { id: "multiDay", label: "Mention multiple events/days" },
  ],
  flowers_decor: [
    {
      id: "ceremonyReception",
      label: "Ask about ceremony vs reception arrangements",
    },
    { id: "seasonal", label: "Ask about seasonal flower availability" },
    { id: "colorPalette", label: "Mention specific color palette or style" },
    { id: "rental", label: "Ask about decor rental items" },
  ],
  beauty_prep: [
    { id: "trialRun", label: "Ask about trial sessions" },
    { id: "brideParty", label: "Ask about bridal party packages" },
    { id: "onLocation", label: "Ask about on-location services" },
    { id: "touchUp", label: "Ask about touch-up kits/end-of-night services" },
  ],
  planning_coordination: [
    { id: "packages", label: "Ask about day-of vs full planning packages" },
    { id: "vendorRecs", label: "Ask about vendor recommendations" },
    { id: "destination", label: "Mention destination/travel requirements" },
    { id: "timeline", label: "Ask about timeline and logistics management" },
  ],
  officiant: [
    { id: "ceremony", label: "Ask about ceremony style and customization" },
    { id: "rehearsal", label: "Ask about rehearsal attendance" },
    { id: "legal", label: "Ask about legal ceremony paperwork" },
    { id: "vows", label: "Ask about personalized vow writing" },
  ],
  transport: [
    { id: "fleetSize", label: "Ask about fleet size and vehicle types" },
    { id: "transfers", label: "Ask about guest transfer logistics" },
    { id: "multiVehicle", label: "Ask about multiple vehicle coordination" },
    { id: "multiDay", label: "Mention multiple events/days" },
  ],
  lighting_av: [
    { id: "setup", label: "Ask about setup and teardown times" },
    { id: "uplighting", label: "Ask about uplighting and colour options" },
    { id: "sound", label: "Ask about sound system and microphones" },
    { id: "multiDay", label: "Mention multiple events/days" },
  ],
  wedding_cake: [
    { id: "tasting", label: "Ask about cake tasting sessions" },
    { id: "design", label: "Mention specific design or style preferences" },
    {
      id: "dietary",
      label: "Mention dietary requirements (gluten-free, vegan, etc.)",
    },
    { id: "delivery", label: "Ask about delivery and setup on the day" },
  ],
  other: [
    { id: "availability", label: "Ask about availability" },
    { id: "pricing", label: "Ask about pricing and packages" },
    { id: "portfolio", label: "Request portfolio or references" },
  ],
};

export const RESPONSE_TYPES = [
  { value: "general_response", label: "General Response" },
  { value: "quote_received", label: "Quote Received" },
  { value: "more_info_needed", label: "More Info Needed" },
  { value: "declined", label: "Declined" },
] as const;

export function getCanonicalVendorType(type: string): string {
  return LEGACY_VENDOR_TYPE_MAP[type] || type;
}

export function getVendorTypeConfig(type: string) {
  const canonical = getCanonicalVendorType(type);
  return VENDOR_TYPE_CONFIG[canonical] || VENDOR_TYPE_CONFIG.other;
}
