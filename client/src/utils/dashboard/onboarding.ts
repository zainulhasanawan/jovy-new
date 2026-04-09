// Unavailable in current workspace:
// import type { WeddingDetails } from "@/components/onboarding-modal";
// import type { User } from "@shared/schema";
import type {
  WeddingDetails,
  OnboardingUser,
} from "@/types/dashboard/onboarding";

type OnboardingEvent = {
  key?: string;
  id?: string;
  type?: string;
  name?: string;
};

const ONBOARDING_KEY_TO_EVENT_ID: Record<string, string> = {
  ceremony: "ceremony",
  cocktail: "cocktail_hour",
  reception: "reception",
  rehearsal: "rehearsal_dinner",
  welcome: "welcome_event",
  brunch: "next_day_brunch",
  afterparty: "after_party",
};

const EVENT_SERVICE_DEFAULTS: Record<string, string[]> = {
  ceremony: ["venue_location", "flowers_decor", "officiant"],
  cocktail_hour: ["venue_location", "catering_food", "bar_beverage"],
  reception: [
    "venue_location",
    "catering_food",
    "bar_beverage",
    "entertainment_music",
    "flowers_decor",
    "lighting_av",
    "wedding_cake",
  ],
  rehearsal_dinner: ["venue_location", "catering_food", "bar_beverage"],
  welcome_event: ["venue_location", "catering_food", "bar_beverage"],
  next_day_brunch: ["venue_location", "catering_food"],
  after_party: ["venue_location", "bar_beverage", "entertainment_music"],
};

export function buildOnboardingUpdatePayload(
  data: WeddingDetails,
  user: OnboardingUser | null,
): Record<string, unknown> {
  const existingRequirements = user?.weddingProfile?.newEventRequirements;
  const coupleNames = [data.partner1Name, data.partner2Name]
    .filter(Boolean)
    .join(" & ");

  const existingServicesByEvent = user?.weddingProfile?.servicesByEvent as
    | Record<string, string[]>
    | undefined;
  const existingKeys = existingServicesByEvent
    ? Object.keys(existingServicesByEvent)
    : [];
  const hasExistingServices =
    existingKeys.length > 0 && !existingKeys.includes("[object Object]");

  const events = (data.events || []) as OnboardingEvent[];
  const derivedServicesByEvent: Record<string, string[]> = {};

  events.forEach((event) => {
    if (event.type === "custom") {
      const eventId = event.id || "";
      if (eventId) {
        derivedServicesByEvent[eventId] = [
          "venue_location",
          "catering_food",
          "bar_beverage",
        ];
      }
      return;
    }

    const eventId =
      ONBOARDING_KEY_TO_EVENT_ID[event.key || ""] ?? event.key ?? "";
    if (eventId) {
      derivedServicesByEvent[eventId] = EVENT_SERVICE_DEFAULTS[eventId] ?? [
        "venue_location",
      ];
    }
  });

  const servicesByEventToSave = hasExistingServices
    ? existingServicesByEvent
    : derivedServicesByEvent;

  const existingAllDayServices = user?.weddingProfile?.allDayServices as
    | string[]
    | undefined;
  const allDayServicesToSave =
    existingAllDayServices && existingAllDayServices.length > 0
      ? existingAllDayServices
      : ["photography_video"];

  const derivedCustomEvents = events
    .filter((e) => e.type === "custom")
    .map((e) => ({ id: e.id, name: e.name }));

  const customEventsToSave = hasExistingServices
    ? user?.weddingProfile?.customEvents || []
    : derivedCustomEvents;

  return {
    onboardingComplete: true,
    name: coupleNames,
    partnerName: data.partner2Name || undefined,
    weddingProfile: {
      coupleNames,
      partner1Name: data.partner1Name,
      partner2Name: data.partner2Name,
      homeCountry: data.homeCountry || "",
      timeline: {
        weddingDate: data.weddingDate || undefined,
      },
      guestInfo: {
        estimatedCount: data.guestCount || 0,
      },
      budget: {
        totalBudget: data.budget || 0,
        currency: data.currency,
      },
      budgetCurrency: data.currency,
      events: data.events,
      newEventRequirements: existingRequirements,
      dateInfo: data.dateInfo || undefined,
      locations: data.locations || [],
      openToSuggestions: data.openToSuggestions || false,
      locationDecided: data.locationDecided || false,
      planningStage: data.planningStage || "exploring",
      servicesByEvent: servicesByEventToSave,
      allDayServices: allDayServicesToSave,
      customEvents: customEventsToSave,
    },
    weddingDate: data.weddingDate || undefined,
    budget: data.budget?.toString(),
  };
}
