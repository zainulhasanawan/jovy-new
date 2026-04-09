import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Check,
  DollarSign,
  Globe,
  Heart,
  Loader2,
  MapPin,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";
import type {
  DateInfo,
  PlanningStage,
  WeddingLocation,
} from "@/types/dashboard/schema";
import { loadGoogleMaps, isGoogleMapsReady } from "@/utils/dashboard/google-maps";
import { COMMON_COUNTRIES } from "@/data/checklist-defaults";

interface PlacePrediction {
  place_id: string;
  description: string;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceResult {
  address_components?: AddressComponent[];
}

interface GoogleAutocompleteService {
  getPlacePredictions: (
    request: { input: string; types: string[] },
    callback: (predictions: PlacePrediction[] | null, status: string) => void,
  ) => void;
}

interface GooglePlacesService {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (result: PlaceResult | null, status: string) => void,
  ) => void;
}

interface GoogleMapsWindow {
  maps: {
    places: {
      AutocompleteService: new () => GoogleAutocompleteService;
      PlacesService: new (container: HTMLDivElement) => GooglePlacesService;
      PlacesServiceStatus: {
        OK: string;
      };
    };
  };
}

function getGoogleMapsWindow(): GoogleMapsWindow | null {
  const maybeGoogle = (window as Window & { google?: unknown }).google;
  if (!maybeGoogle || typeof maybeGoogle !== "object") return null;
  return maybeGoogle as GoogleMapsWindow;
}

type EditSection = "names" | "date" | "location" | "budget" | "planning-stage";

