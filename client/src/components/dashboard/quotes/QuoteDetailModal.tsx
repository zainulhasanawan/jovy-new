import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Check,
  X,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Users,
  Star,
  MapPin,
  Sparkles,
  FileText,
  Package,
} from "lucide-react";
import type { Quote, User } from "@/types/dashboard/schema";
import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";
import { VENDOR_TAXONOMY } from "@/utils/dashboard/vendor-taxonomy";
import {
  getGapAnalysis,
  getEventAwareCoverage,
  filterExclusionsByGapCategories,
} from "@/utils/dashboard/coverage-utils";
import { buildEventGapGroupsFromCoverage } from "@/utils/dashboard/event-gap-groups";
import {
  CATEGORY_ORDER,
  extractKeyDetails,
  getCategoryIconNode,
  getVendorCategoryName,
  groupInclusionsByCategory,
} from "../../../types/dashboard/categorization";
import {
  formatPrice,
  splitExclusionsAndRestrictions,
} from "../../../types/dashboard/formatters";
import {
  toLabel,
  getQuotePriceData,
} from "../../../types/dashboard/quote-utils";
import type {
  AddOnLike,
  MenuOptionLike,
  CoveredPair,
  PricingTierLike,
  WeddingProfileLike,
} from "../../../types/dashboard/quote-types";
import { detectQuoteStructureType } from "@/utils/dashboard/utils";

function getVendorCategoryNameLocal(categoryId: string): string {
  return getVendorCategoryName(
    categoryId,
    VENDOR_TAXONOMY as Record<string, { name?: string }>,
  );
}

interface QuoteDetailModalProps {
  quote: Quote;
  open: boolean;
  onClose: () => void;
  guestCount?: number;
  userId?: string;
}

