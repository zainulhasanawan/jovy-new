import type { LocationInfo } from "@/types/dashboard/schema";
import type { LocationTier } from "@/types/dashboard/location";

// Location-based pricing tiers
export const REGION_MULTIPLIERS: Record<
  LocationTier,
  { multiplier: number; label: string }
> = {
  very_high: { multiplier: 1.45, label: "Premium Market" },
  high: { multiplier: 1.2, label: "Major Metro" },
  medium: { multiplier: 1.0, label: "Average Market" },
  low: { multiplier: 0.75, label: "Budget-Friendly" },
};

// Simplified location tier mapping
export const CITY_TIER_MAPPING: Record<string, LocationTier> = {
  // Very High - Premium cities
  london: "very_high",
  paris: "very_high",
  monaco: "very_high",
  "monte carlo": "very_high",
  "st tropez": "very_high",
  "saint tropez": "very_high",
  zurich: "very_high",
  geneva: "very_high",
  venice: "very_high",
  amalfi: "very_high",
  "amalfi coast": "very_high",
  "lake como": "very_high",
  nice: "very_high",
  cannes: "very_high",
  mykonos: "very_high",
  santorini: "very_high",
  "new york": "very_high",
  nyc: "very_high",
  "san francisco": "very_high",
  singapore: "very_high",
  dubai: "very_high",
  tokyo: "very_high",
  "hong kong": "very_high",

  // High - Major Metros & Popular Destinations
  barcelona: "high",
  rome: "high",
  dublin: "high",
  milan: "high",
  florence: "high",
  tuscany: "high",
  provence: "high",
  dubrovnik: "high",
  split: "high",
  lisbon: "high",
  lisboa: "high",
  madrid: "high",
  ibiza: "high",
  mallorca: "high",
  seville: "high",
  sevilla: "high",
  porto: "high",
  oporto: "high",
  algarve: "high",
  "douro valley": "high",
  douro: "high",
  sintra: "high",
  cascais: "high",
  estoril: "high",
  comporta: "high",
  azores: "high",
  madeira: "high",
  funchal: "high",

  // Greece
  athens: "high",
  crete: "high",
  chania: "high",
  heraklion: "high",
  rhodes: "high",
  corfu: "high",
  paros: "high",
  naxos: "high",
  hydra: "high",
  spetses: "high",
  kefalonia: "high",
  zakynthos: "high",
  lefkada: "high",
  nafplio: "high",
  monemvasia: "high",

  // Croatia
  hvar: "high",
  korcula: "high",
  vis: "high",
  rovinj: "high",
  istria: "high",

  // Netherlands & Belgium
  amsterdam: "high",
  brussels: "high",
  bruxelles: "high",
  bruges: "high",
  brugge: "high",
  antwerp: "high",
  antwerpen: "high",

  // Germany & Austria
  munich: "high",
  berlin: "high",
  hamburg: "high",
  vienna: "high",
  wien: "high",
  salzburg: "high",

  // Central Europe
  prague: "high",
  praha: "high",
  budapest: "high",
  "lake bled": "high",
  bled: "high",
  ljubljana: "high",

  // Baltic & Nordic
  helsinki: "high",
  reykjavik: "high",
  tallinn: "high",
  riga: "high",

  // Cyprus
  cyprus: "high",
  limassol: "high",
  paphos: "high",

  // Turkey - Premium areas
  istanbul: "high",
  bodrum: "high",

  // Africa
  "cape town": "high",
  "cape winelands": "high",
  franschhoek: "high",
  stellenbosch: "high",
  mauritius: "high",
  seychelles: "high",
  marrakech: "high",
  marrakesh: "high",

  // Asia
  bali: "high",
  ubud: "high",
  seminyak: "high",
  canggu: "high",
  uluwatu: "high",
  phuket: "high",
  krabi: "high",
  "koh samui": "high",
  bangkok: "high",

  // Caribbean & Mexico
  jamaica: "high",
  "montego bay": "high",
  negril: "high",
  bahamas: "high",
  nassau: "high",
  exumas: "high",
  barbados: "high",
  antigua: "high",
  "st lucia": "high",
  "saint lucia": "high",
  aruba: "high",
  curacao: "high",
  "punta cana": "high",
  cancun: "high",
  tulum: "high",
  "playa del carmen": "high",
  "riviera maya": "high",
  "los cabos": "high",
  "cabo san lucas": "high",
  "puerto vallarta": "high",
  "riviera nayarit": "high",

  // USA - High
  "los angeles": "high",
  la: "high",
  chicago: "high",
  miami: "high",
  boston: "high",
  washington: "high",
  dc: "high",
  seattle: "high",
  "san diego": "high",
  austin: "high",
  denver: "high",
  napa: "high",
  "napa valley": "high",
  sonoma: "high",
  hawaii: "high",
  maui: "high",
  kauai: "high",
  oahu: "high",
  aspen: "high",
  vail: "high",
  hamptons: "high",
  "martha's vineyard": "high",
  charleston: "high",
  savannah: "high",
  "new orleans": "high",

  // Canada & Australia
  toronto: "high",
  vancouver: "high",
  montreal: "high",
  melbourne: "high",
  perth: "high",
  brisbane: "high",

  // Medium
  valencia: "medium",
  malaga: "medium",
  granada: "medium",
  bilbao: "medium",
  "costa brava": "medium",
  toulouse: "medium",
  montpellier: "medium",
  nantes: "medium",
  lille: "medium",
  marseille: "medium",
  naples: "medium",
  napoli: "medium",
  turin: "medium",
  torino: "medium",
  genoa: "medium",
  genova: "medium",
  pisa: "medium",
  perugia: "medium",
  abruzzo: "medium",
  calabria: "medium",
  frankfurt: "medium",
  cologne: "medium",
  dusseldorf: "medium",
  stuttgart: "medium",
  bavaria: "medium",
  bayern: "medium",
  krakow: "medium",
  warsaw: "medium",
  warszawa: "medium",
  gdansk: "medium",
  wroclaw: "medium",
  vilnius: "medium",
  bratislava: "medium",
  thessaloniki: "medium",
  zadar: "medium",
  pula: "medium",
  coimbra: "medium",
  braga: "medium",
  alentejo: "medium",
  antalya: "medium",
  fethiye: "medium",
  cappadocia: "medium",
  kapadokya: "medium",
  "costa rica": "medium",
  "panama city": "medium",
  "mexico city": "medium",
  "chiang mai": "medium",
  vietnam: "medium",
  "da nang": "medium",
  "hoi an": "medium",

  // Low
  romania: "low",
  bucharest: "low",
  transylvania: "low",
  bulgaria: "low",
  sofia: "low",
  serbia: "low",
  belgrade: "low",
  montenegro: "low",
  albania: "low",
  tirana: "low",
  "north macedonia": "low",
  skopje: "low",
  bosnia: "low",
  sarajevo: "low",
  rural: "low",
  "oklahoma city": "low",
  memphis: "low",
  louisville: "low",
  indianapolis: "low",
  columbus: "low",
  jacksonville: "low",
  "el paso": "low",
  tucson: "low",
  albuquerque: "low",
  omaha: "low",
  "kansas city": "low",
  wichita: "low",
};