interface SettingsEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: EditSection;
  currentData: {
    partner1Name?: string;
    partner2Name?: string;
    homeCountry?: string;
    dateInfo?: DateInfo | null;
    weddingDate?: string | null;
    locations?: WeddingLocation[];
    openToSuggestions?: boolean;
    locationDecided?: boolean;
    guestCount?: number;
    budget?: number;
    currency?: "EUR" | "USD" | "GBP";
    planningStage?: PlanningStage;
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const SEASONS = [
  { value: "spring" as const, label: "Spring", emoji: "🌸" },
  { value: "summer" as const, label: "Summer", emoji: "☀️" },
  { value: "fall" as const, label: "Fall", emoji: "🍂" },
  { value: "winter" as const, label: "Winter", emoji: "❄️" },
];

const PLANNING_STAGES = [
  {
    value: "exploring" as const,
    title: "Just starting to explore",
    subtitle: "Dreaming and researching possibilities",
    emoji: "✨",
  },
  {
    value: "researching" as const,
    title: "Actively researching",
    subtitle: "Looking at venues and vendors",
    emoji: "🔍",
  },
  {
    value: "comparing" as const,
    title: "Comparing quotes",
    subtitle: "Making decisions on vendors",
    emoji: "📊",
  },
  {
    value: "booked" as const,
    title: "Vendors booked",
    subtitle: "Finalizing details",
    emoji: "✅",
  },
];

function DateOption({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
        selected
          ? "border-[#D4847A] bg-[rgba(212,132,122,0.08)]"
          : "border-[rgba(42,32,53,0.08)] bg-white hover:border-[rgba(42,32,53,0.15)]"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span
        className={`font-medium ${selected ? "text-[#2A2035]" : "text-[#6B617B]"}`}
      >
        {label}
      </span>
      {selected && <Check className="w-4 h-4 text-[#D4847A] ml-auto" />}
    </button>
  );
}

export function SettingsEditModal({
  open,
  onOpenChange,
  section,
  currentData,
  onSave,
}: SettingsEditModalProps) {
  const [saving, setSaving] = useState(false);

  const [partner1, setPartner1] = useState(currentData.partner1Name || "");
  const [partner2, setPartner2] = useState(currentData.partner2Name || "");
  const [homeCountry, setHomeCountry] = useState(currentData.homeCountry || "");
  const [countrySearch, setCountrySearch] = useState("");

  const [dateType, setDateType] = useState<
    "specific" | "month" | "season" | "year" | "undecided" | null
  >(currentData.dateInfo?.dateType || null);
  const [specificDate, setSpecificDate] = useState<string | null>(
    currentData.dateInfo?.specificDate || currentData.weddingDate || null,
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentData.dateInfo?.month || null,
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    currentData.dateInfo?.year || null,
  );
  const [selectedSeason, setSelectedSeason] = useState<
    "spring" | "summer" | "fall" | "winter" | null
  >(currentData.dateInfo?.season || null);

  const [locations, setLocations] = useState<WeddingLocation[]>(
    currentData.locations || [],
  );
  const [openToSuggestions, setOpenToSuggestions] = useState(
    currentData.openToSuggestions || false,
  );
  const [locationDecided, setLocationDecided] = useState(
    currentData.locationDecided || false,
  );
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    Array<{ name: string; placeId: string }>
  >([]);
  const [mapsReady, setMapsReady] = useState(false);
  const autocompleteRef = useRef<GoogleAutocompleteService | null>(null);
  const placesServiceRef = useRef<GooglePlacesService | null>(null);
  const placesContainerRef = useRef<HTMLDivElement>(null);

  const [guestCount, setGuestCount] = useState(
    currentData.guestCount?.toString() || "",
  );
  const [budget, setBudget] = useState(currentData.budget?.toString() || "");
  const [currency, setCurrency] = useState<"EUR" | "USD" | "GBP">(
    currentData.currency || "EUR",
  );

  const [planningStage, setPlanningStage] = useState<PlanningStage | null>(
    currentData.planningStage || null,
  );

  useEffect(() => {
    setPartner1(currentData.partner1Name || "");
    setPartner2(currentData.partner2Name || "");
    setHomeCountry(currentData.homeCountry || "");
    setDateType(currentData.dateInfo?.dateType || null);
    setSpecificDate(
      currentData.dateInfo?.specificDate || currentData.weddingDate || null,
    );
    setSelectedMonth(currentData.dateInfo?.month || null);
    setSelectedYear(currentData.dateInfo?.year || null);
    setSelectedSeason(currentData.dateInfo?.season || null);
    setLocations(currentData.locations || []);
    setOpenToSuggestions(currentData.openToSuggestions || false);
    setLocationDecided(currentData.locationDecided || false);
    setGuestCount(currentData.guestCount?.toString() || "");
    setBudget(currentData.budget?.toString() || "");
    setCurrency(currentData.currency || "EUR");
    setPlanningStage(currentData.planningStage || null);
  }, [currentData, open]);

  useEffect(() => {
    if (section !== "location" || !open) return;

    loadGoogleMaps().then(() => {
      if (!isGoogleMapsReady()) return;
      const google = getGoogleMapsWindow();
      if (!google) return;

      setMapsReady(true);
      autocompleteRef.current = new google.maps.places.AutocompleteService();
      if (placesContainerRef.current) {
        placesServiceRef.current = new google.maps.places.PlacesService(
          placesContainerRef.current,
        );
      }
    });
  }, [section, open]);

  useEffect(() => {
    if (!mapsReady || !locationSearch.trim() || !autocompleteRef.current) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      const google = getGoogleMapsWindow();
      if (!google || !autocompleteRef.current) {
        setLocationSuggestions([]);
        return;
      }

      autocompleteRef.current.getPlacePredictions(
        { input: locationSearch, types: ["(regions)"] },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setLocationSuggestions(
              predictions.map((p) => ({
                name: p.description,
                placeId: p.place_id,
              })),
            );
          } else {
            setLocationSuggestions([]);
          }
        },
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [locationSearch, mapsReady]);

  const filteredCountries = COMMON_COUNTRIES.filter(
    (c) =>
      !countrySearch ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear + i);
  };

  const calculateDaysUntil = (date: string) => {
    const target = new Date(date);
    const today = new Date();
    return Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const addLocation = (suggestion: { name: string; placeId: string }) => {
    const google = getGoogleMapsWindow();
    if (!placesServiceRef.current || !google) {
      setLocations([
        ...locations,
        { name: suggestion.name, placeId: suggestion.placeId },
      ]);
      setLocationSearch("");
      setLocationSuggestions([]);
      return;
    }

    placesServiceRef.current.getDetails(
      { placeId: suggestion.placeId, fields: ["address_components"] },
      (result, status) => {
        let country = "";
        let countryCode = "";

        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          result?.address_components
        ) {
          const countryComponent = result.address_components.find((c) =>
            c.types.includes("country"),
          );
          if (countryComponent) {
            country = countryComponent.long_name;
            countryCode = countryComponent.short_name;
          }
        }

        setLocations([
          ...locations,
          {
            name: suggestion.name,
            placeId: suggestion.placeId,
            country,
            countryCode,
          },
        ]);
        setLocationSearch("");
        setLocationSuggestions([]);
      },
    );
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const buildDateInfo = (): DateInfo | null => {
    if (!dateType) return null;
    switch (dateType) {
      case "specific":
        return specificDate
          ? {
              dateType: "specific",
              specificDate,
              year: new Date(specificDate).getFullYear(),
            }
          : null;
      case "month":
        return selectedMonth && selectedYear
          ? { dateType: "month", month: selectedMonth, year: selectedYear }
          : null;
      case "season":
        return selectedSeason && selectedYear
          ? { dateType: "season", season: selectedSeason, year: selectedYear }
          : null;
      case "year":
        return selectedYear ? { dateType: "year", year: selectedYear } : null;
      case "undecided":
        return { dateType: "undecided" };
      default:
        return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let dataToSave: Record<string, unknown> = {};

      switch (section) {
        case "names":
          dataToSave = {
            partner1Name: partner1.trim(),
            partner2Name: partner2.trim(),
            homeCountry,
            coupleNames: [partner1.trim(), partner2.trim()]
              .filter(Boolean)
              .join(" & "),
          };
          break;
        case "date": {
          const dateInfo = buildDateInfo();
          dataToSave = {
            dateInfo,
            timeline:
              dateType === "specific" && specificDate
                ? { weddingDate: specificDate }
                : {},
          };
          break;
        }
        case "location":
          dataToSave = { locations, openToSuggestions, locationDecided };
          break;
        case "budget":
          dataToSave = {
            guestInfo: {
              estimatedCount: guestCount ? parseInt(guestCount, 10) : 0,
            },
            budget: {
              totalBudget: budget ? parseInt(budget, 10) : 0,
              currency,
            },
            budgetCurrency: currency,
          };
          break;
        case "planning-stage":
          dataToSave = { planningStage };
          break;
      }

      await onSave(dataToSave);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (section) {
      case "names":
        return "Wedding Details";
      case "date":
        return "When's the big day?";
      case "location":
        return locationDecided
          ? "Wedding Location"
          : "Where are you considering?";
      case "budget":
        return "Budget & Guests";
      case "planning-stage":
        return "Planning Stage";
    }
  };

  const getIcon = () => {
    switch (section) {
      case "names":
        return <Heart className="w-10 h-10 text-[#D4847A]" />;
      case "date":
        return <Calendar className="w-10 h-10 text-[#D4847A]" />;
      case "location":
        return <MapPin className="w-10 h-10 text-[#D4847A]" />;
      case "budget":
        return <DollarSign className="w-10 h-10 text-[#D4847A]" />;
      case "planning-stage":
        return <Target className="w-10 h-10 text-[#D4847A]" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <div ref={placesContainerRef} style={{ display: "none" }} />

        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FDF8F6] to-[#F8F5FB] flex items-center justify-center mx-auto mb-4">
              {getIcon()}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#2A2035]">
              {getTitle()}
            </h2>
          </div>

          {section === "names" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#6B617B] mb-2">
                  Couple Names
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Partner 1"
                    value={partner1}
                    onChange={(e) => setPartner1(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-center font-medium text-[#2A2035] placeholder:text-[#9B8FA8] focus:outline-none focus:border-[#D4847A] focus:ring-2 focus:ring-[rgba(212,132,122,0.2)]"
                  />
                  <span className="font-display text-xl text-[#D4847A]">&</span>
                  <input
                    type="text"
                    placeholder="Partner 2"
                    value={partner2}
                    onChange={(e) => setPartner2(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-center font-medium text-[#2A2035] placeholder:text-[#9B8FA8] focus:outline-none focus:border-[#D4847A] focus:ring-2 focus:ring-[rgba(212,132,122,0.2)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B617B] mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Home Country
                </label>
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-[#2A2035] placeholder:text-[#9B8FA8] focus:outline-none focus:border-[#D4847A] focus:ring-2 focus:ring-[rgba(212,132,122,0.2)] mb-2"
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setHomeCountry(country.code);
                        setCountrySearch("");
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${
                        homeCountry === country.code
                          ? "border-[#D4847A] bg-[rgba(212,132,122,0.08)]"
                          : "border-[rgba(42,32,53,0.08)] bg-white hover:border-[rgba(42,32,53,0.15)]"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          homeCountry === country.code
                            ? "text-[#2A2035]"
                            : "text-[#6B617B]"
                        }`}
                      >
                        {country.name}
                      </span>
                      {homeCountry === country.code && (
                        <Check className="w-4 h-4 text-[#D4847A] ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {section === "date" && (
            <div className="space-y-4">
              <p className="text-[#6B617B] text-center mb-4">
                Tell us what you know about your wedding date
              </p>

              <div className="space-y-2">
                <DateOption
                  icon="📅"
                  label="We have a specific date"
                  selected={dateType === "specific"}
                  onClick={() => setDateType("specific")}
                />
                <DateOption
                  icon="🗓️"
                  label="We know the month"
                  selected={dateType === "month"}
                  onClick={() => setDateType("month")}
                />
                <DateOption
                  icon="🌿"
                  label="We know the season"
                  selected={dateType === "season"}
                  onClick={() => setDateType("season")}
                />
                <DateOption
                  icon="📆"
                  label="We know the year"
                  selected={dateType === "year"}
                  onClick={() => setDateType("year")}
                />
                <DateOption
                  icon="💭"
                  label="Still deciding"
                  selected={dateType === "undecided"}
                  onClick={() => setDateType("undecided")}
                />
              </div>

              {dateType === "specific" && (
                <div className="mt-4 p-4 bg-[#F8F5FB] rounded-xl">
                  <input
                    type="date"
                    value={specificDate || ""}
                    onChange={(e) => setSpecificDate(e.target.value || null)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-lg font-medium text-[#2A2035] focus:outline-none focus:border-[#D4847A] text-center"
                  />
                  {specificDate && (
                    <div className="mt-3 py-2 px-4 bg-white rounded-lg text-center">
                      <span className="text-2xl font-semibold text-[#D4847A]">
                        {calculateDaysUntil(specificDate)}
                      </span>
                      <span className="text-[#6B617B] ml-2">days to go!</span>
                    </div>
                  )}
                </div>
              )}

              {dateType === "month" && (
                <div className="mt-4 p-4 bg-[#F8F5FB] rounded-xl flex gap-3">
                  <select
                    value={selectedMonth || ""}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-lg font-medium text-[#2A2035] focus:outline-none focus:border-[#D4847A]"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear || ""}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-lg font-medium text-[#2A2035] focus:outline-none focus:border-[#D4847A]"
                  >
                    <option value="">Year</option>
                    {getAvailableYears().map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {dateType === "season" && (
                <div className="mt-4 p-4 bg-[#F8F5FB] rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {SEASONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSelectedSeason(s.value)}
                        className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          selectedSeason === s.value
                            ? "border-[#D4847A] bg-white"
                            : "border-transparent bg-white/50 hover:bg-white"
                        }`}
                      >
                        <span>{s.emoji}</span>
                        <span className="font-medium text-[#2A2035]">
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <select
                    value={selectedYear || ""}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-lg font-medium text-[#2A2035] focus:outline-none focus:border-[#D4847A]"
                  >
                    <option value="">Year</option>
                    {getAvailableYears().map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {dateType === "year" && (
                <div className="mt-4 p-4 bg-[#F8F5FB] rounded-xl">
                  <select
                    value={selectedYear || ""}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-lg font-medium text-[#2A2035] focus:outline-none focus:border-[#D4847A]"
                  >
                    <option value="">Select year</option>
                    {getAvailableYears().map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {section === "location" && (
            <div className="space-y-4">
              <div className="flex rounded-xl border border-[rgba(42,32,53,0.12)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLocationDecided(false)}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                    !locationDecided
                      ? "bg-[#D4847A] text-white"
                      : "bg-white text-[#6B617B] hover:bg-[#F8F5FB]"
                  }`}
                >
                  Still exploring
                </button>
                <button
                  type="button"
                  onClick={() => setLocationDecided(true)}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                    locationDecided
                      ? "bg-[#D4847A] text-white"
                      : "bg-white text-[#6B617B] hover:bg-[#F8F5FB]"
                  }`}
                >
                  We've decided
                </button>
              </div>

              <p className="text-[#6B617B] text-center text-sm">
                {locationDecided
                  ? "Enter your wedding location"
                  : "Add cities or regions you're exploring"}
              </p>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B8FA8]" />
                <input
                  type="text"
                  placeholder={
                    locationDecided
                      ? "Search for your wedding location..."
                      : "Search for a city or region..."
                  }
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-[#2A2035] placeholder:text-[#9B8FA8] focus:outline-none focus:border-[#D4847A] focus:ring-2 focus:ring-[rgba(212,132,122,0.2)]"
                />
                {!mapsReady && locationSearch && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B8FA8] animate-spin" />
                )}
              </div>

              {locationSuggestions.length > 0 && (
                <div className="border border-[rgba(42,32,53,0.12)] rounded-xl overflow-hidden">
                  {locationSuggestions.map((suggestion, i) => (
                    <button
                      key={suggestion.placeId}
                      type="button"
                      onClick={() => {
                        if (locationDecided) {
                          setLocations([
                            {
                              name: suggestion.name,
                              placeId: suggestion.placeId,
                            },
                          ]);
                        } else {
                          addLocation(suggestion);
                        }
                        setLocationSearch("");
                        setLocationSuggestions([]);
                      }}
                      className={`w-full py-3 px-4 text-left hover:bg-[#F8F5FB] text-[#2A2035] ${
                        i > 0 ? "border-t border-[rgba(42,32,53,0.08)]" : ""
                      }`}
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              )}

              {locations.length > 0 && (
                <div className="space-y-2">
                  {locations.map((loc, i) => (
                    <div
                      key={loc.placeId || `${loc.name}-${i}`}
                      className={`flex items-center gap-3 py-2 px-4 rounded-xl ${
                        locationDecided
                          ? "bg-green-50 border border-green-200"
                          : "bg-[#F8F5FB]"
                      }`}
                    >
                      <MapPin
                        className={`w-4 h-4 ${
                          locationDecided ? "text-green-600" : "text-[#D4847A]"
                        }`}
                      />
                      <span className="flex-1 text-[#2A2035]">
                        {loc.name}
                        {locationDecided && (
                          <span className="ml-2 text-xs text-green-600">
                            (Confirmed)
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLocation(i)}
                        className="text-[#9B8FA8] hover:text-[#D4847A]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!locationDecided && (
                <label className="flex items-center gap-3 py-3 px-4 rounded-xl border border-[rgba(42,32,53,0.08)] cursor-pointer hover:border-[rgba(42,32,53,0.15)]">
                  <input
                    type="checkbox"
                    checked={openToSuggestions}
                    onChange={(e) => setOpenToSuggestions(e.target.checked)}
                    className="w-5 h-5 rounded border-[rgba(42,32,53,0.2)] text-[#D4847A] focus:ring-[#D4847A]"
                  />
                  <span className="text-[#6B617B]">
                    We're open to other destinations too
                  </span>
                </label>
              )}

              {locationDecided && locations.length === 0 && (
                <p className="text-center text-[#9B8FA8] text-sm py-4">
                  Search and select your confirmed wedding location above
                </p>
              )}
            </div>
          )}

          {section === "budget" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#6B617B] mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Guest Count
                </label>
                <input
                  type="number"
                  placeholder="Expected number of guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-[#2A2035] placeholder:text-[#9B8FA8] focus:outline-none focus:border-[#D4847A] focus:ring-2 focus:ring-[rgba(212,132,122,0.2)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B617B] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Budget
                </label>
                <div className="flex gap-3">
                  <select
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value as "EUR" | "USD" | "GBP")
                    }
                    className="px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-[#2A2035] focus:outline-none focus:border-[#D4847A]"
                  >
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Total budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[rgba(42,32,53,0.12)] text-[#2A2035] placeholder:text-[#9B8FA8] focus:outline-none focus:border-[#D4847A] focus:ring-2 focus:ring-[rgba(212,132,122,0.2)]"
                  />
                </div>
              </div>
            </div>
          )}

          {section === "planning-stage" && (
            <div className="space-y-2">
              <p className="text-[#6B617B] text-center mb-4">
                Where are you in your planning journey?
              </p>
              {PLANNING_STAGES.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => setPlanningStage(stage.value)}
                  className={`w-full py-4 px-5 rounded-xl border-2 text-left transition-all ${
                    planningStage === stage.value
                      ? "border-[#D4847A] bg-[rgba(212,132,122,0.08)]"
                      : "border-[rgba(42,32,53,0.08)] bg-white hover:border-[rgba(42,32,53,0.15)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stage.emoji}</span>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          planningStage === stage.value
                            ? "text-[#2A2035]"
                            : "text-[#6B617B]"
                        }`}
                      >
                        {stage.title}
                      </p>
                      <p className="text-sm text-[#9B8FA8]">{stage.subtitle}</p>
                    </div>
                    {planningStage === stage.value && (
                      <Check className="w-5 h-5 text-[#D4847A]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-4 border-t border-[rgba(42,32,53,0.08)] flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D4847A] hover:bg-[#C4756B] text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
