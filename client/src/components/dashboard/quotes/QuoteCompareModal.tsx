import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitCompare,
  MapPin,
  Check,
  X,
  AlertTriangle,
  Home,
} from "lucide-react";
import type { Quote, User, WeddingOption } from "@/types/dashboard/schema";
import type { VendorCategoryType } from "@/types/dashboard/vendor-taxonomy";
import {
  getGapAnalysis,
  getEventAwareCoverage,
  filterExclusionsByGapCategories,
} from "@/utils/dashboard/coverage-utils";
import { getVendorCategoryCoverage } from "@/utils/dashboard/coverage-utils";
import { buildEventGapGroupsFromCoverage } from "@/utils/dashboard/event-gap-groups";
import { detectQuoteStructureType } from "@/utils/dashboard/utils";
import {
  CATEGORY_ORDER,
  getCategoryIconNode,
  getVendorCategoryName,
} from "./categorization";
import { VENDOR_TAXONOMY } from "@/utils/dashboard/vendor-taxonomy";
import { formatPrice } from "./formatters";
import {
  toLabel,
  getQuotePriceData,
  calculateMissingServicesEstimate,
} from "./quote-utils";
import type {
  AddOnLike,
  MenuOptionLike,
  WeddingProfileLike,
} from "./quote-types";

function getVendorCategoryNameLocal(categoryId: string): string {
  return getVendorCategoryName(
    categoryId,
    VENDOR_TAXONOMY as Record<string, { name?: string }>,
  );
}

const isRestriction = (value: string): boolean => {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("not allowed") ||
    normalized.includes("no outside") ||
    normalized.includes("required") ||
    normalized.includes("minimum") ||
    normalized.includes("must") ||
    normalized.includes("policy")
  );
};

interface QuoteCompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueQuotes: Quote[];
  confirmedQuotes: Quote[];
  weddingOptions: WeddingOption[];
  user: User | undefined;
  guestCount: number;
}