// State/Province-level tier overrides (when city not found)
export const STATE_TIER_MAPPING: Record<string, LocationTier> = {
  california: "high",
  "new york": "high",
  massachusetts: "high",
  connecticut: "high",
  "new jersey": "high",
  hawaii: "high",
  alaska: "high",
  colorado: "high",
  washington: "high",
  florida: "high",
  mississippi: "low",
  arkansas: "low",
  "west virginia": "low",
  alabama: "low",
  oklahoma: "low",
  kentucky: "low",
  kansas: "low",
  iowa: "low",
  nebraska: "low",
  "south dakota": "low",
  "north dakota": "low",
  "ile de france": "very_high",
  paca: "high",
  lombardia: "high",
  lombardy: "high",
  veneto: "high",
  toscana: "high",
  "canary islands": "medium",
  "islas canarias": "medium",
  bayern: "high",
  bavaria: "high",
  "baden-wurttemberg": "high",
  hessen: "medium",
  "nordrhein-westfalen": "medium",
};

// Country-level tier defaults
export const COUNTRY_TIER_MAPPING: Record<string, LocationTier> = {
  monaco: "very_high",
  switzerland: "very_high",
  liechtenstein: "very_high",
  "united kingdom": "high",
  uk: "high",
  "great britain": "high",
  england: "high",
  scotland: "high",
  ireland: "high",
  france: "high",
  italy: "high",
  netherlands: "high",
  holland: "high",
  belgium: "high",
  luxembourg: "high",
  austria: "high",
  denmark: "high",
  sweden: "high",
  norway: "high",
  finland: "high",
  iceland: "high",
  spain: "medium",
  portugal: "medium",
  germany: "medium",
  greece: "medium",
  croatia: "medium",
  slovenia: "medium",
  "czech republic": "medium",
  czechia: "medium",
  hungary: "medium",
  poland: "medium",
  malta: "medium",
  cyprus: "medium",
  estonia: "medium",
  latvia: "medium",
  lithuania: "medium",
  slovakia: "medium",
  romania: "low",
  bulgaria: "low",
  serbia: "low",
  "bosnia and herzegovina": "low",
  bosnia: "low",
  montenegro: "low",
  albania: "low",
  "north macedonia": "low",
  macedonia: "low",
  kosovo: "low",
  moldova: "low",
  ukraine: "low",
  belarus: "low",
  "united states": "medium",
  usa: "medium",
  us: "medium",
  canada: "medium",
  mexico: "low",
  "costa rica": "medium",
  panama: "medium",
  colombia: "low",
  peru: "low",
  argentina: "medium",
  chile: "medium",
  brazil: "medium",
  ecuador: "low",
  bahamas: "high",
  jamaica: "medium",
  barbados: "high",
  "dominican republic": "medium",
  "puerto rico": "medium",
  cuba: "low",
  "trinidad and tobago": "medium",
  japan: "high",
  singapore: "very_high",
  australia: "high",
  "new zealand": "high",
  thailand: "medium",
  vietnam: "medium",
  indonesia: "medium",
  malaysia: "medium",
  philippines: "low",
  india: "low",
  china: "medium",
  "south korea": "medium",
  taiwan: "medium",
  uae: "high",
  "united arab emirates": "high",
  qatar: "high",
  israel: "high",
  turkey: "medium",
  morocco: "medium",
  egypt: "low",
  "south africa": "medium",
};

