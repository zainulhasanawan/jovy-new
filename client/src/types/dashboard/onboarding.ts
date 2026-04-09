export type WeddingDetails = {
  partner1Name?: string;
  partner2Name?: string;
  homeCountry?: string;
  weddingDate?: string;
  guestCount?: number;
  budget?: number;
  currency?: string;
  events?: Array<{ id?: string; name?: string; key?: string; type?: string }>;
  dateInfo?: unknown;
  locations?: unknown[];
  openToSuggestions?: boolean;
  locationDecided?: boolean;
  planningStage?: string;
};

export type OnboardingUser = {
  weddingProfile?: {
    newEventRequirements?: unknown;
    servicesByEvent?: Record<string, string[]>;
    allDayServices?: string[];
    customEvents?: Array<{ id?: string; name?: string }>;
  };
};