export function QuoteDetailModal({
  quote,
  open,
  onClose,
  guestCount,
  userId,
}: QuoteDetailModalProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER),
  );

  const keyDetails = useMemo(() => extractKeyDetails(quote), [quote]);
  const groupedInclusions = useMemo(
    () => groupInclusionsByCategory(quote.inclusions || []),
    [quote.inclusions],
  );

  const ungroupedInclusions = useMemo(() => {
    const grouped = new Set<string>();
    groupedInclusions.forEach((items) =>
      items.forEach((item) => grouped.add(item)),
    );
    return (quote.inclusions || [])
      .map(toLabel)
      .filter((item) => !grouped.has(item));
  }, [quote.inclusions, groupedInclusions]);

  const exclusionsRaw = useMemo(
    () => (quote.exclusions || []).map(toLabel),
    [quote.exclusions],
  );
  const { notIncluded: exclusions, restrictions: restrictionsDisplay } =
    useMemo(
      () =>
        splitExclusionsAndRestrictions(
          exclusionsRaw,
          (quote.restrictions || []) as string[],
        ),
      [exclusionsRaw, quote.restrictions],
    );

  const isVenue =
    quote.quoteType === "venue" || quote.vendorCategory === "venue_location";
  const gapAnalysis = useMemo(() => {
    if (!isVenue) return null;
    return getGapAnalysis(
      quote,
      CATEGORY_ORDER,
      (quote.selectedMenuOptionIds as string[]) || [],
    );
  }, [quote, isVenue]);

  const addOns = (quote.addOns || []) as AddOnLike[];
  const availableForFee = addOns.filter((a) =>
    Boolean(a.price && a.price > 0 && !a.included),
  );
  const { amount, currency, guestPricing, mandatoryFees } = getQuotePriceData(
    quote,
    guestCount,
  );

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const location = [quote.venue?.city, quote.venue?.country]
    .filter(Boolean)
    .join(", ");
  const quoteSubtype = (quote as Quote & { quoteSubtype?: string })
    .quoteSubtype;

  // ── Structure type detection ──
  let structureType:
    | "all_inclusive"
    | "venue_only"
    | "venue_with_required_options"
    | "itemized" = "venue_only";
  try {
    const menuOptions = (quote.menuOptions || []) as MenuOptionLike[];
    const addOnsRaw = (quote.addOns || []) as AddOnLike[];
    structureType = detectQuoteStructureType({
      menuOptions: menuOptions.map((m) => ({
        required: m?.required,
        price: m?.price,
      })),
      addOns: addOnsRaw.map((a) => ({
        required: a?.required,
        price: a?.price,
      })),
      inclusions: (quote.inclusions || []).map(toLabel),
      exclusions: (quote.exclusions || []).map(toLabel),
      basePrice: quote.basePrice,
      totalPrice: quote.totalPrice,
      packageName: quote.packageName ?? null,
    });
  } catch {
    structureType = "venue_only";
  }

  const structureLabel =
    structureType === "all_inclusive"
      ? "Type A: All-Inclusive"
      : structureType === "venue_only"
        ? "Type B: Venue-Only"
        : structureType === "venue_with_required_options"
          ? "Type B: Venue + required options"
          : "Type C: Itemized";

  const structureDescription =
    structureType === "all_inclusive"
      ? "Base price includes venue, catering, drinks, and other services."
      : structureType === "venue_only"
        ? "Base price is venue only. Add catering, drinks, and other services separately."
        : structureType === "venue_with_required_options"
          ? "Base price is venue. Must select at least one required option (e.g., dinner package)."
          : "Complete proposed package with line items. Adjust quantities or remove items as needed.";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="w-[95vw] max-w-[550px] max-h-[85vh] p-0 overflow-hidden rounded-lg"
        data-testid="quote-detail-modal"
      >
        <ScrollArea className="max-h-[85vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle
                className="font-display text-xl sm:text-2xl text-[#2A2035]"
                data-testid="modal-quote-title"
              >
                {quote.vendorName || quote.packageName || "Quote Details"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Quote details for {quote.vendorName || quote.packageName}
              </DialogDescription>
              <div className="flex items-center gap-3 flex-wrap text-sm text-[#6B617B] mt-1">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {location}
                  </span>
                )}
                <span className="font-semibold text-[#D4847A]">
                  {formatPrice(amount, currency)}
                </span>
                <Badge
                  variant="secondary"
                  className={
                    isVenue
                      ? "bg-[#E07A5F]/10 text-[#E07A5F]"
                      : "bg-[#D4847A]/10 text-[#D4847A]"
                  }
                >
                  {quote.quoteType === "venue"
                    ? "Venue"
                    : String(quote.quoteType) === "external_vendor"
                      ? "Vendor"
                      : quote.quoteType === "venue_addon"
                        ? "Venue Add-on"
                        : isVenue
                          ? "Venue"
                          : getVendorCategoryNameLocal(
                              quote.vendorCategory || "",
                            )}
                </Badge>
              </div>
            </DialogHeader>

            {/* ── External vendor view ── */}
            {String(quote.quoteType) === "external_vendor" &&
              (() => {
                const coveredPairs =
                  (quote.coveredPairs as CoveredPair[] | undefined) ?? null;
                const pricingTiers = (
                  (quote.pricingTiers as PricingTierLike[] | undefined) || []
                ).filter(
                  (t) => (t.label || t.title || t.name || "").trim().length > 0,
                );
                const notes = quote.notes;
                const profile =
                  (user?.weddingProfile as WeddingProfileLike | undefined) ||
                  {};
                const allDayServices: string[] = profile.allDayServices || [];
                const EVENT_NAMES: Record<string, string> = {
                  ceremony: "Ceremony",
                  cocktail_hour: "Cocktail Hour",
                  reception: "Reception",
                  rehearsal_dinner: "Rehearsal Dinner",
                  welcome_event: "Welcome Event",
                  next_day_brunch: "Next Day Brunch",
                  after_party: "After Party",
                  all_day: "All Day",
                };
                return (
                  <div className="space-y-5">
                    {coveredPairs && coveredPairs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {coveredPairs.map((p) => {
                          const cat =
                            VENDOR_TAXONOMY[p.category as VendorCategoryType];
                          if (!cat) return null;
                          return (
                            <Badge
                              key={p.category}
                              variant="secondary"
                              className="bg-[#6B8968]/10 text-[#3D5A38] border border-[#6B8968]/20 gap-1.5 px-3 py-1 text-xs"
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    {coveredPairs &&
                      coveredPairs.filter((p) => p.events.length > 0).length >
                        0 && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3">
                            Coverage
                          </h3>
                          <div className="space-y-2">
                            {coveredPairs
                              .filter((p) => p.events.length > 0)
                              .map((p) => {
                                const cat =
                                  VENDOR_TAXONOMY[
                                    p.category as VendorCategoryType
                                  ];
                                return (
                                  <div
                                    key={p.category}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-[#6B8968]/5 border border-[#6B8968]/10"
                                  >
                                    <span className="text-base shrink-0">
                                      {cat?.icon}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-[#2A2035]">
                                        {cat?.name}
                                      </p>
                                      <p className="text-xs text-[#6B617B] mt-0.5">
                                        {allDayServices.includes(p.category) ||
                                        p.events.includes("all_day")
                                          ? "All Day"
                                          : p.events
                                              .map((e) => EVENT_NAMES[e] || e)
                                              .join(" · ")}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    {pricingTiers.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          Services / Packages
                        </h3>
                        <div className="space-y-1.5">
                          {pricingTiers.map((tier, i) => {
                            const label = (
                              tier.label ||
                              tier.title ||
                              tier.name ||
                              `Package ${i + 1}`
                            ).trim();
                            const tierCurrency =
                              (quote.displayCurrency as string) ||
                              quote.currency ||
                              "EUR";
                            return (
                              <div
                                key={i}
                                className="p-3 rounded-lg border border-gray-100 bg-gray-50"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[#3D3650] break-words">
                                      {label}
                                    </p>
                                    {tier.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {tier.description}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-sm font-semibold text-[#6B8968] shrink-0 whitespace-nowrap">
                                    {formatPrice(tier.price, tierCurrency)}
                                  </span>
                                </div>
                                {Array.isArray(tier.lineItems) &&
                                  tier.lineItems.length > 0 && (
                                    <ul className="mt-1.5 space-y-0.5 border-t border-gray-200 pt-1.5">
                                      {tier.lineItems.map((li, liIdx) => (
                                        <li
                                          key={liIdx}
                                          className="flex items-baseline justify-between gap-2"
                                        >
                                          <span className="text-xs text-stone-500">
                                            • {li.name}
                                          </span>
                                          {(li.price ?? 0) > 0 && (
                                            <span className="text-xs text-stone-400 shrink-0 tabular-nums">
                                              {formatPrice(
                                                li.price ?? 0,
                                                tierCurrency,
                                              )}
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {notes && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Notes
                        </h3>
                        <p className="text-sm text-[#3D3650] p-3 rounded-lg bg-gray-50 border border-gray-100 whitespace-pre-wrap">
                          {notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* Guest pricing, Quote Type badge, Accommodation, Key Details, Inclusions,
                Available for Fee, Not Included, Restrictions, Menu Options, AI Recommendations
                — identical to original, just with updated import references */}
            {/* NOTE: Paste the remaining JSX sections verbatim from the original QuoteDetailModal,
                they are functionally identical — only the import paths changed above. */}

            {guestPricing && String(quote.quoteType) !== "external_vendor" && (
              <div className="mb-5" data-testid="guest-pricing-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D4847A]" />
                  Guest Pricing
                </h3>
                <div className="space-y-1.5 text-sm text-[#3D3650]">
                  <div className="flex justify-between">
                    <span>Included guests</span>
                    <span className="font-medium">
                      {guestPricing.baseGuestCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base package</span>
                    <span className="font-medium">
                      {formatPrice(
                        guestPricing.basePriceWithFees ??
                          guestPricing.basePrice,
                        currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Each additional guest</span>
                    <span className="font-medium">
                      {formatPrice(
                        guestPricing.additionalGuestPriceWithFees ??
                          guestPricing.additionalGuestPrice,
                        currency,
                      )}
                    </span>
                  </div>
                  {guestPricing.maxGuests && (
                    <div className="flex justify-between">
                      <span>Max guests</span>
                      <span className="font-medium">
                        {guestPricing.maxGuests.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {mandatoryFees.length > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#6B617B]">
                        Mandatory fees
                      </span>
                      <span className="text-xs text-[#6B617B]">
                        {mandatoryFees
                          .map((f) => `${f.percentage}%`)
                          .join(" + ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {String(quote.quoteType) !== "external_vendor" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-blue-800">
                    Quote Type:
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-300 text-[10px]"
                  >
                    {quote.quoteType === "venue"
                      ? "Venue"
                      : quote.quoteType === "venue_addon"
                        ? "Venue Add-on"
                        : isVenue
                          ? "Venue"
                          : "Vendor"}
                  </Badge>
                  {isVenue && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                    >
                      {quoteSubtype === "type_a"
                        ? "Type A: All-Inclusive"
                        : quoteSubtype === "type_b"
                          ? "Type B: Venue-Only"
                          : quoteSubtype === "type_c"
                            ? "Type C: Itemized"
                            : structureLabel}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-blue-700">
                  {quote.quoteType === "venue_addon" &&
                    "Add-on linked to a venue. Services and pricing only."}
                  {isVenue && structureDescription}
                </p>
              </div>
            )}

            {keyDetails.length > 0 && (
              <div
                className="bg-[#F8F5FB] rounded-xl p-4 mb-5"
                data-testid="key-details-section"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-2 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  Key Details
                </h3>
                <ul className="space-y-1.5">
                  {keyDetails.map((detail, i) => (
                    <li
                      key={i}
                      className="text-sm text-[#3D3650] flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4847A]" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(groupedInclusions.size > 0 || ungroupedInclusions.length > 0) && (
              <div className="mb-5" data-testid="whats-included-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3">
                  What's Included
                </h3>
                <div className="space-y-2">
                  {CATEGORY_ORDER.map((categoryId) => {
                    const items = groupedInclusions.get(categoryId);
                    if (!items || items.length === 0) return null;
                    const categoryName = getVendorCategoryNameLocal(categoryId);
                    const isOpen = openCategories.has(categoryId);
                    return (
                      <Collapsible
                        key={categoryId}
                        open={isOpen}
                        onOpenChange={() => toggleCategory(categoryId)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-[#5D8A58]/5 hover:bg-[#5D8A58]/10 transition-colors">
                            <div className="flex items-center gap-2">
                              {getCategoryIconNode(
                                categoryId,
                                "w-4 h-4 text-[#5D8A58]",
                              )}
                              <span className="text-sm font-medium text-[#3D3650]">
                                {categoryName}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-[#5D8A58]/15 text-[#5D8A58]"
                              >
                                {items.length}
                              </Badge>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-[#6B617B]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#6B617B]" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="ml-6 mt-2 space-y-1.5 pb-2">
                            {items.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-[#3D3650] flex items-start gap-2"
                              >
                                <Check className="w-3.5 h-3.5 text-[#5D8A58] mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                  {ungroupedInclusions.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#5D8A58]/5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-[#5D8A58]" />
                        <span className="text-sm font-medium text-[#3D3650]">
                          Other Included
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[#5D8A58]/15 text-[#5D8A58]"
                        >
                          {ungroupedInclusions.length}
                        </Badge>
                      </div>
                      <ul className="ml-6 space-y-1.5">
                        {ungroupedInclusions.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-[#3D3650] flex items-start gap-2"
                          >
                            <Check className="w-3.5 h-3.5 text-[#5D8A58] mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {availableForFee.length > 0 && (
              <div className="mb-5" data-testid="available-for-fee-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#D4A574]" />
                  Available for Fee
                </h3>
                <div className="space-y-2 p-3 rounded-lg bg-[#D4A574]/5 border border-[#D4A574]/20">
                  {availableForFee.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#3D3650] flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-[#D4A574]" />
                        {item.label || item.name}
                      </span>
                      <span className="font-medium text-[#D4A574]">
                        {formatPrice(
                          item.price,
                          (quote.displayCurrency as string) ||
                            quote.currency ||
                            "EUR",
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(exclusions.length > 0 ||
              (gapAnalysis &&
                (gapAnalysis.explicitExclusions.length > 0 ||
                  gapAnalysis.availableFromVenue.length > 0 ||
                  gapAnalysis.mustSourceExternally.length > 0))) && (
              <div className="mb-5" data-testid="not-included-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-3 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-600" />
                  Not Included (Must Add Separately)
                </h3>
                <div className="border border-red-200 rounded-lg p-3 bg-red-50/50 space-y-3">
                  {gapAnalysis && isVenue ? (
                    <>
                      {(() => {
                        const gapCategoryIds = [
                          ...gapAnalysis.availableFromVenue,
                          ...gapAnalysis.mustSourceExternally,
                        ];
                        const filteredExclusions =
                          filterExclusionsByGapCategories(
                            gapAnalysis.explicitExclusions,
                            gapCategoryIds,
                          );
                        if (filteredExclusions.length === 0) return null;
                        return (
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-red-600 mb-1">
                              Venue Rules & Restrictions
                            </p>
                            <ul className="space-y-1">
                              {filteredExclusions.map((item, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-red-700 flex items-start gap-2"
                                >
                                  <X className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {(gapAnalysis.availableFromVenue.length > 0 ||
                        gapAnalysis.mustSourceExternally.length > 0) &&
                        (() => {
                          const profile =
                            (user?.weddingProfile as
                              | WeddingProfileLike
                              | undefined) || {};
                          const servicesByEvent = profile.servicesByEvent || {};
                          const allDayServices = profile.allDayServices || [];
                          const customEventsForGrid =
                            profile.customEvents || [];
                          const coverage = getEventAwareCoverage({
                            quotes: [quote],
                            servicesByEvent,
                            allDayServices,
                          });
                          const groups = buildEventGapGroupsFromCoverage(
                            coverage.gaps,
                            customEventsForGrid,
                          );
                          if (groups.length === 0) {
                            return (
                              <div className="flex flex-wrap gap-1.5">
                                {gapAnalysis.availableFromVenue.map((catId) => (
                                  <span
                                    key={catId}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-300"
                                  >
                                    {getVendorCategoryNameLocal(catId)} · via
                                    venue
                                  </span>
                                ))}
                                {gapAnalysis.mustSourceExternally.map(
                                  (catId) => (
                                    <span
                                      key={catId}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"
                                    >
                                      {getVendorCategoryNameLocal(catId)}
                                    </span>
                                  ),
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-2">
                              {groups.map((g) => (
                                <div key={g.eventId}>
                                  <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                                    {g.eventIcon} {g.eventName}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {g.amber.map((catId) => (
                                      <span
                                        key={catId}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-300"
                                      >
                                        {getVendorCategoryNameLocal(catId)} ·
                                        via venue
                                      </span>
                                    ))}
                                    {g.red.map((catId) => (
                                      <span
                                        key={catId}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"
                                      >
                                        {getVendorCategoryNameLocal(catId)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                    </>
                  ) : (
                    <ul className="space-y-1.5">
                      {exclusions.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-red-700 flex items-start gap-2"
                        >
                          <X className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {restrictionsDisplay.length > 0 && (
              <div className="mb-5" data-testid="restrictions-section">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Restrictions & Rules
                </h3>
                <div className="space-y-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <ul className="space-y-1.5">
                    {restrictionsDisplay.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-800 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {(() => {
              const menuOptions = (quote.menuOptions || []) as MenuOptionLike[];
              const requiredMenus = menuOptions.filter(
                (m) => m.required === true,
              );
              const optionalMenus = menuOptions.filter(
                (m) => m.required !== true,
              );
              if (menuOptions.length === 0) return null;
              const qCurrency =
                (quote.displayCurrency as string) || quote.currency || "EUR";
              return (
                <div className="mb-5" data-testid="menu-options-section">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3">
                    Menu Options Available
                  </h3>
                  {requiredMenus.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-orange-700">
                          Required (Must Select One):
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-orange-100 text-orange-800 border-orange-300"
                        >
                          {requiredMenus.length} option
                          {requiredMenus.length > 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="space-y-1 pl-4 border-l-2 border-orange-300">
                        {requiredMenus.map((menu, i) => (
                          <div key={i} className="text-sm text-[#3D3650]">
                            <span className="font-medium">{menu.label}</span>
                            {menu.price && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({formatPrice(menu.price, qCurrency)}
                                {menu.pricingBasis === "per_person"
                                  ? "/person"
                                  : ""}
                                )
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {optionalMenus.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          Optional:
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {optionalMenus.length} option
                          {optionalMenus.length > 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="space-y-1 pl-4 border-l-2 border-gray-200">
                        {optionalMenus.map((menu, i) => (
                          <div key={i} className="text-sm text-[#3D3650]">
                            <span>{menu.label}</span>
                            {menu.price && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({formatPrice(menu.price, qCurrency)}
                                {menu.pricingBasis === "per_person"
                                  ? "/person"
                                  : ""}
                                )
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {quote.aiAnalysis?.recommendations &&
              (quote.aiAnalysis.recommendations as string[]).length > 0 && (
                <div data-testid="ai-recommendations-section">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B617B] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4847A]" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {(quote.aiAnalysis.recommendations as string[]).map(
                      (rec, i) => (
                        <li
                          key={i}
                          className="text-sm text-[#3D3650] flex items-start gap-2 p-3 rounded-lg bg-[#D4847A]/5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#D4847A] mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