export function QuoteCompareModal({
  open,
  onOpenChange,
  venueQuotes,
  confirmedQuotes,
  weddingOptions,
  user,
  guestCount,
}: QuoteCompareModalProps) {
  const getCombinedCoverage = (venueQuote: Quote) => {
    const matchingOption = weddingOptions.find(
      (o) => o.baseVenueQuoteId === venueQuote.id,
    );
    const attachedIds =
      (matchingOption?.attachedVendorQuoteIds as string[]) || [];
    const selectedMenuIds =
      (matchingOption?.selectedMenuOptionIds as string[]) ||
      (venueQuote.selectedMenuOptionIds as string[]) ||
      [];
    const results = getVendorCategoryCoverage({
      venueQuote,
      attachedVendorQuoteIds: attachedIds,
      allQuotes: confirmedQuotes,
      selectedMenuOptionIds: selectedMenuIds,
    });
    return {
      covered: results
        .filter((r) => r.status !== "needed")
        .map((r) => r.categoryId as VendorCategoryType),
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] md:max-w-[90vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GitCompare className="w-5 h-5 text-[#E07A5F]" />
            Compare Venue Quotes
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Side-by-side comparison of what's included and estimated costs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6">
            {/* Header cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {venueQuotes.map((quote) => {
                const { amount, currency } = getQuotePriceData(
                  quote,
                  guestCount,
                );
                let structureType:
                  | "all_inclusive"
                  | "venue_only"
                  | "venue_with_required_options"
                  | "itemized" = "venue_only";
                try {
                  const menuOptions =
                    (quote.menuOptions as MenuOptionLike[] | undefined) || [];
                  const addOns =
                    (quote.addOns as AddOnLike[] | undefined) || [];
                  structureType = detectQuoteStructureType({
                    menuOptions: menuOptions.map((m) => ({
                      required: m.required,
                      price: m.price,
                    })),
                    addOns: addOns.map((a) => ({
                      required: a.required,
                      price: a.price,
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

                const { estimate: estimatedAdditional } =
                  calculateMissingServicesEstimate(quote);
                const estimatedTotal = (amount || 0) + estimatedAdditional;
                const isAllInclusive = estimatedAdditional === 0;
                const quoteSubtype = (
                  quote as Quote & { quoteSubtype?: string }
                ).quoteSubtype;

                return (
                  <Card key={quote.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg text-[#2A2035]">
                            {quote.vendorName || quote.packageName}
                          </h3>
                          {quote.venue?.city && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {quote.venue.city}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] w-fit bg-[#F8F5FB] border-[#D4847A]/30"
                        >
                          {quoteSubtype === "type_a"
                            ? "Type A: All-Inclusive"
                            : quoteSubtype === "type_b"
                              ? "Type B: Venue Only"
                              : quoteSubtype === "type_c"
                                ? "Type C: Itemized"
                                : structureType === "all_inclusive"
                                  ? "Type A: All-Inclusive"
                                  : structureType === "venue_only"
                                    ? "Type B: Venue Only"
                                    : structureType ===
                                        "venue_with_required_options"
                                      ? "Type C: Venue + Options"
                                      : "Type C: Itemized"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 p-3 bg-[#F8F5FB] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Base Price
                          </span>
                          <span className="font-semibold text-[#E07A5F]">
                            {formatPrice(amount || 0, currency)}
                          </span>
                        </div>
                        {estimatedAdditional > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              + Est. Missing
                            </span>
                            <span className="text-red-600 font-medium">
                              +{formatPrice(estimatedAdditional, currency)}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#D4847A]/20">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              True Total
                            </span>
                            <span className="font-bold text-lg text-[#E07A5F]">
                              {formatPrice(estimatedTotal, currency)}
                            </span>
                          </div>
                          {isAllInclusive && (
                            <Badge className="mt-2 text-[10px] bg-green-100 text-green-800 border-green-300 w-fit">
                              All-Inclusive ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-6">
              {/* What's Included */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-base text-[#2A2035]">
                    What's Included
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORY_ORDER.map((categoryId) => {
                    const label = getVendorCategoryNameLocal(categoryId);
                    return (
                      <Card key={categoryId} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            {getCategoryIconNode(
                              categoryId,
                              "w-4 h-4 text-[#6B617B]",
                            )}
                            <span className="text-sm font-medium text-[#3D3650]">
                              {label}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {venueQuotes.map((quote) => {
                              const { covered } = getCombinedCoverage(quote);
                              const isIncluded = covered.includes(
                                categoryId as VendorCategoryType,
                              );
                              return (
                                <div
                                  key={quote.id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-muted-foreground truncate max-w-[120px]">
                                    {quote.vendorName || quote.packageName}
                                  </span>
                                  {isIncluded ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Included</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <X className="w-3.5 h-3.5" />
                                      <span>Not Included</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Accommodation */}
              {venueQuotes.some(
                (q) => q.venue?.accommodationInfo || q.accommodationDetails,
              ) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Home className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-base text-[#2A2035]">
                      Accommodation
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venueQuotes.map((quote) => {
                      const venueAccom = quote.venue?.accommodationInfo;
                      const details = quote.accommodationDetails;
                      const rooms =
                        details?.totalRooms || venueAccom?.onSiteRooms;
                      const capacity =
                        details?.totalCapacity || venueAccom?.onSiteCapacity;
                      const notes = details?.notes;
                      return (
                        <Card
                          key={quote.id}
                          className="border border-blue-200 bg-blue-50/30"
                        >
                          <CardHeader className="pb-2">
                            <h4 className="text-sm font-medium text-[#2A2035]">
                              {quote.vendorName || quote.packageName}
                            </h4>
                          </CardHeader>
                          <CardContent>
                            {rooms || capacity || notes ? (
                              <div className="space-y-1 text-sm">
                                {rooms && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Rooms:
                                    </span>
                                    <span className="font-medium">{rooms}</span>
                                  </div>
                                )}
                                {capacity && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Capacity:
                                    </span>
                                    <span className="font-medium">
                                      {capacity} guests
                                    </span>
                                  </div>
                                )}
                                {notes && (
                                  <div className="mt-2 text-xs text-[#6B617B] italic">
                                    "{notes}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No accommodation info
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Not Included */}
              {venueQuotes.some((q) => {
                const gap = getGapAnalysis(
                  q,
                  CATEGORY_ORDER,
                  (q.selectedMenuOptionIds as string[]) || [],
                );
                return (
                  (q.exclusions || []).length > 0 ||
                  gap.explicitExclusions.length > 0 ||
                  gap.availableFromVenue.length > 0 ||
                  gap.mustSourceExternally.length > 0
                );
              }) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-base text-[#2A2035]">
                      Not Included (Must Add Separately)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venueQuotes.map((quote) => {
                      const gap = getGapAnalysis(
                        quote,
                        CATEGORY_ORDER,
                        (quote.selectedMenuOptionIds as string[]) || [],
                      );
                      const notIncluded = (quote.exclusions || [])
                        .map(toLabel)
                        .filter((exclusion) => !isRestriction(exclusion));
                      const hasContent =
                        notIncluded.length > 0 ||
                        gap.explicitExclusions.length > 0 ||
                        gap.availableFromVenue.length > 0 ||
                        gap.mustSourceExternally.length > 0;
                      const profile =
                        (user?.weddingProfile as
                          | WeddingProfileLike
                          | undefined) || {};
                      const servicesByEvent = profile.servicesByEvent || {};
                      const allDayServices = profile.allDayServices || [];
                      const customEventsForGrid = profile.customEvents || [];
                      return (
                        <Card
                          key={quote.id}
                          className="border border-red-200 bg-red-50/30"
                        >
                          <CardHeader className="pb-2">
                            <h4 className="text-sm font-medium text-[#2A2035]">
                              {quote.vendorName || quote.packageName}
                            </h4>
                          </CardHeader>
                          <CardContent>
                            {hasContent ? (
                              <div className="space-y-2 text-xs">
                                {(() => {
                                  const gapCategoryIds = [
                                    ...gap.availableFromVenue,
                                    ...gap.mustSourceExternally,
                                  ];
                                  const filteredExclusions =
                                    filterExclusionsByGapCategories(
                                      gap.explicitExclusions,
                                      gapCategoryIds,
                                    );
                                  if (filteredExclusions.length === 0)
                                    return null;
                                  return (
                                    <div>
                                      <p className="font-semibold text-red-600 mb-0.5">
                                        Venue Rules & Restrictions
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {filteredExclusions.map((e, i) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-[10px] bg-white text-red-700 border-red-300"
                                          >
                                            {e}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                                {notIncluded.length > 0 &&
                                  gap.explicitExclusions.length === 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {notIncluded.map((exclusion, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-[10px] bg-white text-red-700 border-red-300"
                                        >
                                          {exclusion}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                {(gap.availableFromVenue.length > 0 ||
                                  gap.mustSourceExternally.length > 0) &&
                                  (() => {
                                    const coverage = getEventAwareCoverage({
                                      quotes: [quote],
                                      servicesByEvent,
                                      allDayServices,
                                    });
                                    const groups =
                                      buildEventGapGroupsFromCoverage(
                                        coverage.gaps,
                                        customEventsForGrid,
                                      );
                                    if (groups.length === 0) {
                                      return (
                                        <div className="flex flex-wrap gap-1">
                                          {gap.availableFromVenue.map(
                                            (catId) => (
                                              <Badge
                                                key={catId}
                                                variant="outline"
                                                className="text-[10px] bg-amber-50 text-amber-800 border-amber-300"
                                              >
                                                {getVendorCategoryNameLocal(
                                                  catId,
                                                )}
                                              </Badge>
                                            ),
                                          )}
                                          {gap.mustSourceExternally.map(
                                            (catId) => (
                                              <Badge
                                                key={catId}
                                                variant="outline"
                                                className="text-[10px] bg-white text-red-700 border-red-300"
                                              >
                                                {getVendorCategoryNameLocal(
                                                  catId,
                                                )}
                                              </Badge>
                                            ),
                                          )}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="space-y-1.5">
                                        {groups.map((g) => (
                                          <div key={g.eventId}>
                                            <p className="font-medium text-muted-foreground mb-0.5">
                                              {g.eventIcon} {g.eventName}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                              {g.amber.map((catId) => (
                                                <Badge
                                                  key={catId}
                                                  variant="outline"
                                                  className="text-[10px] bg-amber-50 text-amber-800 border-amber-300"
                                                >
                                                  {getVendorCategoryNameLocal(
                                                    catId,
                                                  )}
                                                </Badge>
                                              ))}
                                              {g.red.map((catId) => (
                                                <Badge
                                                  key={catId}
                                                  variant="outline"
                                                  className="text-[10px] bg-white text-red-700 border-red-300"
                                                >
                                                  {getVendorCategoryNameLocal(
                                                    catId,
                                                  )}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                              </div>
                            ) : (
                              <div className="text-xs text-green-600 font-medium">
                                All services included
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Restrictions */}
              {venueQuotes.some((q) => (q.restrictions || []).length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-base text-[#2A2035]">
                      Restrictions & Rules
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venueQuotes.map((quote) => {
                      const restrictions = (quote.restrictions ||
                        []) as string[];
                      return (
                        <Card
                          key={quote.id}
                          className="border border-amber-200 bg-amber-50/30"
                        >
                          <CardHeader className="pb-2">
                            <h4 className="text-sm font-medium text-[#2A2035]">
                              {quote.vendorName || quote.packageName}
                            </h4>
                          </CardHeader>
                          <CardContent>
                            {restrictions.length > 0 ? (
                              <ul className="space-y-1.5">
                                {restrictions.map((r, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-amber-800 flex items-start gap-1.5"
                                  >
                                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No specific restrictions listed
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Required Options */}
              {venueQuotes.some((q) =>
                ((q.menuOptions || []) as MenuOptionLike[]).some(
                  (m) => m.required === true,
                ),
              ) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-base text-[#2A2035]">
                      Required Options (Must Select One)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venueQuotes.map((quote) => {
                      const requiredMenus = (
                        (quote.menuOptions || []) as MenuOptionLike[]
                      ).filter((m) => m.required === true);
                      const qCurrency =
                        (quote.displayCurrency as string) ||
                        quote.currency ||
                        "EUR";
                      return (
                        <Card
                          key={quote.id}
                          className="border border-orange-200 bg-orange-50/30"
                        >
                          <CardHeader className="pb-2">
                            <h4 className="text-sm font-medium text-[#2A2035]">
                              {quote.vendorName || quote.packageName}
                            </h4>
                          </CardHeader>
                          <CardContent>
                            {requiredMenus.length > 0 ? (
                              <div className="space-y-2">
                                {requiredMenus.map((menu, i) => (
                                  <div
                                    key={i}
                                    className="text-sm p-2 bg-white rounded border border-orange-200"
                                  >
                                    <span className="font-medium text-[#3D3650]">
                                      {menu.label}
                                    </span>
                                    {menu.price && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {formatPrice(menu.price, qCurrency)}
                                        {menu.pricingBasis === "per_person"
                                          ? "/person"
                                          : ""}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No required options
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