export function deriveLocationTier(location: LocationInfo | null | undefined): {
  tier: LocationTier;
  source: string;
} {
  if (!location) {
    return { tier: "medium", source: "default" };
  }

  if (location.city) {
    const cityLower = location.city.toLowerCase().trim();
    if (CITY_TIER_MAPPING[cityLower]) {
      return { tier: CITY_TIER_MAPPING[cityLower], source: location.city };
    }
    for (const [knownCity, tier] of Object.entries(CITY_TIER_MAPPING)) {
      if (cityLower.includes(knownCity) || knownCity.includes(cityLower)) {
        return { tier, source: location.city };
      }
    }
  }

  if (location.region) {
    const regionLower = location.region.toLowerCase().trim();
    if (CITY_TIER_MAPPING[regionLower]) {
      return { tier: CITY_TIER_MAPPING[regionLower], source: location.region };
    }
  }

  if (location.state) {
    const stateLower = location.state.toLowerCase().trim();
    if (STATE_TIER_MAPPING[stateLower]) {
      return { tier: STATE_TIER_MAPPING[stateLower], source: location.state };
    }
  }

  if (location.country) {
    const countryLower = location.country.toLowerCase().trim();
    if (COUNTRY_TIER_MAPPING[countryLower]) {
      return {
        tier: COUNTRY_TIER_MAPPING[countryLower],
        source: location.country,
      };
    }
  }

  return { tier: "medium", source: "default" };
}

export function getLocationAdjustedCost(
  baseCost: number,
  tier: LocationTier,
): number {
  const { multiplier } = REGION_MULTIPLIERS[tier];
  return Math.round(baseCost * multiplier);
}
