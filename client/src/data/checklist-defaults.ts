export interface CountryOption {
  code: string;
  name: string;
}

export type PlanningPace = "relaxed" | "standard" | "intensive" | "auto";

export interface ChecklistPreferences {
  weddingCountry: string;
  isDestinationWedding: boolean;
  destinationModalShown: boolean;
  weddingParty: "yes" | "no" | "undecided";
  planningPace: PlanningPace;

  saveTheDates: boolean;
  weddingWebsite: boolean;
  engagementPhotoshoot: boolean;
  weddingShower: boolean;
  rehearsalDinner: boolean;
  printedPrograms: boolean;
  giftRegistry: boolean;
  videographer: boolean;
  coordinator: boolean;

  vendorTipping: boolean;
  vendorReviews: boolean;

  venueCoversCatering: boolean;
  venueCoversBar: boolean;
  venueCoversCoordination: boolean;
  venueCoversRentals: boolean;
  venueCoversFlorals: boolean;

  setupCompleted: boolean;
}

export const DEFAULT_CHECKLIST_PREFERENCES: ChecklistPreferences = {
  weddingCountry: "",
  isDestinationWedding: false,
  destinationModalShown: false,
  weddingParty: "undecided",
  planningPace: "auto",

  saveTheDates: true,
  weddingWebsite: true,
  engagementPhotoshoot: false,
  weddingShower: false,
  rehearsalDinner: false,
  printedPrograms: false,
  giftRegistry: false,
  videographer: false,
  coordinator: false,

  vendorTipping: false,
  vendorReviews: false,

  venueCoversCatering: false,
  venueCoversBar: false,
  venueCoversCoordination: false,
  venueCoversRentals: false,
  venueCoversFlorals: false,

  setupCompleted: false,
};

export function getAutoDetectedPace(
  monthsUntilWedding: number,
): "relaxed" | "standard" | "intensive" {
  if (monthsUntilWedding < 6) return "intensive";
  if (monthsUntilWedding <= 12) return "standard";
  return "relaxed";
}

export interface CountryDefaults {
  saveTheDates: boolean;
  weddingWebsite: boolean;
  engagementPhotoshoot: boolean;
  weddingShower: boolean;
  rehearsalDinner: boolean;
  printedPrograms: boolean;
  giftRegistry: boolean;
  vendorTipping: boolean;
  vendorReviews: boolean;
}

export const COUNTRY_DEFAULTS: Record<string, CountryDefaults> = {
  US: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: true,
    weddingShower: true,
    rehearsalDinner: true,
    printedPrograms: true,
    giftRegistry: true,
    vendorTipping: true,
    vendorReviews: true,
  },
  GB: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: true,
    weddingShower: true,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: true,
    vendorTipping: false,
    vendorReviews: true,
  },
  FR: {
    saveTheDates: false,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: false,
    vendorTipping: false,
    vendorReviews: false,
  },
  IT: {
    saveTheDates: false,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: false,
    vendorTipping: false,
    vendorReviews: false,
  },
  ES: {
    saveTheDates: false,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: false,
    vendorTipping: false,
    vendorReviews: false,
  },
  MX: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: true,
    printedPrograms: false,
    giftRegistry: true,
    vendorTipping: true,
    vendorReviews: false,
  },
  PT: {
    saveTheDates: false,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: false,
    vendorTipping: false,
    vendorReviews: false,
  },
  GR: {
    saveTheDates: false,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: false,
    vendorTipping: false,
    vendorReviews: false,
  },
  IE: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: true,
    weddingShower: true,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: true,
    vendorTipping: false,
    vendorReviews: true,
  },
  CA: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: true,
    weddingShower: true,
    rehearsalDinner: true,
    printedPrograms: true,
    giftRegistry: true,
    vendorTipping: true,
    vendorReviews: true,
  },
  AU: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: true,
    weddingShower: true,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: true,
    vendorTipping: false,
    vendorReviews: true,
  },
  default: {
    saveTheDates: true,
    weddingWebsite: true,
    engagementPhotoshoot: false,
    weddingShower: false,
    rehearsalDinner: false,
    printedPrograms: false,
    giftRegistry: false,
    vendorTipping: false,
    vendorReviews: false,
  },
};

export function getCountryDefaults(countryCode: string): CountryDefaults {
  return COUNTRY_DEFAULTS[countryCode] || COUNTRY_DEFAULTS.default;
}

export interface DestinationLegalInfo {
  title: string;
  requirements: string[];
  tip: string;
  learnMoreUrl?: string;
}

export const DESTINATION_LEGAL_INFO: Record<string, DestinationLegalInfo> = {
  FR: {
    title: "Legal Requirements for France",
    requirements: [
      "40+ days residency before ceremony required",
      "Documents must be translated by certified translator",
      "Civil ceremony at Mairie (town hall) required",
      "Religious ceremony cannot replace civil ceremony",
    ],
    tip: "Many couples do a legal ceremony at home + symbolic ceremony in France.",
  },
  IT: {
    title: "Legal Requirements for Italy",
    requirements: [
      "Nulla Osta (certificate of no impediment) required",
      "Documents must be apostilled",
      "Civil ceremony at town hall or approved venues",
      "2 witnesses required",
    ],
    tip: "Start paperwork 3-4 months before wedding date.",
  },
  ES: {
    title: "Legal Requirements for Spain",
    requirements: [
      "Civil ceremony at Civil Registry required for legal marriage",
      "Certificado de Capacidad Matrimonial needed",
      "Both partners must appear in person before ceremony",
    ],
    tip: "Symbolic ceremonies are popular at venues; legal ceremony done separately.",
  },
  MX: {
    title: "Legal Requirements for Mexico",
    requirements: [
      "Blood tests required in some states",
      "Documents must be translated and apostilled",
      "Civil ceremony with Mexican judge required",
      "4 witnesses required (2 per person)",
    ],
    tip: "Requirements vary by state. Confirm with your venue.",
  },
  GR: {
    title: "Legal Requirements for Greece",
    requirements: [
      "Certificate of no impediment required",
      "Documents must be apostilled and translated",
      "Civil or religious ceremony both legally recognized",
    ],
    tip: "Orthodox ceremonies require both parties to be Orthodox for some churches.",
  },
  PT: {
    title: "Legal Requirements for Portugal",
    requirements: [
      "Certificate of legal capacity to marry required",
      "Documents must be apostilled and translated",
      "Civil ceremony at Conservatória do Registo Civil required",
    ],
    tip: "Allow 2-3 months for document processing.",
  },
  HR: {
    title: "Legal Requirements for Croatia",
    requirements: [
      "Birth certificates and proof of single status required",
      "Documents must be apostilled and translated",
      "Civil or religious ceremonies both recognized",
    ],
    tip: "Some venues can host the civil ceremony on-site.",
  },
  TH: {
    title: "Legal Requirements for Thailand",
    requirements: [
      "Affirmation of Freedom to Marry from your embassy required",
      "Documents must be translated into Thai",
      "Registration at Amphur (district office) required",
    ],
    tip: "The Buddhist ceremony is symbolic only; civil registration is separate.",
  },
};

export const DESTINATION_TASKS = [
  {
    monthsOut: 10,
    category: "details" as const,
    title: "Research marriage license requirements for destination",
    tags: ["destination"],
  },
  {
    monthsOut: 8,
    category: "details" as const,
    title: "Begin legal paperwork/document gathering",
    tags: ["destination"],
  },
  {
    monthsOut: 6,
    category: "details" as const,
    title: "Plan welcome event for traveling guests",
    tags: ["destination"],
  },
  {
    monthsOut: 4,
    category: "details" as const,
    title: "Send travel information to guests",
    tags: ["destination"],
  },
  {
    monthsOut: 2,
    category: "details" as const,
    title: "Confirm document translations/apostilles",
    tags: ["destination"],
  },
];

export const COMMON_COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "MX", name: "Mexico" },
  { code: "HR", name: "Croatia" },
  { code: "TH", name: "Thailand" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
];
